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

// Initialize
async function init() {
  // Load settings
  settings = await window.electronAPI.getSettings();
  applySettings();

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
    updateStatus(`Area selected: ${bounds.width}x${bounds.height}`);
  });
}

function applySettings() {
  resolutionSelect.value = settings.resolution || '1080p';
  audioToggle.checked = settings.audioEnabled || false;
  outputPath.value = settings.outputPath || '';
}

async function saveCurrentSettings() {
  settings.resolution = resolutionSelect.value;
  settings.audioEnabled = audioToggle.checked;
  settings.outputPath = outputPath.value;

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
    updateStatus('Recording', 'recording');
  }
});

pauseBtn.addEventListener('click', async () => {
  if (isPaused) {
    await window.electronAPI.resumeRecording();
    isPaused = false;
    recordingStartTime = Date.now() - elapsedTime;
    startTimer();
    updateStatus('Recording', 'recording');
  } else {
    await window.electronAPI.pauseRecording();
    isPaused = true;
    stopTimer();
    updateStatus('Paused', 'paused');
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
  updateStatus('Ready');
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

  if (isPaused) {
    pauseBtn.innerHTML = '<span class="icon">▶</span> Resume';
  } else {
    pauseBtn.innerHTML = '<span class="icon">⏸</span> Pause';
  }
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
      updateStatus('Recording', 'recording');
      updateControls();
      break;

    case 'paused':
      isPaused = true;
      updateStatus('Paused', 'paused');
      updateControls();
      break;

    case 'processing':
      updateStatus('Processing video...', 'processing');
      if (status.progress) {
        updateStatus(`Processing video... ${Math.round(status.progress)}%`, 'processing');
      }
      break;

    case 'completed':
      isRecording = false;
      isPaused = false;
      stopTimer();
      resetTimer();
      updateStatus('Ready');
      updateControls();
      selectedArea = null;

      // Show success notification
      if (status.outputPath) {
        alert(`Recording saved to:\n${status.outputPath}`);
      }
      break;

    case 'error':
      isRecording = false;
      isPaused = false;
      stopTimer();
      resetTimer();
      updateStatus('Error', 'error');
      updateControls();
      selectedArea = null;

      // Show error message
      alert(`Recording error: ${status.error || 'Unknown error'}`);
      break;
  }
}

// Initialize the app
init();