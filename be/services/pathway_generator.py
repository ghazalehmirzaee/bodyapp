"""
LLM-Powered Pathway Generator

Creates personalized Duolingo-style improvement pathways based on:
1. Body feature analysis
2. User preferences
3. Commitment period
"""

import json
import os
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import random

# For actual LLM integration, you would use:
# import openai
# openai.api_key = os.getenv('OPENAI_API_KEY')


def generate_pathway(
    features: Dict[str, Any],
    user_data: Dict[str, Any],
    commitment_days: int = 30
) -> Dict[str, Any]:
    """
    Generate a personalized Duolingo-style pathway.
    
    For MVP: Uses rule-based generation
    For Production: Would use GPT-4 or similar LLM
    """
    
    pathway = {
        'id': f"pathway_{datetime.now().strftime('%Y%m%d%H%M%S')}",
        'user_id': user_data.get('user_id', 'demo_user'),
        'created_at': datetime.now().isoformat(),
        'commitment_days': commitment_days,
        'title': generate_pathway_title(features, user_data),
        'description': generate_pathway_description(features),
        'total_xp': 0,
        'stages': [],
        'milestones': [],
        'focus_areas': features.get('focus_areas', []),
    }
    
    # Generate daily stages
    stages = generate_daily_stages(features, user_data, commitment_days)
    pathway['stages'] = stages
    pathway['total_xp'] = sum(stage['xp'] for stage in stages)
    
    # Generate milestones
    pathway['milestones'] = generate_milestones(commitment_days)
    
    return pathway


def generate_pathway_title(features: Dict, user_data: Dict) -> str:
    """Generate a motivating pathway title based on user's focus areas."""
    
    overall_score = features.get('scores', {}).get('overall', 70)
    gender = user_data.get('gender', 'male')
    
    if overall_score >= 80:
        titles = [
            "Elite Physique Refinement",
            "Advanced Aesthetics Journey",
            "Peak Performance Path"
        ]
    elif overall_score >= 60:
        titles = [
            "Body Transformation Journey",
            "Physique Evolution Path",
            "Athletic Build Program"
        ]
    else:
        titles = [
            "Foundation Builder",
            "Transformation Starter",
            "New You Journey"
        ]
    
    return random.choice(titles)


def generate_pathway_description(features: Dict) -> str:
    """Generate pathway description based on analysis."""
    
    focus_areas = features.get('focus_areas', [])
    high_priority = [a for a in focus_areas if a.get('priority') == 'high']
    
    if high_priority:
        main_focus = high_priority[0]['area']
        return f"A personalized journey focusing on {main_focus} development, with balanced attention to overall physique improvement and healthy habits."
    
    return "A comprehensive program designed to enhance your physique through targeted workouts, nutrition guidance, and mindset development."


def generate_daily_stages(
    features: Dict,
    user_data: Dict,
    commitment_days: int
) -> List[Dict]:
    """Generate all daily stages for the pathway."""
    
    stages = []
    focus_areas = features.get('focus_areas', [])
    
    # Workout templates based on focus areas
    workout_templates = get_workout_templates(focus_areas, user_data.get('gender', 'male'))
    
    # Generate each day's stage
    for day in range(1, commitment_days + 1):
        stage = generate_single_stage(day, commitment_days, workout_templates, features)
        stages.append(stage)
    
    return stages


def generate_single_stage(
    day: int,
    total_days: int,
    workout_templates: List[Dict],
    features: Dict
) -> Dict:
    """Generate a single day's stage."""
    
    # Determine stage type based on day
    is_rest_day = day % 7 == 0  # Every 7th day is rest
    is_assessment_day = day % 14 == 0  # Every 14th day is assessment
    
    if is_assessment_day:
        stage_type = 'assessment'
        title = f"Progress Check #{day // 14}"
        xp = 50
    elif is_rest_day:
        stage_type = 'recovery'
        title = "Active Recovery Day"
        xp = 15
    else:
        stage_type = 'workout'
        workout_idx = (day - 1) % len(workout_templates)
        title = workout_templates[workout_idx]['name']
        xp = workout_templates[workout_idx].get('xp', 30)
    
    # Progress through difficulty
    difficulty = get_difficulty_for_day(day, total_days)
    
    stage = {
        'day': day,
        'title': title,
        'type': stage_type,
        'difficulty': difficulty,
        'xp': xp,
        'completed': False,
        'completed_at': None,
        'tasks': generate_stage_tasks(stage_type, workout_templates, day, features),
    }
    
    return stage


