# BodyApp - AI-Powered Body Analysis

**Under 90 seconds. Every day. Zero friction.**

BodyApp is the fastest body analysis app - designed to track your fitness progression with minimal user effort. Just stand in front of your camera, and get instant AI-powered insights about your physique.

---

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- Modern browser with camera access

### Installation

1. **Install dependencies:**
```bash
# Install Python dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd fe
npm install
```

2. **Start the backend:**
```bash
cd be
python main.py
```
Backend runs on `http://localhost:8000`

3. **Start the frontend:**
```bash
cd fe
npm run dev
```
Frontend runs on `http://localhost:3000`

4. **Open the app:**
Navigate to `http://localhost:3000` and allow camera access.

---

## How It Works

### Complete User Flow (60-90 seconds)

1. **Onboarding** (10s)
   - Select gender (Male/Female/Non-binary)
   - Optionally enter height for better calibration
   - That's it!

2. **Front Pose Capture** (15-20s)
   - AI-guided pose detection with real-time readiness scoring
   - Auto-captures when pose is perfect (or click to capture manually)
   - Visual skeleton overlay shows body detection

3. **Side Pose Capture** (15-20s)
   - Turn 90° to your right
   - Same guided capture process
   - Auto-capture after 2 seconds of stable pose

4. **Analysis** (2-5s)
   - AI analyzes your physique
   - Calculates scores across 7 categories
   - Generates personalized insights

5. **Results** (15-20s to read)
   - Overall physique score (0-100) with grade
   - Your top 3 strengths
   - Your top 3 growth opportunities
   - Personalized diet plan
   - Custom workout routine
   - Progress tracking vs baseline

---

## Features

### ✅ Implemented (MVP)

**Web App:**
- **Beautiful onboarding** - Minimal friction, 2 questions max
- **Smart auto-capture** - No need to run back and forth
- **Real-time pose guidance** - Know before you capture if pose is good
- **Male physique scoring** - 0-100 ratings across 7 categories
- **Baseline & progression tracking** - Automatic comparison to first scan
- **Clean, motivating UI** - No negative language, confidence-building
- **Database persistence** - All scans saved with SQLite

**Mobile App (React Native):** ⭐ NEW
- **Complete onboarding flow** - Welcome → Gender → Height → Age
- **Beautiful dark theme** - Pine green on black, consistent with brand
- **Input validation** - Smart Continue button states
- **Results screen** - Shows overall score with mock data
- **Camera placeholder** - Explains upcoming body scanning feature

### Scoring Categories (Male)

1. **Shoulders** (20% weight) - Width relative to hips
2. **V-Taper** (18% weight) - Shoulder-to-waist ratio
3. **Chest** (15% weight) - Development estimate
4. **Core** (15% weight) - Waist tightness
5. **Symmetry** (12% weight) - Left-right balance
6. **Posture** (10% weight) - Alignment from side view
7. **Arms** (10% weight) - Proportions to body

### ⏳ Coming Soon

**Immediate (This Week):**
- Mobile camera integration with real pose detection
- Mobile backend API connection for real analysis
- Female-specific scoring algorithm
- Non-binary physique analysis

**Near-term (This Month):**
- Gamification system (streaks, leagues, competition)
- Character/avatar system based on body scan
- Basic workout & food logging
- Progress tracking with graphs

**Long-term (See PRODUCT_VISION.md):**
- 25+ improvement vectors (sleep, mewing, flexibility, etc.)
- AI coaching agent for personalized programs
- Photo-based food logging
- Advanced social features

---

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **MediaPipe** - Real-time pose detection
- **Styled JSX** - Component-scoped styling

### Backend
- **FastAPI** - Modern Python web framework
- **SQLite** - Database (PostgreSQL for production)
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

### AI/ML
- **MediaPipe Pose** - 33-point skeleton tracking
- **Custom scoring algorithm** - Research-backed anthropometric ratios

---

## Project Structure

