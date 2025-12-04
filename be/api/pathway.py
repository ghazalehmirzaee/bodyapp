"""
Pathway API Endpoints

Handles:
- Generating personalized pathways
- Tracking progress
- Managing streaks
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

from services.feature_extraction import extract_body_features
from services.pathway_generator import generate_pathway

router = APIRouter()


class PathwayRequest(BaseModel):
    front_pose: List[Dict[str, float]]
    side_pose: List[Dict[str, float]]
    gender: str = 'male'
    age: Optional[int] = 25
    height: Optional[int] = 175
    commitment_days: int = 30


class StageCompleteRequest(BaseModel):
    pathway_id: str
    stage_day: int
    task_id: str


# In-memory storage for MVP (replace with database later)
pathways_db = {}
user_progress_db = {}


@router.post("/generate-pathway")
async def generate_user_pathway(request: PathwayRequest):
    """
    Generate a personalized Duolingo-style pathway based on body analysis.
    """
    try:
        # Extract body features from pose data
        features = extract_body_features(
            front_pose=request.front_pose,
            side_pose=request.side_pose,
            gender=request.gender
        )
        
        # Prepare user data for pathway generation
        user_data = {
            'gender': request.gender,
            'age': request.age,
            'height': request.height,
            'commitment_days': request.commitment_days,
            'user_id': 'demo_user',  # Replace with actual user ID
        }
        
        # Generate personalized pathway
        pathway = generate_pathway(
            features=features,
            user_data=user_data,
            commitment_days=request.commitment_days
        )
        
        # Store pathway (in-memory for MVP)
        pathways_db[pathway['id']] = pathway
        
        # Initialize user progress
        user_progress_db['demo_user'] = {
            'current_pathway': pathway['id'],
            'current_day': 1,
            'streak': 0,
            'last_activity': datetime.now().isoformat(),
            'total_xp': 0,
            'league': 'bronze',
        }
        
        return {
            'success': True,
            'pathway': pathway,
            'features': features,
            'user_progress': user_progress_db['demo_user'],
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pathway generation failed: {str(e)}")


@router.post("/complete-task")
async def complete_task(request: StageCompleteRequest):
    """Mark a task as completed and update user progress."""
    try:
        pathway = pathways_db.get(request.pathway_id)
        if not pathway:
            raise HTTPException(status_code=404, detail="Pathway not found")
        
        # Find the stage and task
        stage = next((s for s in pathway['stages'] if s['day'] == request.stage_day), None)
        if not stage:
            raise HTTPException(status_code=404, detail="Stage not found")
        
        task = next((t for t in stage['tasks'] if t['id'] == request.task_id), None)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Mark task as completed
        task['completed'] = True
        
        # Update user progress
        progress = user_progress_db.get('demo_user', {})
        progress['total_xp'] = progress.get('total_xp', 0) + task['xp']
        
        # Check if all tasks in stage are complete
        all_complete = all(t['completed'] for t in stage['tasks'])
        if all_complete:
            stage['completed'] = True
            stage['completed_at'] = datetime.now().isoformat()
            
            # Update streak
            progress['streak'] = progress.get('streak', 0) + 1
            progress['last_activity'] = datetime.now().isoformat()
            
            # Check if user can advance to next day
            if progress.get('current_day', 1) == request.stage_day:
                progress['current_day'] = request.stage_day + 1
        
        # Update league based on XP
        total_xp = progress.get('total_xp', 0)
        if total_xp >= 5000:
            progress['league'] = 'diamond'
        elif total_xp >= 2500:
            progress['league'] = 'platinum'
        elif total_xp >= 1000:
            progress['league'] = 'gold'
        elif total_xp >= 500:
            progress['league'] = 'silver'
        else:
            progress['league'] = 'bronze'
        
        user_progress_db['demo_user'] = progress
        
        return {
            'success': True,
            'task_completed': True,
            'stage_completed': all_complete,
            'xp_earned': task['xp'],
            'progress': progress,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pathway/{pathway_id}")
async def get_pathway(pathway_id: str):
    """Get a pathway by ID."""
    pathway = pathways_db.get(pathway_id)
    if not pathway:
        raise HTTPException(status_code=404, detail="Pathway not found")
    
    return {
        'pathway': pathway,
        'progress': user_progress_db.get('demo_user', {}),
    }


@router.get("/user-progress")
async def get_user_progress():
    """Get current user progress."""
    return user_progress_db.get('demo_user', {
        'current_pathway': None,
        'current_day': 1,
        'streak': 0,
        'total_xp': 0,
        'league': 'bronze',
    })

