@echo off
REM Icon Generation Helper Script for Windows
REM This script helps generate application icons from a source PNG file

echo Screen Recorder - Icon Generation Helper
echo ========================================
echo.

REM Check if ImageMagick is installed
where magick >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X ImageMagick is not installed.
    echo   Download and install from: https://imagemagick.org/
    echo.
    exit /b 1
)

echo √ ImageMagick is installed
echo.

REM Check if source icon exists
if not exist "assets\icon-1024.png" (
    echo X Source icon not found: assets\icon-1024.png
    echo.
    echo Please create a 1024x1024 PNG icon and save it as:
    echo    assets\icon-1024.png
    echo.
    echo You can use the provided SVG as a starting point:
    echo    assets\icon.svg
    echo.
    exit /b 1
)

echo √ Source icon found: assets\icon-1024.png
echo.

REM Generate Windows ICO
echo Generating Windows icon (icon.ico)...
magick convert assets\icon-1024.png -define icon:auto-resize=256,128,64,48,32,16 assets\icon.ico

if %ERRORLEVEL% EQU 0 (
    echo √ Windows icon created: assets\icon.ico
) else (
    echo X Failed to create Windows icon
)

REM Generate Linux PNG
echo Generating Linux icon (icon.png)...
magick convert assets\icon-1024.png -resize 512x512 assets\icon.png

if %ERRORLEVEL% EQU 0 (
    echo √ Linux icon created: assets\icon.png
) else (
    echo X Failed to create Linux icon
)

echo.
echo Note: macOS icon (.icns) must be generated on macOS
echo       or using an online converter
echo.

echo √ Icon generation complete!
echo.
echo Generated icons:
echo   - assets\icon.ico (Windows)
echo   - assets\icon.png (Linux)
echo.
echo You can now build the application with proper icons:
echo   npm run build
echo.
pause
