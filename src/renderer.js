// 初始化 i18n
i18n.registerLocale('zh-CN', zhCN);
i18n.registerLocale('en-US', enUS);

// State management
let settings = {};
let selectedArea = null;
let isRecording = false;
let isPaused = false;
let timerInterval = null;
let recordingStartTime = 0;
let elapsedTime = 0;

// DOM elements
const selectAreaBtn = document.getElementById('selectAreaBtn');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = statusIndicator.querySelector('.status-text');
const timer = document.getElementById('timer');
const resolutionSelect = document.getElementById('resolution');
const audioToggle = document.getElementById('audioToggle');
const outputPath = document.getElementById('outputPath');
const selectPathBtn = document.getElementById('selectPathBtn');

// 更新所有界面文本
function updateUIText() {
  // 更新所有带 data-i18n 属性的元素
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const text = i18n.t(key);

    // 根据元素类型更新文本
    if (element.tagName === 'INPUT' && element.type === 'text') {
      element.placeholder = text;
    } else if (element.tagName === 'TITLE') {
      element.textContent = text;
      document.title = text;
    } else {
      element.textContent = text;
    }
  });

  // 更新当前状态文本（如果不是默认状态）
  if (isRecording) {
    updateStatus(i18n.t('status.recording'), 'recording');
  } else if (isPaused) {
    updateStatus(i18n.t('status.paused'), 'paused');
  } else if (selectedArea) {
    updateStatus(i18n.t('status.areaSelected', {
      width: selectedArea.width,
      height: selectedArea.height
    }));
  } else {
    updateStatus(i18n.t('status.ready'));
  }

  // 更新暂停/恢复按钮文本
  updatePauseButtonText();
}

// 更新暂停按钮文本
function updatePauseButtonText() {
  const pauseBtnText = pauseBtn.querySelector('span:not(.icon)');
  if (pauseBtnText) {
    pauseBtnText.textContent = isPaused ? i18n.t('buttons.resume') : i18n.t('buttons.pause');
  }
}

// Initialize
async function init() {
  // Load settings
  settings = await window.electronAPI.getSettings();
  applySettings();

  // 设置语言
  const savedLanguage = settings.language || 'zh-CN';
  i18n.setLocale(savedLanguage);
  updateUIText();

  // Apply theme
  const theme = await window.electronAPI.getTheme();
  document.documentElement.setAttribute('data-theme', theme);

  // Listen for theme changes
  window.electronAPI.onThemeChanged((theme) => {
    document.documentElement.setAttribute('data-theme', theme);
  });

  // Listen for recording status updates
  window.electronAPI.onRecordingStatus((status) => {
    handleRecordingStatus(status);
  });

  // Listen for area selection
  window.electronAPI.onAreaSelected((bounds) => {
    selectedArea = bounds;
    startBtn.disabled = false;
    updateStatus(i18n.t('status.areaSelected', {
      width: bounds.width,
      height: bounds.height
    }));
  });

  // Listen for language changes from menu
  window.electronAPI.onLanguageChanged((language) => {
    i18n.setLocale(language);
    settings.language = language;
    updateUIText();
  });

  // Listen for menu actions
  window.electronAPI.onMenuSelectArea(() => {
    selectAreaBtn.click();
  });
}

function applySettings() {
  resolutionSelect.value = settings.resolution || '1080p';
  audioToggle.checked = settings.audioEnabled || false;
  outputPath.value = settings.outputPath || '';

  // 应用语言设置
  if (settings.language) {
    i18n.setLocale(settings.language);
  }
}

async function saveCurrentSettings() {
  settings.resolution = resolutionSelect.value;
  settings.audioEnabled = audioToggle.checked;
  settings.outputPath = outputPath.value;
  settings.language = i18n.getLocale();

  await window.electronAPI.saveSettings(settings);
}

// Event listeners
selectAreaBtn.addEventListener('click', async () => {
  await window.electronAPI.openSelector();
  // The selector will send back the selected area via IPC
});

startBtn.addEventListener('click', async () => {
  if (!selectedArea) return;

  await saveCurrentSettings();
  const result = await window.electronAPI.startRecording(selectedArea);

  if (result.success) {
    isRecording = true;
    isPaused = false;
    recordingStartTime = Date.now();
    startTimer();
    updateControls();
    updateStatus(i18n.t('status.recording'), 'recording');
  }
});

pauseBtn.addEventListener('click', async () => {
  if (isPaused) {
    await window.electronAPI.resumeRecording();
    isPaused = false;
    recordingStartTime = Date.now() - elapsedTime;
    startTimer();
    updateStatus(i18n.t('status.recording'), 'recording');
  } else {
    await window.electronAPI.pauseRecording();
    isPaused = true;
    stopTimer();
    updateStatus(i18n.t('status.paused'), 'paused');
  }
  updateControls();
});

stopBtn.addEventListener('click', async () => {
  await window.electronAPI.stopRecording();
  isRecording = false;
  isPaused = false;
  stopTimer();
  resetTimer();
  updateControls();
  updateStatus(i18n.t('status.ready'));
  selectedArea = null;
});

selectPathBtn.addEventListener('click', async () => {
  const path = await window.electronAPI.selectDirectory();
  if (path) {
    outputPath.value = path;
    settings.outputPath = path;
    await saveCurrentSettings();
  }
});

// Settings change listeners
resolutionSelect.addEventListener('change', saveCurrentSettings);
audioToggle.addEventListener('change', saveCurrentSettings);

// UI update functions
function updateControls() {
  selectAreaBtn.disabled = isRecording;
  startBtn.disabled = isRecording || !selectedArea;
  pauseBtn.disabled = !isRecording;
  stopBtn.disabled = !isRecording;

  updatePauseButtonText();
}

function updateStatus(text, state = '') {
  statusText.textContent = text;
  statusIndicator.className = 'status-indicator';
  if (state) {
    statusIndicator.classList.add(state);
  }
}

function startTimer() {
  timerInterval = setInterval(() => {
    elapsedTime = Date.now() - recordingStartTime;
    updateTimerDisplay();
  }, 100);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function resetTimer() {
  elapsedTime = 0;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const totalSeconds = Math.floor(elapsedTime / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  timer.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function pad(num) {
  return num.toString().padStart(2, '0');
}

function handleRecordingStatus(status) {
  console.log('Recording status:', status);

  switch (status.status) {
    case 'recording':
      isRecording = true;
      isPaused = false;
      updateStatus(i18n.t('status.recording'), 'recording');
      updateControls();
      break;

    case 'paused':
      isPaused = true;
      updateStatus(i18n.t('status.paused'), 'paused');
      updateControls();
      break;

    case 'processing':
      updateStatus(i18n.t('status.processing'), 'processing');
      if (status.progress) {
        updateStatus(i18n.t('status.processingProgress', {
          progress: Math.round(status.progress)
        }), 'processing');
      }
      break;

    case 'completed':
      isRecording = false;
      isPaused = false;
      stopTimer();
      resetTimer();
      updateStatus(i18n.t('status.ready'));
      updateControls();
      selectedArea = null;

      // Show success notification
      if (status.outputPath) {
        alert(i18n.t('messages.recordingSaved', {
          path: status.outputPath
        }));
      }
      break;

    case 'error':
      isRecording = false;
      isPaused = false;
      stopTimer();
      resetTimer();
      updateStatus(i18n.t('status.error'), 'error');
      updateControls();
      selectedArea = null;

      // Show error message
      alert(i18n.t('messages.recordingError', {
        error: status.error || i18n.t('messages.unknownError')
      }));
      break;
  }
}

// Initialize the app
init();
