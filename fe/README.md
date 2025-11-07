# Frontend - Body Composition Scanner

Next.js frontend application for the Body Composition Scanner.

## Features

- 🎥 **Real-time Camera**: Live webcam feed with pose detection
- 🎯 **Pose Visualization**: MediaPipe pose landmarks overlay
- 📊 **Results Display**: Beautiful UI for analysis results
- 🎨 **Modern Design**: Responsive and user-friendly interface
- ⚡ **Fast Performance**: Optimized Next.js 13 with TypeScript

## Prerequisites

- Node.js 12.22.9+ (Node 16+ recommended)
- Modern browser with camera access
- Webcam/camera connected to your device
- **Python backend running** (see `../be/README.md`)

## Installation

1. **Navigate to frontend directory**:
   ```bash
   cd fe
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment** (optional):
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local if your backend runs on a different URL
   ```

   By default, the frontend expects the backend at `http://localhost:8000`.

## Running the Frontend

### Development Mode

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

### Production Build

```bash
npm run build
npm run start
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Usage

1. **Start the backend first** (see `../be/README.md`)
2. Open http://localhost:3000 in your browser
3. Allow camera access when prompted
4. Position yourself so your full body is visible
5. Hold still - scanning starts automatically when pose is detected
6. Wait 3 seconds for scan to complete
7. View your personalized analysis, diet plan, and workout routine

## Project Structure

```
fe/
├── app/                 # Next.js 13 app directory
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # React components
│   └── BodyScanCamera.tsx  # Main camera & analysis component
├── lib/                 # Utilities
│   ├── bodyScanner.ts   # MediaPipe pose scanner
│   └── bodyAnalysis.ts  # Type definitions (legacy)
├── styles/              # Global styles
│   └── globals.css
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
└── next.config.js       # Next.js config
```

## Configuration

### Backend URL

Set the backend URL in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Camera Settings

Modify camera resolution in `components/BodyScanCamera.tsx`:

```typescript
video: { width: 1280, height: 720, facingMode: 'user' }
```

## Troubleshooting

### "next: not found" error
```bash
npm install
```

### Backend connection errors
- Ensure Python backend is running on http://localhost:8000
- Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
- Verify CORS settings in backend allow `http://localhost:3000`

### Camera access denied
- Grant browser permission to access camera
- Check if camera is already in use by another app
- Try a different browser (Chrome/Edge recommended)

### File watcher limit (Linux/macOS)
```bash
./fix-watchers.sh
# Or manually:
sudo sysctl -w fs.inotify.max_user_watches=524288
```

## Technologies

- **Next.js 13**: React framework with app directory
- **TypeScript**: Type-safe development
- **MediaPipe**: Pose detection (client-side)
- **React 18**: Modern React features
- **Styled JSX**: Component-scoped styles

## License

MIT

