# Quick Start Guide

## Installation

### Windows
1. Double-click `setup.bat`
2. Wait for dependencies to install
3. Run `npm start`

### macOS/Linux
1. Run `./setup.sh` (or `bash setup.sh`)
2. Wait for dependencies to install
3. Run `npm start`

### Manual Installation
```bash
npm install
npm start
```

## First Time Setup

1. When the app launches, go to Settings section
2. Click "Browse" to set your output directory
3. Choose your preferred resolution (720p or 1080p)
4. Audio recording toggle is available (not yet functional)

## Recording Your First Video

1. Click **"Select Area"** button
2. A full-screen overlay will appear
3. Click and drag to select the area you want to record
   - Minimum size: 100x100 pixels
   - Coordinates and dimensions are shown at the top
4. Press **Enter** to confirm (or **ESC** to cancel)
5. The main window will show your selected area size
6. Click **"Start"** to begin recording
7. The timer will start and status will show "Recording"
8. Click **"Pause"** to temporarily pause (click again to resume)
9. Click **"Stop"** when finished
10. Wait for video processing (WebM → MP4 conversion)
11. A notification will show the saved file location

## Keyboard Shortcuts

### In Selector Window
- **Enter**: Confirm selection and return to main window
- **ESC**: Cancel selection and close selector

## Tips

- Select a smaller area for better performance
- Use 720p for smaller file sizes
- Use 1080p for higher quality
- The first recording may take longer due to initialization
- Videos are saved with timestamp in filename: `recording-YYYY-MM-DD_HH-MM-SS.mp4`

## Troubleshooting

### "Recording failed to start"
- Check screen recording permissions (macOS: System Preferences → Security & Privacy → Screen Recording)
- Ensure output directory exists and is writable

### "Selection too small"
- Make sure your selection is at least 100x100 pixels
- The dimensions are shown in real-time as you drag

### Video quality issues
- Try switching between 720p and 1080p
- Ensure you're not recording an area larger than your screen resolution

### App won't start
- Run `npm install` again
- Check that Node.js version is 16 or higher: `node --version`
- Check console for error messages

## Building for Distribution

### Windows
```bash
npm run build:win
```
Output: `dist/Screen Recorder Setup.exe`

### macOS
```bash
npm run build:mac
```
Output: `dist/Screen Recorder.dmg`

### Both platforms
```bash
npm run build
```

## System Requirements

- **Node.js**: 16.x or higher
- **npm**: 8.x or higher
- **OS**: Windows 10+, macOS 10.13+, or Linux
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 500MB for app + space for recordings

## Default Settings

- **Resolution**: 1080p (1920x1080)
- **Frame Rate**: 30 fps
- **Video Codec**: H.264
- **Quality**: CRF 23 (high quality)
- **Output Directory**: System Videos folder
- **Audio**: Disabled (not yet implemented)

## File Locations

### Settings
- **Windows**: `%APPDATA%/screen-recorder/settings.json`
- **macOS**: `~/Library/Application Support/screen-recorder/settings.json`
- **Linux**: `~/.config/screen-recorder/settings.json`

### Default Output
- **Windows**: `C:\Users\[Username]\Videos`
- **macOS**: `~/Movies`
- **Linux**: `~/Videos`

## Support

For issues or questions:
1. Check the README.md for detailed documentation
2. Check IMPLEMENTATION.md for technical details
3. Review console logs for error messages
4. Ensure all dependencies are installed correctly
