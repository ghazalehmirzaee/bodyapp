'use client';

import { useState } from 'react';

interface OnboardingProps {
  onComplete: (data: { gender: string; height?: number }) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<'welcome' | 'gender' | 'height'>('welcome');
  const [gender, setGender] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [unit, setUnit] = useState<'cm' | 'ft'>('cm');

  const handleContinueFromGender = () => {
    if (!gender) return;
    setStep('height');
  };

  const handleComplete = () => {
    const heightNum = height ? parseFloat(height) : undefined;
    onComplete({ 
      gender, 
      height: heightNum && unit === 'cm' ? heightNum : heightNum ? heightNum * 30.48 : undefined 
    });
  };

  const handleSkipHeight = () => {
    onComplete({ gender });
  };

  if (step === 'welcome') {
    return (
      <div className="onboarding-container">
        <div className="welcome-screen">
          <div className="logo">💪</div>
          <h1>BodyApp</h1>
          <p className="tagline">AI-Powered Body Analysis</p>
          
          <div className="features">
            <div className="feature">
              <span className="icon">⚡</span>
              <span>Quick 2-pose scan</span>
            </div>
            <div className="feature">
              <span className="icon">📊</span>
              <span>Instant insights</span>
            </div>
            <div className="feature">
              <span className="icon">📈</span>
              <span>Track your progress</span>
            </div>
          </div>

          <button 
            className="primary-button"
            onClick={() => setStep('gender')}
          >
            Get Started →
          </button>
        </div>

        <style jsx>{`
          .onboarding-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%);
            padding: 20px;
          }

          .welcome-screen {
            background: white;
            border-radius: 24px;
            padding: 60px 40px;
            max-width: 480px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.6s ease-out;
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .logo {
            font-size: 80px;
            margin-bottom: 20px;
            animation: bounce 2s infinite;
          }

          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }

          h1 {
            font-size: 48px;
            font-weight: 800;
            color: #333;
            margin: 0 0 10px 0;
          }

          .tagline {
            font-size: 20px;
            color: #666;
            margin: 0 0 40px 0;
          }

          .features {
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin-bottom: 40px;
            text-align: left;
          }

          .feature {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px 20px;
            background: #f8f9fa;
            border-radius: 12px;
            font-size: 18px;
            color: #333;
          }

          .icon {
            font-size: 28px;
          }

          .primary-button {
            background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
            color: white;
            border: none;
            padding: 18px 60px;
            font-size: 20px;
            font-weight: 700;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 8px 30px rgba(76, 175, 80, 0.4);
            width: 100%;
          }

          .primary-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 40px rgba(76, 175, 80, 0.6);
          }
        `}</style>
      </div>
    );
  }

  if (step === 'gender') {
    return (
      <div className="onboarding-container">
        <div className="setup-screen">
          <h2>Let's personalize your experience</h2>
          <p className="subtitle">This helps us provide accurate analysis</p>

          <div className="question-section">
            <label>Select your gender</label>
            <div className="gender-options">
              <button
                className={`option-button ${gender === 'male' ? 'selected' : ''}`}
                onClick={() => setGender('male')}
              >
                <span className="option-icon">👨</span>
                <span>Male</span>
              </button>
              <button
                className={`option-button ${gender === 'female' ? 'selected' : ''}`}
                onClick={() => setGender('female')}
              >
                <span className="option-icon">👩</span>
                <span>Female</span>
              </button>
              <button
                className={`option-button ${gender === 'non-binary' ? 'selected' : ''}`}
                onClick={() => setGender('non-binary')}
              >
                <span className="option-icon">🧑</span>
                <span>Non-binary</span>
              </button>
            </div>

            {gender === 'female' && (
              <div className="info-box">
                <p>🚧 Female analysis is coming soon! For now, you can continue with general analysis.</p>
              </div>
            )}

            {gender === 'non-binary' && (
              <div className="info-box">
                <p>🚧 Non-binary analysis is coming soon! For now, you can continue with general analysis.</p>
              </div>
            )}
          </div>

          <button 
            className="primary-button"
            onClick={handleContinueFromGender}
            disabled={!gender}
          >
            Continue →
          </button>
        </div>

        <style jsx>{`
          .onboarding-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%);
            padding: 20px;
          }

          .setup-screen {
            background: white;
            border-radius: 24px;
            padding: 50px 40px;
            max-width: 540px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.6s ease-out;
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          h2 {
            font-size: 32px;
            font-weight: 700;
            color: #333;
            margin: 0 0 10px 0;
            text-align: center;
          }

          .subtitle {
            font-size: 16px;
            color: #666;
            text-align: center;
            margin: 0 0 40px 0;
          }

          .question-section {
            margin-bottom: 30px;
          }

          label {
            display: block;
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin-bottom: 20px;
          }

          .gender-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
          }

          .option-button {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            padding: 25px 20px;
            background: #f8f9fa;
            border: 3px solid transparent;
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 16px;
            font-weight: 600;
            color: #666;
          }

          .option-button:hover {
            background: #e9ecef;
            transform: translateY(-2px);
          }

          .option-button.selected {
            background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
            border-color: #4CAF50;
            color: white;
            transform: scale(1.05);
          }

          .option-icon {
            font-size: 48px;
          }

          .info-box {
            background: #FFF3CD;
            border: 1px solid #FFE69C;
            border-radius: 12px;
            padding: 15px;
            margin-top: 15px;
          }

          .info-box p {
            margin: 0;
            color: #856404;
            font-size: 14px;
            text-align: center;
          }

          .primary-button {
            background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
            color: white;
            border: none;
            padding: 18px 60px;
            font-size: 20px;
            font-weight: 700;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 8px 30px rgba(76, 175, 80, 0.4);
            width: 100%;
          }

          .primary-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 12px 40px rgba(76, 175, 80, 0.6);
          }

          .primary-button:disabled {
            background: #ccc;
            cursor: not-allowed;
            opacity: 0.6;
            box-shadow: none;
          }
        `}</style>
      </div>
    );
  }

