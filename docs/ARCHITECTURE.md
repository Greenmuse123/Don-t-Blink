# Architecture

## System Overview

Eyes Closed Punisher is an Electron-based desktop application that combines:
- **Electron** for desktop shell and window management
- **React 18** for UI rendering
- **MediaPipe Face Landmarker** for real-time eye detection
- **Web APIs** for media playback (HTMLAudioElement, HTMLVideoElement)

## Data Flow

```
Webcam → Face Landmarker → EAR Calculation → State Machine → Spam Controller
                                                   ↓
                                          UI Updates / Audio + Video
```

## Core Components

### Detection Layer (`src/detection/`)

#### `faceLandmarker.ts`
- Initializes MediaPipe FaceLandmarker
- Processes video frames at 20 FPS
- Returns 468 facial landmarks

#### `eyeMetrics.ts`
- Calculates Eye Aspect Ratio (EAR) from landmarks
- Uses left eye indices [159, 145, 23, 230, 33, 133]
- Uses right eye indices [386, 374, 253, 450, 362, 263]
- Applies exponential moving average (alpha=0.3) for smoothing

#### `calibration.ts`
- Manages calibration data in localStorage
- Calculates threshold as average of open and closed baselines

### State Management (`src/app/hooks/`)

#### `useCamera.ts`
- Manages MediaStream from webcam
- Handles camera permissions
- Provides video element ref

#### `useEyeDetection.ts`
- Runs detection loop at 20 FPS
- Implements debounced state transitions:
  - OPEN → CLOSED: 200ms consecutive frames
  - CLOSED → OPEN: 150ms consecutive frames
- Tracks closed duration for escalation

#### `useSpamController.ts`
- Manages SpamController instance
- Provides reactive state updates

### Spam Layer (`src/spam/`)

#### `audioController.ts`
- Single HTMLAudioElement instance
- Fade-out over 150ms when stopping
- Loop playback enabled

#### `videoSpawner.ts`
- Creates video elements in overlay container
- Random positioning (10-90% x/y, 200-500px size)
- Max cap enforcement with LRU eviction
- Supports clear/keep/fade behaviors

#### `spamController.ts`
- Orchestrates audio + video
- Escalation timer (every 2000ms)
- Burst size formula: `min(level + 1, 5)`

### UI Layer (`src/app/components/`)

#### `CameraPreview.tsx`
- Shows webcam feed with mirror effect
- Toggle visibility

#### `Controls.tsx`
- Detection start/stop
- File selection (audio/video)
- Threshold slider
- Calibration trigger
- Max videos slider
- Video behavior dropdown
- Real-time status display

#### `CalibrationModal.tsx`
- 3-second open eye sampling
- 2-second closed eye sampling
- Calculates and saves threshold

#### `DebugPanel.tsx`
- Expandable diagnostic panel
- EAR values, eye state, duration
- Escalation level, spawn rate
- Active video count

#### `VideoOverlay.tsx`
- Fixed position container (z-index: 9999)
- Holds spawned video elements
- Pointer-events: none (click-through)

## Algorithms

### Eye Aspect Ratio (EAR)

```
EAR = (vertical_avg) / (horizontal)

vertical_avg = avg(dist(upper[i], lower[i]) for i in range(2))
horizontal = dist(left_corner, right_corner)
```

### State Machine

```
OPEN ──[EAR < THRESHOLD for 200ms]──> CLOSED
  ↑                                    │
  └──[EAR > THRESHOLD for 150ms]───────┘
```

### Escalation

```
level = floor(closed_duration_ms / 2000)
burst_size = min(level + 1, 5)

Timeline:
0s    → level 0 → 1 video (initial)
2s    → level 1 → 2 videos
4s    → level 2 → 3 videos
6s    → level 3 → 4 videos
8s+   → level 4 → 5 videos (capped)
```

## File Structure

```
src/
├── app/
│   ├── components/
│   │   ├── CameraPreview.tsx
│   │   ├── Controls.tsx
│   │   ├── CalibrationModal.tsx
│   │   ├── DebugPanel.tsx
│   │   └── VideoOverlay.tsx
│   └── hooks/
│       ├── useCamera.ts
│       ├── useEyeDetection.ts
│       └── useSpamController.ts
├── detection/
│   ├── faceLandmarker.ts
│   ├── eyeMetrics.ts
│   ├── calibration.ts
│   └── types.ts
├── spam/
│   ├── spamController.ts
│   ├── audioController.ts
│   ├── videoSpawner.ts
│   └── types.ts
├── lib/
│   └── utils.ts
├── App.tsx
└── main.tsx

electron/
├── main.ts
└── preload.ts
```

## Performance Considerations

1. **Throttled Detection**: 20 FPS cap to reduce CPU usage
2. **GPU Acceleration**: MediaPipe uses GPU delegate when available
3. **Video Cleanup**: LRU eviction prevents memory leaks
4. **Audio Fading**: Smooth 150ms fade prevents audio pops
5. **Debouncing**: 150-200ms debounce prevents state flickering

## Security

- Context isolation enabled (`contextIsolation: true`)
- Node integration disabled (`nodeIntegration: false`)
- Preload script provides controlled IPC bridge
- CSP headers restrict script sources
