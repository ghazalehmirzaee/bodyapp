import { PoseLandmarks, BodyAnalysis } from './bodyScanner';

export function analyzeBody(landmarks: PoseLandmarks[]): BodyAnalysis {
  if (!landmarks || landmarks.length < 33) {
    throw new Error('Insufficient pose landmarks detected');
  }

  // Key landmark indices
  const LEFT_SHOULDER = 11;
  const RIGHT_SHOULDER = 12;
  const LEFT_HIP = 23;
  const RIGHT_HIP = 24;
  const LEFT_ELBOW = 13;
  const LEFT_WRIST = 15;
  const LEFT_KNEE = 25;
  const LEFT_ANKLE = 27;
  const LEFT_EAR = 7;
  const NOSE = 0;

  // Calculate measurements (normalized coordinates, converted to estimated cm)
  const shoulderWidth = calculateDistance(landmarks[LEFT_SHOULDER], landmarks[RIGHT_SHOULDER]) * 200;
  const hipWidth = calculateDistance(landmarks[LEFT_HIP], landmarks[RIGHT_HIP]) * 200;
  const armLength = calculateDistance(landmarks[LEFT_SHOULDER], landmarks[LEFT_WRIST]) * 200;
  const legLength = calculateDistance(landmarks[LEFT_HIP], landmarks[LEFT_ANKLE]) * 200;
  
  // Estimate chest and waist (using shoulder and hip as proxies)
  const chestWidth = shoulderWidth * 0.85;
  const waistWidth = hipWidth * 0.75;

  // Analyze proportions and symmetry
  const shoulderHipRatio = shoulderWidth / hipWidth;
  const armToLegRatio = armLength / legLength;
  const upperBodyHeight = calculateDistance(landmarks[NOSE], landmarks[LEFT_HIP]) * 200;
  const lowerBodyHeight = legLength;
  const torsoLegRatio = upperBodyHeight / lowerBodyHeight;

  // Determine strong and weak spots
  const strongSpots: string[] = [];
  const weakSpots: string[] = [];

  // Shoulder analysis
  if (shoulderWidth > 45) {
    strongSpots.push('Broad shoulders - excellent upper body frame');
  } else {
    weakSpots.push('Narrow shoulders - focus on shoulder width training');
  }

  // Waist analysis
  if (waistWidth < 35) {
    strongSpots.push('Lean waist - good core definition');
  } else if (waistWidth > 40) {
    weakSpots.push('Wider waist - prioritize core strengthening and fat loss');
  }

  // Proportion analysis
  if (shoulderHipRatio > 1.2) {
    strongSpots.push('V-taper physique - excellent shoulder-to-hip ratio');
  } else if (shoulderHipRatio < 1.0) {
    weakSpots.push('Hip-dominant frame - focus on shoulder and back development');
  }

  if (armToLegRatio > 0.45 && armToLegRatio < 0.55) {
    strongSpots.push('Balanced arm-to-leg proportions');
  } else if (armToLegRatio < 0.4) {
    weakSpots.push('Shorter arms relative to legs - emphasize arm training');
  } else {
    weakSpots.push('Longer arms relative to legs - focus on leg development');
  }

  // Posture and symmetry checks
  const leftRightShoulderDiff = Math.abs(
    landmarks[LEFT_SHOULDER].y - landmarks[RIGHT_SHOULDER].y
  );
  const leftRightHipDiff = Math.abs(
    landmarks[LEFT_HIP].y - landmarks[RIGHT_HIP].y
  );

  if (leftRightShoulderDiff < 0.02) {
    strongSpots.push('Excellent shoulder symmetry');
  } else {
    weakSpots.push('Shoulder asymmetry detected - focus on unilateral training');
  }

  if (leftRightHipDiff < 0.02) {
    strongSpots.push('Good hip alignment');
  } else {
    weakSpots.push('Hip imbalance - include corrective exercises');
  }

  // Estimate body composition (simplified)
  const bmiEstimate = estimateBMI(waistWidth, shoulderWidth);
  const bodyFatEstimate = Math.max(8, Math.min(25, bmiEstimate * 0.8));
  const muscleMassEstimate = 100 - bodyFatEstimate;

  return {
    measurements: {
      shoulderWidth: Math.round(shoulderWidth * 10) / 10,
      chestWidth: Math.round(chestWidth * 10) / 10,
      waistWidth: Math.round(waistWidth * 10) / 10,
      hipWidth: Math.round(hipWidth * 10) / 10,
      armLength: Math.round(armLength * 10) / 10,
      legLength: Math.round(legLength * 10) / 10,
    },
    strongSpots,
    weakSpots,
    bodyFatEstimate: Math.round(bodyFatEstimate * 10) / 10,
    muscleMassEstimate: Math.round(muscleMassEstimate * 10) / 10,
  };
}

