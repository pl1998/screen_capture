# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-02-06

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

### Technical Details
- Electron 28.x framework
- FFmpeg bundled via ffmpeg-static
- H.264 video codec at 30fps
- CRF 23 quality setting
- Secure IPC communication
- ASAR packaging for app resources

### Known Limitations
- Audio recording UI present but not yet functional
- Records full screen then crops during encoding
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