def get_difficulty_for_day(day: int, total_days: int) -> str:
    """Progressive difficulty based on day in program."""
    progress = day / total_days
    
    if progress < 0.25:
        return 'beginner'
    elif progress < 0.5:
        return 'intermediate'
    elif progress < 0.75:
        return 'advanced'
    else:
        return 'elite'


def generate_stage_tasks(
    stage_type: str,
    workout_templates: List[Dict],
    day: int,
    features: Dict
) -> List[Dict]:
    """Generate tasks for a stage (like Duolingo lessons)."""
    
    tasks = []
    
    if stage_type == 'workout':
        workout_idx = (day - 1) % len(workout_templates)
        workout = workout_templates[workout_idx]
        
        # Workout task
        tasks.append({
            'id': f"task_{day}_workout",
            'type': 'workout',
            'title': workout['name'],
            'description': workout['description'],
            'exercises': workout.get('exercises', []),
            'duration_minutes': workout.get('duration', 30),
            'xp': 20,
            'completed': False,
        })
        
        # Nutrition task
        tasks.append({
            'id': f"task_{day}_nutrition",
            'type': 'nutrition',
            'title': 'Log Your Meals',
            'description': get_nutrition_tip(day),
            'xp': 5,
            'completed': False,
        })
        
        # Mindset task
        tasks.append({
            'id': f"task_{day}_mindset",
            'type': 'mindset',
            'title': get_mindset_task(day)['title'],
            'description': get_mindset_task(day)['description'],
            'xp': 5,
            'completed': False,
        })
        
    elif stage_type == 'recovery':
        tasks.append({
            'id': f"task_{day}_stretch",
            'type': 'stretch',
            'title': 'Mobility Routine',
            'description': '15-minute stretching and mobility work',
            'duration_minutes': 15,
            'xp': 10,
            'completed': False,
        })
        
        tasks.append({
            'id': f"task_{day}_reflect",
            'type': 'reflection',
            'title': 'Weekly Reflection',
            'description': 'Review your progress and set intentions for next week',
            'xp': 5,
            'completed': False,
        })
        
    elif stage_type == 'assessment':
        tasks.append({
            'id': f"task_{day}_photos",
            'type': 'photos',
            'title': 'Progress Photos',
            'description': 'Take new front and side photos to track changes',
            'xp': 30,
            'completed': False,
        })
        
        tasks.append({
            'id': f"task_{day}_measurements",
            'type': 'measurements',
            'title': 'Body Measurements',
            'description': 'Record weight and key measurements',
            'xp': 10,
            'completed': False,
        })
        
        tasks.append({
            'id': f"task_{day}_review",
            'type': 'review',
            'title': 'AI Progress Analysis',
            'description': 'Review your transformation with AI insights',
            'xp': 10,
            'completed': False,
        })
    
    return tasks


