'use client';

import { useState } from 'react';
import styles from './OnboardingNew.module.css';

interface OnboardingProps {
  onComplete: (data: { gender: string; height: string; age: string }) => void;
}

type OnboardingStep = 'welcome' | 'gender' | 'height' | 'age';

export default function OnboardingNew({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [age, setAge] = useState('');

  const handleContinue = () => {
    if (step === 'welcome') {
      setStep('gender');
    } else if (step === 'gender' && gender) {
      setStep('height');
    } else if (step === 'height' && isValidHeight()) {
      setStep('age');
    } else if (step === 'age' && isValidAge()) {
      onComplete({ gender, height, age });
    }
  };

  const handleBack = () => {
    if (step === 'gender') {
      setGender('');
      setStep('welcome');
    } else if (step === 'height') {
      setStep('gender');
    } else if (step === 'age') {
      setStep('height');
    }
  };

  const isValidHeight = () => {
    if (!height) return false;
    if (heightUnit === 'cm') {
      const h = parseInt(height);
      return h >= 100 && h <= 250;
    } else {
      const h = parseFloat(height);
      return h >= 3.0 && h <= 8.5;
    }
  };

  const isValidAge = () => {
    if (!age) return false;
    const a = parseInt(age);
    return a >= 13 && a <= 99;
  };

  // Welcome Screen
  if (step === 'welcome') {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.logo}>You Day</h1>
          <p className={styles.tagline}>Your daily transformation</p>

          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>⚡</span>
              <span className={styles.featureText}>Quick 2-pose scan</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>📊</span>
              <span className={styles.featureText}>Instant insights</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>📈</span>
              <span className={styles.featureText}>Track progress</span>
            </div>
          </div>

          <button className={styles.button} onClick={handleContinue}>
            Get Started
          </button>
        </div>
      </div>
    );
  }

  // Gender Selection
  if (step === 'gender') {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <h2 className={styles.title}>Select Gender</h2>
          <p className={styles.subtitle}>For accurate analysis</p>

          <div className={styles.optionsContainer}>
            <button
              className={`${styles.genderOption} ${gender === 'male' ? styles.selectedOption : ''}`}
              onClick={() => setGender('male')}>
              <span className={styles.genderIcon}>👨</span>
              <span className={styles.genderText}>Male</span>
            </button>

            <button
              className={`${styles.genderOption} ${gender === 'female' ? styles.selectedOption : ''}`}
              onClick={() => setGender('female')}>
              <span className={styles.genderIcon}>👩</span>
              <span className={styles.genderText}>Female</span>
            </button>

            <button
              className={`${styles.genderOption} ${gender === 'non-binary' ? styles.selectedOption : ''}`}
              onClick={() => setGender('non-binary')}>
              <span className={styles.genderIcon}>🧑</span>
              <span className={styles.genderText}>Non-binary</span>
            </button>
          </div>

          <button
            className={`${styles.button} ${!gender ? styles.buttonDisabled : ''}`}
            disabled={!gender}
            onClick={handleContinue}>
            Continue
          </button>

          <button className={styles.backButton} onClick={handleBack}>
            Back
          </button>
        </div>
      </div>
    );
  }

  // Height Input
  if (step === 'height') {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <h2 className={styles.title}>Your Height</h2>
          <p className={styles.subtitle}>This helps personalize your analysis</p>

          {/* Unit Toggle */}
          <div className={styles.unitToggle}>
            <button
              className={`${styles.unitButton} ${heightUnit === 'cm' ? styles.unitButtonActive : ''}`}
              onClick={() => setHeightUnit('cm')}>
              cm
            </button>
            <button
              className={`${styles.unitButton} ${heightUnit === 'ft' ? styles.unitButtonActive : ''}`}
              onClick={() => setHeightUnit('ft')}>
              feet
            </button>
          </div>

          {/* Height Input */}
          <div className={styles.inputWrapper}>
            <input
              type="number"
              className={styles.largeInput}
              placeholder={heightUnit === 'cm' ? '175' : '5.9'}
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              maxLength={heightUnit === 'cm' ? 3 : 4}
            />
            <span className={styles.inputUnit}>{heightUnit}</span>
          </div>

          <button
            className={`${styles.button} ${!isValidHeight() ? styles.buttonDisabled : ''}`}
            disabled={!isValidHeight()}
            onClick={handleContinue}>
            Continue
          </button>

          <button className={styles.backButton} onClick={handleBack}>
            Back
          </button>
        </div>
      </div>
    );
  }

  // Age Input
  if (step === 'age') {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <h2 className={styles.title}>Your Age</h2>
          <p className={styles.subtitle}>Helps us understand your fitness stage</p>

          {/* Age Input */}
          <div className={styles.inputWrapper}>
            <input
              type="number"
              className={styles.largeInput}
              placeholder="25"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              maxLength={2}
            />
            <span className={styles.inputUnit}>years</span>
          </div>

          <div className={styles.ageInfo}>
            <span className={styles.infoIcon}>ℹ️</span>
            <span className={styles.infoText}>
              Helps create your personalized training program
            </span>
          </div>

          <button
            className={`${styles.button} ${!isValidAge() ? styles.buttonDisabled : ''}`}
            disabled={!isValidAge()}
            onClick={handleContinue}>
            <span>Start Body Scan</span>
            <span className={styles.buttonIcon}>📸</span>
          </button>

          <button className={styles.backButton} onClick={handleBack}>
            Back
          </button>
        </div>
      </div>
    );
  }

  return null;
}

