#!/bin/bash

# Icon Generation Helper Script
# This script helps generate application icons from a source PNG file

echo "Screen Recorder - Icon Generation Helper"
echo "========================================"
echo ""

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "⚠️  ImageMagick is not installed."
    echo "   Install it to use this script:"
    echo "   - macOS: brew install imagemagick"
    echo "   - Ubuntu: sudo apt-get install imagemagick"
    echo "   - Windows: Download from https://imagemagick.org/"
    echo ""
    exit 1
fi

echo "✅ ImageMagick is installed"
echo ""

# Check if source icon exists
if [ ! -f "assets/icon-1024.png" ]; then
    echo "❌ Source icon not found: assets/icon-1024.png"
    echo ""
    echo "Please create a 1024x1024 PNG icon and save it as:"
    echo "   assets/icon-1024.png"
    echo ""
    echo "You can use the provided SVG as a starting point:"
    echo "   assets/icon.svg"
    echo ""
    exit 1
fi

echo "✅ Source icon found: assets/icon-1024.png"
echo ""

# Generate Windows ICO
echo "📦 Generating Windows icon (icon.ico)..."
convert assets/icon-1024.png -define icon:auto-resize=256,128,64,48,32,16 assets/icon.ico

if [ $? -eq 0 ]; then
    echo "✅ Windows icon created: assets/icon.ico"
else
    echo "❌ Failed to create Windows icon"
fi

# Generate Linux PNG
echo "📦 Generating Linux icon (icon.png)..."
convert assets/icon-1024.png -resize 512x512 assets/icon.png

if [ $? -eq 0 ]; then
    echo "✅ Linux icon created: assets/icon.png"
else
    echo "❌ Failed to create Linux icon"
fi

# Generate macOS ICNS (requires iconutil on macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📦 Generating macOS icon (icon.icns)..."

    # Create iconset directory
    mkdir -p assets/icon.iconset

    # Generate all required sizes
    sips -z 16 16     assets/icon-1024.png --out assets/icon.iconset/icon_16x16.png
    sips -z 32 32     assets/icon-1024.png --out assets/icon.iconset/icon_16x16@2x.png
    sips -z 32 32     assets/icon-1024.png --out assets/icon.iconset/icon_32x32.png
    sips -z 64 64     assets/icon-1024.png --out assets/icon.iconset/icon_32x32@2x.png
    sips -z 128 128   assets/icon-1024.png --out assets/icon.iconset/icon_128x128.png
    sips -z 256 256   assets/icon-1024.png --out assets/icon.iconset/icon_128x128@2x.png
    sips -z 256 256   assets/icon-1024.png --out assets/icon.iconset/icon_256x256.png
    sips -z 512 512   assets/icon-1024.png --out assets/icon.iconset/icon_256x256@2x.png
    sips -z 512 512   assets/icon-1024.png --out assets/icon.iconset/icon_512x512.png
    sips -z 1024 1024 assets/icon-1024.png --out assets/icon.iconset/icon_512x512@2x.png

    # Convert to ICNS
    iconutil -c icns assets/icon.iconset -o assets/icon.icns

    if [ $? -eq 0 ]; then
        echo "✅ macOS icon created: assets/icon.icns"
        # Clean up iconset directory
        rm -rf assets/icon.iconset
    else
        echo "❌ Failed to create macOS icon"
    fi
else
    echo "⚠️  Skipping macOS icon (iconutil only available on macOS)"
    echo "   You can generate it on a Mac or use an online converter"
fi

echo ""
echo "✅ Icon generation complete!"
echo ""
echo "Generated icons:"
echo "  - assets/icon.ico (Windows)"
echo "  - assets/icon.png (Linux)"
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "  - assets/icon.icns (macOS)"
fi
echo ""
echo "You can now build the application with proper icons:"
echo "  npm run build"
echo ""