def get_workout_templates(focus_areas: List[Dict], gender: str) -> List[Dict]:
    """Get workout templates based on focus areas."""
    
    templates = []
    
    # Base templates
    push_template = {
        'name': 'Push Day',
        'description': 'Chest, shoulders, and triceps focus',
        'duration': 45,
        'xp': 30,
        'exercises': [
            {'name': 'Bench Press', 'sets': 4, 'reps': '8-10'},
            {'name': 'Overhead Press', 'sets': 3, 'reps': '8-10'},
            {'name': 'Incline Dumbbell Press', 'sets': 3, 'reps': '10-12'},
            {'name': 'Lateral Raises', 'sets': 3, 'reps': '12-15'},
            {'name': 'Tricep Pushdowns', 'sets': 3, 'reps': '12-15'},
        ]
    }
    
    pull_template = {
        'name': 'Pull Day',
        'description': 'Back and biceps focus',
        'duration': 45,
        'xp': 30,
        'exercises': [
            {'name': 'Pull-ups/Lat Pulldown', 'sets': 4, 'reps': '8-10'},
            {'name': 'Barbell Rows', 'sets': 4, 'reps': '8-10'},
            {'name': 'Face Pulls', 'sets': 3, 'reps': '15-20'},
            {'name': 'Dumbbell Curls', 'sets': 3, 'reps': '10-12'},
            {'name': 'Rear Delt Flyes', 'sets': 3, 'reps': '12-15'},
        ]
    }
    
    legs_template = {
        'name': 'Leg Day',
        'description': 'Quadriceps, hamstrings, and glutes',
        'duration': 50,
        'xp': 35,
        'exercises': [
            {'name': 'Squats', 'sets': 4, 'reps': '8-10'},
            {'name': 'Romanian Deadlifts', 'sets': 3, 'reps': '10-12'},
            {'name': 'Leg Press', 'sets': 3, 'reps': '10-12'},
            {'name': 'Walking Lunges', 'sets': 3, 'reps': '12 each'},
            {'name': 'Calf Raises', 'sets': 4, 'reps': '15-20'},
        ]
    }
    
    core_posture = {
        'name': 'Core & Posture',
        'description': 'Core strengthening and postural correction',
        'duration': 30,
        'xp': 25,
        'exercises': [
            {'name': 'Planks', 'sets': 3, 'reps': '45-60 sec'},
            {'name': 'Dead Bugs', 'sets': 3, 'reps': '10 each side'},
            {'name': 'Bird Dogs', 'sets': 3, 'reps': '10 each side'},
            {'name': 'Back Extensions', 'sets': 3, 'reps': '12-15'},
            {'name': 'Pallof Press', 'sets': 3, 'reps': '10 each side'},
        ]
    }
    
    hiit_template = {
        'name': 'HIIT Conditioning',
        'description': 'High-intensity interval training for fat loss',
        'duration': 25,
        'xp': 30,
        'exercises': [
            {'name': 'Burpees', 'sets': 4, 'reps': '30 sec on/30 sec off'},
            {'name': 'Mountain Climbers', 'sets': 4, 'reps': '30 sec on/30 sec off'},
            {'name': 'Jump Squats', 'sets': 4, 'reps': '30 sec on/30 sec off'},
            {'name': 'High Knees', 'sets': 4, 'reps': '30 sec on/30 sec off'},
        ]
    }
    
    # Add templates based on focus areas
    has_shoulder_focus = any(a['area'] in ['shoulders', 'lats'] for a in focus_areas)
    has_posture_focus = any(a['area'] == 'posture' for a in focus_areas)
    
    # Standard PPL + accessories
    templates = [push_template, pull_template, legs_template]
    
    if has_posture_focus:
        templates.append(core_posture)
    
    templates.append(hiit_template)
    
    if has_shoulder_focus:
        shoulder_focus = {
            'name': 'Shoulder Specialization',
            'description': 'Extra focus on building wider shoulders',
            'duration': 40,
            'xp': 30,
            'exercises': [
                {'name': 'Overhead Press', 'sets': 4, 'reps': '6-8'},
                {'name': 'Lateral Raises', 'sets': 5, 'reps': '12-15'},
                {'name': 'Cable Lateral Raises', 'sets': 3, 'reps': '12-15'},
                {'name': 'Face Pulls', 'sets': 4, 'reps': '15-20'},
                {'name': 'Upright Rows', 'sets': 3, 'reps': '10-12'},
            ]
        }
        templates.append(shoulder_focus)
    
    return templates


