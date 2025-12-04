"""
Physique Scoring Module - Rating system for body analysis
"""
import math
from typing import List, Dict, Any


def calculate_distance(point1: Dict[str, float], point2: Dict[str, float]) -> float:
    """Calculate Euclidean distance between two pose landmarks"""
    dx = point1['x'] - point2['x']
    dy = point1['y'] - point2['y']
    return math.sqrt(dx * dx + dy * dy)


def score_male_physique(
    front_landmarks: List[Dict[str, float]],
    side_landmarks: List[Dict[str, float]],
    height_cm: float = None
) -> Dict[str, Any]:
    """
    Calculate physique scores for male body (0-100 scale)
    
    Args:
        front_landmarks: Front view pose landmarks
        side_landmarks: Side view pose landmarks
        height_cm: Optional height in centimeters for calibration
    
    Returns:
        Complete physique analysis with scores and insights
    """
    scores = {}
    insights = []
    strong_areas = []
    growth_areas = []
    
    # MediaPipe landmark indices
    LEFT_SHOULDER = 11
    RIGHT_SHOULDER = 12
    LEFT_HIP = 23
    RIGHT_HIP = 24
    LEFT_ELBOW = 13
    RIGHT_ELBOW = 14
    LEFT_WRIST = 15
    RIGHT_WRIST = 16
    NOSE = 0
    LEFT_ANKLE = 27
    RIGHT_ANKLE = 28
    
    # === FRONT VIEW ANALYSIS ===
    
    # 1. SHOULDER SCORE (Width relative to hips)
    shoulder_width = calculate_distance(
        front_landmarks[LEFT_SHOULDER],
        front_landmarks[RIGHT_SHOULDER]
    )
    hip_width = calculate_distance(
        front_landmarks[LEFT_HIP],
        front_landmarks[RIGHT_HIP]
    )
    
    shoulder_hip_ratio = shoulder_width / hip_width if hip_width > 0 else 1.0
    
    if shoulder_hip_ratio >= 1.45:
        scores['shoulders'] = min(100, 85 + (shoulder_hip_ratio - 1.45) * 50)
        strong_areas.append({
            'name': 'Shoulders',
            'score': int(scores['shoulders']),
            'description': 'Outstanding shoulder width - exceptional frame'
        })
    elif shoulder_hip_ratio >= 1.35:
        scores['shoulders'] = 75 + (shoulder_hip_ratio - 1.35) * 100
        strong_areas.append({
            'name': 'Shoulders',
            'score': int(scores['shoulders']),
            'description': 'Excellent shoulder development'
        })
    elif shoulder_hip_ratio >= 1.25:
        scores['shoulders'] = 65 + (shoulder_hip_ratio - 1.25) * 100
    elif shoulder_hip_ratio >= 1.15:
        scores['shoulders'] = 55 + (shoulder_hip_ratio - 1.15) * 100
        growth_areas.append({
            'name': 'Shoulders',
            'score': int(scores['shoulders']),
            'description': 'Build shoulder width with lateral raises and overhead press'
        })
    else:
        scores['shoulders'] = max(40, 40 + shoulder_hip_ratio * 10)
        growth_areas.append({
            'name': 'Shoulders',
            'score': int(scores['shoulders']),
            'description': 'Focus on shoulder width training - high priority'
        })
    
    # 2. V-TAPER SCORE (Shoulder-to-waist ratio)
    # Estimate waist width (typically 0.7-0.8 of hip width)
    waist_width = hip_width * 0.75
    v_taper_ratio = shoulder_width / waist_width if waist_width > 0 else 1.0
    
    if v_taper_ratio >= 1.8:
        scores['v_taper'] = min(100, 90 + (v_taper_ratio - 1.8) * 25)
        strong_areas.append({
            'name': 'V-Taper',
            'score': int(scores['v_taper']),
            'description': 'Elite V-taper physique - competition level'
        })
    elif v_taper_ratio >= 1.6:
        scores['v_taper'] = 75 + (v_taper_ratio - 1.6) * 75
        strong_areas.append({
            'name': 'V-Taper',
            'score': int(scores['v_taper']),
            'description': 'Strong shoulder-to-waist ratio'
        })
    elif v_taper_ratio >= 1.4:
        scores['v_taper'] = 60 + (v_taper_ratio - 1.4) * 75
    else:
        scores['v_taper'] = max(45, v_taper_ratio * 35)
        if scores['v_taper'] < 65:
            growth_areas.append({
                'name': 'V-Taper',
                'score': int(scores['v_taper']),
                'description': 'Build wider shoulders and tighter core'
            })
    
    # 3. CORE/WAIST SCORE (Tightness relative to frame)
    waist_shoulder_ratio = waist_width / shoulder_width if shoulder_width > 0 else 1.0
    
    if waist_shoulder_ratio <= 0.55:
        scores['core'] = min(100, 95 + (0.55 - waist_shoulder_ratio) * 100)
        strong_areas.append({
            'name': 'Core',
            'score': int(scores['core']),
            'description': 'Exceptional core definition and leanness'
        })
    elif waist_shoulder_ratio <= 0.65:
        scores['core'] = 80 + (0.65 - waist_shoulder_ratio) * 150
        strong_areas.append({
            'name': 'Core',
            'score': int(scores['core']),
            'description': 'Well-defined midsection'
        })
    elif waist_shoulder_ratio <= 0.75:
        scores['core'] = 65 + (0.75 - waist_shoulder_ratio) * 150
    else:
        scores['core'] = max(45, 100 - waist_shoulder_ratio * 50)
        growth_areas.append({
            'name': 'Core',
            'score': int(scores['core']),
            'description': 'Focus on core training and body fat reduction'
        })
    
    # 4. SYMMETRY SCORE
    left_shoulder_y = front_landmarks[LEFT_SHOULDER]['y']
    right_shoulder_y = front_landmarks[RIGHT_SHOULDER]['y']
    left_hip_y = front_landmarks[LEFT_HIP]['y']
    right_hip_y = front_landmarks[RIGHT_HIP]['y']
    
    shoulder_imbalance = abs(left_shoulder_y - right_shoulder_y)
    hip_imbalance = abs(left_hip_y - right_hip_y)
    total_imbalance = (shoulder_imbalance + hip_imbalance) / 2
    
    if total_imbalance < 0.015:
        scores['symmetry'] = 95 + (0.015 - total_imbalance) * 333
        strong_areas.append({
            'name': 'Symmetry',
            'score': int(scores['symmetry']),
            'description': 'Perfect left-right balance'
        })
    elif total_imbalance < 0.03:
        scores['symmetry'] = 80 + (0.03 - total_imbalance) * 1000
    elif total_imbalance < 0.05:
        scores['symmetry'] = 65 + (0.05 - total_imbalance) * 750
    else:
        scores['symmetry'] = max(50, 100 - total_imbalance * 800)
        if scores['symmetry'] < 70:
            growth_areas.append({
                'name': 'Symmetry',
                'score': int(scores['symmetry']),
                'description': 'Include unilateral exercises to balance development'
            })
    
    # 5. CHEST SCORE (estimated from shoulder and torso proportions)
    chest_width_estimate = shoulder_width * 0.85
    torso_height = calculate_distance(front_landmarks[NOSE], front_landmarks[LEFT_HIP])
    chest_torso_ratio = chest_width_estimate / torso_height if torso_height > 0 else 1.0
    
    if chest_torso_ratio >= 0.45:
        scores['chest'] = min(100, 85 + (chest_torso_ratio - 0.45) * 200)
        strong_areas.append({
            'name': 'Chest',
            'score': int(scores['chest']),
            'description': 'Well-developed chest'
        })
    elif chest_torso_ratio >= 0.35:
        scores['chest'] = 65 + (chest_torso_ratio - 0.35) * 200
    else:
        scores['chest'] = max(50, chest_torso_ratio * 180)
        if scores['chest'] < 65:
            growth_areas.append({
                'name': 'Chest',
                'score': int(scores['chest']),
                'description': 'Build chest size with bench press variations'
            })
    
    # === SIDE VIEW ANALYSIS ===
    
    # 6. POSTURE SCORE (from side view)
    # Check alignment of head, shoulder, hip
    if side_landmarks:
        nose_side = side_landmarks[NOSE]
        shoulder_side = side_landmarks[LEFT_SHOULDER]
        hip_side = side_landmarks[LEFT_HIP]
        ankle_side = side_landmarks[LEFT_ANKLE]
        
        # Calculate forward head position
        head_forward = abs(nose_side['x'] - shoulder_side['x'])
        # Calculate shoulder to ankle alignment
        vertical_alignment = abs(shoulder_side['x'] - ankle_side['x'])
        
        posture_deviation = (head_forward * 2 + vertical_alignment) / 3
        
        if posture_deviation < 0.08:
            scores['posture'] = 90 + (0.08 - posture_deviation) * 125
            strong_areas.append({
                'name': 'Posture',
                'score': int(scores['posture']),
                'description': 'Excellent upright posture'
            })
        elif posture_deviation < 0.15:
            scores['posture'] = 70 + (0.15 - posture_deviation) * 285
        else:
            scores['posture'] = max(50, 100 - posture_deviation * 300)
            if scores['posture'] < 70:
                growth_areas.append({
                    'name': 'Posture',
                    'score': int(scores['posture']),
                    'description': 'Work on posture - include back strengthening exercises'
                })
    else:
        scores['posture'] = 75  # Default score if no side view
    
    # 7. ARM SCORE (from front view - arm length and proportion)
    arm_length = calculate_distance(
        front_landmarks[LEFT_SHOULDER],
        front_landmarks[LEFT_WRIST]
    )
    leg_length = calculate_distance(
        front_landmarks[LEFT_HIP],
        front_landmarks[LEFT_ANKLE]
    )
    arm_leg_ratio = arm_length / leg_length if leg_length > 0 else 1.0
    
    # Ideal ratio is around 0.45-0.55
    arm_score_base = 100 - abs(arm_leg_ratio - 0.5) * 200
    scores['arms'] = max(60, min(85, arm_score_base))
    
    # Arms are generally a growth area unless exceptionally developed
    if scores['arms'] < 75:
        growth_areas.append({
            'name': 'Arms',
            'score': int(scores['arms']),
            'description': 'Increase arm size with curls and tricep work'
        })
    
    # === OVERALL SCORE ===
    # Weighted average of all components
    scores['overall'] = (
        scores['shoulders'] * 0.20 +
        scores['v_taper'] * 0.18 +
        scores['chest'] * 0.15 +
        scores['core'] * 0.15 +
        scores['symmetry'] * 0.12 +
        scores['posture'] * 0.10 +
        scores['arms'] * 0.10
    )
    
    # === BODY TYPE CLASSIFICATION ===
    if scores['overall'] >= 85:
        body_type = 'Elite Physique'
        body_description = 'Competition-level development'
    elif scores['overall'] >= 75:
        body_type = 'Athletic'
        body_description = 'Strong, well-developed physique'
    elif scores['overall'] >= 65:
        body_type = 'Above Average'
        body_description = 'Good muscle development'
    elif scores['overall'] >= 55:
        body_type = 'Average'
        body_description = 'Solid foundation to build on'
    else:
        body_type = 'Beginner'
        body_description = 'Great potential for improvement'
    
    # === FRAME CLASSIFICATION ===
    if shoulder_hip_ratio >= 1.4:
        frame = 'Wide Frame'
    elif shoulder_hip_ratio >= 1.25:
        frame = 'Athletic Frame'
    elif shoulder_hip_ratio >= 1.15:
        frame = 'Medium Frame'
    else:
        frame = 'Narrow Frame'
    
    # === KEY INSIGHT ===
    # Generate personalized insight based on top scores
    top_score_category = max(scores.items(), key=lambda x: x[1] if x[0] != 'overall' else 0)[0]
    bottom_score_category = min(scores.items(), key=lambda x: x[1] if x[0] != 'overall' else 0)[0]
    
    insight = generate_key_insight(top_score_category, bottom_score_category, scores, body_type)
    
    # Sort and limit strong/growth areas
    strong_areas.sort(key=lambda x: x['score'], reverse=True)
    growth_areas.sort(key=lambda x: x['score'])
    
    return {
        'overall_score': int(scores['overall']),
        'scores': {k: int(v) for k, v in scores.items()},
        'body_type': body_type,
        'body_description': body_description,
        'frame': frame,
        'strong_areas': strong_areas[:3],  # Top 3
        'growth_areas': growth_areas[:3],  # Bottom 3
        'key_insight': insight,
    }


