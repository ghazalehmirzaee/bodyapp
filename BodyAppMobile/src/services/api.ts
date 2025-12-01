import axios from 'axios';
import type {PhysiqueScore, DietPlan, WorkoutRoutine} from '../types';

const API_URL = 'http://10.0.2.2:8000'; // Android emulator localhost

export async function analyzePhysique(data: any) {
  const response = await axios.post(`${API_URL}/api/analyze-physique`, data);
  return response.data as {
    physique: PhysiqueScore;
    dietPlan: DietPlan;
    workoutRoutine: WorkoutRoutine;
  };
}
















