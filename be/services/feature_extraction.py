"""
Body Feature Extraction Service

Extracts measurable features from pose landmarks for:
1. Storing in database for progress tracking
2. Feeding to LLM for personalized pathway generation
"""

from typing import Dict, List, Any
import math


def calculate_distance(p1: Dict, p2: Dict) -> float:
    """Calculate Euclidean distance between two landmarks."""
    return math.sqrt((p1['x'] - p2['x'])**2 + (p1['y'] - p2['y'])**2)


def calculate_angle(p1: Dict, p2: Dict, p3: Dict) -> float:
    """Calculate angle at p2 formed by p1-p2-p3."""
    v1 = (p1['x'] - p2['x'], p1['y'] - p2['y'])
    v2 = (p3['x'] - p2['x'], p3['y'] - p2['y'])
    
    dot = v1[0] * v2[0] + v1[1] * v2[1]
    mag1 = math.sqrt(v1[0]**2 + v1[1]**2)
    mag2 = math.sqrt(v2[0]**2 + v2[1]**2)
    
    if mag1 * mag2 == 0:
        return 0
    
    cos_angle = max(-1, min(1, dot / (mag1 * mag2)))
    return math.degrees(math.acos(cos_angle))


# MediaPipe landmark indices
LANDMARKS = {
    'nose': 0,
    'left_eye': 2,
    'right_eye': 5,
    'left_ear': 7,
    'right_ear': 8,
    'left_shoulder': 11,
    'right_shoulder': 12,
    'left_elbow': 13,
    'right_elbow': 14,
    'left_wrist': 15,
    'right_wrist': 16,
    'left_hip': 23,
    'right_hip': 24,
    'left_knee': 25,
    'right_knee': 26,
    'left_ankle': 27,
    'right_ankle': 28,
}