```
bodyapp/
├── be/                     # Backend (FastAPI)
│   ├── api/                # API routers
│   │   └── physique.py     # Physique analysis endpoint
│   ├── services/           # Business logic
│   │   └── scoring.py      # Scoring algorithms
│   ├── database/           # Database layer
│   │   └── connection.py   # SQLite connection & queries
│   ├── models/             # Data models (future)
│   ├── utils/              # Utilities (future)
│   ├── tests/              # Tests (future)
│   ├── config.py           # Configuration
│   ├── body_analysis.py    # Legacy diet/workout generation
│   ├── body_scanner.py     # Pose validation utilities
│   └── main.py             # App initialization (50 lines)
│
├── fe/                     # Frontend (Next.js Web App)
│   ├── app/                # Next.js App Router
│   │   └── page.tsx        # Main app orchestrator
│   ├── components/         # React components
│   │   ├── Onboarding.tsx      # 3-screen onboarding
│   │   ├── TwoPoseCapture.tsx  # 2-pose capture with auto-capture
│   │   └── PhysiqueResults.tsx # Clean results display
│   └── lib/                # Utilities
│       └── bodyScanner.ts  # MediaPipe wrapper
│
├── BodyAppFinal/           # Mobile App (React Native) ⭐ NEW
│   ├── App.tsx             # Main app with all screens
│   ├── android/            # Android native code
│   ├── ios/                # iOS native code
│   ├── package.json        # Dependencies
│   ├── README.md           # Mobile-specific docs
│   ├── SCREENS_FLOW.md     # Screen flow visualization
│   └── NEXT_STEPS.md       # Implementation guide
│
├── PRODUCT_VISION.md       # Complete feature roadmap & ideas ⭐ NEW
├── requirements.txt        # Python dependencies
├── .cursorrules            # Development rules (strict)
├── .gitignore              # Git ignore rules
├── start.bat / start.sh    # Quick start scripts
└── README.md               # This file (ONLY markdown allowed)
```

---

## Development Philosophy

### Code Organization Rules (STRICT)

1. **Maximum 1000 lines per file**
   - If ANY file exceeds 1000 lines, STOP and refactor immediately
   - Split into smaller, focused modules
   - No exceptions

2. **Only README.md for documentation**
   - This is the ONLY markdown file in the project
   - All documentation goes here
   - Updates must be in this file, not new files

3. **Clean root folder**
   - Only: README.md, requirements.txt, .gitignore, .cursorrules, start scripts
   - Everything else in proper subfolders

4. **Backend structure**
   - `api/` for all endpoints (routers)
   - `services/` for business logic
   - `models/` for data models
   - `database/` for database operations
   - `utils/` for utilities
   - `main.py` ONLY for app init (< 200 lines)

5. **Modularity over monoliths**
   - Prefer many small files over few large files
   - Each file has a single, clear responsibility
   - Refactor before it's too late

See `.cursorrules` for complete development rules.

---

## API Endpoints

### Health Check
```
GET /
GET /health
```

### Physique Analysis
```
POST /api/analyze-physique
```

**Request:**
```json
{
  "frontPose": [{ "x": 0.5, "y": 0.5, "z": 0, "visibility": 0.9 }, ...],
  "sidePose": [{ "x": 0.5, "y": 0.5, "z": 0, "visibility": 0.9 }, ...],
  "gender": "male",
  "height": 175  // optional, in cm
}
```

**Response:**
```json
{
  "physique": {
    "overall_score": 72,
    "scores": { "shoulders": 85, "core": 62, ... },
    "body_type": "Athletic",
    "frame": "Athletic Frame",
    "strong_areas": [...],
    "growth_areas": [...],
    "key_insight": "..."
  },
  "dietPlan": { "calories": 2300, "protein": 172, ... },
  "workoutRoutine": { "focus": "...", "days": [...] }
}
```

---

## Database Schema

### Tables

**users**
- `user_id` (PK) - User identifier
- `gender` - Male/Female/Non-binary
- `height_cm` - Optional height for calibration
- `created_at`, `updated_at` - Timestamps

**scans**
- `scan_id` (PK) - Scan identifier
- `user_id` (FK) - User reference
- `scan_date` - When scan was taken
- `is_baseline` - First scan flag
- `front_pose_data`, `side_pose_data` - JSON landmarks
- `overall_score` - 0-100 score
- `scores_json` - All category scores
- `body_type`, `frame` - Classifications
- `strong_areas_json`, `growth_areas_json` - Top 3 each
- `key_insight` - Personalized message

**baseline_metrics**
- `baseline_id` (PK)
- `user_id` (FK) - User reference
- `baseline_scan_id` (FK) - Reference to baseline scan
- `shoulder_hip_ratio`, `waist_shoulder_ratio`, `arm_leg_ratio` - Body proportions
- `shoulder_width_normalized`, `hip_width_normalized` - Normalized measurements

**progression**
- `progression_id` (PK)
- `user_id` (FK)
- `scan_id` (FK)
- `days_since_baseline` - Days since first scan
- `overall_score_delta`, `shoulder_score_delta`, etc. - Score changes
- `notes` - Optional notes

