const { app, BrowserWindow, ipcMain, dialog, screen, nativeTheme, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const ScreenRecorder = require('./recorder');
const menuI18n = require('./menu-i18n');

let mainWindow;
let selectorWindow;
let recorder;
let currentLanguage = 'zh-CN';
let isCompactMode = false;
let isChangingLanguage = false; // 防止并发语言切换

// Store user settings
const settingsPath = path.join(app.getPath('userData'), 'settings.json');

function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      // 加载语言设置
      if (settings.language) {
        currentLanguage = settings.language;
      }
      return settings;
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }

  // Default settings
  return {
    resolution: '1080p',
    outputPath: app.getPath('videos'),
    audioEnabled: false,
    theme: 'system',
    language: 'zh-CN'
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
  const isMac = process.platform === 'darwin';

  mainWindow = new BrowserWindow({
    width: 420,
    height: 680,
    resizable: false,
    transparent: true,
    backgroundColor: '#00000000', // 完全透明
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
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

// 创建应用菜单
function createMenu() {
  const t = menuI18n[currentLanguage];
  console.log('Creating menu with language:', currentLanguage);
  console.log('Menu translations sample:', {
    fileLabel: t.file.label,
    viewLabel: t.view.label,
    languageLabel: t.language.label
  });
  const isMac = process.platform === 'darwin';

  const template = [
    // macOS 应用菜单
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { label: t.app.about, role: 'about' },
        { type: 'separator' },
        { label: t.app.hide, role: 'hide' },
        { label: t.app.hideOthers, role: 'hideOthers' },
        { label: t.app.unhide, role: 'unhide' },
        { type: 'separator' },
        { label: t.app.quit, role: 'quit' }
      ]
    }] : []),

    // 文件菜单
    {
      label: t.file.label,
      submenu: [
        {
          label: t.file.selectArea,
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-select-area');
            }
          }
        },
        { type: 'separator' },
        {
          label: t.file.openOutputFolder,
          click: async () => {
            const settings = loadSettings();
            const outputPath = settings.outputPath || app.getPath('videos');
            shell.openPath(outputPath);
          }
        },
        { type: 'separator' },
        ...(!isMac ? [{ label: t.app.quit, role: 'quit' }] : [])
      ]
    },

    // 编辑菜单（简化版）
    {
      label: t.edit.label,
      submenu: [
        { label: t.edit.undo, role: 'undo' },
        { label: t.edit.redo, role: 'redo' },
        { type: 'separator' },
        { label: t.edit.cut, role: 'cut' },
        { label: t.edit.copy, role: 'copy' },
        { label: t.edit.paste, role: 'paste' },
        { label: t.edit.selectAll, role: 'selectAll' }
      ]
    },

    // 视图菜单
    {
      label: t.view.label,
      submenu: [
        {
          label: t.view.compactMode,
          type: 'checkbox',
          checked: isCompactMode,
          click: () => toggleCompactMode()
        }
      ]
    },

    // 语言菜单
    {
      label: t.language.label,
      submenu: [
        {
          label: t.language.chinese,
          type: 'radio',
          checked: currentLanguage === 'zh-CN',
          click: () => changeLanguage('zh-CN')
        },
        {
          label: t.language.english,
          type: 'radio',
          checked: currentLanguage === 'en-US',
          click: () => changeLanguage('en-US')
        }
      ]
    },

    // 窗口菜单
    {
      label: t.window.label,
      submenu: [
        { label: t.window.minimize, role: 'minimize' },
        { label: t.window.close, role: 'close' },
        ...(isMac ? [
          { type: 'separator' },
          { label: t.window.front, role: 'front' }
        ] : [])
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  console.log('Menu set successfully with language:', currentLanguage);
}

// 切换语言
function changeLanguage(language) {
  // 防止并发调用
  if (isChangingLanguage) {
    console.log('Language change already in progress, ignoring');
    return;
  }

  // 如果已经是目标语言，直接返回
  if (currentLanguage === language) {
    console.log('Already in language:', language);
    return;
  }

  isChangingLanguage = true;
  console.log('Changing language from', currentLanguage, 'to', language);

  currentLanguage = language;

  // 保存语言设置
  const settings = loadSettings();
  settings.language = language;
  saveSettings(settings);
  console.log('Language settings saved');

  // 不再需要重建原生菜单，因为使用自定义菜单栏
  // createMenu();

  // 通知渲染进程更新语言
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('language-changed', language);
    console.log('Language change notification sent to renderer');
  }

  // 短暂延迟后重置锁
  setTimeout(() => {
    isChangingLanguage = false;
  }, 50);
}

