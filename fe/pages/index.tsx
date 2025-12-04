

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { PoseLandmarks } from '@/lib/bodyScanner';

const OnboardingNew = dynamic(() => import('@/components/OnboardingNew'), {
  ssr: false,
});

const TwoPoseCapture = dynamic(() => import('@/components/TwoPoseCapture'), {
  ssr: false,
  loading: () => <div style={{ padding: '20px', textAlign: 'center', color: '#fff', background: '#000' }}>Loading camera...</div>,
});

const ImageUploadCapture = dynamic(() => import('@/components/ImageUploadCapture'), {
  ssr: false,
  loading: () => <div style={{ padding: '20px', textAlign: 'center', color: '#fff', background: '#000' }}>Loading...</div>,
});

const CommitmentSelection = dynamic(() => import('@/components/CommitmentSelection'), {
  ssr: false,
});

const PathwayView = dynamic(() => import('@/components/PathwayView'), {
  ssr: false,
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type AppState = 'onboarding' | 'choose-method' | 'camera' | 'upload' | 'analyzing' | 'results-summary' | 'commitment' | 'generating-pathway' | 'pathway';

interface UserData {
  gender: string;
  height: string;
  age: string;
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>('onboarding');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [physique, setPhysique] = useState<any>(null);
  const [dietPlan, setDietPlan] = useState<any>(null);
  const [workoutRoutine, setWorkoutRoutine] = useState<any>(null);
  const [poseData, setPoseData] = useState<{ frontPose: any[]; sidePose: any[] } | null>(null);
  const [pathway, setPathway] = useState<any>(null);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOnboardingComplete = (data: { gender: string; height: string; age: string }) => {
    setUserData(data);
    setAppState('choose-method');
  };

  const handleCaptureComplete = async (data: {
    frontPose: PoseLandmarks[];
    sidePose: PoseLandmarks[];
  }) => {
    setAppState('analyzing');
    setError(null);
    setPoseData(data);

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
          gender: userData?.gender || 'male',
          height: userData?.height ? parseInt(userData.height) : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setPhysique(result.physique);
      setDietPlan(result.dietPlan);
      setWorkoutRoutine(result.workoutRoutine);
      setAppState('results-summary');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(`Analysis failed: ${err.message}. Make sure the backend is running on ${API_URL}`);
      setAppState('choose-method');
    }
  };

  const handleCommitmentSelect = async (days: number) => {
    setAppState('generating-pathway');
    
    try {
      const response = await fetch(`${API_URL}/api/pathway/generate-pathway`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          front_pose: poseData?.frontPose || [],
          side_pose: poseData?.sidePose || [],
          gender: userData?.gender || 'male',
          age: userData?.age ? parseInt(userData.age) : 25,
          height: userData?.height ? parseInt(userData.height) : 175,
          commitment_days: days,
        }),
      });

      if (!response.ok) {
        throw new Error(`Pathway generation failed: ${response.status}`);
      }

      const result = await response.json();
      setPathway(result.pathway);
      setUserProgress(result.user_progress);
      setAppState('pathway');
    } catch (err: any) {
      console.error('Pathway generation error:', err);
      setError(`Failed to generate pathway: ${err.message}`);
      setAppState('commitment');
    }
  };

  const handleCompleteTask = async (stageDay: number, taskId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/pathway/complete-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pathway_id: pathway?.id,
          stage_day: stageDay,
          task_id: taskId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete task');
      }

      const result = await response.json();
      
      // Update local state
      if (result.progress) {
        setUserProgress(result.progress);
      }
      
      // Update pathway stages
      if (pathway) {
        const updatedStages = pathway.stages.map((stage: any) => {
          if (stage.day === stageDay) {
            return {
              ...stage,
              tasks: stage.tasks.map((task: any) => 
                task.id === taskId ? { ...task, completed: true } : task
              ),
              completed: result.stage_completed,
            };
          }
          return stage;
        });
        setPathway({ ...pathway, stages: updatedStages });
      }
    } catch (err: any) {
      console.error('Task completion error:', err);
    }
  };

  const handleScanAgain = () => {
    setPhysique(null);
    setDietPlan(null);
    setWorkoutRoutine(null);
    setPathway(null);
    setUserProgress(null);
    setPoseData(null);
    setAppState('choose-method');
  };

  return (
    <main>
      {appState === 'onboarding' && (
        <OnboardingNew onComplete={handleOnboardingComplete} />
      )}

      {appState === 'choose-method' && userData && (
        <div className="choose-method-screen">
          <h2 className="choose-title">How would you like to scan?</h2>
          <p className="choose-subtitle">Choose your preferred method</p>
          
          <div className="method-cards">
            <div className="method-card" onClick={() => setAppState('upload')}>
              <span className="method-icon">📤</span>
              <h3 className="method-name">Upload Photos</h3>
              <p className="method-desc">Upload existing front and side photos</p>
            </div>
            
            <div className="method-card" onClick={() => setAppState('camera')}>
              <span className="method-icon">📹</span>
              <h3 className="method-name">Use Camera</h3>
              <p className="method-desc">Take photos with your webcam</p>
            </div>
          </div>

          <style jsx>{`
            .choose-method-screen {
              min-height: 100vh;
              background: #000000;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 40px 20px;
            }
            
            .choose-title {
              font-size: 36px;
              font-weight: bold;
              color: #FFFFFF;
              margin-bottom: 10px;
              text-align: center;
            }
            
            .choose-subtitle {
              font-size: 16px;
              color: #2E7D32;
              margin-bottom: 50px;
              text-align: center;
            }
            
            .method-cards {
              display: flex;
              gap: 30px;
              flex-wrap: wrap;
              justify-content: center;
            }
            
            .method-card {
              background: #000000;
              border: 3px solid #2E7D32;
              border-radius: 20px;
              padding: 40px 30px;
              width: 280px;
              text-align: center;
              cursor: pointer;
              transition: all 0.3s;
            }
            
            .method-card:hover {
              border-color: #4CAF50;
              transform: translateY(-5px);
              box-shadow: 0 10px 30px rgba(76, 175, 80, 0.3);
            }
            
            .method-icon {
              font-size: 64px;
              display: block;
              margin-bottom: 20px;
            }
            
            .method-name {
              font-size: 22px;
              font-weight: bold;
              color: #FFFFFF;
              margin: 0 0 10px 0;
            }
            
            .method-desc {
              font-size: 14px;
              color: #2E7D32;
              margin: 0;
            }
          `}</style>
        </div>
      )}

      {appState === 'camera' && userData && (
        <TwoPoseCapture
          onComplete={handleCaptureComplete}
        />
      )}

      {appState === 'upload' && userData && (
        <ImageUploadCapture
          onComplete={handleCaptureComplete}
          onSwitchToCamera={() => setAppState('camera')}
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

      {appState === 'results-summary' && physique && (
        <div className="results-summary">
          <div className="summary-content">
            <div className="score-circle">
              <span className="score-number">{physique.overall_score || 75}</span>
              <span className="score-label">Overall Score</span>
            </div>
            
            <h2 className="summary-title">Great Analysis!</h2>
            <p className="summary-desc">
              We've analyzed your physique and identified key areas for improvement.
              Now let's create your personalized transformation pathway!
            </p>

            <div className="insights-preview">
              <div className="insight">
                <span className="insight-icon">💪</span>
                <span className="insight-text">V-Taper Score: {physique.scores?.shoulders || 70}%</span>
              </div>
              <div className="insight">
                <span className="insight-icon">⚖️</span>
                <span className="insight-text">Symmetry: {physique.scores?.symmetry || 80}%</span>
              </div>
              <div className="insight">
                <span className="insight-icon">🧘</span>
                <span className="insight-text">Posture: {physique.scores?.posture || 75}%</span>
              </div>
            </div>

            <button 
              className="continue-button"
              onClick={() => setAppState('commitment')}
            >
              Create My Pathway →
            </button>
          </div>

          <style jsx>{`
            .results-summary {
              min-height: 100vh;
              background: #000000;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 40px 20px;
            }
            
            .summary-content {
              max-width: 500px;
              text-align: center;
            }
            
            .score-circle {
              width: 180px;
              height: 180px;
              border-radius: 50%;
              border: 8px solid #2E7D32;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              margin: 0 auto 30px;
            }
            
            .score-number {
              font-size: 64px;
              font-weight: bold;
              color: #4CAF50;
            }
            
            .score-label {
              font-size: 14px;
              color: #2E7D32;
            }
            
            .summary-title {
              font-size: 32px;
              font-weight: bold;
              color: #FFFFFF;
              margin: 0 0 15px 0;
            }
            
            .summary-desc {
              font-size: 16px;
              color: #888;
              line-height: 1.6;
              margin: 0 0 30px 0;
            }
            
            .insights-preview {
              display: flex;
              flex-direction: column;
              gap: 12px;
              margin-bottom: 40px;
            }
            
            .insight {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
              padding: 12px 20px;
              background: #111;
              border-radius: 10px;
            }
            
            .insight-icon {
              font-size: 20px;
            }
            
            .insight-text {
              font-size: 16px;
              color: #FFFFFF;
            }
            
            .continue-button {
              width: 100%;
              padding: 18px 40px;
              background: #2E7D32;
              border: none;
              border-radius: 50px;
              color: #FFFFFF;
              font-size: 18px;
              font-weight: bold;
              cursor: pointer;
              transition: all 0.2s;
            }
            
            .continue-button:hover {
              background: #388E3C;
              transform: translateY(-2px);
            }
          `}</style>
        </div>
      )}

      {appState === 'commitment' && (
        <CommitmentSelection
          onSelect={handleCommitmentSelect}
          onBack={() => setAppState('results-summary')}
        />
      )}

      {appState === 'generating-pathway' && (
        <div className="generating-screen">
          <div className="generating-content">
            <div className="spinner"></div>
            <h2>Creating Your Pathway</h2>
            <p>Our AI is building your personalized transformation journey...</p>
          </div>

          <style jsx>{`
            .generating-screen {
              position: fixed;
              top: 0;
              left: 0;
              width: 100vw;
              height: 100vh;
              background: #000000;
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
            }

            .generating-content {
              text-align: center;
              color: white;
            }

            .spinner {
              width: 80px;
              height: 80px;
              border: 8px solid rgba(46, 125, 50, 0.3);
              border-top-color: #4CAF50;
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
              font-size: 28px;
              font-weight: 700;
              margin: 0 0 15px 0;
              color: #FFFFFF;
            }

            p {
              font-size: 16px;
              color: #2E7D32;
              margin: 0;
            }
          `}</style>
        </div>
      )}

      {appState === 'pathway' && pathway && userProgress && (
        <PathwayView
          pathway={pathway}
          progress={userProgress}
          onCompleteTask={handleCompleteTask}
          onTakeNewScan={handleScanAgain}
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

