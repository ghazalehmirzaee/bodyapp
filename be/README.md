# Backend - Body Composition Scanner API

FastAPI backend for body composition analysis, diet planning, and workout generation.

## Features

- 🎯 **Body Analysis**: Analyze body composition from pose landmarks
- 🍽️ **Diet Planning**: Generate personalized nutrition plans
- 💪 **Workout Generation**: Create custom workout routines
- 🚀 **Fast API**: High-performance async endpoints
- 📊 **MediaPipe Integration**: Process pose detection data

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Installation

1. **Navigate to backend directory**:
   ```bash
   cd be
   ```

2. **Create virtual environment** (recommended):
   ```bash
   python -m venv venv
   
   # Activate on Windows
   venv\Scripts\activate
   
   # Activate on macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables** (optional):
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

## Running the Backend

### Development Mode

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Endpoints

### Health Check
- `GET /` - Basic health check
- `GET /health` - Detailed health check

### Body Analysis
- `POST /api/analyze` - Analyze body from pose landmarks
  - **Input**: Pose landmarks array
  - **Output**: Body measurements, strong/weak spots, estimates

### Diet Planning
- `POST /api/diet-plan` - Generate diet plan
  - **Input**: Body analysis results
  - **Output**: Calories, macros, meal suggestions

### Workout Generation
- `POST /api/workout-routine` - Generate workout routine
  - **Input**: Body analysis results
  - **Output**: Training focus, daily exercises

### Complete Analysis
- `POST /api/analyze-complete` - Get everything at once
  - **Input**: Pose landmarks
  - **Output**: Analysis + diet plan + workout routine

## Project Structure

```
be/
├── main.py              # FastAPI application & endpoints
├── body_analysis.py     # Body analysis algorithms
├── body_scanner.py      # Pose processing utilities
├── config.py            # Configuration settings
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variables template
└── README.md           # This file
```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Development

### Adding New Endpoints

1. Add your endpoint function in `main.py`
2. Use Pydantic models for request/response validation
3. Document with docstrings
4. Test using `/docs` interface

### Testing

Test endpoints using the interactive API documentation at `/docs`, or with curl:

```bash
# Health check
curl http://localhost:8000/health

# Analyze body (example)
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"landmarks": [...]}'
```

## Troubleshooting

### Port Already in Use
```bash
# Change port in main.py or use:
uvicorn main:app --port 8001
```

### Import Errors
```bash
# Ensure virtual environment is activated and dependencies installed
pip install -r requirements.txt
```

### CORS Issues
- Check `ALLOWED_ORIGINS` in `config.py`
- Ensure frontend URL is whitelisted

## License

MIT

