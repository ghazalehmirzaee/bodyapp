# Body Composition Scanner App

## Important: Manual Server Start Required

**You must start the development server manually.** The server will NOT start automatically.

## Quick Start

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Fix file watcher limit** (if you encounter ENOSPC errors):
   ```bash
   ./fix-watchers.sh
   ```
   Or manually:
   ```bash
   sudo sysctl -w fs.inotify.max_user_watches=524288
   ```

3. **Start the development server manually**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

## Available Scripts

- `npm run dev` - Start the development server (you must run this manually)
- `npm run build` - Build the app for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint

## Usage

1. When you open the app, it will automatically request camera permission
2. Position yourself in front of the camera so your full body is visible
3. Hold still for 3 seconds when your pose is detected
4. View your personalized body analysis, diet plan, and workout routine

## Requirements

- Node.js 12.22.9+ (currently using v12.22.9)
- Modern browser with camera access
- Webcam/camera connected to your device

## Troubleshooting

If you see "next: not found" error, make sure you've run `npm install` first.

