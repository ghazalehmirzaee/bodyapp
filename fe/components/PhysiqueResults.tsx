'use client';

interface PhysiqueScore {
  overall_score: number;
  scores: { [key: string]: number };
  body_type: string;
  body_description: string;
  frame: string;
  strong_areas: Array<{ name: string; score: number; description: string }>;
  growth_areas: Array<{ name: string; score: number; description: string }>;
  key_insight: string;
}

interface DietPlan {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  meals: string[];
}

interface WorkoutRoutine {
  focus: string;
  days: Array<{
    day: string;
    exercises: string[];
  }>;
}

interface PhysiqueResultsProps {
  physique: PhysiqueScore;
  dietPlan: DietPlan;
  workoutRoutine: WorkoutRoutine;
  onScanAgain: () => void;
}

export default function PhysiqueResults({
  physique,
  dietPlan,
  workoutRoutine,
  onScanAgain,
}: PhysiqueResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 85) return '#4CAF50';
    if (score >= 70) return '#8BC34A';
    if (score >= 60) return '#FFC107';
    return '#FF9800';
  };

  const getOverallGrade = (score: number) => {
    if (score >= 90) return 'S';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  };

  return (
    <div className="results-container">
      <div className="results-content">
        <h1>Your Body Analysis</h1>

        {/* Overall Score Card */}
        <div className="overall-card">
          <div className="overall-score-section">
            <div className="score-circle" style={{ borderColor: getScoreColor(physique.overall_score) }}>
              <span className="score-number">{physique.overall_score}</span>
              <span className="score-max">/100</span>
            </div>
            <div className="overall-info">
              <div className="grade" style={{ color: getScoreColor(physique.overall_score) }}>
                Grade {getOverallGrade(physique.overall_score)}
              </div>
              <h2 className="body-type">{physique.body_type}</h2>
              <p className="body-description">{physique.body_description}</p>
              <div className="frame-badge">{physique.frame}</div>
            </div>
          </div>
        </div>

        {/* Key Insight */}
        <div className="insight-card">
          <div className="insight-icon">💡</div>
          <div className="insight-content">
            <h3>Key Insight</h3>
            <p>{physique.key_insight}</p>
          </div>
        </div>

        {/* Strong Areas & Growth Opportunities */}
        <div className="areas-grid">
          {/* Strong Areas */}
          <div className="areas-section strong-section">
            <h3>💪 Your Strengths</h3>
            <div className="areas-list">
              {physique.strong_areas.map((area, idx) => (
                <div key={idx} className="area-item">
                  <div className="area-header">
                    <span className="area-name">{area.name}</span>
                    <span className="area-score" style={{ color: getScoreColor(area.score) }}>
                      {area.score}/100
                    </span>
                  </div>
                  <div className="area-bar">
                    <div
                      className="area-fill"
                      style={{
                        width: `${area.score}%`,
                        background: getScoreColor(area.score),
                      }}
                    />
                  </div>
                  <p className="area-description">{area.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Growth Areas */}
          <div className="areas-section growth-section">
            <h3>📊 Growth Opportunities</h3>
            <div className="areas-list">
              {physique.growth_areas.map((area, idx) => (
                <div key={idx} className="area-item">
                  <div className="area-header">
                    <span className="area-name">{area.name}</span>
                    <span className="area-score" style={{ color: getScoreColor(area.score) }}>
                      {area.score}/100
                    </span>
                  </div>
                  <div className="area-bar">
                    <div
                      className="area-fill"
                      style={{
                        width: `${area.score}%`,
                        background: getScoreColor(area.score),
                      }}
                    />
                  </div>
                  <p className="area-description">{area.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Diet Plan */}
        <div className="plan-card">
          <h3>🍽️ Your Personalized Diet Plan</h3>
          <div className="macros-grid">
            <div className="macro-item">
              <span className="macro-value">{dietPlan.calories}</span>
              <span className="macro-label">Calories</span>
            </div>
            <div className="macro-item">
              <span className="macro-value">{dietPlan.protein}g</span>
              <span className="macro-label">Protein</span>
            </div>
            <div className="macro-item">
              <span className="macro-value">{dietPlan.carbs}g</span>
              <span className="macro-label">Carbs</span>
            </div>
            <div className="macro-item">
              <span className="macro-value">{dietPlan.fats}g</span>
              <span className="macro-label">Fats</span>
            </div>
          </div>
          <div className="meals-section">
            <h4>Meal Suggestions:</h4>
            <ul>
              {dietPlan.meals.slice(0, 3).map((meal, idx) => (
                <li key={idx}>{meal}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Workout Routine */}
        <div className="plan-card">
          <h3>💪 Your Workout Plan</h3>
          <p className="workout-focus"><strong>Focus:</strong> {workoutRoutine.focus}</p>
          <div className="workout-preview">
            {workoutRoutine.days.slice(0, 2).map((day, idx) => (
              <div key={idx} className="workout-day-preview">
                <h4>{day.day}</h4>
                <ul>
                  {day.exercises.slice(0, 3).map((exercise, exIdx) => (
                    <li key={exIdx}>{exercise}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button className="scan-again-button" onClick={onScanAgain}>
          📸 Scan Again Tomorrow
        </button>
      </div>

      <style jsx>{`
        .results-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 40px 20px;
          animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .results-content {
          max-width: 900px;
          margin: 0 auto;
        }

        h1 {
          text-align: center;
          font-size: 36px;
          font-weight: 800;
          color: #333;
          margin: 0 0 30px 0;
        }

        .overall-card {
          background: white;
          border-radius: 24px;
          padding: 40px;
          margin-bottom: 30px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          animation: slideUp 0.6s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .overall-score-section {
          display: flex;
          align-items: center;
          gap: 40px;
        }

        .score-circle {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          border: 8px solid;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .score-number {
          font-size: 56px;
          font-weight: 800;
          line-height: 1;
          color: #333;
        }

        .score-max {
          font-size: 20px;
          color: #999;
          margin-top: 5px;
        }

        .overall-info {
          flex: 1;
        }

        .grade {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .body-type {
          font-size: 32px;
          font-weight: 700;
          color: #333;
          margin: 0 0 10px 0;
        }

        .body-description {
          font-size: 18px;
          color: #666;
          margin: 0 0 15px 0;
        }

        .frame-badge {
          display: inline-block;
          padding: 8px 20px;
          background: linear-gradient(135deg, #424242 0%, #212121 100%);
          color: white;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }

        .insight-card {
          background: linear-gradient(135deg, #FFD54F 0%, #FFCA28 100%);
          border-radius: 20px;
          padding: 25px;
          margin-bottom: 30px;
          display: flex;
          gap: 20px;
          align-items: flex-start;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
          animation: slideUp 0.7s ease-out;
        }

        .insight-icon {
          font-size: 40px;
          flex-shrink: 0;
        }

        .insight-content h3 {
          margin: 0 0 10px 0;
          font-size: 20px;
          color: #333;
        }

        .insight-content p {
          margin: 0;
          font-size: 16px;
          line-height: 1.6;
          color: #555;
        }

        .areas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 25px;
          margin-bottom: 30px;
        }

        .areas-section {
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
          animation: slideUp 0.8s ease-out;
        }

        .areas-section h3 {
          margin: 0 0 25px 0;
          font-size: 22px;
          font-weight: 700;
          color: #333;
        }

        .strong-section {
          border-left: 5px solid #4CAF50;
        }

        .growth-section {
          border-left: 5px solid #FF9800;
        }

        .areas-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .area-item {
          padding: 15px;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .area-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .area-name {
          font-size: 18px;
          font-weight: 700;
          color: #333;
        }

        .area-score {
          font-size: 16px;
          font-weight: 700;
        }

        .area-bar {
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .area-fill {
          height: 100%;
          transition: width 1s ease-out;
        }

        .area-description {
          margin: 0;
          font-size: 14px;
          color: #666;
          line-height: 1.5;
        }

        .plan-card {
          background: white;
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 25px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
          animation: slideUp 0.9s ease-out;
        }

        .plan-card h3 {
          margin: 0 0 20px 0;
          font-size: 24px;
          font-weight: 700;
          color: #333;
        }

        .macros-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 20px;
          margin-bottom: 25px;
        }

        .macro-item {
          text-align: center;
          padding: 20px;
          background: linear-gradient(135deg, #424242 0%, #212121 100%);
          border-radius: 15px;
          color: white;
        }

        .macro-value {
          display: block;
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 5px;
        }

        .macro-label {
          display: block;
          font-size: 14px;
          opacity: 0.9;
        }

        .meals-section h4 {
          margin: 0 0 15px 0;
          font-size: 18px;
          color: #333;
        }

        .meals-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .meals-section li {
          padding: 12px 0;
          border-bottom: 1px solid #eee;
          color: #666;
          font-size: 15px;
        }

        .meals-section li:last-child {
          border-bottom: none;
        }

        .workout-focus {
          font-size: 16px;
          color: #666;
          margin-bottom: 20px;
        }

        .workout-preview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .workout-day-preview {
          padding: 20px;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .workout-day-preview h4 {
          margin: 0 0 15px 0;
          font-size: 18px;
          color: #4CAF50;
        }

        .workout-day-preview ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .workout-day-preview li {
          padding: 8px 0;
          color: #666;
          font-size: 14px;
        }

        .scan-again-button {
          display: block;
          width: 100%;
          max-width: 400px;
          margin: 40px auto 0;
          padding: 20px 50px;
          background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 20px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 30px rgba(76, 175, 80, 0.4);
        }

        .scan-again-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(76, 175, 80, 0.6);
        }

        @media (max-width: 768px) {
          .overall-score-section {
            flex-direction: column;
            text-align: center;
          }

          .areas-grid {
            grid-template-columns: 1fr;
          }

          h1 {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  );
}

