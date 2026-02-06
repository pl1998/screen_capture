const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),

  // Area selection
  openSelector: () => ipcRenderer.invoke('open-selector'),
  closeSelector: () => ipcRenderer.invoke('close-selector'),
  areaSelected: (bounds) => ipcRenderer.invoke('area-selected', bounds),
  onAreaSelected: (callback) => ipcRenderer.on('area-selected', (event, bounds) => callback(bounds)),

  // Recording
  startRecording: (bounds) => ipcRenderer.invoke('start-recording', bounds),
  stopRecording: () => ipcRenderer.invoke('stop-recording'),
  pauseRecording: () => ipcRenderer.invoke('pause-recording'),
  resumeRecording: () => ipcRenderer.invoke('resume-recording'),

  // Theme
  getTheme: () => ipcRenderer.invoke('get-theme'),
  onThemeChanged: (callback) => ipcRenderer.on('theme-changed', (event, theme) => callback(theme)),

  // Language
  onLanguageChanged: (callback) => ipcRenderer.on('language-changed', (event, language) => callback(language)),

  // Menu actions
  onMenuSelectArea: (callback) => ipcRenderer.on('menu-select-area', callback),

  // Recording status updates
  onRecordingStatus: (callback) => ipcRenderer.on('recording-status', (event, status) => callback(status))
});
