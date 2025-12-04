"""
Database Models and Schema
SQLite database for storing user scans, baseline data, and progression tracking
"""
from datetime import datetime
from typing import Optional, List, Dict
import json
import sqlite3
import os


class Database:
    """Simple SQLite database wrapper"""
    
    def __init__(self, db_path: str = "bodyapp.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize database tables"""
        conn = sqlite3.connect(self.db_path, timeout=10.0)
        conn.execute('PRAGMA journal_mode=WAL')  # Write-Ahead Logging for better concurrency
        cursor = conn.cursor()
        
        # Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id TEXT PRIMARY KEY,
                gender TEXT NOT NULL,
                height_cm REAL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)
        
        # Scans table - stores all body scans
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS scans (
                scan_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                scan_date TEXT NOT NULL,
                is_baseline INTEGER DEFAULT 0,
                front_pose_data TEXT NOT NULL,
                side_pose_data TEXT NOT NULL,
                overall_score INTEGER NOT NULL,
                scores_json TEXT NOT NULL,
                body_type TEXT,
                frame TEXT,
                strong_areas_json TEXT,
                growth_areas_json TEXT,
                key_insight TEXT,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        """)
        
        # Baseline metrics table - stores body proportions from first scan
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS baseline_metrics (
                baseline_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL UNIQUE,
                baseline_scan_id INTEGER NOT NULL,
                shoulder_hip_ratio REAL NOT NULL,
                waist_shoulder_ratio REAL NOT NULL,
                arm_leg_ratio REAL NOT NULL,
                shoulder_width_normalized REAL NOT NULL,
                hip_width_normalized REAL NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(user_id),
                FOREIGN KEY (baseline_scan_id) REFERENCES scans(scan_id)
            )
        """)
        
        # Progression tracking table - stores deltas and trends
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS progression (
                progression_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                scan_id INTEGER NOT NULL,
                days_since_baseline INTEGER NOT NULL,
                overall_score_delta INTEGER NOT NULL,
                shoulder_score_delta INTEGER,
                chest_score_delta INTEGER,
                core_score_delta INTEGER,
                v_taper_score_delta INTEGER,
                symmetry_score_delta INTEGER,
                posture_score_delta INTEGER,
                arms_score_delta INTEGER,
                notes TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(user_id),
                FOREIGN KEY (scan_id) REFERENCES scans(scan_id)
            )
        """)
        
        # Create indexes for faster queries
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_scans_user_date 
            ON scans(user_id, scan_date DESC)
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_progression_user 
            ON progression(user_id, days_since_baseline)
        """)
        
        conn.commit()
        conn.close()
    
    def create_user(self, user_id: str, gender: str, height_cm: Optional[float] = None) -> bool:
        """Create a new user"""
        try:
            conn = sqlite3.connect(self.db_path, timeout=10.0)
            cursor = conn.cursor()
            now = datetime.now().isoformat()
            
            cursor.execute("""
                INSERT INTO users (user_id, gender, height_cm, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)
            """, (user_id, gender, height_cm, now, now))
            
            conn.commit()
            conn.close()
            return True
        except sqlite3.IntegrityError:
            return False  # User already exists
    
    def save_scan(
        self,
        user_id: str,
        front_pose: List[Dict],
        side_pose: List[Dict],
        physique_analysis: Dict,
        is_baseline: bool = False
    ) -> Optional[int]:
        """Save a body scan"""
        conn = sqlite3.connect(self.db_path, timeout=10.0)
        try:
            cursor = conn.cursor()
            now = datetime.now().isoformat()
            
            cursor.execute("""
                INSERT INTO scans (
                    user_id, scan_date, is_baseline,
                    front_pose_data, side_pose_data,
                    overall_score, scores_json,
                    body_type, frame,
                    strong_areas_json, growth_areas_json,
                    key_insight
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                user_id,
                now,
                1 if is_baseline else 0,
                json.dumps(front_pose),
                json.dumps(side_pose),
                physique_analysis['overall_score'],
                json.dumps(physique_analysis['scores']),
                physique_analysis.get('body_type'),
                physique_analysis.get('frame'),
                json.dumps(physique_analysis.get('strong_areas', [])),
                json.dumps(physique_analysis.get('growth_areas', [])),
                physique_analysis.get('key_insight')
            ))
            
            scan_id = cursor.lastrowid
            conn.commit()
            
            return scan_id
        finally:
            conn.close()
    
    def save_baseline_metrics(
        self,
        user_id: str,
        baseline_scan_id: int,
        front_landmarks: List[Dict]
    ):
        """Save baseline body proportions from first scan"""
        import math
        
        def calc_distance(p1, p2):
            dx = p1['x'] - p2['x']
            dy = p1['y'] - p2['y']
            return math.sqrt(dx * dx + dy * dy)
        
        # Calculate baseline ratios
        LEFT_SHOULDER = 11
        RIGHT_SHOULDER = 12
        LEFT_HIP = 23
        RIGHT_HIP = 24
        LEFT_ELBOW = 13
        LEFT_WRIST = 15
        LEFT_KNEE = 25
        LEFT_ANKLE = 27
        
        shoulder_width = calc_distance(
            front_landmarks[LEFT_SHOULDER],
            front_landmarks[RIGHT_SHOULDER]
        )
        hip_width = calc_distance(
            front_landmarks[LEFT_HIP],
            front_landmarks[RIGHT_HIP]
        )
        arm_length = calc_distance(
            front_landmarks[LEFT_SHOULDER],
            front_landmarks[LEFT_WRIST]
        )
        leg_length = calc_distance(
            front_landmarks[LEFT_HIP],
            front_landmarks[LEFT_ANKLE]
        )
        
        shoulder_hip_ratio = shoulder_width / hip_width if hip_width > 0 else 1.0
        waist_shoulder_ratio = (hip_width * 0.75) / shoulder_width if shoulder_width > 0 else 1.0
        arm_leg_ratio = arm_length / leg_length if leg_length > 0 else 1.0
        
        conn = sqlite3.connect(self.db_path, timeout=10.0)
        cursor = conn.cursor()
        now = datetime.now().isoformat()
        
        cursor.execute("""
            INSERT OR REPLACE INTO baseline_metrics (
                user_id, baseline_scan_id,
                shoulder_hip_ratio, waist_shoulder_ratio, arm_leg_ratio,
                shoulder_width_normalized, hip_width_normalized,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            baseline_scan_id,
            shoulder_hip_ratio,
            waist_shoulder_ratio,
            arm_leg_ratio,
            shoulder_width,
            hip_width,
            now
        ))
        
        conn.commit()
        conn.close()
    
    def save_progression(
        self,
        user_id: str,
        scan_id: int,
        current_scores: Dict[str, int],
        baseline_scores: Dict[str, int],
        days_since_baseline: int
    ):
        """Save progression data comparing current scan to baseline"""
        conn = sqlite3.connect(self.db_path, timeout=10.0)
        cursor = conn.cursor()
        now = datetime.now().isoformat()
        
        # Calculate deltas
        overall_delta = current_scores['overall'] - baseline_scores.get('overall', 0)
        
        cursor.execute("""
            INSERT INTO progression (
                user_id, scan_id, days_since_baseline,
                overall_score_delta,
                shoulder_score_delta, chest_score_delta, core_score_delta,
                v_taper_score_delta, symmetry_score_delta,
                posture_score_delta, arms_score_delta,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            scan_id,
            days_since_baseline,
            overall_delta,
            current_scores.get('shoulders', 0) - baseline_scores.get('shoulders', 0),
            current_scores.get('chest', 0) - baseline_scores.get('chest', 0),
            current_scores.get('core', 0) - baseline_scores.get('core', 0),
            current_scores.get('v_taper', 0) - baseline_scores.get('v_taper', 0),
            current_scores.get('symmetry', 0) - baseline_scores.get('symmetry', 0),
            current_scores.get('posture', 0) - baseline_scores.get('posture', 0),
            current_scores.get('arms', 0) - baseline_scores.get('arms', 0),
            now
        ))
        
        conn.commit()
        conn.close()
    
    def get_baseline_scan(self, user_id: str) -> Optional[Dict]:
        """Get user's baseline scan"""
        conn = sqlite3.connect(self.db_path, timeout=10.0)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM scans
            WHERE user_id = ? AND is_baseline = 1
            LIMIT 1
        """, (user_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return dict(row)
        return None
    
    def get_user_scans(self, user_id: str, limit: int = 10) -> List[Dict]:
        """Get user's recent scans"""
        conn = sqlite3.connect(self.db_path, timeout=10.0)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM scans
            WHERE user_id = ?
            ORDER BY scan_date DESC
            LIMIT ?
        """, (user_id, limit))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in rows]
    
    def get_progression_history(self, user_id: str) -> List[Dict]:
        """Get user's progression history"""
        conn = sqlite3.connect(self.db_path, timeout=10.0)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT p.*, s.scan_date, s.overall_score
            FROM progression p
            JOIN scans s ON p.scan_id = s.scan_id
            WHERE p.user_id = ?
            ORDER BY p.days_since_baseline ASC
        """, (user_id,))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in rows]


# Global database instance
db = Database()

