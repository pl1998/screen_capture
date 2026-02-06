const { app, BrowserWindow, ipcMain, dialog, screen, nativeTheme } = require('electron');
const path = require('path');
const fs = require('fs');
const ScreenRecorder = require('./recorder');

let mainWindow;
let selectorWindow;
let recorder;

// Store user settings
const settingsPath = path.join(app.getPath('userData'), 'settings.json');

function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }

  // Default settings
  return {
    resolution: '1080p',
    outputPath: app.getPath('videos'),
    audioEnabled: false,
    theme: 'system'
  };
}

function saveSettings(settings) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#1e1e1e' : '#ffffff'
  });

  mainWindow.loadFile('src/index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createSelectorWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  selectorWindow = new BrowserWindow({
    width,
    height,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  selectorWindow.loadFile('src/selector/selector.html');
  selectorWindow.setFullScreen(true);

  selectorWindow.on('closed', () => {
    selectorWindow = null;
  });
}

// IPC Handlers
ipcMain.handle('get-settings', () => {
  return loadSettings();
});

ipcMain.handle('save-settings', (event, settings) => {
  saveSettings(settings);
  return { success: true };
});

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('open-selector', () => {
  createSelectorWindow();
});

ipcMain.handle('close-selector', () => {
  if (selectorWindow) {
    selectorWindow.close();
  }
});

ipcMain.handle('area-selected', (event, bounds) => {
  // Send the selected area to the main window
  if (mainWindow) {
    mainWindow.webContents.send('area-selected', bounds);
  }

  // Close the selector window
  if (selectorWindow) {
    selectorWindow.close();
  }

  return { success: true };
});

ipcMain.handle('start-recording', async (event, bounds) => {
  try {
    const settings = loadSettings();
    await recorder.startRecording(bounds, settings);

    if (selectorWindow) {
      selectorWindow.close();
    }

    return { success: true };
  } catch (error) {
    console.error('Error starting recording:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('stop-recording', async () => {
  try {
    const result = recorder.stopRecording();
    return result;
  } catch (error) {
    console.error('Error stopping recording:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('pause-recording', () => {
  return recorder.pauseRecording();
});

ipcMain.handle('resume-recording', () => {
  return recorder.resumeRecording();
});

ipcMain.handle('get-theme', () => {
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
});

// App lifecycle
app.whenReady().then(async () => {
  // Initialize recorder
  recorder = new ScreenRecorder();
  await recorder.initialize();

  // Set up status change callback
  recorder.onStatusChange = (status) => {
    if (mainWindow) {
      mainWindow.webContents.send('recording-status', status);
    }
  };

  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (recorder) {
    recorder.destroy();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Listen for theme changes
nativeTheme.on('updated', () => {
  if (mainWindow) {
    mainWindow.webContents.send('theme-changed', nativeTheme.shouldUseDarkColors ? 'dark' : 'light');
  }
});
