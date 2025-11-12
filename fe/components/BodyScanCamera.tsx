'use client';

import { useEffect, useRef, useState } from 'react';
import { BodyScanner, PoseLandmarks, BodyAnalysis } from '@/lib/bodyScanner';

// Backend API URL - can be configured via environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function BodyScanCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scannerRef = useRef<BodyScanner | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [analysis, setAnalysis] = useState<BodyAnalysis | null>(null);
  const [dietPlan, setDietPlan] = useState<any>(null);
  const [workoutRoutine, setWorkoutRoutine] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('Initializing...');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scanStartTimeRef = useRef<number>(0);
  const poseDetectedRef = useRef<boolean>(false);
  const stablePoseStartRef = useRef<number>(0);
  const hasInitializedRef = useRef<boolean>(false);
  const latestLandmarksRef = useRef<PoseLandmarks[] | null>(null);

  useEffect(() => {
    console.log('▶️ useEffect running...');
    
    // Ensure we're in the browser
    if (typeof window === 'undefined') {
      console.error('❌ Not in browser environment');
      return;
    }
    
    if (!videoRef.current || !canvasRef.current) {
      console.error('❌ Video or canvas refs not ready');
      setDebugInfo('Error: Video elements not ready');
      return;
    }
    
    // Only run once on mount - check inside timer to avoid React Strict Mode issues
    if (hasInitializedRef.current) {
      console.log('⚠️ Already initialized, skipping');
      return;
    }
    
    console.log('✅ Refs are ready, will initialize...');

    const handlePoseResults = (landmarks: PoseLandmarks[]) => {
      // Store latest landmarks for manual capture
      latestLandmarksRef.current = landmarks;
      
      // Update debug info based on detection
      if (landmarks && landmarks.length >= 33) {
        setDebugInfo(`✅ Body detected! ${landmarks.length} landmarks. Ready to capture.`);
      } else if (landmarks && landmarks.length > 0) {
        setDebugInfo(`⚠️ Partial detection (${landmarks.length} landmarks). Show more of your body.`);
      } else {
        setDebugInfo('👤 No body detected. Step into frame.');
      }
    };

    // Delay initialization slightly to ensure DOM is ready
    const initTimer = setTimeout(async () => {
      // Mark as initialized at the START of initialization
      if (hasInitializedRef.current) {
        console.log('⚠️ Timer fired but already initialized, aborting');
        return;
      }
      hasInitializedRef.current = true;
      
      try {
        console.log('🚀 Starting initialization...');
        setDebugInfo('Initializing camera...');
        
        if (!videoRef.current || !canvasRef.current) {
          console.error('Video or canvas ref not available');
          setError('Video elements not ready');
          return;
        }
        
        console.log('📹 Creating BodyScanner...');
        scannerRef.current = new BodyScanner(
          videoRef.current,
          canvasRef.current,
          handlePoseResults
        );

        console.log('🤖 Initializing MediaPipe...');
        setDebugInfo('Loading MediaPipe AI model...');
        
        await scannerRef.current.initialize();

        console.log('📷 Starting camera...');
        setDebugInfo('Starting camera...');
        await initializeCamera();
        
        console.log('✅ Initialization complete!');
        setDebugInfo('Camera ready. Position yourself in frame.');
      } catch (err: any) {
        console.error('❌ Error initializing BodyScanner:', err);
        console.error('Full error details:', err);
        setError(`Failed to initialize scanner: ${err.message}`);
        setDebugInfo(`Error: ${err.message}`);
        hasInitializedRef.current = false; // Reset on error
      }
    }, 500);
    
    console.log('⏱️ Initialization timer set for 500ms');

    return () => {
      clearTimeout(initTimer);
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      // Clean up camera stream
      stopCameraStream();
    };
  }, []); // Empty dependencies - run only once on mount

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

      console.log('📹 Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
      });

      console.log('✅ Camera access granted');
      videoRef.current.srcObject = stream;
      
      // Wait for video to be ready
      await new Promise((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              console.log('📹 Video metadata loaded, starting playback...');
              videoRef.current.play();
              resolve(undefined);
            }
          };
        }
      });

      console.log('🎬 Starting pose detection...');
      if (scannerRef.current) {
        await scannerRef.current.start();
        console.log('✅ Pose detection started successfully');
        setDebugInfo('Detecting pose... Position your full body in frame.');
      }
    } catch (err: any) {
      console.error('❌ Camera error:', err);
      setError(`Camera access denied: ${err.message}`);
      setDebugInfo(`Camera error: ${err.message}`);
    }
  };

  const handleCaptureAndAnalyze = async () => {
    if (!latestLandmarksRef.current || latestLandmarksRef.current.length < 20) {
      setError('No body detected. Please position yourself in the camera frame.');
      return;
    }

    const landmarksToSend = latestLandmarksRef.current;

    setIsAnalyzing(true);
    setDebugInfo('📸 Capturing and analyzing...');

    try {
      console.log('📸 Capturing frame with', landmarksToSend.length, 'landmarks');
      
      // Call Python backend API for complete analysis
      const response = await fetch(`${API_URL}/api/analyze-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          landmarks: landmarksToSend.map(lm => ({
            x: lm.x,
            y: lm.y,
            z: lm.z,
            visibility: lm.visibility,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Analysis complete:', data);

      // Set all data immediately
      setAnalysis(data.analysis);
      setDietPlan(data.dietPlan);
      setWorkoutRoutine(data.workoutRoutine);
      setIsAnalyzing(false);

      // Stop camera and scanner immediately
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
      stopCameraStream();

      // Transition UI
      setShowCamera(false);
      
      // Small delay to let camera fade out, then show results
      setTimeout(() => {
        setShowResults(true);
        // Scroll to top to ensure results are visible
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 600);
    } catch (err: any) {
      setError(`Analysis failed: ${err.message}. Make sure the Python backend is running on ${API_URL}`);
      console.error('Backend error:', err);
      setIsAnalyzing(false);
      setDebugInfo('❌ Analysis failed. Check console for details.');
    }
  };

  return (
    <div className={`container ${!showCamera ? 'camera-hidden' : ''}`}>
      {showCamera && (
        <div className={`camera-section ${showCamera ? 'fade-in' : 'fade-out'}`}>
          <div className="video-container fullscreen">
            <video
              ref={videoRef}
              className="video"
              autoPlay
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="canvas" />
            {scanning && (
              <div className="scan-overlay">
                <div className="scan-progress-bar">
                  <div
                    className="scan-progress-fill"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
                <p className="scan-text">
                  Scanning... Keep steady for {Math.max(0, Math.ceil((3000 - (Date.now() - stablePoseStartRef.current)) / 1000))}s
                </p>
              </div>
            )}
            {!analysis && (
              <div className="instruction-overlay">
                <p className="instruction-text">Position yourself in front of the camera</p>
                <p className="debug-text">{debugInfo}</p>
                <button 
                  onClick={handleCaptureAndAnalyze}
                  disabled={isAnalyzing || !latestLandmarksRef.current || latestLandmarksRef.current.length < 20}
                  className="capture-button"
                >
                  {isAnalyzing ? '⏳ Analyzing...' : '📸 Capture & Analyze'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={initializeCamera} className="retry-button">
            Retry
          </button>
        </div>
      )}

      {showResults && analysis && (
        <div className="results-section">
          <h2>Body Composition Analysis</h2>

          <div className="results-grid">
            <div className="result-card">
              <h3>Measurements</h3>
              <ul>
                <li>Shoulder Width: {analysis.measurements.shoulderWidth} cm</li>
                <li>Chest Width: {analysis.measurements.chestWidth} cm</li>
                <li>Waist Width: {analysis.measurements.waistWidth} cm</li>
                <li>Hip Width: {analysis.measurements.hipWidth} cm</li>
                <li>Arm Length: {analysis.measurements.armLength} cm</li>
                <li>Leg Length: {analysis.measurements.legLength} cm</li>
              </ul>
            </div>

            <div className="result-card">
              <h3>Body Composition</h3>
              <ul>
                <li>Estimated Body Fat: {analysis.bodyFatEstimate}%</li>
                <li>Estimated Muscle Mass: {analysis.muscleMassEstimate}%</li>
              </ul>
            </div>

            <div className="result-card strong-spots">
              <h3>Strong Spots</h3>
              <ul>
                {analysis.strongSpots.map((spot, idx) => (
                  <li key={idx}>{spot}</li>
                ))}
              </ul>
            </div>

            <div className="result-card weak-spots">
              <h3>Areas for Improvement</h3>
              <ul>
                {analysis.weakSpots.map((spot, idx) => (
                  <li key={idx}>{spot}</li>
                ))}
              </ul>
            </div>
          </div>

          {dietPlan && (
            <div className="result-card diet-plan">
              <h3>Personalized Diet Plan</h3>
              <div className="macros">
                <p><strong>Daily Calories:</strong> {dietPlan.calories} kcal</p>
                <p><strong>Protein:</strong> {dietPlan.protein}g</p>
                <p><strong>Carbs:</strong> {dietPlan.carbs}g</p>
                <p><strong>Fats:</strong> {dietPlan.fats}g</p>
              </div>
              <h4>Meal Plan:</h4>
              <ul>
                {dietPlan.meals.map((meal: string, idx: number) => (
                  <li key={idx}>{meal}</li>
                ))}
              </ul>
            </div>
          )}

          {workoutRoutine && (
            <div className="result-card workout-routine">
              <h3>Personalized Workout Routine</h3>
              <p className="workout-focus"><strong>Focus:</strong> {workoutRoutine.focus}</p>
              {workoutRoutine.days.map((day: any, idx: number) => (
                <div key={idx} className="workout-day">
                  <h4>{day.day}</h4>
                  <ul>
                    {day.exercises.map((exercise: string, exIdx: number) => (
                      <li key={exIdx}>{exercise}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={async () => {
              // Reset all states
              setAnalysis(null);
              setDietPlan(null);
              setWorkoutRoutine(null);
              setScanning(false);
              setScanProgress(0);
              setShowResults(false);
              setIsAnalyzing(false);
              setError(null);
              poseDetectedRef.current = false;
              stablePoseStartRef.current = 0;
              latestLandmarksRef.current = null;
              if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
              }
              
              // Show camera again
              setShowCamera(true);
              setDebugInfo('Restarting camera...');
              
              // Restart camera
              await initializeCamera();
            }}
            className="scan-again-button"
          >
            Scan Again
          </button>
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0;
          transition: padding 0.5s ease;
        }

        .container.camera-hidden {
          padding: 20px;
        }

        .camera-section {
          margin-bottom: 0;
          animation: fadeIn 0.5s ease-in;
        }

        .camera-section.fade-out {
          animation: fadeOut 0.5s ease-out forwards;
        }

        .video-container {
          position: relative;
          width: 100%;
          background: #000;
          overflow: hidden;
        }

        .video-container.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 1000;
          border-radius: 0;
        }

        .video,
        .canvas {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .canvas {
          position: absolute;
          top: 0;
          left: 0;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.95);
          }
        }

        .scan-overlay {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 20px 40px;
          border-radius: 15px;
          text-align: center;
          min-width: 350px;
          backdrop-filter: blur(10px);
          animation: slideUp 0.5s ease-out;
        }

        .instruction-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 30px 50px;
          border-radius: 20px;
          text-align: center;
          max-width: 600px;
          backdrop-filter: blur(10px);
          animation: fadeIn 1s ease-in;
        }

        .instruction-text {
          color: white;
          font-size: 24px;
          font-weight: 500;
          margin: 0 0 15px 0;
          line-height: 1.5;
        }

        .debug-text {
          color: #4CAF50;
          font-size: 16px;
          font-weight: 400;
          margin: 0 0 20px 0;
          padding: 10px 20px;
          background: rgba(76, 175, 80, 0.2);
          border-radius: 8px;
          border: 1px solid rgba(76, 175, 80, 0.3);
        }

        .capture-button {
          background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
          color: white;
          border: none;
          padding: 18px 50px;
          font-size: 20px;
          font-weight: 700;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 30px rgba(76, 175, 80, 0.6);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .capture-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(76, 175, 80, 0.8);
          background: linear-gradient(135deg, #66BB6A 0%, #81C784 100%);
        }

        .capture-button:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .capture-button:disabled {
          background: linear-gradient(135deg, #999 0%, #666 100%);
          cursor: not-allowed;
          opacity: 0.6;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .scan-progress-bar {
          width: 100%;
          height: 10px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 5px;
          overflow: hidden;
          margin-bottom: 15px;
        }

        .scan-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4CAF50, #8BC34A);
          transition: width 0.1s linear;
          box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
        }

        .scan-text {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .scan-button,
        .cancel-button,
        .retry-button,
        .scan-again-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 15px 40px;
          font-size: 18px;
          font-weight: 600;
          border-radius: 50px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .scan-button:hover,
        .scan-again-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .cancel-button {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .error-message {
          background: #fee;
          border: 2px solid #fcc;
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }

        .error-message p {
          color: #c33;
          margin-bottom: 15px;
        }

        .results-section {
          margin-top: 40px;
          animation: slideInFromBottom 0.6s ease-out;
        }

        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .results-section h2 {
          text-align: center;
          color: #333;
          margin-bottom: 30px;
          font-size: 32px;
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .result-card {
          background: white;
          border-radius: 15px;
          padding: 25px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s;
          animation: cardFadeIn 0.5s ease-out backwards;
        }

        .result-card:nth-child(1) {
          animation-delay: 0.1s;
        }

        .result-card:nth-child(2) {
          animation-delay: 0.2s;
        }

        .result-card:nth-child(3) {
          animation-delay: 0.3s;
        }

        .result-card:nth-child(4) {
          animation-delay: 0.4s;
        }

        .diet-plan {
          animation-delay: 0.5s !important;
        }

        .workout-routine {
          animation-delay: 0.6s !important;
        }

        @keyframes cardFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .result-card:hover {
          transform: translateY(-5px);
        }

        .result-card h3 {
          color: #4CAF50;
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 22px;
          border-bottom: 2px solid #4CAF50;
          padding-bottom: 10px;
        }

        .result-card h4 {
          color: #555;
          margin-top: 20px;
          margin-bottom: 10px;
        }

        .result-card ul {
          list-style: none;
          padding: 0;
        }

        .result-card li {
          padding: 8px 0;
          border-bottom: 1px solid #eee;
          color: #666;
        }

        .result-card li:last-child {
          border-bottom: none;
        }

        .strong-spots {
          border-left: 4px solid #4CAF50;
        }

        .weak-spots {
          border-left: 4px solid #FF9800;
        }

        .diet-plan,
        .workout-routine {
          grid-column: 1 / -1;
        }

        .macros {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 10px;
        }

        .macros p {
          margin: 0;
          color: #555;
        }

        .workout-focus {
          font-size: 18px;
          color: #4CAF50;
          margin-bottom: 20px;
          padding: 15px;
          background: rgba(76, 175, 80, 0.1);
          border-radius: 10px;
          border: 1px solid rgba(76, 175, 80, 0.3);
        }

        .workout-day {
          margin-bottom: 25px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 10px;
        }

        .workout-day h4 {
          color: #4CAF50;
          margin-top: 0;
        }

        .scan-again-button {
          display: block;
          margin: 30px auto 0;
          background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
          box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
        }

        .scan-again-button:hover {
          box-shadow: 0 6px 20px rgba(76, 175, 80, 0.6);
          background: linear-gradient(135deg, #66BB6A 0%, #81C784 100%);
        }
      `}</style>
    </div>
  );
}

