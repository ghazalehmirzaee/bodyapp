# Body Composition Scanner

AI-powered body composition analysis application with personalized diet plans and workout routines.

## 🏗️ Project Structure

This project is split into two main parts:

```
bodyapp/
├── be/          # Backend - Python FastAPI
└── fe/          # Frontend - Next.js + React
```

### Backend (`be/`)
- **Language**: Python 3.8+
- **Framework**: FastAPI
- **Features**: Body analysis algorithms, diet planning, workout generation
- **Port**: 8000

### Frontend (`fe/`)
- **Language**: TypeScript
- **Framework**: Next.js 13 + React 18
- **Features**: Camera interface, pose detection (MediaPipe), results visualization
- **Port**: 3000

## ⚡ Quick Start

### Prerequisites
- **Python 3.8+** with pip
- **Node.js 12.22.9+** (Node 16+ recommended)
- **Webcam** for body scanning

### 🚀 Fastest Way (Automated Scripts)

**Windows:**
```bash
start.bat
```
Double-click `start.bat` or run it from command prompt. It will automatically:
- Set up Python virtual environment
- Install all dependencies
- Start both backend and frontend servers in separate windows

**Linux/macOS:**
```bash
chmod +x start.sh
./start.sh
```
The script will handle everything automatically!

### 📋 Manual Setup (If Scripts Don't Work)

#### 1. Start the Backend (Terminal 1)

```bash
# Navigate to backend
cd be

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```

✅ Backend will be available at: **http://localhost:8000**

✅ API Documentation: **http://localhost:8000/docs**

#### 2. Start the Frontend (Terminal 2)

Open a **new terminal** window:

```bash
# Navigate to frontend
cd fe

# Install dependencies
npm install

# Run the development server
npm run dev
```

✅ Frontend will be available at: **http://localhost:3000**

### 🎯 Using the Application

1. Open **http://localhost:3000** in your browser
2. Allow camera access when prompted
3. Position yourself so your **full body is visible** in the frame
4. Hold still - scanning starts **automatically** when pose is detected
5. Wait **3 seconds** for the scan to complete
6. View your personalized results:
   - 📏 Body measurements and composition
   - 💪 Strong spots and areas for improvement
   - 🍽️ Custom diet plan with macros and meals
   - 🏋️ Personalized 7-day workout routine

### ✅ Verify Installation

