# Testing Guide

## Manual E2E Checklist

### Initial Launch
- [ ] App launches without errors
- [ ] Camera permission prompt appears
- [ ] Grant permission → preview shows webcam
- [ ] UI renders correctly (controls visible)

### File Selection
- [ ] Click "Select Audio" → file picker opens
- [ ] Select audio file → filename displays
- [ ] Click "Select Videos" → file picker opens
- [ ] Select multiple videos → count displays

### Calibration
- [ ] Click "Calibrate Threshold"
- [ ] Modal appears with "Look normally" instruction
- [ ] 3-second countdown works
- [ ] "Close your eyes" instruction appears
- [ ] 2-second countdown works
- [ ] "Calibration complete" message shows
- [ ] Threshold updates automatically

### Detection Start
- [ ] Click "Start Detection"
- [ ] Button changes to "Stop Detection" (red)
- [ ] Debug panel shows EAR values updating
- [ ] Eye state indicator shows OPEN (green)

### Eye Close Trigger
- [ ] Close eyes → Eye state changes to CLOSED (red)
- [ ] Audio plays within 500ms
- [ ] 1 video spawns immediately
- [ ] Debug panel shows "Spam Active: YES"

### Escalation Test
- [ ] Keep eyes closed 2 seconds → 2 more videos spawn
- [ ] Keep eyes closed 4 seconds → 3 more videos spawn
- [ ] Keep eyes closed 6 seconds → 4 more videos spawn
- [ ] Keep eyes closed 8+ seconds → 5 videos every 2s (capped)

### Eye Open Response
- [ ] Open eyes → Audio stops within 200ms
- [ ] No new videos spawn
- [ ] Eye state changes to OPEN (green)
- [ ] Debug panel shows "Spam Active: NO"

### Video Behavior Options
- [ ] Set "On Eyes Open" to "Clear" → videos disappear immediately
- [ ] Set "On Eyes Open" to "Keep" → videos remain playing
- [ ] Set "On Eyes Open" to "Fade" → videos fade out over 1s

### Settings
- [ ] Adjust threshold slider → detection sensitivity changes
- [ ] Adjust max videos slider → limit enforced correctly
- [ ] Click "Clear All Videos Now" → all videos removed

### Stress Test
- [ ] Repeat open/close cycle 10 times → no crashes
- [ ] Keep closed for 30 seconds → memory usage stable
- [ ] Run for 5 minutes → no memory leaks
- [ ] Memory usage stays below 500MB growth

### Edge Cases
- [ ] No face detected → treated as "eyes open" (safe)
- [ ] No audio file selected → videos spawn, no audio
- [ ] No video files selected → audio plays, no videos
- [ ] Max videos reached → oldest video removed before new one

## Unit Tests

Run unit tests:
```bash
npm test
```

### Test Coverage

- `detection/eyeMetrics.test.ts`
  - EAR calculation with known coordinates
  - Smoothing algorithm verification

- `spam/spamController.test.ts`
  - Escalation level calculation
  - Spawn burst size logic

- `detection/stateMachine.test.ts`
  - Debounce transition logic
  - State change callbacks

## Performance Benchmarks

### CPU Usage
- Detection active: < 15% CPU on modern hardware
- Video spawning: < 5% additional CPU per 5 videos

### Memory Usage
- Base application: ~150MB
- Per video: ~20-50MB (depends on resolution)
- Max 50 videos: ~1.2GB total

### Frame Rate
- Detection loop: 20 FPS (configurable)
- Video playback: 30-60 FPS (depends on source)

## Regression Testing

Before each release, verify:
1. All manual E2E tests pass
2. Unit tests pass
3. No console errors
4. Memory stable after 5-minute run
5. Audio never overlaps
6. Videos always muted
7. Only max videos exist at any time