def generate_key_insight(
    top_category: str,
    bottom_category: str,
    scores: Dict[str, float],
    body_type: str
) -> str:
    """Generate personalized insight based on scores"""
    
    insights_map = {
        'shoulders': 'Your shoulders are your greatest strength - they provide an excellent foundation for an impressive physique.',
        'v_taper': 'You have a natural V-taper that many strive for - your shoulder-to-waist ratio is exceptional.',
        'chest': 'Your chest development is strong - continue building on this foundation.',
        'core': 'Your core definition is excellent - this gives you a lean, athletic appearance.',
        'symmetry': 'Your physique shows excellent symmetry - balanced development across both sides.',
        'posture': 'Your posture is outstanding - you carry yourself with confidence and alignment.',
        'arms': 'Your arm proportions are well-balanced with your overall frame.',
    }
    
    growth_map = {
        'shoulders': 'Focus on shoulder width training to enhance your frame.',
        'v_taper': 'Build wider shoulders and tighten your core to improve your V-taper.',
        'chest': 'Prioritize chest development to add thickness to your upper body.',
        'core': 'Core strengthening and fat loss will enhance overall definition.',
        'symmetry': 'Include unilateral exercises to balance your development.',
        'posture': 'Work on posture with back strengthening and mobility work.',
        'arms': 'Add dedicated arm work to match your torso development.',
    }
    
    strength_part = insights_map.get(top_category, 'You have good overall development.')
    growth_part = growth_map.get(bottom_category, 'Keep working consistently on all muscle groups.')
    
    return f"{strength_part} {growth_part}"


def score_female_physique(front_landmarks, side_landmarks, height_cm=None):
    """Placeholder for female physique scoring - to be implemented"""
    return {
        'overall_score': 0,
        'message': 'Female physique analysis coming soon!'
    }


def score_non_binary_physique(front_landmarks, side_landmarks, height_cm=None):
    """Placeholder for non-binary physique scoring - to be implemented"""
    return {
        'overall_score': 0,
        'message': 'Non-binary physique analysis coming soon!'
    }

