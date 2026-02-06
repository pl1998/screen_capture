@echo off
echo Screen Recorder - Setup and Test Script
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js is not installed. Please install Node.js first.
    exit /b 1
)

echo √ Node.js is installed
node --version

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X npm is not installed. Please install npm first.
    exit /b 1
)

echo √ npm is installed
npm --version
echo.

REM Install dependencies
echo Installing dependencies...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo √ Dependencies installed successfully
) else (
    echo X Failed to install dependencies
    exit /b 1
)

echo.
echo Setup complete! You can now run:
echo    npm start    - Start the application
echo    npm run build - Build for production
echo.
pause
