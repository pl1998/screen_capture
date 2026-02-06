# Build and Distribution Guide

This guide explains how to build and distribute the Screen Recorder application for different platforms.

## Prerequisites

### All Platforms
- Node.js 16.x or higher
- npm 8.x or higher
- Git (optional, for version control)

### Windows
- Windows 10 or higher
- No additional requirements (electron-builder handles everything)

### macOS
- macOS 10.13 or higher
- Xcode Command Line Tools: `xcode-select --install`
- For code signing: Apple Developer account

### Linux
- Ubuntu 18.04+ or equivalent
- Required packages:
  ```bash
  sudo apt-get install -y rpm
  ```

## Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

## Building

### Development Build (Test Packaging)
```bash
npm run pack
```
This creates an unpacked build in `dist/[platform]-unpacked/` for testing.

### Production Builds

#### Windows
```bash
npm run build:win
```
**Output:**
- `dist/Screen Recorder-1.0.0-x64.exe` - NSIS installer (64-bit)
- `dist/Screen Recorder-1.0.0-ia32.exe` - NSIS installer (32-bit)
- `dist/Screen Recorder-1.0.0-portable.exe` - Portable version (no installation)

**Installer Features:**
- Custom installation directory
- Desktop shortcut
- Start menu shortcut
- Uninstaller
- Per-user installation (no admin required)

#### macOS
```bash
npm run build:mac
```
**Output:**
- `dist/Screen Recorder-1.0.0-x64.dmg` - Intel Macs
- `dist/Screen Recorder-1.0.0-arm64.dmg` - Apple Silicon (M1/M2)
- `dist/Screen Recorder-1.0.0-x64.zip` - Intel Macs (archive)
- `dist/Screen Recorder-1.0.0-arm64.zip` - Apple Silicon (archive)

**DMG Features:**
- Drag-to-Applications installer
- Custom background (if configured)
- Automatic mounting

#### Linux
```bash
npm run build:linux
```
**Output:**
- `dist/Screen Recorder-1.0.0-x86_64.AppImage` - Universal Linux package
- `dist/Screen Recorder-1.0.0-amd64.deb` - Debian/Ubuntu
- `dist/Screen Recorder-1.0.0-x86_64.rpm` - RedHat/Fedora/CentOS

#### All Platforms
```bash
npm run build
```
Builds for the current platform only.

## Icon Setup

Before building for production, you should add proper application icons:

1. Create or obtain a 1024x1024 PNG icon
2. Convert to required formats:
   - **Windows**: `icon.ico` (multi-size)
   - **macOS**: `icon.icns` (multi-size)
   - **Linux**: `icon.png` (512x512)

3. Place icons in the `assets/` directory

See `assets/README.md` for detailed instructions on creating icons.

### Building Without Icons
If you don't have icons yet, you can still build:
1. Comment out icon lines in `package.json`
2. Build will use default Electron icons
3. Add proper icons later and rebuild

## Code Signing

### Windows
For production releases, you should sign your executables:

1. Obtain a code signing certificate
2. Set environment variables:
   ```bash
   set CSC_LINK=path/to/certificate.pfx
   set CSC_KEY_PASSWORD=your_password
   ```
3. Build normally - electron-builder will sign automatically

### macOS
For distribution outside the App Store:

1. Join Apple Developer Program ($99/year)
2. Create certificates in Xcode
3. Set environment variables:
   ```bash
   export CSC_LINK=path/to/certificate.p12
   export CSC_KEY_PASSWORD=your_password
   export APPLE_ID=your@email.com
   export APPLE_ID_PASSWORD=app-specific-password
   ```
4. Build normally - electron-builder will sign and notarize

**Note:** Unsigned macOS apps will show security warnings.

## Distribution

### Windows
- **NSIS Installer**: Recommended for most users
- **Portable**: For users who prefer no installation
- **MSI**: For enterprise deployment (optional)

Upload to:
- Your website
- GitHub Releases
- Microsoft Store (requires additional setup)

### macOS
- **DMG**: Recommended for most users
- **ZIP**: Alternative distribution method

Upload to:
- Your website
- GitHub Releases
- Mac App Store (requires additional setup and review)

### Linux
- **AppImage**: Universal, works on most distributions
- **DEB**: For Debian/Ubuntu users
- **RPM**: For RedHat/Fedora users

Upload to:
- Your website
- GitHub Releases
- Snap Store (requires additional setup)
- Flathub (requires additional setup)

## Auto-Updates

To enable auto-updates, you need to:

1. Set up a release server (GitHub Releases, S3, etc.)
2. Add update configuration to `package.json`:
   ```json
   "publish": {
     "provider": "github",
     "owner": "yourusername",
     "repo": "screen-recorder"
   }
   ```
3. Implement update checking in `main.js`:
   ```javascript
   const { autoUpdater } = require('electron-updater');
   autoUpdater.checkForUpdatesAndNotify();
   ```

## Build Optimization

### Reducing Build Size
The current configuration already includes:
- Maximum compression
- Exclusion of unnecessary files
- ASAR packaging
- Tree-shaking of dependencies

### Build Time Optimization
- Use `npm run pack` for quick testing
- Only build for target platform during development
- Use `--dir` flag to skip compression

## Troubleshooting

### Build Fails
- Ensure all dependencies are installed: `npm install`
- Clear cache: `rm -rf node_modules dist && npm install`
- Check Node.js version: `node --version` (should be 16+)

### FFmpeg Not Found in Build
- Check `extraResources` in package.json
- Verify ffmpeg-static is in dependencies
- Check `asarUnpack` configuration

### Icons Not Showing
- Verify icon files exist in `assets/` directory
- Check file names match package.json configuration
- Ensure icon files are valid format

### macOS Build on Windows/Linux
- macOS builds can only be created on macOS
- Use CI/CD services (GitHub Actions, CircleCI) for cross-platform builds
- Or use a macOS virtual machine

### Windows Build on macOS/Linux
- Windows builds can be created on any platform
- Requires Wine on Linux: `sudo apt-get install wine`
- May require additional setup for code signing

## CI/CD Integration

### GitHub Actions Example
Create `.github/workflows/build.yml`:

```yaml
name: Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, ubuntu-latest, windows-latest]

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.os }}-build
          path: dist/*
```

## Version Management

Update version in `package.json`:
```json
{
  "version": "1.0.0"
}
```

Version will be automatically included in:
- Installer file names
- Application about dialog
- Update checks

## Release Checklist

- [ ] Update version in package.json
- [ ] Update CHANGELOG.md
- [ ] Test application thoroughly
- [ ] Create proper icons
- [ ] Build for all target platforms
- [ ] Test installers on clean systems
- [ ] Sign executables (if applicable)
- [ ] Create release notes
- [ ] Upload to distribution channels
- [ ] Update website/documentation
- [ ] Announce release

## Support

For build issues:
- Check electron-builder documentation: https://www.electron.build/
- Check Electron documentation: https://www.electronjs.org/
- Review build logs in `dist/` directory
- Check GitHub issues for similar problems