function calculateDistance(point1: PoseLandmarks, point2: PoseLandmarks): number {
  const dx = point1.x - point2.x;
  const dy = point1.y - point2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function estimateBMI(waistWidth: number, shoulderWidth: number): number {
  // Simplified BMI estimation based on proportions
  const ratio = waistWidth / shoulderWidth;
  return 18 + (ratio - 0.6) * 15; // Rough estimate
}

export function generateDietPlan(analysis: BodyAnalysis): {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  meals: string[];
} {
  const baseCalories = 2000;
  const adjustment = analysis.bodyFatEstimate > 18 ? -300 : analysis.bodyFatEstimate < 12 ? 300 : 0;
  const calories = baseCalories + adjustment;

  const protein = Math.round(calories * 0.3 / 4); // 30% calories from protein
  const carbs = Math.round(calories * 0.4 / 4); // 40% calories from carbs
  const fats = Math.round(calories * 0.3 / 9); // 30% calories from fats

  const meals = [
    'Breakfast: Oatmeal with berries, Greek yogurt, and almonds',
    'Mid-morning: Protein shake with banana',
    'Lunch: Grilled chicken breast, quinoa, and steamed vegetables',
    'Afternoon snack: Apple with peanut butter',
    'Dinner: Salmon, sweet potato, and mixed greens salad',
    'Evening: Casein protein or cottage cheese',
  ];

  return { calories, protein, carbs, fats, meals };
}

export function generateWorkoutRoutine(analysis: BodyAnalysis): {
  focus: string;
  days: Array<{ day: string; exercises: string[] }>;
} {
  const hasWeakShoulders = analysis.weakSpots.some(s => s.includes('shoulder'));
  const hasWeakCore = analysis.weakSpots.some(s => s.includes('waist') || s.includes('core'));
  const hasWeakLegs = analysis.weakSpots.some(s => s.includes('leg'));

  let focus = 'Balanced full-body development';
  if (hasWeakShoulders) focus = 'Upper body emphasis - shoulders and back';
  if (hasWeakCore) focus = 'Core strengthening and definition';
  if (hasWeakLegs) focus = 'Lower body power and size';

  const days = [
    {
      day: 'Day 1: Upper Body',
      exercises: [
        'Barbell Bench Press: 4 sets x 6-8 reps',
        'Overhead Press: 4 sets x 6-8 reps',
        'Pull-ups: 4 sets x 8-10 reps',
        'Barbell Rows: 4 sets x 8-10 reps',
        'Lateral Raises: 3 sets x 12-15 reps',
        'Tricep Dips: 3 sets x 10-12 reps',
      ],
    },
    {
      day: 'Day 2: Lower Body',
      exercises: [
        'Barbell Squats: 4 sets x 6-8 reps',
        'Romanian Deadlifts: 4 sets x 8-10 reps',
        'Leg Press: 4 sets x 10-12 reps',
        'Walking Lunges: 3 sets x 12 reps per leg',
        'Leg Curls: 3 sets x 12-15 reps',
        'Calf Raises: 4 sets x 15-20 reps',
      ],
    },
    {
      day: 'Day 3: Rest',
      exercises: ['Active recovery: Light stretching or yoga'],
    },
    {
      day: 'Day 4: Push Focus',
      exercises: [
        'Incline Dumbbell Press: 4 sets x 8-10 reps',
        'Dumbbell Shoulder Press: 4 sets x 8-10 reps',
        'Cable Flyes: 3 sets x 12-15 reps',
        'Side Lateral Raises: 3 sets x 15 reps',
        'Overhead Tricep Extension: 3 sets x 12 reps',
        'Push-ups: 3 sets to failure',
      ],
    },
    {
      day: 'Day 5: Pull Focus',
      exercises: [
        'Deadlifts: 4 sets x 5-6 reps',
        'Wide-Grip Pull-ups: 4 sets x 8-10 reps',
        'T-Bar Rows: 4 sets x 8-10 reps',
        'Face Pulls: 3 sets x 15 reps',
        'Barbell Curls: 3 sets x 10-12 reps',
        'Hammer Curls: 3 sets x 12 reps',
      ],
    },
    {
      day: 'Day 6: Legs & Core',
      exercises: [
        'Front Squats: 4 sets x 8-10 reps',
        'Bulgarian Split Squats: 3 sets x 10 reps per leg',
        'Romanian Deadlifts: 3 sets x 10 reps',
        'Plank: 3 sets x 60 seconds',
        'Russian Twists: 3 sets x 20 reps',
        'Leg Raises: 3 sets x 15 reps',
      ],
    },
    {
      day: 'Day 7: Rest',
      exercises: ['Complete rest or light activity'],
    },
  ];

  return { focus, days };
}

