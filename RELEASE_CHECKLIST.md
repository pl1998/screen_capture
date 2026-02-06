# Release Checklist

Use this checklist when preparing a new release of Screen Recorder.

## Pre-Release

### Code Quality
- [ ] All features working as expected
- [ ] No critical bugs
- [ ] Code reviewed and cleaned up
- [ ] Console logs removed or made conditional
- [ ] Error handling tested
- [ ] Memory leaks checked

### Testing
- [ ] Test on Windows 10/11
- [ ] Test on macOS (Intel and Apple Silicon if possible)
- [ ] Test on Linux (Ubuntu/Debian)
- [ ] Test all recording features
- [ ] Test area selection
- [ ] Test pause/resume
- [ ] Test settings persistence
- [ ] Test theme switching
- [ ] Test with different screen resolutions
- [ ] Test with multiple monitors (if supported)
- [ ] Test edge cases (minimum size, large areas, etc.)

### Documentation
- [ ] README.md updated
- [ ] CHANGELOG.md updated with new version
- [ ] BUILD.md reviewed and updated if needed
- [ ] QUICKSTART.md reviewed
- [ ] Code comments added where needed
- [ ] API documentation updated (if applicable)

### Version Management
- [ ] Version number updated in package.json
- [ ] Version follows semantic versioning
- [ ] Git tag created: `git tag v1.0.0`
- [ ] CHANGELOG.md has entry for this version

### Assets
- [ ] Application icons created (icon.ico, icon.icns, icon.png)
- [ ] Icons placed in assets/ directory
- [ ] Icons tested at different sizes
- [ ] Screenshots updated (if needed)
- [ ] Demo video created/updated (optional)

## Build Process

### Preparation
- [ ] Clean build environment: `rm -rf node_modules dist`
- [ ] Fresh install: `npm install`
- [ ] Test run: `npm start`
- [ ] Verify all dependencies installed correctly

### Windows Build
- [ ] Run: `npm run build:win`
- [ ] Check dist/ for output files
- [ ] Test NSIS installer on clean Windows system
- [ ] Test portable version
- [ ] Verify file associations (if any)
- [ ] Check Start Menu shortcuts
- [ ] Check Desktop shortcut
- [ ] Test uninstaller
- [ ] Verify app runs after installation
- [ ] Check for antivirus false positives

### macOS Build
- [ ] Run: `npm run build:mac`
- [ ] Check dist/ for output files
- [ ] Test DMG on clean macOS system
- [ ] Test on Intel Mac (if available)
- [ ] Test on Apple Silicon Mac (if available)
- [ ] Verify app opens without security warnings (if signed)
- [ ] Check Applications folder installation
- [ ] Test app permissions (screen recording)
- [ ] Verify app runs after installation

### Linux Build
- [ ] Run: `npm run build:linux`
- [ ] Check dist/ for output files
- [ ] Test AppImage on Ubuntu/Debian
- [ ] Test .deb package installation
- [ ] Test .rpm package (if possible)
- [ ] Verify app runs after installation
- [ ] Check desktop entry created
- [ ] Test app permissions

### Code Signing (Optional but Recommended)
- [ ] Windows: Code signing certificate obtained
- [ ] Windows: Executable signed
- [ ] macOS: Developer certificate obtained
- [ ] macOS: App signed and notarized
- [ ] Verify signatures: `codesign -dv --verbose=4 app.app`

## Release

### GitHub Release
- [ ] Push code to GitHub: `git push origin main`
- [ ] Push tags: `git push origin v1.0.0`
- [ ] Create GitHub Release
- [ ] Upload Windows installers
- [ ] Upload macOS DMG/ZIP
- [ ] Upload Linux packages
- [ ] Write release notes
- [ ] Mark as pre-release if beta/alpha
- [ ] Publish release

### Release Notes Template
```markdown
## Screen Recorder v1.0.0

### New Features
- Feature 1
- Feature 2

### Improvements
- Improvement 1
- Improvement 2

### Bug Fixes
- Fix 1
- Fix 2

### Known Issues
- Issue 1
- Issue 2

### Download
- Windows: [Download](link)
- macOS: [Download](link)
- Linux: [Download](link)

### Installation
See [QUICKSTART.md](link) for installation instructions.

### System Requirements
- Windows 10 or higher
- macOS 10.13 or higher
- Ubuntu 18.04 or equivalent
```

### Distribution Channels
- [ ] Upload to website (if applicable)
- [ ] Update download links
- [ ] Submit to Microsoft Store (optional)
- [ ] Submit to Mac App Store (optional)
- [ ] Submit to Snap Store (optional)
- [ ] Submit to Flathub (optional)

### Communication
- [ ] Announce on social media
- [ ] Send email to users (if mailing list exists)
- [ ] Update project website
- [ ] Post on relevant forums/communities
- [ ] Update documentation site
- [ ] Create blog post (optional)

## Post-Release

### Monitoring
- [ ] Monitor GitHub Issues for bug reports
- [ ] Check download statistics
- [ ] Monitor crash reports (if telemetry enabled)
- [ ] Check user feedback
- [ ] Monitor social media mentions

### Support
- [ ] Respond to issues promptly
- [ ] Update FAQ if needed
- [ ] Create troubleshooting guides for common issues
- [ ] Help users with installation problems

### Planning
- [ ] Review feedback for next version
- [ ] Plan next release features
- [ ] Update roadmap
- [ ] Create issues for reported bugs
- [ ] Prioritize feature requests

## Hotfix Release

If a critical bug is found after release:

- [ ] Create hotfix branch: `git checkout -b hotfix/v1.0.1`
- [ ] Fix the bug
- [ ] Update version to 1.0.1
- [ ] Update CHANGELOG.md
- [ ] Test thoroughly
- [ ] Build for all platforms
- [ ] Create new release
- [ ] Merge back to main: `git checkout main && git merge hotfix/v1.0.1`
- [ ] Delete hotfix branch: `git branch -d hotfix/v1.0.1`

## Version Numbering Guide

### Major Version (X.0.0)
- Breaking changes
- Major new features
- Complete redesign
- API changes

### Minor Version (1.X.0)
- New features
- Backward compatible
- Significant improvements
- New functionality

### Patch Version (1.0.X)
- Bug fixes
- Minor improvements
- Security patches
- Performance improvements

## Emergency Procedures

### Critical Bug Found
1. Immediately mark release as "Pre-release" on GitHub
2. Add warning to README
3. Prepare hotfix ASAP
4. Notify users via all channels

### Security Vulnerability
1. Do not disclose publicly until fixed
2. Prepare security patch immediately
3. Release as soon as possible
4. Notify users with security advisory
5. Update all distribution channels

### Build Issues
1. Do not release if builds fail
2. Fix build issues first
3. Re-test everything
4. Only release when all builds succeed

## Notes

- Always test on clean systems (VMs recommended)
- Keep backups of all release builds
- Document any issues encountered
- Update this checklist based on experience
- Consider automating parts of this process
