# Eyes Closed Punisher

A desktop application that uses webcam eye-tracking to play audio and spawn videos when eyes close.

## Overview

**Eyes Closed Punisher** detects when you close your eyes using computer vision (MediaPipe Face Landmarker) and responds by:
- Playing a selected audio track on loop
- Spawning videos progressively that escalate in intensity the longer eyes stay closed
- Stopping instantly when eyes reopen

## Prerequisites

- Node.js 18+
- A webcam
- Windows or macOS

## Installation

```bash
npm install
```

## Development

Start the Vite development server:
```bash
npm run dev
```

In a separate terminal, start the Electron app:
```bash
npm run electron:dev
```

## Building

Build for Windows:
```bash
npm run package:win
```

Build for macOS:
```bash
npm run package:mac
```

## Usage

1. **Launch** the application
2. **Grant camera permissions** when prompted
3. **Calibrate** the eye detection threshold (click "Calibrate Threshold")
4. **Select files:**
   - Audio file (MP3, WAV, OGG, etc.)
   - Video files (MP4, WEBM, MOV, etc.)
5. **Click "Start Detection"**
6. **Close your eyes** to trigger the punishment

## How It Works

### Eye Detection
- Uses MediaPipe Face Landmarker to detect 468 facial landmarks
- Calculates Eye Aspect Ratio (EAR) to determine eye openness
- Debounces state changes to prevent flickering

### Escalation System
- Level 0: 1 video immediately on eye close
- Level 1 (2s): 2 additional videos
- Level 2 (4s): 3 additional videos
- Level 3 (6s): 4 additional videos
- Level 4+ (8s+): 5 additional videos (capped)

### Audio Behavior
- Only ONE audio track plays at any time
- Audio fades out over 150ms when eyes reopen
- Videos are always muted

## Configuration

Settings available in the UI:
- **Threshold:** Eye closure detection sensitivity (0.05-0.30)
- **Max Videos:** Maximum concurrent videos (5-50)
- **On Eyes Open:** Behavior when eyes reopen (Clear/Keep/Fade)

## Troubleshooting

See [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) for common issues.

## Architecture

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for technical details.

## License

MIT
