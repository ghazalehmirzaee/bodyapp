#!/bin/bash
# Startup script for Body Composition Scanner
# Starts both backend and frontend servers

echo "🚀 Starting Body Composition Scanner..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Python is installed
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python is not installed. Please install Python 3.8+${NC}"
    exit 1
fi

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 12.22.9+${NC}"
    exit 1
fi

# Determine Python command
if command -v python3 &> /dev/null; then
    PYTHON=python3
else
    PYTHON=python
fi

echo -e "${BLUE}📦 Starting Backend (Python FastAPI)...${NC}"
cd be

# Check if venv exists, create if not
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    $PYTHON -m venv venv
fi

# Activate virtual environment and install dependencies
source venv/bin/activate
pip install -q -r requirements.txt

# Start backend in background
echo -e "${GREEN}✓ Backend starting on http://localhost:8000${NC}"
$PYTHON main.py &
BACKEND_PID=$!

cd ..

# Wait a moment for backend to start
sleep 3

echo ""
echo -e "${BLUE}🎨 Starting Frontend (Next.js)...${NC}"
cd fe

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

echo -e "${GREEN}✓ Frontend starting on http://localhost:3000${NC}"
npm run dev &
FRONTEND_PID=$!

cd ..

echo ""
echo -e "${GREEN}✨ Both servers are running!${NC}"
echo ""
echo -e "  Backend:  ${BLUE}http://localhost:8000${NC}"
echo -e "  Frontend: ${BLUE}http://localhost:3000${NC}"
echo -e "  API Docs: ${BLUE}http://localhost:8000/docs${NC}"
echo ""
echo -e "Press ${RED}Ctrl+C${NC} to stop both servers"

# Wait for either process to exit
wait $BACKEND_PID $FRONTEND_PID

