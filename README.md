# Screen Recorder

A cross-platform desktop application for recording screen areas with high quality using Electron and FFmpeg.

## Features

- 🎯 Select any screen area with mouse drag
- 🎥 Record in 720p or 1080p quality
- 🎵 Optional audio recording
- 🌓 Dark/Light theme (follows system)
- ⚙️ Customizable output directory
- 🎨 Fluent 2 inspired design

## Technical Specifications

- **Framework**: Electron
- **Video Codec**: H.264
- **Frame Rate**: 30 fps
- **Output Format**: MP4
- **Minimum Selection**: 100x100 pixels

## Installation

1. Install dependencies:
```bash
npm install
```

2. Run the application:
```bash
npm start
```

## Building

### Quick Setup
Run the setup script for your platform:
- **Windows**: `setup.bat`
- **macOS/Linux**: `./setup.sh`

Or manually:
```bash
npm install
```

### Development
```bash
npm start
```

### Production Builds

#### Windows
```bash
npm run build:win
```
Output: `dist/Screen Recorder-1.0.0-x64.exe` (NSIS installer)

#### macOS
```bash
npm run build:mac
```
Output: `dist/Screen Recorder-1.0.0-x64.dmg` (DMG installer)

#### Linux
```bash
npm run build:linux
```
Output: `dist/Screen Recorder-1.0.0-x86_64.AppImage`

#### All Platforms
```bash
npm run build
```

### Icons
Before building, add application icons to `assets/`:
- `icon.ico` (Windows)
- `icon.icns` (macOS)
- `icon.png` (Linux)

Use the icon generation scripts:
- **Windows**: `generate-icons.bat`
- **macOS/Linux**: `./generate-icons.sh`

See `assets/README.md` for detailed instructions.

For complete build documentation, see [BUILD.md](docs/BUILD.md).

## Usage

1. Click "Select Area" to choose the screen region to record
2. Drag to select the desired area (minimum 100x100 pixels)
3. Press Enter to confirm or ESC to cancel
4. Click "Start" to begin recording
5. Use "Pause" to temporarily pause recording
6. Click "Stop" to finish and save the video

## Settings

- **Resolution**: Choose between 720p and 1080p output
- **Audio Recording**: Toggle audio capture on/off
- **Output Directory**: Set where videos are saved

## Project Structure

```
screen_capture/
├── main.js              # Main process
├── preload.js           # Preload script for IPC
├── package.json         # Project configuration
├── src/
│   ├── index.html       # Main window UI
│   ├── styles.css       # Main window styles
│   ├── renderer.js      # Main window logic
│   └── selector/
│       ├── selector.html    # Area selector UI
│       ├── selector.css     # Area selector styles
│       └── selector.js      # Area selector logic
└── README.md
```

## Development Status

- [x] Project structure setup
- [x] Main UI with Fluent 2 design
- [x] Area selection interface
- [x] Settings management
- [x] FFmpeg integration
- [x] Recording functionality (WebM capture + MP4 conversion)
- [x] Pause/Resume support
- [x] Packaging configuration
- [ ] Audio recording support
- [ ] Application icons

## Documentation

All project documentation is located in the `docs/` folder:

- [中文文档索引](docs/中文文档索引.md) - Chinese documentation index
- [文档规范](docs/文档规范.md) - Documentation standards (Chinese)
- [QUICKSTART.md](docs/QUICKSTART.md) - Quick start guide for users
- [BUILD.md](docs/BUILD.md) - Detailed build and distribution guide
- [IMPLEMENTATION.md](docs/IMPLEMENTATION.md) - Technical implementation details
- [CHANGELOG.md](docs/CHANGELOG.md) - Version history and changes
- [RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md) - Release preparation checklist
- [assets/README.md](assets/README.md) - Icon creation guide

## Known Limitations

- Audio recording is not yet implemented (UI toggle is present but non-functional)
- The recording captures the entire screen and then crops to the selected area during encoding
- First recording may take longer due to FFmpeg initialization

## Troubleshooting

**Recording fails to start:**
- Ensure you have granted screen recording permissions (macOS)
- Check that the output directory exists and is writable

**FFmpeg errors:**
- The app bundles FFmpeg automatically via ffmpeg-static
- Check console logs for detailed error messages

**Video quality issues:**
- Try adjusting the resolution setting (720p vs 1080p)
- The CRF value is set to 23 (good quality). Lower values = higher quality but larger files.

## License

MIT
