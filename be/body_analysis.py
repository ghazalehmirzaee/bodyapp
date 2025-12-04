"""
Body Analysis Module - Python implementation
Analyzes body composition, generates diet plans and workout routines
"""
import math
from typing import List, Dict, Any


def calculate_distance(point1: Dict[str, float], point2: Dict[str, float]) -> float:
    """Calculate Euclidean distance between two pose landmarks"""
    dx = point1['x'] - point2['x']
    dy = point1['y'] - point2['y']
    return math.sqrt(dx * dx + dy * dy)


def estimate_bmi(waist_width: float, shoulder_width: float) -> float:
    """
    Simplified BMI estimation based on proportions
    
    Args:
        waist_width: Estimated waist width in cm
        shoulder_width: Estimated shoulder width in cm
    
    Returns:
        Estimated BMI value
    """
    ratio = waist_width / shoulder_width
    return 18 + (ratio - 0.6) * 15


def analyze_body(landmarks: List[Dict[str, float]]) -> Dict[str, Any]:
    """
    Analyze body composition from pose landmarks
    
    Args:
        landmarks: List of pose landmarks with x, y, z, visibility
    
    Returns:
        Complete body analysis with measurements and assessments
    """
    if not landmarks or len(landmarks) < 33:
        raise ValueError('Insufficient pose landmarks detected')
    
    # Key landmark indices (MediaPipe Pose)
    LEFT_SHOULDER = 11
    RIGHT_SHOULDER = 12
    LEFT_HIP = 23
    RIGHT_HIP = 24
    LEFT_ELBOW = 13
    LEFT_WRIST = 15
    LEFT_KNEE = 25
    LEFT_ANKLE = 27
    LEFT_EAR = 7
    NOSE = 0
    
    # Calculate measurements (normalized coordinates, converted to estimated cm)
    shoulder_width = calculate_distance(landmarks[LEFT_SHOULDER], landmarks[RIGHT_SHOULDER]) * 200
    hip_width = calculate_distance(landmarks[LEFT_HIP], landmarks[RIGHT_HIP]) * 200
    arm_length = calculate_distance(landmarks[LEFT_SHOULDER], landmarks[LEFT_WRIST]) * 200
    leg_length = calculate_distance(landmarks[LEFT_HIP], landmarks[LEFT_ANKLE]) * 200
    
    # Estimate chest and waist (using shoulder and hip as proxies)
    chest_width = shoulder_width * 0.85
    waist_width = hip_width * 0.75
    
    # Analyze proportions and symmetry
    shoulder_hip_ratio = shoulder_width / hip_width if hip_width > 0 else 1
    arm_to_leg_ratio = arm_length / leg_length if leg_length > 0 else 1
    upper_body_height = calculate_distance(landmarks[NOSE], landmarks[LEFT_HIP]) * 200
    lower_body_height = leg_length
    torso_leg_ratio = upper_body_height / lower_body_height if lower_body_height > 0 else 1
    
    # Determine strong and weak spots
    strong_spots = []
    weak_spots = []
    
    # Shoulder analysis
    if shoulder_width > 45:
        strong_spots.append('Broad shoulders - excellent upper body frame')
    else:
        weak_spots.append('Narrow shoulders - focus on shoulder width training')
    
    # Waist analysis
    if waist_width < 35:
        strong_spots.append('Lean waist - good core definition')
    elif waist_width > 40:
        weak_spots.append('Wider waist - prioritize core strengthening and fat loss')
    
    # Proportion analysis
    if shoulder_hip_ratio > 1.2:
        strong_spots.append('V-taper physique - excellent shoulder-to-hip ratio')
    elif shoulder_hip_ratio < 1.0:
        weak_spots.append('Hip-dominant frame - focus on shoulder and back development')
    
    if 0.45 < arm_to_leg_ratio < 0.55:
        strong_spots.append('Balanced arm-to-leg proportions')
    elif arm_to_leg_ratio < 0.4:
        weak_spots.append('Shorter arms relative to legs - emphasize arm training')
    else:
        weak_spots.append('Longer arms relative to legs - focus on leg development')
    
    # Posture and symmetry checks
    left_right_shoulder_diff = abs(landmarks[LEFT_SHOULDER]['y'] - landmarks[RIGHT_SHOULDER]['y'])
    left_right_hip_diff = abs(landmarks[LEFT_HIP]['y'] - landmarks[RIGHT_HIP]['y'])
    
    if left_right_shoulder_diff < 0.02:
        strong_spots.append('Excellent shoulder symmetry')
    else:
        weak_spots.append('Shoulder asymmetry detected - focus on unilateral training')
    
    if left_right_hip_diff < 0.02:
        strong_spots.append('Good hip alignment')
    else:
        weak_spots.append('Hip imbalance - include corrective exercises')
    
    # Estimate body composition (simplified)
    bmi_estimate = estimate_bmi(waist_width, shoulder_width)
    body_fat_estimate = max(8, min(25, bmi_estimate * 0.8))
    muscle_mass_estimate = 100 - body_fat_estimate
    
    return {
        'measurements': {
            'shoulderWidth': round(shoulder_width, 1),
            'chestWidth': round(chest_width, 1),
            'waistWidth': round(waist_width, 1),
            'hipWidth': round(hip_width, 1),
            'armLength': round(arm_length, 1),
            'legLength': round(leg_length, 1),
        },
        'strongSpots': strong_spots,
        'weakSpots': weak_spots,
        'bodyFatEstimate': round(body_fat_estimate, 1),
        'muscleMassEstimate': round(muscle_mass_estimate, 1),
    }