def extract_body_features(front_pose: List[Dict], side_pose: List[Dict], gender: str = 'male') -> Dict[str, Any]:
    """
    Extract comprehensive body features from front and side pose landmarks.
    
    Returns a dictionary of features that can be:
    1. Stored in database
    2. Fed to LLM for pathway generation
    3. Used for progress tracking over time
    """
    
    features = {
        'raw_measurements': {},
        'ratios': {},
        'scores': {},
        'insights': [],
        'focus_areas': [],
    }
    
    try:
        # Get key landmarks from front pose
        left_shoulder = front_pose[LANDMARKS['left_shoulder']]
        right_shoulder = front_pose[LANDMARKS['right_shoulder']]
        left_hip = front_pose[LANDMARKS['left_hip']]
        right_hip = front_pose[LANDMARKS['right_hip']]
        left_knee = front_pose[LANDMARKS['left_knee']]
        right_knee = front_pose[LANDMARKS['right_knee']]
        left_ankle = front_pose[LANDMARKS['left_ankle']]
        right_ankle = front_pose[LANDMARKS['right_ankle']]
        nose = front_pose[LANDMARKS['nose']]
        
        # === RAW MEASUREMENTS (normalized to body height) ===
        
        # Shoulder width
        shoulder_width = calculate_distance(left_shoulder, right_shoulder)
        
        # Hip width
        hip_width = calculate_distance(left_hip, right_hip)
        
        # Torso length (shoulder to hip)
        torso_length = (calculate_distance(left_shoulder, left_hip) + 
                       calculate_distance(right_shoulder, right_hip)) / 2
        
        # Leg length (hip to ankle)
        leg_length = (calculate_distance(left_hip, left_ankle) + 
                     calculate_distance(right_hip, right_ankle)) / 2
        
        # Body height estimate (nose to ankle midpoint)
        ankle_midpoint = {
            'x': (left_ankle['x'] + right_ankle['x']) / 2,
            'y': (left_ankle['y'] + right_ankle['y']) / 2
        }
        body_height = calculate_distance(nose, ankle_midpoint)
        
        features['raw_measurements'] = {
            'shoulder_width': round(shoulder_width, 4),
            'hip_width': round(hip_width, 4),
            'torso_length': round(torso_length, 4),
            'leg_length': round(leg_length, 4),
            'body_height': round(body_height, 4),
        }
        
        # === RATIOS (key for physique analysis) ===
        
        # Shoulder-to-hip ratio (V-taper indicator)
        shoulder_hip_ratio = shoulder_width / hip_width if hip_width > 0 else 0
        
        # Shoulder-to-waist ratio (approximated)
        waist_width = hip_width * 0.85  # Estimate waist as 85% of hip
        shoulder_waist_ratio = shoulder_width / waist_width if waist_width > 0 else 0
        
        # Torso-to-leg ratio
        torso_leg_ratio = torso_length / leg_length if leg_length > 0 else 0
        
        # Symmetry score (left vs right comparison)
        left_arm_length = calculate_distance(
            front_pose[LANDMARKS['left_shoulder']], 
            front_pose[LANDMARKS['left_wrist']]
        )
        right_arm_length = calculate_distance(
            front_pose[LANDMARKS['right_shoulder']], 
            front_pose[LANDMARKS['right_wrist']]
        )
        symmetry = 1 - abs(left_arm_length - right_arm_length) / max(left_arm_length, right_arm_length, 0.001)
        
        features['ratios'] = {
            'shoulder_hip_ratio': round(shoulder_hip_ratio, 3),
            'shoulder_waist_ratio': round(shoulder_waist_ratio, 3),
            'torso_leg_ratio': round(torso_leg_ratio, 3),
            'symmetry': round(symmetry, 3),
        }
        
        # === SCORES (0-100 scale) ===
        
        # V-taper score (ideal ~1.6 for men, ~1.4 for women)
        ideal_shr = 1.6 if gender == 'male' else 1.4
        vtaper_score = max(0, min(100, 100 - abs(shoulder_hip_ratio - ideal_shr) * 50))
        
        # Symmetry score
        symmetry_score = symmetry * 100
        
        # Posture score (from side pose if available)
        posture_score = calculate_posture_score(side_pose)
        
        # Overall physique score
        overall_score = (vtaper_score * 0.35 + symmetry_score * 0.25 + posture_score * 0.40)
        
        features['scores'] = {
            'vtaper': round(vtaper_score),
            'symmetry': round(symmetry_score),
            'posture': round(posture_score),
            'overall': round(overall_score),
        }
        
        # === INSIGHTS (text descriptions for LLM) ===
        
        insights = []
        
        if vtaper_score >= 80:
            insights.append("Excellent shoulder-to-hip ratio indicating good V-taper")
        elif vtaper_score >= 60:
            insights.append("Good foundation for V-taper, can be improved with shoulder/lat work")
        else:
            insights.append("V-taper needs development - focus on shoulder width and waist reduction")
        
        if symmetry_score >= 90:
            insights.append("Excellent left-right body symmetry")
        elif symmetry_score >= 75:
            insights.append("Good symmetry with minor imbalances to address")
        else:
            insights.append("Noticeable asymmetry - incorporate unilateral exercises")
        
        if posture_score >= 80:
            insights.append("Good posture alignment")
        elif posture_score >= 60:
            insights.append("Some postural issues - focus on core and back strengthening")
        else:
            insights.append("Significant posture concerns - prioritize corrective exercises")
        
        features['insights'] = insights
        
        # === FOCUS AREAS (for pathway generation) ===
        
        focus_areas = []
        
        if vtaper_score < 70:
            focus_areas.append({
                'area': 'shoulders',
                'priority': 'high' if vtaper_score < 50 else 'medium',
                'recommendation': 'Lateral raises, overhead press, face pulls'
            })
            focus_areas.append({
                'area': 'lats',
                'priority': 'high' if vtaper_score < 50 else 'medium', 
                'recommendation': 'Pull-ups, lat pulldowns, rows'
            })
        
        if symmetry_score < 85:
            focus_areas.append({
                'area': 'symmetry',
                'priority': 'medium',
                'recommendation': 'Unilateral dumbbell exercises, single-leg work'
            })
        
        if posture_score < 70:
            focus_areas.append({
                'area': 'posture',
                'priority': 'high' if posture_score < 50 else 'medium',
                'recommendation': 'Core work, back extensions, stretching'
            })
        
        # Add general areas based on gender preferences
        if gender == 'male':
            focus_areas.append({
                'area': 'chest',
                'priority': 'medium',
                'recommendation': 'Bench press variations, push-ups, flyes'
            })
            focus_areas.append({
                'area': 'arms',
                'priority': 'low',
                'recommendation': 'Compound movements + isolation work'
            })
        else:
            focus_areas.append({
                'area': 'glutes',
                'priority': 'medium',
                'recommendation': 'Hip thrusts, squats, lunges'
            })
            focus_areas.append({
                'area': 'core',
                'priority': 'medium',
                'recommendation': 'Planks, dead bugs, ab work'
            })
        
        features['focus_areas'] = focus_areas
        
    except Exception as e:
        print(f"Feature extraction error: {e}")
        # Return default features on error
        features['scores'] = {'overall': 70, 'vtaper': 70, 'symmetry': 80, 'posture': 70}
        features['insights'] = ["Unable to fully analyze - using baseline assessment"]
        features['focus_areas'] = [{'area': 'general fitness', 'priority': 'medium', 'recommendation': 'Full body training'}]
    
    return features


