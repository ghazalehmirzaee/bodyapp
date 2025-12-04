import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { POSE_CONNECTIONS } from '@mediapipe/pose';

export interface PoseLandmarks {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface BodyAnalysis {
  measurements: {
    shoulderWidth: number;
    chestWidth: number;
    waistWidth: number;
    hipWidth: number;
    armLength: number;
    legLength: number;
  };
  strongSpots: string[];
  weakSpots: string[];
  bodyFatEstimate: number;
  muscleMassEstimate: number;
}

export class BodyScanner {
  private pose: Pose | null = null;
  private camera: Camera | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private onResults: (landmarks: PoseLandmarks[]) => void;
  private scanning: boolean = false;
  private scanStartTime: number = 0;
  private stablePoseCount: number = 0;
  private lastPose: PoseLandmarks[] | null = null;
  private readonly SCAN_DURATION = 3000; // 3 seconds
  private readonly STABILITY_THRESHOLD = 0.1;
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  constructor(
    videoElement: HTMLVideoElement,
    canvasElement: HTMLCanvasElement,
    onResults: (landmarks: PoseLandmarks[]) => void
  ) {
    // Ensure we're in the browser environment
    if (typeof window === 'undefined') {
      throw new Error('BodyScanner can only be used in the browser');
    }

    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    this.onResults = onResults;
  }

  async initialize(): Promise<void> {
    if (this.initialized && this.pose) {
      console.log('Already initialized');
      return;
    }

    if (this.initPromise) {
      console.log('Init already in progress');
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        console.log('Creating Pose instance...');
        
        this.pose = new Pose({
          locateFile: (file) => {
            const url = `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`;
            console.log('Loading file:', url);
            return url;
          },
        });

        console.log('Setting pose options...');
        this.pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        console.log('Setting onResults callback...');
        this.pose.onResults(this.onPoseResults.bind(this));
        
        this.initialized = true;
        console.log('✅ MediaPipe Pose initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing MediaPipe Pose:', error);
        this.initPromise = null;
        throw error;
      }
    })();

    return this.initPromise;
  }

  private onPoseResults(results: any) {
    if (!this.canvasElement || !this.videoElement || !this.pose) return;

    const canvasCtx = this.canvasElement.getContext('2d');
    if (!canvasCtx) return;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      this.canvasElement.width,
      this.canvasElement.height
    );

    if (results.poseLandmarks) {
      // Draw pose landmarks
      drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
        color: '#00FF00',
        lineWidth: 2,
      });
      drawLandmarks(canvasCtx, results.poseLandmarks, {
        color: '#FF0000',
        lineWidth: 1,
        radius: 3,
      });

      // Check pose stability
      if (this.scanning) {
        this.checkPoseStability(results.poseLandmarks);
      }

      this.onResults(results.poseLandmarks);
    }

    canvasCtx.restore();
  }

  private checkPoseStability(currentPose: PoseLandmarks[]) {
    if (!this.lastPose) {
      this.lastPose = currentPose;
      this.scanStartTime = Date.now();
      this.stablePoseCount = 0;
      return;
    }

    // Calculate average movement
    let totalMovement = 0;
    for (let i = 0; i < Math.min(currentPose.length, this.lastPose.length); i++) {
      const dx = currentPose[i].x - this.lastPose[i].x;
      const dy = currentPose[i].y - this.lastPose[i].y;
      totalMovement += Math.sqrt(dx * dx + dy * dy);
    }
    const avgMovement = totalMovement / currentPose.length;

    if (avgMovement < this.STABILITY_THRESHOLD) {
      this.stablePoseCount++;
    } else {
      this.stablePoseCount = 0;
      this.scanStartTime = Date.now();
    }

    this.lastPose = currentPose;

    const scanDuration = Date.now() - this.scanStartTime;
    if (scanDuration >= this.SCAN_DURATION && this.stablePoseCount > 10) {
      this.onScanComplete(currentPose);
    }
  }

  private onScanComplete(landmarks: PoseLandmarks[]) {
    this.scanning = false;
    // This will be handled by the parent component
  }

  startScanning() {
    this.scanning = true;
    this.scanStartTime = Date.now();
    this.stablePoseCount = 0;
    this.lastPose = null;
  }

  stopScanning() {
    this.scanning = false;
  }

  async start() {
    if (!this.videoElement) return;

    // Ensure MediaPipe is initialized before starting
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.pose) {
      throw new Error('MediaPipe Pose not initialized');
    }

    this.camera = new Camera(this.videoElement, {
      onFrame: async () => {
        if (this.pose && this.videoElement) {
          await this.pose.send({ image: this.videoElement });
        }
      },
      width: 1280,
      height: 720,
    });
    this.camera.start();
  }

  stop() {
    if (this.camera) {
      this.camera.stop();
    }
  }
}

