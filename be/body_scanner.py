"""
Body Scanner Module - Python implementation
Processes pose landmarks from MediaPipe
"""
from typing import List, Dict, Any
import math


def process_pose_landmarks(landmarks: List[Dict[str, float]]) -> Dict[str, Any]:
    """
    Process raw pose landmarks for validation and quality checks
    
    Args:
        landmarks: List of pose landmarks with x, y, z, visibility
    
    Returns:
        Processed landmarks with quality metrics
    """
    if not landmarks:
        raise ValueError("No landmarks provided")
    
    if len(landmarks) < 33:
        raise ValueError(f"Insufficient landmarks: got {len(landmarks)}, need 33")
    
    # Calculate average visibility
    total_visibility = sum(lm.get('visibility', 0) for lm in landmarks)
    avg_visibility = total_visibility / len(landmarks)
    
    # Check if pose is well-detected (high visibility)
    quality = "excellent" if avg_visibility > 0.8 else "good" if avg_visibility > 0.6 else "poor"
    
    return {
        'landmarks': landmarks,
        'landmark_count': len(landmarks),
        'average_visibility': round(avg_visibility, 3),
        'quality': quality,
        'is_valid': avg_visibility > 0.5
    }


def validate_pose_stability(current_pose: List[Dict[str, float]], 
                            previous_pose: List[Dict[str, float]],
                            threshold: float = 0.1) -> Dict[str, Any]:
    """
    Check if pose is stable between frames
    
    Args:
        current_pose: Current frame landmarks
        previous_pose: Previous frame landmarks
        threshold: Movement threshold for stability
    
    Returns:
        Stability metrics
    """
    if len(current_pose) != len(previous_pose):
        return {
            'is_stable': False,
            'movement': float('inf'),
            'reason': 'Landmark count mismatch'
        }
    
    # Calculate average movement
    total_movement = 0
    for i in range(min(len(current_pose), len(previous_pose))):
        dx = current_pose[i]['x'] - previous_pose[i]['x']
        dy = current_pose[i]['y'] - previous_pose[i]['y']
        total_movement += math.sqrt(dx * dx + dy * dy)
    
    avg_movement = total_movement / len(current_pose)
    is_stable = avg_movement < threshold
    
    return {
        'is_stable': is_stable,
        'movement': round(avg_movement, 4),
        'threshold': threshold,
        'status': 'stable' if is_stable else 'moving'
    }


def extract_key_landmarks(landmarks: List[Dict[str, float]]) -> Dict[str, Dict[str, float]]:
    """
    Extract key body landmarks for easier access
    
    Args:
        landmarks: Full list of pose landmarks
    
    Returns:
        Dictionary of key landmarks
    """
    key_indices = {
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
    
    key_landmarks = {}
    for name, idx in key_indices.items():
        if idx < len(landmarks):
            key_landmarks[name] = landmarks[idx]
    
    return key_landmarks

