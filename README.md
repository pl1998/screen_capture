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

## interface Img

<br/>

<img src="docs/demo_home.png">

<br/>

<img src="docs/demo_right.png">


<br/>

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
├── main.js                 # Main process (window management, IPC)
├── preload.js              # Preload script for IPC bridge
├── recorder.js             # Screen recording and FFmpeg integration
├── menu-i18n.js            # Menu bar internationalization
├── package.json            # Project configuration and dependencies
│
├── src/                    # Renderer process source files
│   ├── index.html          # Main window UI
│   ├── styles.css          # Main window styles (gradient background, glassmorphism)
│   ├── renderer.js         # Main window logic and event handlers
│   ├── recording.html      # Hidden recording window for MediaRecorder
│   │
│   ├── i18n/               # Internationalization
│   │   ├── i18n.js         # i18n manager
│   │   ├── zh-CN.js        # Chinese translations
│   │   └── en-US.js        # English translations
│   │
│   └── selector/           # Area selection window
│       ├── selector.html   # Area selector UI
│       ├── selector.css    # Area selector styles (recording border effects)
│       └── selector.js     # Area selector logic and state management
│
├── assets/                 # Application resources
│   ├── icon.ico            # Windows icon
│   ├── icon.icns           # macOS icon
│   ├── icon.png            # Linux icon
│   ├── icon.svg            # Source icon
│   ├── README.md           # Icon creation guide
│   └── entitlements.mac.plist  # macOS entitlements
│
├── docs/                   # Documentation
│   ├── 中文文档索引.md     # Chinese documentation index
│   ├── 文档规范.md         # Documentation standards
│   ├── 项目初稿设计.md     # Initial project design
│   ├── README_zh.md        # Chinese README
│   ├── QUICKSTART.md       # Quick start guide
│   ├── QUICKSTART_zh.md    # Chinese quick start guide
│   ├── BUILD.md            # Build guide
│   ├── IMPLEMENTATION.md   # Technical implementation
│   ├── CHANGELOG.md        # Version history
│   ├── CHANGELOG_zh.md     # Chinese version history
│   ├── PROJECT_SUMMARY.md  # Project summary
│   ├── PROJECT_SUMMARY_zh.md  # Chinese project summary
│   ├── RELEASE_CHECKLIST.md   # Release checklist
│   │
│   ├── 新UI设计说明.md     # New UI design documentation
│   ├── 简化模式功能说明.md  # Compact mode feature
│   ├── 透明标题栏实现说明.md  # Transparent title bar
│   ├── 录制区域边框视觉效果说明.md  # Recording border effects
│   ├── 改进-录制时隐藏边框.md  # Hide border during recording
│   │
│   ├── Bug修复-录制区域裁剪.md  # Bug fix: area cropping
│   ├── Bug修复-打包后FFmpeg路径.md  # Bug fix: FFmpeg path in production
│   ├── Bug修复-切换语言退出.md  # Bug fix: language switch crash
│   ├── FFmpeg路径调试指南.md  # FFmpeg path debugging
│   ├── 语言切换调试指南.md  # Language switch debugging
│   ├── 构建问题-图标格式错误.md  # Build issue: icon format
│   │
│   ├── demo_home.png       # Home interface screenshot
│   └── demo_right.png      # Compact mode screenshot
│
└── dist/                   # Build output (generated)
    ├── win-unpacked/       # Windows unpacked build
    ├── Screen Recorder-1.0.0-x64.exe  # Windows installer
    └── ...                 # Other platform builds
```

### Key Components

**Main Process (Electron)**
- `main.js`: Window lifecycle, menu management, IPC handlers
- `recorder.js`: Screen capture, FFmpeg video processing
- `menu-i18n.js`: Multi-language menu support

**Renderer Process**
- `src/index.html`: Main UI with gradient background
- `src/renderer.js`: UI logic, recording controls, i18n
- `src/selector/`: Area selection with visual feedback

**Internationalization**
- `src/i18n/`: Language management system
- Supports Chinese (zh-CN) and English (en-US)
- Menu bar and UI text translation

**Recording System**
- `src/recording.html`: MediaRecorder for screen capture
- `recorder.js`: FFmpeg integration for MP4 conversion
- Area cropping and resolution scaling

**Features**
- 🎨 Modern gradient UI with glassmorphism
- 🌐 Multi-language support (Chinese/English)
- 📐 Compact mode for minimal screen space
- 🎬 Visual recording border with animations
- 🔄 Transparent title bar integration
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
