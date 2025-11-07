@echo off
REM Startup script for Body Composition Scanner (Windows)
REM Starts both backend and frontend servers

echo.
echo Starting Body Composition Scanner...
echo.

REM Check if Python is installed
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Python is not installed. Please install Python 3.8+
    pause
    exit /b 1
)

REM Check if Node is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed. Please install Node.js 12.22.9+
    pause
    exit /b 1
)

echo Starting Backend (Python FastAPI)...
cd be

REM Check if venv exists, create if not
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment and install dependencies
call venv\Scripts\activate.bat
pip install -q -r requirements.txt

REM Start backend in new window
echo Backend starting on http://localhost:8000
start "Backend - FastAPI" cmd /k "venv\Scripts\activate.bat && python main.py"

cd ..

REM Wait for backend to start
timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend (Next.js)...
cd fe

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing npm dependencies...
    npm install
)

REM Start frontend in new window
echo Frontend starting on http://localhost:3000
start "Frontend - Next.js" cmd /k "npm run dev"

cd ..

echo.
echo Both servers are starting in separate windows!
echo.
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000
echo   API Docs: http://localhost:8000/docs
echo.
echo Close the server windows to stop the application.
echo.
pause

