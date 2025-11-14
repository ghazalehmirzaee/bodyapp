'use client';

import { useEffect, useRef, useState } from 'react';
import { BodyScanner, PoseLandmarks } from '@/lib/bodyScanner';

interface TwoPoseCaptureProps {
  gender: string;
  height?: number;
  onComplete: (data: {
    frontPose: PoseLandmarks[];
    sidePose: PoseLandmarks[];
    gender: string;
    height?: number;
  }) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function TwoPoseCapture({ gender, height, onComplete }: TwoPoseCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scannerRef = useRef<BodyScanner | null>(null);
  const hasInitializedRef = useRef<boolean>(false);
  const latestLandmarksRef = useRef<PoseLandmarks[] | null>(null);

  const [currentPose, setCurrentPose] = useState<'front' | 'side'>('front');
  const [frontPose, setFrontPose] = useState<PoseLandmarks[] | null>(null);
  const [readiness, setReadiness] = useState<number>(0);
  const [readinessStatus, setReadinessStatus] = useState<string>('Position yourself in frame');
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoCapturing, setAutoCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);
  const autoCaptureTriggerRef = useRef<number>(0);
  const stableFramesRef = useRef<number>(0);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !videoRef.current || !canvasRef.current) return;
    if (hasInitializedRef.current) return;

    const handlePoseResults = (landmarks: PoseLandmarks[]) => {
      latestLandmarksRef.current = landmarks;
      
      // Calculate readiness score
      const score = calculateReadinessScore(landmarks, currentPose);
      setReadiness(score.score);
      setReadinessStatus(score.message);

      // Auto-capture when pose is excellent and stable
      if (score.score >= 90 && !isCapturing && !autoCapturing) {
        stableFramesRef.current += 1;
        
        // Require 60 stable frames (about 2 seconds at 30fps)
        if (stableFramesRef.current >= 60) {
          setAutoCapturing(true);
          
          // IMMEDIATELY capture the current landmarks (don't wait for countdown)
          const capturedLandmarks = landmarks;
          
          // Countdown is just for user feedback - BIG and visible
          let countdownValue = 3;
          setCountdown(countdownValue);
          setReadinessStatus('📸 Auto-capturing...');
          
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          
          countdownIntervalRef.current = setInterval(() => {
            countdownValue--;
            if (countdownValue > 0) {
              setCountdown(countdownValue);
            } else {
              if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
              }
              setCountdown(0);
              // Use the landmarks we captured at the START
              handleCaptureWithLandmarks(capturedLandmarks);
            }
          }, 1000);
        } else {
          // Show progress to 2 seconds
          const secondsRemaining = Math.ceil((60 - stableFramesRef.current) / 30);
          setReadinessStatus(`✅ Hold steady for ${secondsRemaining}s...`);
        }
      } else if (score.score < 90) {
        // Reset if pose quality drops
        stableFramesRef.current = 0;
        setAutoCapturing(false);
      }
    };

    const initTimer = setTimeout(async () => {
      if (hasInitializedRef.current) return;
      hasInitializedRef.current = true;

      try {
        if (!videoRef.current || !canvasRef.current) return;

        scannerRef.current = new BodyScanner(
          videoRef.current,
          canvasRef.current,
          handlePoseResults
        );

        await scannerRef.current.initialize();
        await initializeCamera();
      } catch (err: any) {
        console.error('Error initializing scanner:', err);
        setError(`Failed to initialize: ${err.message}`);
        hasInitializedRef.current = false;
      }
    }, 500);

    return () => {
      clearTimeout(initTimer);
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      stopCameraStream();
    };
  }, [currentPose]);

  const calculateReadinessScore = (
    landmarks: PoseLandmarks[],
    pose: 'front' | 'side'
  ): { score: number; message: string } => {
    if (!landmarks || landmarks.length < 33) {
      return { score: 0, message: '👤 No body detected - step into frame' };
    }

    let score = 0;
    let issues: string[] = [];

    // Check visibility (all landmarks should be visible)
    const avgVisibility = landmarks.reduce((sum, lm) => sum + lm.visibility, 0) / landmarks.length;
    if (avgVisibility > 0.8) {
      score += 40;
    } else if (avgVisibility > 0.6) {
      score += 20;
      issues.push('Show more of your body');
    } else {
      issues.push('Step back to show full body');
    }

    // Check symmetry (for front pose)
    if (pose === 'front') {
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
      
      if (shoulderDiff < 0.02) {
        score += 30;
      } else if (shoulderDiff < 0.05) {
        score += 15;
        issues.push('Face camera directly');
      } else {
        issues.push('Turn to face camera');
      }
    }

    // Check if standing upright
    const nose = landmarks[0];
    const leftHip = landmarks[23];
    const verticalAlignment = Math.abs(nose.x - leftHip.x);
    
    if (verticalAlignment < 0.1) {
      score += 30;
    } else if (verticalAlignment < 0.15) {
      score += 15;
      issues.push('Stand up straight');
    } else {
      issues.push('Stand upright');
    }

    // Determine message
    let message = '';
    if (score >= 90) {
      message = '✅ Perfect! Ready to capture';
    } else if (score >= 70) {
      message = `⚠️ Good - ${issues[0] || 'Hold steady'}`;
    } else if (issues.length > 0) {
      message = `❌ ${issues[0]}`;
    } else {
      message = '👤 Position yourself in frame';
    }

    return { score: Math.min(100, score), message };
  };

  const stopCameraStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const initializeCamera = async () => {
    try {
      if (!videoRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
      });

      videoRef.current.srcObject = stream;

      await new Promise((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play();
              resolve(undefined);
            }
          };
        }
      });

      if (scannerRef.current) {
        await scannerRef.current.start();
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setError(`Camera access denied: ${err.message}`);
    }
  };

  const handleCaptureWithLandmarks = (landmarks: PoseLandmarks[]) => {
    // Use provided landmarks (from auto-capture) instead of checking current pose
    if (!landmarks || landmarks.length < 33) {
      setError('No body detected. Please position yourself in frame.');
      return;
    }

    setIsCapturing(true);
    setAutoCapturing(false);
    stableFramesRef.current = 0;

    if (currentPose === 'front') {
      // Captured front pose, move to side
      setFrontPose(landmarks);
      setCurrentPose('side');
      setIsCapturing(false);
      setReadiness(0);
      setReadinessStatus('Turn to your right side');
      stableFramesRef.current = 0;
    } else {
      // Captured side pose, complete
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
      stopCameraStream();

      onComplete({
        frontPose: frontPose!,
        sidePose: landmarks,
        gender,
        height,
      });
    }
  };

  const handleCapture = () => {
    // Manual capture - check current pose quality
    if (!latestLandmarksRef.current || latestLandmarksRef.current.length < 33) {
      setError('No body detected. Please position yourself in frame.');
      return;
    }

    if (readiness < 70) {
      setError('Please adjust your position before capturing.');
      return;
    }

    // Use current landmarks
    handleCaptureWithLandmarks(latestLandmarksRef.current);
  };

  const getReadinessColor = () => {
    if (readiness >= 90) return '#4CAF50';
    if (readiness >= 70) return '#FF9800';
    return '#f44336';
  };

  const getProgressBarColor = () => {
    if (readiness >= 90) return 'linear-gradient(90deg, #4CAF50, #8BC34A)';
    if (readiness >= 70) return 'linear-gradient(90deg, #FF9800, #FFB74D)';
    return 'linear-gradient(90deg, #f44336, #e57373)';
  };

  return (
    <div className="capture-container">
      <div className="video-wrapper">
        <video
          ref={videoRef}
          className="video"
          autoPlay
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="canvas" />

        <div className="overlay">
          <div className="header">
            <div className="pose-indicator">
              <span className={`pose-step ${currentPose === 'front' ? 'active' : 'done'}`}>
                1. Front
              </span>
              <span className="divider">→</span>
              <span className={`pose-step ${currentPose === 'side' ? 'active' : ''}`}>
                2. Side
              </span>
            </div>
          </div>

          <div className="instructions">
            <h3>
              {currentPose === 'front' ? '📸 Scan 1 of 2: Front View' : '📸 Scan 2 of 2: Side View'}
            </h3>
            <div className="instruction-list">
              {currentPose === 'front' ? (
                <>
                  <p>• Face the camera directly</p>
                  <p>• Arms slightly out from body</p>
                  <p>• Stand naturally and relax</p>
                </>
              ) : (
                <>
                  <p>• Turn 90° to your right</p>
                  <p>• Arms by your side</p>
                  <p>• Stand tall and straight</p>
                </>
              )}
            </div>
          </div>

          <div className="readiness-section">
            <div className="readiness-bar">
              <div
                className="readiness-fill"
                style={{
                  width: `${readiness}%`,
                  background: getProgressBarColor(),
                }}
              />
            </div>
            <p className="readiness-text" style={{ color: getReadinessColor() }}>
              {readinessStatus}
            </p>
          </div>

          <button
            className="capture-button"
            onClick={handleCapture}
            disabled={isCapturing || readiness < 70}
            style={{
              background: readiness >= 70 
                ? 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)'
                : 'linear-gradient(135deg, #999 0%, #666 100%)',
            }}
          >
            {isCapturing ? '⏳ Capturing...' : autoCapturing ? '⏱️ Auto-capturing...' : `📸 Capture Now (or wait for auto-capture)`}
          </button>
        </div>
      </div>

      {/* BIG COUNTDOWN OVERLAY - Clear and Transparent */}
      {countdown > 0 && (
        <div className="countdown-overlay">
          <div className="countdown-circle">
            <span className="countdown-number">{countdown}</span>
          </div>
          <p className="countdown-text">Get ready...</p>
        </div>
      )}

      {error && (
        <div className="error-popup">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <style jsx>{`
        .capture-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #000;
          z-index: 1000;
        }

        .video-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .video,
        .canvas {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .canvas {
          position: absolute;
          top: 0;
          left: 0;
        }

        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 30px;
        }

        .header {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .pose-indicator {
          display: flex;
          align-items: center;
          gap: 15px;
          background: rgba(0, 0, 0, 0.8);
          padding: 15px 30px;
          border-radius: 50px;
          backdrop-filter: blur(10px);
        }

        .pose-step {
          font-size: 18px;
          font-weight: 600;
          color: #999;
          transition: all 0.3s ease;
        }

        .pose-step.active {
          color: #4CAF50;
          font-size: 20px;
        }

        .pose-step.done {
          color: #4CAF50;
        }

        .divider {
          color: #666;
          font-size: 20px;
        }

        .instructions {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        }

        .instructions h3 {
          font-size: 28px;
          color: white;
          margin: 0 0 20px 0;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        }

        .instruction-list {
          background: rgba(0, 0, 0, 0.7);
          padding: 20px 30px;
          border-radius: 15px;
          backdrop-filter: blur(10px);
        }

        .instruction-list p {
          margin: 8px 0;
          font-size: 16px;
          color: white;
          text-align: left;
        }

        .readiness-section {
          margin-bottom: 20px;
        }

        .readiness-bar {
          width: 100%;
          height: 12px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .readiness-fill {
          height: 100%;
          transition: width 0.3s ease, background 0.3s ease;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }

        .readiness-text {
          text-align: center;
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
          transition: color 0.3s ease;
        }

        .capture-button {
          pointer-events: all;
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
          display: block;
          color: white;
          border: none;
          padding: 20px 40px;
          font-size: 20px;
          font-weight: 700;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
        }

        .capture-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(76, 175, 80, 0.8);
        }

        .capture-button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .error-popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(244, 67, 54, 0.95);
          color: white;
          padding: 20px 30px;
          border-radius: 15px;
          text-align: center;
          z-index: 2000;
          pointer-events: all;
        }

        .error-popup p {
          margin: 0 0 15px 0;
          font-size: 16px;
        }

        .error-popup button {
          background: white;
          color: #f44336;
          border: none;
          padding: 10px 30px;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
        }

        /* BIG COUNTDOWN OVERLAY - User-friendly and transparent */
        .countdown-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.7);
          z-index: 3000;
          pointer-events: none;
          animation: fadeIn 0.3s ease;
        }

        .countdown-circle {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2E7D32 0%, #1b5e20 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 50px rgba(46, 125, 50, 0.8);
          animation: pulse 1s ease infinite;
        }

        .countdown-number {
          font-size: 120px;
          font-weight: 900;
          color: white;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }

        .countdown-text {
          margin-top: 30px;
          font-size: 32px;
          font-weight: 700;
          color: white;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}