def generate_diet_plan(analysis: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate personalized diet plan based on body analysis
    
    Args:
        analysis: Body analysis results
    
    Returns:
        Diet plan with calories, macros, and meal suggestions
    """
    base_calories = 2000
    body_fat = analysis['bodyFatEstimate']
    
    # Adjust calories based on body fat percentage
    if body_fat > 18:
        adjustment = -300
    elif body_fat < 12:
        adjustment = 300
    else:
        adjustment = 0
    
    calories = base_calories + adjustment
    
    # Calculate macros
    protein = round(calories * 0.3 / 4)  # 30% calories from protein (4 cal/g)
    carbs = round(calories * 0.4 / 4)    # 40% calories from carbs (4 cal/g)
    fats = round(calories * 0.3 / 9)     # 30% calories from fats (9 cal/g)
    
    meals = [
        'Breakfast: Oatmeal with berries, Greek yogurt, and almonds',
        'Mid-morning: Protein shake with banana',
        'Lunch: Grilled chicken breast, quinoa, and steamed vegetables',
        'Afternoon snack: Apple with peanut butter',
        'Dinner: Salmon, sweet potato, and mixed greens salad',
        'Evening: Casein protein or cottage cheese',
    ]
    
    return {
        'calories': calories,
        'protein': protein,
        'carbs': carbs,
        'fats': fats,
        'meals': meals,
    }


def generate_workout_routine(analysis: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate personalized workout routine based on body analysis
    
    Args:
        analysis: Body analysis results
    
    Returns:
        Workout routine with focus areas and daily exercises
    """
    weak_spots = analysis['weakSpots']
    
    # Determine training focus
    has_weak_shoulders = any('shoulder' in spot.lower() for spot in weak_spots)
    has_weak_core = any('waist' in spot.lower() or 'core' in spot.lower() for spot in weak_spots)
    has_weak_legs = any('leg' in spot.lower() for spot in weak_spots)
    
    focus = 'Balanced full-body development'
    if has_weak_shoulders:
        focus = 'Upper body emphasis - shoulders and back'
    if has_weak_core:
        focus = 'Core strengthening and definition'
    if has_weak_legs:
        focus = 'Lower body power and size'
    
    days = [
        {
            'day': 'Day 1: Upper Body',
            'exercises': [
                'Barbell Bench Press: 4 sets x 6-8 reps',
                'Overhead Press: 4 sets x 6-8 reps',
                'Pull-ups: 4 sets x 8-10 reps',
                'Barbell Rows: 4 sets x 8-10 reps',
                'Lateral Raises: 3 sets x 12-15 reps',
                'Tricep Dips: 3 sets x 10-12 reps',
            ],
        },
        {
            'day': 'Day 2: Lower Body',
            'exercises': [
                'Barbell Squats: 4 sets x 6-8 reps',
                'Romanian Deadlifts: 4 sets x 8-10 reps',
                'Leg Press: 4 sets x 10-12 reps',
                'Walking Lunges: 3 sets x 12 reps per leg',
                'Leg Curls: 3 sets x 12-15 reps',
                'Calf Raises: 4 sets x 15-20 reps',
            ],
        },
        {
            'day': 'Day 3: Rest',
            'exercises': ['Active recovery: Light stretching or yoga'],
        },
        {
            'day': 'Day 4: Push Focus',
            'exercises': [
                'Incline Dumbbell Press: 4 sets x 8-10 reps',
                'Dumbbell Shoulder Press: 4 sets x 8-10 reps',
                'Cable Flyes: 3 sets x 12-15 reps',
                'Side Lateral Raises: 3 sets x 15 reps',
                'Overhead Tricep Extension: 3 sets x 12 reps',
                'Push-ups: 3 sets to failure',
            ],
        },
        {
            'day': 'Day 5: Pull Focus',
            'exercises': [
                'Deadlifts: 4 sets x 5-6 reps',
                'Wide-Grip Pull-ups: 4 sets x 8-10 reps',
                'T-Bar Rows: 4 sets x 8-10 reps',
                'Face Pulls: 3 sets x 15 reps',
                'Barbell Curls: 3 sets x 10-12 reps',
                'Hammer Curls: 3 sets x 12 reps',
            ],
        },
        {
            'day': 'Day 6: Legs & Core',
            'exercises': [
                'Front Squats: 4 sets x 8-10 reps',
                'Bulgarian Split Squats: 3 sets x 10 reps per leg',
                'Romanian Deadlifts: 3 sets x 10 reps',
                'Plank: 3 sets x 60 seconds',
                'Russian Twists: 3 sets x 20 reps',
                'Leg Raises: 3 sets x 15 reps',
            ],
        },
        {
            'day': 'Day 7: Rest',
            'exercises': ['Complete rest or light activity'],
        },
    ]
    
    return {
        'focus': focus,
        'days': days,
    }