---

## Testing

### Manual Testing Checklist

**Onboarding:**
- [ ] Welcome screen loads
- [ ] Gender selection works
- [ ] Height input (optional) works
- [ ] Skip button works

**Pose Capture:**
- [ ] Camera initializes
- [ ] Skeleton overlay appears on body
- [ ] Readiness score updates in real-time
- [ ] Auto-capture triggers after 2s of stable pose
- [ ] Manual capture button works
- [ ] Front → Side transition works

**Results:**
- [ ] Analysis completes in < 5 seconds
- [ ] Overall score displays (0-100)
- [ ] Grade shows (S/A/B/C/D)
- [ ] Strong areas list (top 3)
- [ ] Growth areas list (top 3)
- [ ] Diet plan shows
- [ ] Workout plan shows
- [ ] "Scan Again" button works

**Database:**
- [ ] First scan marked as baseline
- [ ] Second scan shows progression
- [ ] Data persists between restarts

### Automated Tests (Coming Soon)
- Unit tests for scoring algorithms
- Integration tests for API endpoints
- E2E tests for complete user flow

---

## Troubleshooting

### Camera Not Working
**Issue:** Black screen or "Camera access denied"  
**Fix:** 
1. Grant camera permissions in browser
2. Ensure no other app is using camera
3. Try Chrome (best MediaPipe support)

### Backend Connection Error
**Issue:** "Analysis failed: Failed to fetch"  
**Fix:**
1. Verify backend running on `http://localhost:8000`
2. Check CORS settings in `be/config.py`
3. Refresh frontend page

### Skeleton Not Appearing
**Issue:** Camera works but no skeleton overlay  
**Fix:**
1. Step back 6-8 feet to show full body
2. Ensure good lighting
3. Try plain background
4. Check browser console for MediaPipe errors

### Readiness Always Low
**Issue:** Readiness bar stuck at < 50%  
**Fix:**
1. Show full body (head to feet) in frame
2. Face camera directly
3. Improve lighting
4. Stand against plain background

### Wrong Error in Terminal
**Issue:** You mentioned getting an error - what was it?  
**Action:** Please share the exact error message so I can fix it

---

## Known Limitations (MVP)

1. **Single demo user per gender** - Uses `demo_user_male` for all male users
2. **No authentication** - Production needs proper user accounts
3. **Female/non-binary incomplete** - Returns placeholder responses
4. **Camera distance affects measurements** - Mitigated by height calibration & ratios
5. **SQLite for MVP** - Will migrate to PostgreSQL for production

---

## Roadmap

### Phase 1: MVP (✅ Complete)
- [x] Onboarding flow
- [x] 2-pose capture with auto-capture
- [x] Male physique scoring
- [x] Results display
- [x] Database persistence
- [x] Baseline & progression tracking

### Phase 2: Enhanced Features
- [ ] Female physique scoring
- [ ] Non-binary analysis
- [ ] Trend graphs over time
- [ ] Photo storage & comparison
- [ ] Export data (CSV, PDF)

### Phase 3: Production Ready
- [ ] User authentication
- [ ] PostgreSQL database
- [ ] Error monitoring (Sentry)
- [ ] Analytics (Mixpanel/Amplitude)
- [ ] Privacy policy & terms
- [ ] GDPR compliance

### Phase 4: Mobile & Advanced
- [x] React Native mobile app (iOS & Android) - **IN PROGRESS**
  - [x] Onboarding flow (Welcome → Gender → Height → Age)
  - [x] Results display with mock data
  - [ ] Camera integration with real pose detection
  - [ ] Backend API connection
- [ ] LLaVA qualitative assessment
- [ ] Social features (optional sharing)
- [ ] Trainer/coach portal
- [ ] Integration with Apple Health/Google Fit

---

## Contributing

### Development Workflow

1. Check `.cursorrules` for code standards
2. No file should exceed 1000 lines
3. All documentation goes in this README.md
4. Test locally before committing
5. Follow folder structure strictly

### Adding New Features

1. **API endpoints** → `be/api/` folder
2. **Business logic** → `be/services/` folder
3. **Database operations** → `be/database/` folder
4. **React components** → `fe/components/` folder
5. **Update this README** with new features

---

## License

Proprietary - All rights reserved

---

## Contact & Support

For questions, issues, or feedback:
- Open an issue on GitHub
- Contact: [Your contact info]

---

**Built with ❤️ for fitness enthusiasts who value their time.**

*Less than 90 seconds a day. No excuses.*
