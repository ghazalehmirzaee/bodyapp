"""
Physique Analysis API Router
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime
import json

from services.scoring import score_male_physique, score_female_physique, score_non_binary_physique
from body_analysis import generate_diet_plan, generate_workout_routine
from database.connection import db


router = APIRouter(prefix="/api", tags=["physique"])


class PoseLandmark(BaseModel):
    x: float
    y: float
    z: float
    visibility: float


class TwoPoseAnalyzeRequest(BaseModel):
    frontPose: List[PoseLandmark]
    sidePose: List[PoseLandmark]
    gender: str
    height: Optional[float] = None


@router.post("/analyze-physique")
async def analyze_physique(request: TwoPoseAnalyzeRequest):
    """
    Analyze physique from front and side poses with scoring system
    
    Args:
        request: Contains front pose, side pose, gender, and optional height
    
    Returns:
        Physique scores (0-100), body type, strong areas, growth areas, and insights
    """
    try:
        # Convert Pydantic models to dict format
        front_landmarks = [landmark.dict() for landmark in request.frontPose]
        side_landmarks = [landmark.dict() for landmark in request.sidePose]
        
        print(f"[DEBUG] Received {len(front_landmarks)} front landmarks, {len(side_landmarks)} side landmarks")
        print(f"[DEBUG] Gender: {request.gender}, Height: {request.height}")
        
        # For MVP, use a simple user_id (in production, use proper auth)
        user_id = f"demo_user_{request.gender}"
        
        # Create user if doesn't exist
        print(f"[DEBUG] Creating/checking user: {user_id}")
        db.create_user(user_id, request.gender, request.height)
        
        # Check if this is user's first scan (baseline)
        baseline_scan = db.get_baseline_scan(user_id)
        is_baseline = baseline_scan is None
        print(f"[DEBUG] Is baseline: {is_baseline}")
        
        # Route to appropriate scoring function based on gender
        print(f"[DEBUG] Scoring physique...")
        if request.gender == 'male':
            physique_analysis = score_male_physique(
                front_landmarks,
                side_landmarks,
                request.height
            )
        elif request.gender == 'female':
            physique_analysis = score_female_physique(
                front_landmarks,
                side_landmarks,
                request.height
            )
        elif request.gender == 'non-binary':
            physique_analysis = score_non_binary_physique(
                front_landmarks,
                side_landmarks,
                request.height
            )
        else:
            raise ValueError(f"Invalid gender: {request.gender}")
        
        print(f"[DEBUG] Scoring complete. Overall score: {physique_analysis.get('overall_score')}")
        
        # Save scan to database
        print(f"[DEBUG] Saving scan to database...")
        scan_id = db.save_scan(
            user_id,
            front_landmarks,
            side_landmarks,
            physique_analysis,
            is_baseline=is_baseline
        )
        print(f"[DEBUG] Scan saved with ID: {scan_id}")
        
        # If this is the baseline scan, save baseline metrics
        if is_baseline:
            db.save_baseline_metrics(user_id, scan_id, front_landmarks)
            physique_analysis['is_baseline'] = True
            physique_analysis['message'] = "Great! This is your baseline scan. Future scans will show your progress."
        else:
            # Calculate progression from baseline
            baseline_scores = json.loads(baseline_scan['scores_json'])
            
            # Calculate days since baseline
            baseline_date = datetime.fromisoformat(baseline_scan['scan_date'])
            days_since = (datetime.now() - baseline_date).days
            
            # Save progression
            db.save_progression(
                user_id,
                scan_id,
                physique_analysis['scores'],
                baseline_scores,
                days_since
            )
            
            # Add progression info to response
            physique_analysis['is_baseline'] = False
            physique_analysis['days_since_baseline'] = days_since
            physique_analysis['score_change'] = physique_analysis['overall_score'] - baseline_scan['overall_score']
        
        # Generate diet plan and workout based on physique analysis
        legacy_analysis = {
            'bodyFatEstimate': max(8, min(25, 100 - physique_analysis['overall_score'] * 0.2)),
            'muscleMassEstimate': 100 - max(8, min(25, 100 - physique_analysis['overall_score'] * 0.2)),
            'weakSpots': [area['description'] for area in physique_analysis.get('growth_areas', [])],
        }
        
        diet_plan = generate_diet_plan(legacy_analysis)
        workout = generate_workout_routine(legacy_analysis)
        
        return {
            "physique": physique_analysis,
            "dietPlan": diet_plan,
            "workoutRoutine": workout
        }
    except ValueError as e:
        print(f"[ERROR] ValueError: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"[ERROR] Exception: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Physique analysis failed: {str(e)}")