// 切换简化模式
function toggleCompactMode() {
  isCompactMode = !isCompactMode;
  console.log('Toggling compact mode to:', isCompactMode);

  // 不再需要重建原生菜单，因为使用自定义菜单栏
  // createMenu();

  // 调整窗口大小
  if (mainWindow && !mainWindow.isDestroyed()) {
    // 临时启用窗口大小调整以确保 setSize 生效
    mainWindow.setResizable(true);

    if (isCompactMode) {
      // 简化模式：窄窗口
      mainWindow.setSize(120, 680);
    } else {
      // 正常模式：标准窗口
      mainWindow.setSize(420, 680);
    }

    // 恢复禁用窗口大小调整
    mainWindow.setResizable(false);

    // 通知渲染进程切换模式
    mainWindow.webContents.send('compact-mode-changed', isCompactMode);
  }
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

// 自定义菜单栏的 IPC 处理器
ipcMain.handle('menu-toggle-compact-mode', () => {
  toggleCompactMode();
});

ipcMain.handle('menu-change-language', (event, language) => {
  changeLanguage(language);
});

ipcMain.handle('menu-open-output-folder', async () => {
  const settings = loadSettings();
  const outputPath = settings.outputPath || app.getPath('videos');
  shell.openPath(outputPath);
});

ipcMain.handle('menu-minimize-window', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.minimize();
  }
});

ipcMain.handle('menu-close-window', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.close();
  }
});

ipcMain.handle('get-current-language', () => {
  return currentLanguage;
});

ipcMain.handle('get-compact-mode', () => {
  return isCompactMode;
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

  // 不关闭选择器窗口，保持显示边框
  // if (selectorWindow) {
  //   selectorWindow.close();
  // }

  return { success: true };
});

ipcMain.handle('start-recording', async (event, bounds) => {
  try {
    const settings = loadSettings();
    await recorder.startRecording(bounds, settings);

    // 隐藏选择器窗口，避免边框被录制到视频中
    if (selectorWindow) {
      selectorWindow.hide();
    }

    // 开始录制时自动切换到简化模式
    if (!isCompactMode) {
      toggleCompactMode();
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

    // 停止录制时关闭选择器窗口
    if (selectorWindow) {
      selectorWindow.close();
    }

    // 停止录制时恢复正常模式
    if (isCompactMode) {
      toggleCompactMode();
    }

    return result;
  } catch (error) {
    console.error('Error stopping recording:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('pause-recording', () => {
  // 暂停时显示选择器窗口（显示暂停状态的边框）
  if (selectorWindow) {
    selectorWindow.show();
  }
  return recorder.pauseRecording();
});

ipcMain.handle('resume-recording', () => {
  // 恢复录制时隐藏选择器窗口
  if (selectorWindow) {
    selectorWindow.hide();
  }
  return recorder.resumeRecording();
});

ipcMain.handle('get-theme', () => {
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
});

// App lifecycle
app.whenReady().then(async () => {
  // 加载设置（包括语言）
  const settings = loadSettings();
  currentLanguage = settings.language || 'zh-CN';

  // 隐藏原生菜单（使用自定义菜单栏）
  Menu.setApplicationMenu(null);

  // Initialize recorder
  recorder = new ScreenRecorder();
  await recorder.initialize();

  // Set up status change callback
  recorder.onStatusChange = (status) => {
    if (mainWindow) {
      mainWindow.webContents.send('recording-status', status);
    }
    // 同时向选择器窗口发送状态
    if (selectorWindow) {
      selectorWindow.webContents.send('recording-status', status);
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

// 应用退出前确保清理所有资源
app.on('before-quit', (event) => {
  console.log('App is quitting, cleaning up...');

  // 如果录制器存在，确保清理
  if (recorder) {
    recorder.destroy();
  }

  // 关闭所有窗口
  if (selectorWindow && !selectorWindow.isDestroyed()) {
    selectorWindow.destroy();
  }

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.destroy();
  }

  console.log('Cleanup completed');
});

// 最后的清理机会
app.on('will-quit', () => {
  console.log('App will quit, final cleanup...');

  // 确保录制器被销毁
  if (recorder) {
    try {
      recorder.destroy();
    } catch (err) {
      console.error('Error in final cleanup:', err);
    }
    recorder = null;
  }
});

// Listen for theme changes
nativeTheme.on('updated', () => {
  if (mainWindow) {
    mainWindow.webContents.send('theme-changed', nativeTheme.shouldUseDarkColors ? 'dark' : 'light');
  }
});