**Check Backend:**
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy","message":"Backend is running smoothly"}
```

**Check Frontend:**
Open http://localhost:3000 - you should see the camera interface

**Explore API:**
Visit http://localhost:8000/docs for interactive API documentation

## 📚 Documentation

- **Backend Documentation**: [be/README.md](be/README.md)
- **Frontend Documentation**: [fe/README.md](fe/README.md)

## 🎯 Features

### Body Analysis
- Real-time pose detection using MediaPipe
- Detailed body measurements (shoulders, chest, waist, hips, arms, legs)
- Body composition estimates (body fat %, muscle mass %)
- Proportion analysis and symmetry checks
- Identification of strong spots and areas for improvement

### Personalized Diet Plan
- Calorie calculation based on body composition
- Macro breakdown (protein, carbs, fats)
- Sample meal plan with 6 meals per day
- Adjustments for different body fat percentages

### Custom Workout Routine
- 7-day workout program
- Training focus based on weak spots
- Detailed exercise prescriptions with sets and reps
- Push/Pull/Legs split with recovery days

## 🔧 API Endpoints

### Backend API (http://localhost:8000)

- `GET /` - Health check
- `GET /health` - Detailed health status
- `POST /api/analyze` - Analyze body from pose landmarks
- `POST /api/diet-plan` - Generate personalized diet plan
- `POST /api/workout-routine` - Generate workout routine
- `POST /api/analyze-complete` - Complete analysis (all in one)

Full API documentation available at http://localhost:8000/docs

## 🛠️ Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Pydantic**: Data validation
- **Uvicorn**: ASGI server
- **Python 3.8+**: Core language

### Frontend
- **Next.js 13**: React framework
- **React 18**: UI library
- **TypeScript**: Type safety
- **MediaPipe**: Pose detection
- **Styled JSX**: Component styling

## 📦 Project Files

### Backend (`be/`)
```
be/
├── main.py              # FastAPI application & endpoints
├── body_analysis.py     # Body analysis algorithms
├── body_scanner.py      # Pose processing utilities
├── config.py            # Configuration settings
├── requirements.txt     # Python dependencies
├── .gitignore          # Git ignore rules
└── README.md           # Backend documentation
```

### Frontend (`fe/`)
```
fe/
├── app/
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/
│   └── BodyScanCamera.tsx  # Main camera component
├── lib/
│   ├── bodyScanner.ts  # MediaPipe integration
│   └── bodyAnalysis.ts # Type definitions
├── styles/
│   └── globals.css     # Global styles
├── package.json        # Node dependencies
├── tsconfig.json       # TypeScript config
├── next.config.js      # Next.js config
└── README.md          # Frontend documentation
```

## 🔐 Environment Variables

### Backend (`be/.env`)
```env
HOST=0.0.0.0
PORT=8000
RELOAD=true
LOG_LEVEL=info
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Frontend (`fe/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🐛 Troubleshooting

### Backend Issues

**Python version check**
```bash
python --version  # Should be 3.8 or higher
```

**Port 8000 already in use**
```bash
# Find and kill process using port 8000 (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or change port in be/main.py:
uvicorn.run("main:app", host="0.0.0.0", port=8001, ...)
```

**Import errors / Module not found**
```bash
cd be
# Make sure virtual environment is activated
pip install -r requirements.txt
```

**Virtual environment issues**
```bash
# Delete and recreate
cd be
rm -rf venv  # Windows: rmdir /s venv
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/macOS
pip install -r requirements.txt
```

### Frontend Issues

**Node version check**
```bash
node --version  # Should be 12.22.9 or higher
npm --version
```

**Backend connection failed**
- ✅ Ensure Python backend is **running** at http://localhost:8000
- ✅ Check `fe/.env.local` exists with: `NEXT_PUBLIC_API_URL=http://localhost:8000`
- ✅ Test backend: `curl http://localhost:8000/health`
- ✅ Check browser console for CORS errors

**Port 3000 already in use**
```bash
# Next.js will automatically try port 3001
# Or manually kill the process (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Camera not working**
- ✅ Grant browser camera permissions (click lock icon in address bar)
- ✅ Check if camera is in use by another app (Zoom, Teams, etc.)
- ✅ Try Chrome or Edge browsers (best MediaPipe support)
- ✅ Check browser console for specific errors
- ✅ Test camera in another app to ensure it's working

**npm install fails**
```bash
cd fe
# Clear cache and reinstall
rm -rf node_modules package-lock.json  # Windows: rmdir /s node_modules, del package-lock.json
npm cache clean --force
npm install
```

**"Module not found" errors in frontend**
```bash
cd fe
npm install
# Restart the dev server
```

### Common Issues

**Both servers seem to start but nothing happens**
- Wait 5-10 seconds after starting for servers to fully initialize
- Check if backend shows "Application startup complete" message
- Check if frontend shows "Ready" or "Compiled" message

**Analysis fails after scanning**
- Ensure backend is running (most common issue!)
- Check browser console for error messages
- Verify backend logs for errors
- Try scanning again with better lighting and full body visible

**Slow performance**
- Close other camera-using applications
- Use a modern browser (Chrome/Edge recommended)
- Ensure good lighting for better pose detection
- Make sure your full body is visible in frame

## 📝 Development

### Running Tests

Backend:
```bash
cd be
pytest
```

Frontend:
```bash
cd fe
npm test
```

### Code Formatting

Backend:
```bash
cd be
black .
```

Frontend:
```bash
cd fe
npm run lint
```

## 🚀 Deployment

### Backend
```bash
cd be
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend
```bash
cd fe
npm run build
npm run start
```

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on the GitHub repository.

---

**Built with ❤️ using Python FastAPI and Next.js**

