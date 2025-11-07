"""
FastAPI Backend for Body Composition Scanner
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import uvicorn

from body_analysis import analyze_body, generate_diet_plan, generate_workout_routine
from body_scanner import process_pose_landmarks

app = FastAPI(
    title="Body Composition Scanner API",
    description="AI-powered body analysis, diet planning, and workout generation",
    version="1.0.0"
)

# Configure CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models for request/response
class PoseLandmark(BaseModel):
    x: float
    y: float
    z: float
    visibility: float


class AnalyzeRequest(BaseModel):
    landmarks: List[PoseLandmark]


class Measurements(BaseModel):
    shoulderWidth: float
    chestWidth: float
    waistWidth: float
    hipWidth: float
    armLength: float
    legLength: float


class BodyAnalysisResponse(BaseModel):
    measurements: Measurements
    strongSpots: List[str]
    weakSpots: List[str]
    bodyFatEstimate: float
    muscleMassEstimate: float


class DietPlan(BaseModel):
    calories: int
    protein: int
    carbs: int
    fats: int
    meals: List[str]


class WorkoutDay(BaseModel):
    day: str
    exercises: List[str]


class WorkoutRoutine(BaseModel):
    focus: str
    days: List[WorkoutDay]


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Body Composition Scanner API",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "message": "Backend is running smoothly"
    }


@app.post("/api/analyze", response_model=BodyAnalysisResponse)
async def analyze_body_endpoint(request: AnalyzeRequest):
    """
    Analyze body composition from pose landmarks
    
    Args:
        request: Contains pose landmarks from MediaPipe
    
    Returns:
        Complete body analysis including measurements, strong/weak spots, and estimates
    """
    try:
        # Convert Pydantic models to dict format for processing
        landmarks = [landmark.dict() for landmark in request.landmarks]
        
        # Perform body analysis
        analysis = analyze_body(landmarks)
        
        return analysis
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/api/diet-plan", response_model=DietPlan)
async def get_diet_plan(analysis: BodyAnalysisResponse):
    """
    Generate personalized diet plan based on body analysis
    
    Args:
        analysis: Body analysis results
    
    Returns:
        Personalized diet plan with macros and meal suggestions
    """
    try:
        diet_plan = generate_diet_plan(analysis.dict())
        return diet_plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diet plan generation failed: {str(e)}")


@app.post("/api/workout-routine", response_model=WorkoutRoutine)
async def get_workout_routine(analysis: BodyAnalysisResponse):
    """
    Generate personalized workout routine based on body analysis
    
    Args:
        analysis: Body analysis results
    
    Returns:
        Personalized workout routine targeting weak spots
    """
    try:
        workout = generate_workout_routine(analysis.dict())
        return workout
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Workout generation failed: {str(e)}")


@app.post("/api/analyze-complete")
async def analyze_complete(request: AnalyzeRequest):
    """
    Complete analysis endpoint - returns body analysis, diet plan, and workout routine
    
    Args:
        request: Contains pose landmarks from MediaPipe
    
    Returns:
        Complete package with analysis, diet, and workout
    """
    try:
        # Convert Pydantic models to dict format
        landmarks = [landmark.dict() for landmark in request.landmarks]
        
        # Perform body analysis
        analysis = analyze_body(landmarks)
        
        # Generate diet plan and workout routine
        diet_plan = generate_diet_plan(analysis)
        workout = generate_workout_routine(analysis)
        
        return {
            "analysis": analysis,
            "dietPlan": diet_plan,
            "workoutRoutine": workout
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Complete analysis failed: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

