# Don't Blink

> Weeping angels, but make it productivity.

An Electron application that uses AI-powered eye tracking to detect when you blink or close your eyes. The moment you dare to rest, it unleashes a chaotic barrage of popups, videos, images, and audio all over your screen. The only way to stop the madness? **Don't blink. Open your eyes.**

![Demo](https://img.shields.io/badge/status-working-brightgreen) ![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue) ![License](https://img.shields.io/badge/license-MIT-orange)

---

## 🎯 Features

- **AI Eye Tracking** - Uses MediaPipe Face Landmarker with blendshape-based blink detection for accurate eye state recognition
- **Native Desktop Popups** - Spawns frameless, always-on-top popup windows scattered across your entire desktop
- **Fair Media Distribution** - Smart rotation system ensures all uploaded media files are displayed equally (no more seeing the same meme 10 times)
- **Auto-Calibration** - One-click calibration to learn your personal eye open/closed thresholds
- **Escalating Chaos** - The longer your eyes stay closed, the more popups spawn
- **Custom Media Support** - Upload your own audio, videos, images, and GIFs
- **Cross-Platform** - Works on Windows, macOS, and Linux

---

## 📸 Screenshots

*Coming soon - PRs welcome!*

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/dont-blink.git
cd dont-blink

# Install dependencies
npm install

# Build the application
npm run build

# Start the application
npm start
```

---

## 🎮 How to Use

1. **Start the app** - Launch and allow camera access
2. **Calibrate** - Click "Calibrate Threshold" and follow the instructions:
   - Keep eyes open for 3 seconds
   - Close eyes for 2 seconds
3. **Upload Media** - Select your audio file and media files (images, videos, GIFs)
4. **Enable Detection** - Toggle "Start Detection"
5. **Stay Productive** - If you close your eyes... enjoy the chaos

---

## 🛠️ Development

### Project Structure

```
dont-blink/
├── electron/              # Electron main process
│   ├── main.ts           # Main window & popup management
│   └── preload.ts        # IPC bridge
├── src/
│   ├── app/              # React application
│   │   ├── components/   # UI components
│   │   └── hooks/        # React hooks
│   ├── detection/        # Eye tracking logic
│   │   ├── faceLandmarker.ts
│   │   └── types.ts
│   └── spam/             # Popup/media management
│       ├── spamController.ts
│       └── videoSpawner.ts
└── renderer-dist/        # Built assets
```

### Available Scripts

```bash
npm run dev          # Start development mode with hot reload
npm run build        # Build for production
npm start            # Run the built application
npm run lint         # Run ESLint
```

---

## 🔧 How It Works

### Eye Detection
The app uses **MediaPipe's Face Landmarker** with **blendshape-based blink detection** instead of traditional EAR (Eye Aspect Ratio) calculations. This provides:

- Higher accuracy in various lighting conditions
- Better performance with different face angles
- Direct eye closure scoring from `eyeBlinkLeft` and `eyeBlinkRight` blendshapes

### Fair Media Distribution
When you upload multiple media files, the app tracks display counts for each file. It always selects the **least-used** file to ensure equal distribution. If multiple files have the same count, it randomly picks among them for variety.

### Popup System
Each media file spawns in its own native **BrowserWindow**:
- Frameless and transparent
- Always on top of other windows
- Random position and size (400-800px)
- Shows only after content fully loads (prevents broken image icons)

---

## 🎨 Customization

### Configuration Options

- **Video Behavior**: Choose between "clear" (instant removal) or "fade" (smooth fade-out) when eyes open
- **Max Videos**: Limit the maximum number of concurrent popups
- **Calibration**: Personalize the eye detection threshold

### Supported Media Formats

**Video:** `.mp4`, `.webm`, `.mov`, `.mkv`, `.avi`
**Audio:** `.mp3`, `.wav`, `.ogg`, `.flac`
**Images:** `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.webp`, `.svg`

---

## 🐛 Troubleshooting

### Camera not working?
- Ensure your browser/OS has camera permissions enabled
- Try refreshing the app
- Check if another application is using the camera

### Popups not showing?
- Make sure media files are selected
- Check the console for errors (Ctrl+Shift+I)
- Verify file paths are accessible

### Detection not accurate?
- Re-run calibration in your current lighting
- Ensure your face is well-lit and visible
- Adjust the threshold manually if needed

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙏 Acknowledgments

- [MediaPipe](https://mediapipe.dev/) - For the incredible face detection models
- [Electron](https://www.electronjs.org/) - For cross-platform desktop apps
- [React](https://reactjs.org/) - For the UI framework
- Everyone who dared to close their eyes during development

---

## ⚠️ Disclaimer

This application is for entertainment and productivity purposes. The developers are not responsible for:
- Heart attacks from sudden popup barrages
- Ruined naps
- Traumatized coworkers
- Any other chaos this may cause

**Use at your own risk. Keep your eyes open.** 👀

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=YOUR_USERNAME/eyes-closed-punisher&type=Date)](https://star-history.com/#YOUR_USERNAME/eyes-closed-punisher&Date)

---

Made with 😈 and ☕ by [Your Name](https://github.com/YOUR_USERNAME)