def calculate_posture_score(side_pose: List[Dict]) -> float:
    """Calculate posture score from side view landmarks."""
    try:
        ear = side_pose[LANDMARKS['left_ear']]
        shoulder = side_pose[LANDMARKS['left_shoulder']]
        hip = side_pose[LANDMARKS['left_hip']]
        knee = side_pose[LANDMARKS['left_knee']]
        ankle = side_pose[LANDMARKS['left_ankle']]
        
        # Ideal posture: ear, shoulder, hip roughly vertically aligned
        # Calculate horizontal deviation
        ear_shoulder_deviation = abs(ear['x'] - shoulder['x'])
        shoulder_hip_deviation = abs(shoulder['x'] - hip['x'])
        
        # Lower deviation = better posture
        total_deviation = ear_shoulder_deviation + shoulder_hip_deviation
        
        # Convert to score (0-100)
        score = max(0, min(100, 100 - total_deviation * 200))
        
        return score
    except:
        return 70  # Default score


def features_to_llm_prompt(features: Dict[str, Any], user_data: Dict) -> str:
    """
    Convert extracted features to a prompt for LLM pathway generation.
    """
    prompt = f"""Based on the following body analysis, create a personalized fitness pathway:

USER PROFILE:
- Gender: {user_data.get('gender', 'male')}
- Age: {user_data.get('age', 25)}
- Height: {user_data.get('height', 175)}cm
- Commitment: {user_data.get('commitment_days', 30)} days

BODY ANALYSIS SCORES:
- Overall Score: {features['scores'].get('overall', 70)}/100
- V-Taper Score: {features['scores'].get('vtaper', 70)}/100
- Symmetry Score: {features['scores'].get('symmetry', 80)}/100
- Posture Score: {features['scores'].get('posture', 70)}/100

KEY RATIOS:
- Shoulder-to-Hip Ratio: {features['ratios'].get('shoulder_hip_ratio', 1.4)}
- Symmetry: {features['ratios'].get('symmetry', 0.95)}

INSIGHTS:
{chr(10).join('- ' + insight for insight in features.get('insights', []))}

FOCUS AREAS:
{chr(10).join(f"- {area['area'].upper()} ({area['priority']} priority): {area['recommendation']}" for area in features.get('focus_areas', []))}

Please generate a personalized {user_data.get('commitment_days', 30)}-day pathway with daily stages. Each stage should include:
1. A workout or exercise focus
2. A nutrition tip
3. A mindset/habit focus
4. XP points (10-50 based on difficulty)

Format as JSON array of daily stages.
"""
    return prompt

