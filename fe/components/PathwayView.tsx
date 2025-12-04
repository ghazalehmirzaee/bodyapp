'use client';

import { useState } from 'react';

interface Stage {
  day: number;
  title: string;
  type: string;
  difficulty: string;
  xp: number;
  completed: boolean;
  tasks: Task[];
}

interface Task {
  id: string;
  type: string;
  title: string;
  description: string;
  xp: number;
  completed: boolean;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  day: number;
  xp_bonus: number;
  achieved: boolean;
}

interface Pathway {
  id: string;
  title: string;
  description: string;
  commitment_days: number;
  total_xp: number;
  stages: Stage[];
  milestones: Milestone[];
}

interface UserProgress {
  current_day: number;
  streak: number;
  total_xp: number;
  league: string;
}

interface PathwayViewProps {
  pathway: Pathway;
  progress: UserProgress;
  onCompleteTask: (stageDay: number, taskId: string) => void;
  onTakeNewScan: () => void;
}

const LEAGUE_COLORS: { [key: string]: string } = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
  diamond: '#B9F2FF',
};

const LEAGUE_ICONS: { [key: string]: string } = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎',
  diamond: '👑',
};

export default function PathwayView({ pathway, progress, onCompleteTask, onTakeNewScan }: PathwayViewProps) {
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [showStageModal, setShowStageModal] = useState(false);

  const currentDay = progress.current_day || 1;
  const visibleStages = pathway.stages.slice(0, Math.min(currentDay + 6, pathway.stages.length));

  const openStage = (stage: Stage) => {
    if (stage.day <= currentDay) {
      setSelectedStage(stage);
      setShowStageModal(true);
    }
  };

  const handleTaskComplete = (taskId: string) => {
    if (selectedStage) {
      onCompleteTask(selectedStage.day, taskId);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header with stats */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.pathwayTitle}>{pathway.title}</h1>
          <p style={styles.pathwayDesc}>{pathway.description}</p>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.newScanButton} onClick={onTakeNewScan}>
            📸 New Scan
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={styles.statsBar}>
        <div style={styles.stat}>
          <span style={styles.statIcon}>🔥</span>
          <span style={styles.statValue}>{progress.streak}</span>
          <span style={styles.statLabel}>Day Streak</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statIcon}>⚡</span>
          <span style={styles.statValue}>{progress.total_xp}</span>
          <span style={styles.statLabel}>Total XP</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statIcon}>{LEAGUE_ICONS[progress.league] || '🥉'}</span>
          <span style={{...styles.statValue, color: LEAGUE_COLORS[progress.league] || '#CD7F32'}}>
            {progress.league?.charAt(0).toUpperCase() + progress.league?.slice(1)}
          </span>
          <span style={styles.statLabel}>League</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statIcon}>📅</span>
          <span style={styles.statValue}>Day {currentDay}</span>
          <span style={styles.statLabel}>of {pathway.commitment_days}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={styles.progressContainer}>
        <div style={styles.progressBar}>
          <div 
            style={{
              ...styles.progressFill,
              width: `${(currentDay / pathway.commitment_days) * 100}%`,
            }}
          />
        </div>
        <span style={styles.progressText}>
          {Math.round((currentDay / pathway.commitment_days) * 100)}% Complete
        </span>
      </div>

      {/* Pathway stages (Duolingo style) */}
      <div style={styles.pathway}>
        {visibleStages.map((stage, index) => {
          const isLocked = stage.day > currentDay;
          const isCurrent = stage.day === currentDay;
          const isCompleted = stage.completed;

          return (
            <div key={stage.day} style={styles.stageWrapper}>
              {/* Connector line */}
              {index > 0 && (
                <div style={{
                  ...styles.connector,
                  backgroundColor: stage.day <= currentDay ? '#4CAF50' : '#333',
                }} />
              )}
              
              {/* Stage node */}
              <div
                style={{
                  ...styles.stageNode,
                  ...(isCompleted ? styles.stageCompleted : {}),
                  ...(isCurrent ? styles.stageCurrent : {}),
                  ...(isLocked ? styles.stageLocked : {}),
                }}
                onClick={() => openStage(stage)}
              >
                {isCompleted ? '✓' : isLocked ? '🔒' : stage.day}
              </div>
              
              {/* Stage info */}
              <div style={styles.stageInfo}>
                <span style={{
                  ...styles.stageTitle,
                  color: isLocked ? '#666' : '#FFFFFF',
                }}>
                  {stage.title}
                </span>
                <span style={styles.stageXp}>+{stage.xp} XP</span>
              </div>
            </div>
          );
        })}
        
        {/* Show more indicator */}
        {visibleStages.length < pathway.stages.length && (
          <div style={styles.moreStages}>
            ... {pathway.stages.length - visibleStages.length} more stages
          </div>
        )}
      </div>

      {/* Milestones */}
      <div style={styles.milestones}>
        <h3 style={styles.milestonesTitle}>🏆 Upcoming Milestones</h3>
        <div style={styles.milestonesList}>
          {pathway.milestones
            .filter(m => !m.achieved)
            .slice(0, 3)
            .map((milestone) => (
              <div key={milestone.id} style={styles.milestone}>
                <span style={styles.milestoneIcon}>
                  {milestone.day <= currentDay ? '✅' : '⭐'}
                </span>
                <div style={styles.milestoneInfo}>
                  <span style={styles.milestoneTitle}>{milestone.title}</span>
                  <span style={styles.milestoneDesc}>{milestone.description}</span>
                </div>
                <span style={styles.milestoneXp}>+{milestone.xp_bonus} XP</span>
              </div>
            ))}
        </div>
      </div>

      {/* Stage detail modal */}
      {showStageModal && selectedStage && (
        <div style={styles.modalOverlay} onClick={() => setShowStageModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Day {selectedStage.day}: {selectedStage.title}</h3>
              <button 
                style={styles.modalClose}
                onClick={() => setShowStageModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div style={styles.modalContent}>
              <div style={styles.tasksHeader}>
                <span style={styles.tasksTitle}>Today's Tasks</span>
                <span style={styles.tasksXp}>
                  {selectedStage.tasks.filter(t => t.completed).length}/{selectedStage.tasks.length} Complete
                </span>
              </div>
              
              {selectedStage.tasks.map((task) => (
                <div 
                  key={task.id}
                  style={{
                    ...styles.task,
                    ...(task.completed ? styles.taskCompleted : {}),
                  }}
                >
                  <div 
                    style={{
                      ...styles.taskCheckbox,
                      ...(task.completed ? styles.taskCheckboxComplete : {}),
                    }}
                    onClick={() => !task.completed && handleTaskComplete(task.id)}
                  >
                    {task.completed ? '✓' : ''}
                  </div>
                  <div style={styles.taskInfo}>
                    <span style={styles.taskTitle}>{task.title}</span>
                    <span style={styles.taskDesc}>{task.description}</span>
                  </div>
                  <span style={styles.taskXp}>+{task.xp} XP</span>
                </div>
              ))}
            </div>
            
            {selectedStage.completed && (
              <div style={styles.stageCompleteBanner}>
                🎉 Stage Complete! Great work!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#000000',
    padding: '30px 20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '25px',
    maxWidth: '800px',
    margin: '0 auto 25px',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {},
  pathwayTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    margin: '0 0 8px 0',
  },
  pathwayDesc: {
    fontSize: '14px',
    color: '#2E7D32',
    margin: 0,
  },
  newScanButton: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    border: '2px solid #2E7D32',
    borderRadius: '25px',
    color: '#2E7D32',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  statsBar: {
    display: 'flex',
    justifyContent: 'space-around',
    backgroundColor: '#111',
    borderRadius: '15px',
    padding: '20px',
    marginBottom: '25px',
    maxWidth: '800px',
    margin: '0 auto 25px',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
  },
  statIcon: {
    fontSize: '24px',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
  },
  progressContainer: {
    maxWidth: '800px',
    margin: '0 auto 30px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  progressBar: {
    flex: 1,
    height: '12px',
    backgroundColor: '#333',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: '6px',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '14px',
    color: '#4CAF50',
    fontWeight: 'bold',
    minWidth: '100px',
    textAlign: 'right',
  },
  pathway: {
    maxWidth: '400px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: '30px',
  },
  stageWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
  },
  connector: {
    width: '4px',
    height: '30px',
    marginBottom: '10px',
  },
  stageNode: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#2E7D32',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: '10px',
  },
  stageCompleted: {
    backgroundColor: '#4CAF50',
  },
  stageCurrent: {
    boxShadow: '0 0 20px rgba(76, 175, 80, 0.5)',
    transform: 'scale(1.1)',
  },
  stageLocked: {
    backgroundColor: '#333',
    cursor: 'not-allowed',
    color: '#666',
  },
  stageInfo: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  stageTitle: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '4px',
  },
  stageXp: {
    fontSize: '12px',
    color: '#4CAF50',
  },
  moreStages: {
    color: '#666',
    fontSize: '14px',
    marginTop: '20px',
  },
  milestones: {
    maxWidth: '800px',
    margin: '40px auto 0',
    padding: '20px',
    backgroundColor: '#111',
    borderRadius: '15px',
  },
  milestonesTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    margin: '0 0 20px 0',
  },
  milestonesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  milestone: {
    display: 'flex',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: '#1a1a1a',
    borderRadius: '10px',
  },
  milestoneIcon: {
    fontSize: '24px',
    marginRight: '15px',
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    display: 'block',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: '4px',
  },
  milestoneDesc: {
    fontSize: '13px',
    color: '#666',
  },
  milestoneXp: {
    fontSize: '14px',
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    backgroundColor: '#1a1a1a',
    borderRadius: '20px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '80vh',
    overflow: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #333',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    margin: 0,
  },
  modalClose: {
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: '24px',
    cursor: 'pointer',
  },
  modalContent: {
    padding: '20px',
  },
  tasksHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  tasksTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tasksXp: {
    fontSize: '14px',
    color: '#4CAF50',
  },
  task: {
    display: 'flex',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: '#222',
    borderRadius: '12px',
    marginBottom: '12px',
  },
  taskCompleted: {
    opacity: 0.6,
  },
  taskCheckbox: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    border: '2px solid #2E7D32',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '15px',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#FFFFFF',
  },
  taskCheckboxComplete: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    display: 'block',
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: '4px',
  },
  taskDesc: {
    fontSize: '13px',
    color: '#888',
  },
  taskXp: {
    fontSize: '14px',
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  stageCompleteBanner: {
    padding: '20px',
    backgroundColor: '#2E7D32',
    textAlign: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    borderBottomLeftRadius: '20px',
    borderBottomRightRadius: '20px',
  },
};