def get_nutrition_tip(day: int) -> str:
    """Get a nutrition tip for the day."""
    tips = [
        "Focus on protein: Aim for 0.8-1g per pound of body weight",
        "Stay hydrated: Drink at least 8 glasses of water today",
        "Eat the rainbow: Include colorful vegetables in your meals",
        "Time your carbs: Prioritize complex carbs around workouts",
        "Healthy fats matter: Include avocado, nuts, or olive oil",
        "Meal prep tip: Prepare tomorrow's meals today",
        "Mindful eating: Put away your phone during meals",
        "Protein timing: Have protein within 2 hours post-workout",
        "Fiber focus: Aim for 25-35g of fiber today",
        "Limit processed foods: Choose whole foods when possible",
    ]
    return tips[(day - 1) % len(tips)]


def get_mindset_task(day: int) -> Dict:
    """Get a mindset/habit task for the day."""
    tasks = [
        {'title': 'Morning Visualization', 'description': 'Spend 5 minutes visualizing your ideal physique'},
        {'title': 'Gratitude Journal', 'description': 'Write 3 things you appreciate about your body'},
        {'title': 'Progress Photo', 'description': 'Take a quick mirror selfie to track changes'},
        {'title': 'Sleep Optimization', 'description': 'Get 7-8 hours of quality sleep tonight'},
        {'title': 'Stress Management', 'description': '10 minutes of meditation or deep breathing'},
        {'title': 'Goal Review', 'description': 'Review your transformation goals'},
        {'title': 'Positive Affirmations', 'description': 'Repeat 3 positive statements about your journey'},
    ]
    return tasks[(day - 1) % len(tasks)]


def generate_milestones(commitment_days: int) -> List[Dict]:
    """Generate milestone achievements for the pathway."""
    
    milestones = [
        {
            'id': 'first_workout',
            'title': '🎯 First Step',
            'description': 'Complete your first workout',
            'day': 1,
            'xp_bonus': 50,
            'achieved': False,
        },
        {
            'id': 'week_1',
            'title': '🔥 Week 1 Complete',
            'description': 'Finish your first week',
            'day': 7,
            'xp_bonus': 100,
            'achieved': False,
        },
    ]
    
    if commitment_days >= 14:
        milestones.append({
            'id': 'first_assessment',
            'title': '📊 First Progress Check',
            'description': 'Complete your first progress assessment',
            'day': 14,
            'xp_bonus': 150,
            'achieved': False,
        })
    
    if commitment_days >= 30:
        milestones.append({
            'id': 'month_1',
            'title': '🏆 Month 1 Champion',
            'description': 'Complete 30 days of transformation',
            'day': 30,
            'xp_bonus': 300,
            'achieved': False,
        })
    
    if commitment_days >= 90:
        milestones.append({
            'id': 'quarter',
            'title': '💎 Quarter Master',
            'description': 'Complete 90 days - a new habit is formed!',
            'day': 90,
            'xp_bonus': 500,
            'achieved': False,
        })
    
    if commitment_days >= 365:
        milestones.append({
            'id': 'year',
            'title': '👑 Year of Transformation',
            'description': 'Complete a full year of dedication',
            'day': 365,
            'xp_bonus': 2000,
            'achieved': False,
        })
    
    return milestones


# For future LLM integration:
# async def generate_pathway_with_llm(features: Dict, user_data: Dict) -> Dict:
#     """Use GPT-4 to generate highly personalized pathways."""
#     from .feature_extraction import features_to_llm_prompt
#     
#     prompt = features_to_llm_prompt(features, user_data)
#     
#     response = await openai.ChatCompletion.acreate(
#         model="gpt-4",
#         messages=[
#             {"role": "system", "content": "You are a fitness coach creating personalized training programs."},
#             {"role": "user", "content": prompt}
#         ],
#         temperature=0.7,
#     )
#     
#     # Parse and structure the response
#     ...

