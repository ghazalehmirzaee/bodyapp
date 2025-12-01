export interface UserData {
  gender: string;
  height?: number;
}

export interface PhysiqueScore {
  overall_score: number;
  body_type: string;
  body_description: string;
  frame: string;
  key_insight: string;
  strong_areas: Array<{ name: string; score: number; description: string }>;
  growth_areas: Array<{ name: string; score: number; description: string }>;
}

export interface DietPlan {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  meals: string[];
}

export interface WorkoutRoutine {
  focus: string;
  days: Array<{
    day: string;
    exercises: string[];
  }>;
}
















