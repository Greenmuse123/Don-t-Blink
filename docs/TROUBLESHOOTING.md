# Troubleshooting

## Camera Issues

### Camera not detected
- **Check OS permissions**: Ensure camera access is allowed in system settings
- **Restart app**: Close and reopen the application
- **Check other apps**: Ensure no other app is using the camera
- **Try different camera**: If you have multiple cameras, try selecting a different one

### Camera permission denied
- **Windows**: Settings → Privacy → Camera → Allow apps to access camera
- **macOS**: System Preferences → Security & Privacy → Camera → Check the app

### Black screen in preview
- Camera may be in use by another application
- Try refreshing the page (Ctrl+R / Cmd+R)
- Restart the application

## MediaPipe Issues

### "Failed to initialize face detection"
- Check internet connection (MediaPipe models load from CDN)
- Try reloading the application
- Check console for specific error messages

### High CPU usage
- Reduce detection FPS (edit `FRAME_INTERVAL` in `useEyeDetection.ts`)
- Lower max videos setting
- Close other applications

### Detection not working
- Ensure face is well-lit
- Face the camera directly
- Remove glasses if possible
- Check that calibration is complete

## Audio Issues

### Audio doesn't play
- **Electron autoplay policy**: Audio should autoplay from user gesture (click Start Detection)
- Check that audio file is valid (try playing in another player)
- Check system volume
- Try a different audio file format (MP3 recommended)

### Multiple audio tracks playing
- This should never happen - restart the app if it does
- Check console for errors

## Video Issues

### Videos don't spawn
- Check that video files are selected
- Check console for errors
- Try different video formats (MP4 recommended)
- Ensure you have enough disk space

### Too many videos causing lag
- Reduce "Max Videos" setting (default: 20, try 10)
- Close other applications
- Lower video file resolution

### Videos have audio
- Videos are forcibly muted - if you hear audio, it's from another source
- Check system for other media players

## Calibration Issues

### Calibration fails
- Ensure you're in a well-lit environment
- Keep your head still during calibration
- Face the camera directly
- Try recalibrating

### Threshold too sensitive/not sensitive enough
- Manually adjust threshold slider after calibration
- Recalibrate with more exaggerated eye open/close

## Build Issues

### "Cannot find module"
- Run `npm install` to install dependencies
- Ensure you're in the correct directory

### Electron build fails
- Ensure `electron-builder` is installed: `npm install -g electron-builder`
- Check `electron-builder.yml` is properly configured
- Ensure all required files exist

### Vite dev server won't start
- Check port 5173 is not in use
- Try a different port: `npm run dev -- --port 3000`

## Runtime Issues

### App crashes
- Check console for error messages
- Ensure video files are not corrupted
- Try with different media files
- Restart the application

### Memory leak
- Videos are automatically cleaned up when max is reached
- If memory keeps growing, click "Clear All Videos"
- Reduce max videos setting

### Application freezes
- Too many videos may cause rendering issues
- Clear all videos and reduce max videos setting
- Restart the application

## Windows-Specific Issues

### NSIS installer fails
- Run as Administrator
- Disable antivirus temporarily
- Check Windows Defender is not blocking the installer

### App won't launch after install
- Check Windows Event Viewer for errors
- Try running from command line to see errors
- Ensure Visual C++ Redistributables are installed

## macOS-Specific Issues

### "App is damaged" error
- Run: `xattr -cr /Applications/Eyes\ Closed\ Punisher.app`
- Or: System Preferences → Security & Privacy → Open Anyway

### Camera permission on macOS 10.15+
- The app must be code signed for camera permissions to work properly
- For development, you may need to run from terminal

## General Debugging

### Enable debug panel
- Click "Show Debug Info" in the UI
- Check EAR values and eye state
- Verify threshold is appropriate

### Check console logs
- Open DevTools (Ctrl+Shift+I / Cmd+Option+I)
- Look for error messages
- Check MediaPipe initialization status

### Reset calibration
- Calibration is stored in localStorage
- Clear browser data or run: `localStorage.removeItem('eyes-closed-punisher-calibration')`

## Still Having Issues?

1. Check the console for error messages
2. Try with different media files
3. Restart the application
4. Reinstall dependencies: `rm -rf node_modules && npm install`
