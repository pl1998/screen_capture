# Application Icons

This directory should contain the application icons for different platforms.

## Required Icon Files

### Windows
- **icon.ico** - Windows application icon
  - Should contain multiple sizes: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256
  - Format: ICO
  - Tool: You can use online converters or tools like ImageMagick

### macOS
- **icon.icns** - macOS application icon
  - Should contain multiple sizes from 16x16 to 1024x1024
  - Format: ICNS
  - Tool: Use `iconutil` on macOS or online converters

### Linux
- **icon.png** - Linux application icon
  - Recommended size: 512x512 or 1024x1024
  - Format: PNG with transparency

## Creating Icons

### Option 1: Using Online Tools
1. Create a 1024x1024 PNG image with your logo
2. Use online converters:
   - For ICO: https://convertio.co/png-ico/
   - For ICNS: https://cloudconvert.com/png-to-icns
   - For PNG: Just resize your image to 512x512

### Option 2: Using ImageMagick (Command Line)

#### Windows ICO
```bash
convert icon-1024.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico
```

#### macOS ICNS
```bash
# Create iconset directory
mkdir icon.iconset

# Generate all required sizes
sips -z 16 16     icon-1024.png --out icon.iconset/icon_16x16.png
sips -z 32 32     icon-1024.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32     icon-1024.png --out icon.iconset/icon_32x32.png
sips -z 64 64     icon-1024.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128   icon-1024.png --out icon.iconset/icon_128x128.png
sips -z 256 256   icon-1024.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256   icon-1024.png --out icon.iconset/icon_256x256.png
sips -z 512 512   icon-1024.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512   icon-1024.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 icon-1024.png --out icon.iconset/icon_512x512@2x.png

# Convert to ICNS
iconutil -c icns icon.iconset
```

#### Linux PNG
```bash
convert icon-1024.png -resize 512x512 icon.png
```

### Option 3: Using Electron Icon Maker
```bash
npm install -g electron-icon-maker
electron-icon-maker --input=icon-1024.png --output=./assets
```

## Temporary Solution

For development and testing, you can build without icons. The build will succeed but use default Electron icons.

To build without icons, temporarily comment out the icon lines in package.json:
```json
"win": {
  // "icon": "assets/icon.ico"
},
"mac": {
  // "icon": "assets/icon.icns"
}
```

## Design Guidelines

### Recommended Icon Design
- Simple, recognizable symbol
- Works well at small sizes (16x16)
- High contrast
- Avoid fine details
- Use a square canvas with some padding

### Suggested Concepts for Screen Recorder
- Camera/video camera icon
- Screen with recording indicator
- Play button with screen
- Rectangular selection frame
- Video file icon

## Icon Resources

Free icon sources:
- https://www.flaticon.com/
- https://icons8.com/
- https://www.iconfinder.com/
- https://iconmonstr.com/

Design tools:
- Figma (free, web-based)
- Inkscape (free, vector graphics)
- GIMP (free, raster graphics)
- Adobe Illustrator (paid)
- Sketch (paid, macOS only)
