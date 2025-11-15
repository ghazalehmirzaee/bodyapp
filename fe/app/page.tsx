'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { PoseLandmarks } from '@/lib/bodyScanner';

const Onboarding = dynamic(() => import('@/components/Onboarding'), {
  ssr: false,
});

const TwoPoseCapture = dynamic(() => import('@/components/TwoPoseCapture'), {
  ssr: false,
  loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Loading camera...</div>,
});

const PhysiqueResults = dynamic(() => import('@/components/PhysiqueResults'), {
  ssr: false,
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type AppState = 'onboarding' | 'scanning' | 'analyzing' | 'results';

interface UserData {
  gender: string;
  height?: number;
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>('onboarding');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [physique, setPhysique] = useState<any>(null);
  const [dietPlan, setDietPlan] = useState<any>(null);
  const [workoutRoutine, setWorkoutRoutine] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOnboardingComplete = (data: { gender: string; height?: number }) => {
    setUserData(data);
    setAppState('scanning');
  };

  const handleCaptureComplete = async (data: {
    frontPose: PoseLandmarks[];
    sidePose: PoseLandmarks[];
    gender: string;
    height?: number;
  }) => {
    setAppState('analyzing');
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/analyze-physique`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          frontPose: data.frontPose.map(lm => ({
            x: lm.x,
            y: lm.y,
            z: lm.z,
            visibility: lm.visibility,
          })),
          sidePose: data.sidePose.map(lm => ({
            x: lm.x,
            y: lm.y,
            z: lm.z,
            visibility: lm.visibility,
          })),
          gender: data.gender,
          height: data.height,
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setPhysique(result.physique);
      setDietPlan(result.dietPlan);
      setWorkoutRoutine(result.workoutRoutine);
      setAppState('results');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(`Analysis failed: ${err.message}. Make sure the backend is running on ${API_URL}`);
      setAppState('scanning');
    }
  };

  const handleScanAgain = () => {
    setPhysique(null);
    setDietPlan(null);
    setWorkoutRoutine(null);
    setAppState('scanning');
  };

  return (
    <main>
      {appState === 'onboarding' && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}

      {appState === 'scanning' && userData && (
        <TwoPoseCapture
          gender={userData.gender}
          height={userData.height}
          onComplete={handleCaptureComplete}
        />
      )}

      {appState === 'analyzing' && (
        <div className="analyzing-screen">
          <div className="analyzing-content">
            <div className="spinner"></div>
            <h2>Analyzing Your Physique</h2>
            <p>Our AI is calculating your scores...</p>
          </div>

          <style jsx>{`
            .analyzing-screen {
              position: fixed;
              top: 0;
              left: 0;
              width: 100vw;
              height: 100vh;
              background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
            }

            .analyzing-content {
              text-align: center;
              color: white;
            }

            .spinner {
              width: 80px;
              height: 80px;
              border: 8px solid rgba(255, 255, 255, 0.3);
              border-top-color: white;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 30px;
            }

            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }

            h2 {
              font-size: 32px;
              font-weight: 700;
              margin: 0 0 15px 0;
            }

            p {
              font-size: 18px;
              opacity: 0.9;
              margin: 0;
            }
          `}</style>
        </div>
      )}

      {appState === 'results' && physique && dietPlan && workoutRoutine && (
        <PhysiqueResults
          physique={physique}
          dietPlan={dietPlan}
          workoutRoutine={workoutRoutine}
          onScanAgain={handleScanAgain}
        />
      )}

      {error && (
        <div className="error-overlay">
          <div className="error-box">
            <h3>⚠️ Error</h3>
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>

          <style jsx>{`
            .error-overlay {
              position: fixed;
              top: 0;
              left: 0;
              width: 100vw;
              height: 100vh;
              background: rgba(0, 0, 0, 0.8);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 2000;
            }

            .error-box {
              background: white;
              border-radius: 20px;
              padding: 40px;
              max-width: 500px;
              text-align: center;
            }

            h3 {
              font-size: 28px;
              color: #f44336;
              margin: 0 0 20px 0;
            }

            p {
              font-size: 16px;
              color: #666;
              line-height: 1.6;
              margin: 0 0 25px 0;
            }

            button {
              background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
              color: white;
              border: none;
              padding: 15px 40px;
              border-radius: 50px;
              font-size: 18px;
              font-weight: 600;
              cursor: pointer;
              transition: transform 0.2s;
            }

            button:hover {
              transform: translateY(-2px);
            }
          `}</style>
        </div>
      )}
    </main>
  );
}

