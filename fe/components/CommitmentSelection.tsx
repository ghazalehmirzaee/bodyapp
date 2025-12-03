'use client';

import { useState } from 'react';

interface CommitmentSelectionProps {
  onSelect: (days: number) => void;
  onBack: () => void;
}

const COMMITMENT_OPTIONS = [
  {
    days: 7,
    label: '1 Week',
    description: 'Quick start to build momentum',
    icon: '🚀',
    recommended: false,
  },
  {
    days: 30,
    label: '1 Month',
    description: 'Form lasting habits',
    icon: '💪',
    recommended: true,
  },
  {
    days: 90,
    label: '3 Months',
    description: 'Real transformation',
    icon: '🔥',
    recommended: false,
  },
  {
    days: 365,
    label: '1 Year',
    description: 'Complete lifestyle change',
    icon: '👑',
    recommended: false,
  },
];

export default function CommitmentSelection({ onSelect, onBack }: CommitmentSelectionProps) {
  const [selected, setSelected] = useState<number | null>(30);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h2 style={styles.title}>Your Commitment</h2>
        <p style={styles.subtitle}>How long do you want to transform?</p>

        <div style={styles.options}>
          {COMMITMENT_OPTIONS.map((option) => (
            <div
              key={option.days}
              style={{
                ...styles.option,
                ...(selected === option.days ? styles.optionSelected : {}),
              }}
              onClick={() => setSelected(option.days)}
            >
              {option.recommended && (
                <div style={styles.recommendedBadge}>RECOMMENDED</div>
              )}
              <span style={styles.optionIcon}>{option.icon}</span>
              <div style={styles.optionInfo}>
                <h3 style={styles.optionLabel}>{option.label}</h3>
                <p style={styles.optionDesc}>{option.description}</p>
              </div>
              <div style={styles.optionDays}>{option.days} days</div>
            </div>
          ))}
        </div>

        <div style={styles.motivation}>
          <span style={styles.motivationIcon}>💡</span>
          <p style={styles.motivationText}>
            Studies show it takes 66 days to form a new habit. We recommend at least 30 days for visible results!
          </p>
        </div>

        <button
          style={{
            ...styles.continueButton,
            ...(selected ? {} : styles.buttonDisabled),
          }}
          disabled={!selected}
          onClick={() => selected && onSelect(selected)}
        >
          Start My {selected ? COMMITMENT_OPTIONS.find(o => o.days === selected)?.label : ''} Journey
        </button>

        <button style={styles.backButton} onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  content: {
    maxWidth: '500px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: '10px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '16px',
    color: '#2E7D32',
    marginBottom: '40px',
    textAlign: 'center',
  },
  options: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '30px',
  },
  option: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#000000',
    border: '2px solid #2E7D32',
    borderRadius: '15px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  optionSelected: {
    backgroundColor: '#2E7D32',
    borderColor: '#4CAF50',
  },
  recommendedBadge: {
    position: 'absolute',
    top: '-10px',
    right: '15px',
    backgroundColor: '#4CAF50',
    color: '#FFFFFF',
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '4px 10px',
    borderRadius: '10px',
  },
  optionIcon: {
    fontSize: '32px',
    marginRight: '15px',
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    margin: '0 0 5px 0',
  },
  optionDesc: {
    fontSize: '13px',
    color: '#4CAF50',
    margin: 0,
  },
  optionDays: {
    fontSize: '14px',
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  motivation: {
    display: 'flex',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    border: '1px solid #2E7D32',
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '30px',
    width: '100%',
  },
  motivationIcon: {
    fontSize: '24px',
    marginRight: '12px',
    flexShrink: 0,
  },
  motivationText: {
    fontSize: '14px',
    color: '#FFFFFF',
    margin: 0,
    lineHeight: 1.5,
  },
  continueButton: {
    width: '100%',
    padding: '18px 40px',
    backgroundColor: '#2E7D32',
    border: 'none',
    borderRadius: '50px',
    color: '#FFFFFF',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: '15px',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  backButton: {
    padding: '15px 30px',
    backgroundColor: 'transparent',
    border: '2px solid #2E7D32',
    borderRadius: '50px',
    color: '#2E7D32',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

