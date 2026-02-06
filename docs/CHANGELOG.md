# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-06

### Added
- Initial release
- Screen area selection with mouse drag
- Recording controls (Start, Pause, Resume, Stop)
- Real-time recording timer
- FFmpeg integration for H.264 encoding
- Resolution presets (720p, 1080p)
- Output directory selection
- Settings persistence
- Dark/Light theme support (follows system)
- Fluent 2 inspired UI design
- Cross-platform support (Windows, macOS, Linux)
- Automatic WebM to MP4 conversion
- Minimum selection size validation (100x100 pixels)
- Visual feedback during recording
- Progress indicator during video processing
- Timestamp-based file naming
- Multi-language support (Chinese and English)
- Compact mode for minimal UI during recording
- Menu bar with keyboard shortcuts

### Fixed
- **Recording area cropping**: Videos now correctly record only the selected area instead of the entire screen
  - Implemented FFmpeg crop filter to accurately crop video to selected bounds
  - Added proper bounds parameter passing through the recording pipeline
- **FFmpeg path resolution in packaged apps**: Fixed "spawn ffmpeg.exe ENOENT" error in production builds
  - Implemented multi-path fallback mechanism for FFmpeg binary location
  - Added proper resource path resolution for ASAR packaged applications
  - Delayed require('ffmpeg-static') to only load in development mode
- **Language switching crash**: Fixed application exit when changing language in menu
  - Removed problematic Menu.setApplicationMenu(null) call
  - Added window state validation with !mainWindow.isDestroyed()
  - Improved menu update logic to prevent crashes
- **Recording border visibility**: Fixed border appearing in output videos
  - Selector window now hides during active recording
  - Border only shows when paused or selecting area
- **Compact mode sizing**: Fixed window height consistency
  - Adjusted compact mode height from 600 to 680 pixels to match main window
  - Ensured proper window dimensions in both normal and compact modes
- **Code quality**: Removed duplicate return statement in stop-recording handler

### Technical Details
- Electron 28.x framework
- FFmpeg bundled via ffmpeg-static
- H.264 video codec at 30fps
- CRF 23 quality setting
- Secure IPC communication
- ASAR packaging for app resources
- i18n system for multi-language support
- Dynamic menu generation based on language selection

### Known Limitations
- Audio recording UI present but not yet functional
- First recording may be slower due to FFmpeg initialization

## [Unreleased]

### Planned Features
- Audio recording (system audio and microphone)
- Hotkey support for quick recording
- Recording preview window
- Video trimming/editing
- Multiple monitor support
- Custom frame rate selection
- Webcam overlay
- Annotation tools
- Cloud upload integration
- Recording history/library

### Planned Improvements
- Direct area capture (without full screen recording)
- Hardware acceleration support
- Reduced memory usage
- Faster encoding with GPU support
- Custom output format selection
- Bitrate customization
- Advanced FFmpeg options

---

## Version History

### Version Numbering
- **Major.Minor.Patch** (e.g., 1.0.0)
- **Major**: Breaking changes or major new features
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes, minor improvements

### Release Types
- **Stable**: Production-ready releases (1.0.0, 1.1.0, etc.)
- **Beta**: Feature-complete but needs testing (1.0.0-beta.1)
- **Alpha**: Early development versions (1.0.0-alpha.1)

---

## How to Update

### For Users
1. Download the latest version from the releases page
2. Install over the existing version (settings will be preserved)
3. Or use the built-in auto-updater (if enabled)

### For Developers
1. Pull the latest changes: `git pull`
2. Update dependencies: `npm install`
3. Rebuild: `npm run build`

---

## Support

For issues, feature requests, or questions:
- GitHub Issues: https://github.com/yourusername/screen-recorder/issues
- Email: support@screenrecorder.app
- Documentation: See README.md and other docs