  if (step === 'height') {
    return (
      <div className="onboarding-container">
        <div className="setup-screen">
          <h2>One more thing</h2>
          <p className="subtitle">This helps us calibrate measurements</p>

          <div className="question-section">
            <label>Your height (optional)</label>
            
            <div className="unit-toggle">
              <button
                className={`unit-button ${unit === 'cm' ? 'active' : ''}`}
                onClick={() => setUnit('cm')}
              >
                cm
              </button>
              <button
                className={`unit-button ${unit === 'ft' ? 'active' : ''}`}
                onClick={() => setUnit('ft')}
              >
                ft
              </button>
            </div>

            <input
              type="number"
              className="height-input"
              placeholder={unit === 'cm' ? 'e.g. 175' : 'e.g. 5.9'}
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              step={unit === 'cm' ? '1' : '0.1'}
            />

            <p className="help-text">
              💡 This helps us provide more accurate measurements. You can skip this if you prefer.
            </p>
          </div>

          <div className="button-group">
            <button 
              className="skip-button"
              onClick={handleSkipHeight}
            >
              Skip
            </button>
            <button 
              className="primary-button"
              onClick={handleComplete}
            >
              Start Scan →
            </button>
          </div>
        </div>

        <style jsx>{`
          .onboarding-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%);
            padding: 20px;
          }

          .setup-screen {
            background: white;
            border-radius: 24px;
            padding: 50px 40px;
            max-width: 480px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.6s ease-out;
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          h2 {
            font-size: 32px;
            font-weight: 700;
            color: #333;
            margin: 0 0 10px 0;
            text-align: center;
          }

          .subtitle {
            font-size: 16px;
            color: #666;
            text-align: center;
            margin: 0 0 40px 0;
          }

          .question-section {
            margin-bottom: 30px;
          }

          label {
            display: block;
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin-bottom: 20px;
            text-align: center;
          }

          .unit-toggle {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-bottom: 20px;
          }

          .unit-button {
            padding: 10px 30px;
            background: #f8f9fa;
            border: 2px solid #dee2e6;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            color: #666;
            transition: all 0.3s ease;
          }

          .unit-button.active {
            background: linear-gradient(135deg, #2E7D32 0%, #1b5e20 100%);
            border-color: #2E7D32;
            color: white;
          }

          .height-input {
            width: 100%;
            padding: 20px;
            font-size: 24px;
            text-align: center;
            border: 3px solid #dee2e6;
            border-radius: 16px;
            outline: none;
            transition: border-color 0.3s ease;
          }

          .height-input:focus {
            border-color: #4CAF50;
          }

          .help-text {
            margin-top: 15px;
            font-size: 14px;
            color: #666;
            text-align: center;
            line-height: 1.5;
          }

          .button-group {
            display: flex;
            gap: 15px;
          }

          .skip-button {
            flex: 1;
            background: transparent;
            color: #666;
            border: 2px solid #dee2e6;
            padding: 18px 30px;
            font-size: 18px;
            font-weight: 600;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .skip-button:hover {
            background: #f8f9fa;
            border-color: #adb5bd;
          }

          .primary-button {
            flex: 2;
            background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
            color: white;
            border: none;
            padding: 18px 40px;
            font-size: 18px;
            font-weight: 700;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 8px 30px rgba(76, 175, 80, 0.4);
          }

          .primary-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 40px rgba(76, 175, 80, 0.6);
          }
        `}</style>
      </div>
    );
  }

  return null;
}

