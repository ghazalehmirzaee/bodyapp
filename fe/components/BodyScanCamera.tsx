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
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scanStartTimeRef = useRef<number>(0);
  const poseDetectedRef = useRef<boolean>(false);
  const stablePoseStartRef = useRef<number>(0);

  useEffect(() => {
    // Ensure we're in the browser
    if (typeof window === 'undefined') return;
    
    if (!videoRef.current || !canvasRef.current) return;

    const handlePoseResults = (landmarks: PoseLandmarks[]) => {
      if (analysis) return; // Don't process if already have results

      // Auto-start scanning when pose is detected and stable
      if (landmarks && landmarks.length >= 33) {
        if (!poseDetectedRef.current) {
          poseDetectedRef.current = true;
          stablePoseStartRef.current = Date.now();
          setScanning(true);
          scanStartTimeRef.current = Date.now();
        }

        // Track progress during stable pose
        const elapsed = Date.now() - stablePoseStartRef.current;
        const progress = Math.min(100, (elapsed / 3000) * 100);
        setScanProgress(progress);

        // Complete scan after 3 seconds of stable pose
        if (elapsed >= 3000) {
          completeScan(landmarks);
        }
      } else {
        // Reset if pose is lost
        poseDetectedRef.current = false;
        stablePoseStartRef.current = 0;
        setScanning(false);
        setScanProgress(0);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      }
    };

    // Delay initialization slightly to ensure DOM is ready
    const initTimer = setTimeout(async () => {
      try {
        if (!videoRef.current || !canvasRef.current) return;
        
        scannerRef.current = new BodyScanner(
          videoRef.current,
          canvasRef.current,
          handlePoseResults
        );

        // Initialize MediaPipe first
        await scannerRef.current.initialize();

        // Auto-start camera on mount
        await initializeCamera();
      } catch (err: any) {
        console.error('Error initializing BodyScanner:', err);
        setError(`Failed to initialize scanner: ${err.message}`);
      }
    }, 300);

    return () => {
      clearTimeout(initTimer);
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [scanning, analysis]);

  const initializeCamera = async () => {
    try {
      if (!videoRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
      });

      videoRef.current.srcObject = stream;
      
      // Wait for video to be ready
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
      setError(`Camera access denied: ${err.message}`);
      console.error('Camera error:', err);
    }
  };

  const completeScan = async (landmarks: PoseLandmarks[]) => {
    setScanning(false);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    try {
      // Call Python backend API for complete analysis
      const response = await fetch(`${API_URL}/api/analyze-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          landmarks: landmarks.map(lm => ({
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

      setAnalysis(data.analysis);
      setDietPlan(data.dietPlan);
      setWorkoutRoutine(data.workoutRoutine);
    } catch (err: any) {
      setError(`Analysis failed: ${err.message}. Make sure the Python backend is running on ${API_URL}`);
      console.error('Backend error:', err);
    }
  };

  return (
    <div className="container">
      <div className="camera-section">
        <div className="video-container">
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
        </div>
        <div className="controls">
          {scanning && (
            <button
              onClick={() => {
                setScanning(false);
                if (progressIntervalRef.current) {
                  clearInterval(progressIntervalRef.current);
                }
              }}
              className="cancel-button"
            >
              Cancel Scan
            </button>
          )}
          {!scanning && !analysis && (
            <p className="instruction-text">Position yourself in front of the camera. Scanning will start automatically...</p>
          )}
        </div>
      </div>

          {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={initializeCamera} className="retry-button">
            Retry
          </button>
        </div>
      )}

      {analysis && (
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
            onClick={() => {
              setAnalysis(null);
              setDietPlan(null);
              setWorkoutRoutine(null);
              setScanning(false);
              setScanProgress(0);
              poseDetectedRef.current = false;
              stablePoseStartRef.current = 0;
              if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
              }
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
          padding: 20px;
        }

        .camera-section {
          margin-bottom: 30px;
        }

        .video-container {
          position: relative;
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          background: #000;
          border-radius: 10px;
          overflow: hidden;
        }

        .video,
        .canvas {
          width: 100%;
          height: auto;
          display: block;
        }

        .canvas {
          position: absolute;
          top: 0;
          left: 0;
        }

        .scan-overlay {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 15px 30px;
          border-radius: 10px;
          text-align: center;
          min-width: 300px;
        }

        .scan-progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .scan-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4CAF50, #8BC34A);
          transition: width 0.1s linear;
        }

        .scan-text {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .controls {
          text-align: center;
          margin-top: 20px;
        }

        .instruction-text {
          color: #666;
          font-size: 16px;
          font-style: italic;
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
        }

        .result-card:hover {
          transform: translateY(-5px);
        }

        .result-card h3 {
          color: #667eea;
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 22px;
          border-bottom: 2px solid #667eea;
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
          color: #667eea;
          margin-bottom: 20px;
          padding: 15px;
          background: #f0f4ff;
          border-radius: 10px;
        }

        .workout-day {
          margin-bottom: 25px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 10px;
        }

        .workout-day h4 {
          color: #667eea;
          margin-top: 0;
        }

        .scan-again-button {
          display: block;
          margin: 30px auto 0;
        }
      `}</style>
    </div>
  );
}

