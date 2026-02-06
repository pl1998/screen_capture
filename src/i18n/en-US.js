// English language pack
const enUS = {
  // Application title
  appTitle: 'Screen Recorder',

  // Status
  status: {
    ready: 'Ready',
    recording: 'Recording',
    paused: 'Paused',
    processing: 'Processing video...',
    processingProgress: 'Processing video... {progress}%',
    error: 'Error',
    areaSelected: 'Area selected: {width}x{height}'
  },

  // Buttons
  buttons: {
    selectArea: 'Select Area',
    start: 'Start',
    pause: 'Pause',
    resume: 'Resume',
    stop: 'Stop',
    browse: 'Browse'
  },

  // Settings
  settings: {
    title: 'Settings',
    resolution: 'Resolution',
    audioRecording: 'Audio Recording',
    audioNone: 'Off',
    audioMicrophone: 'Microphone',
    audioSystem: 'System Audio',
    audioBoth: 'Microphone + System Audio',
    outputDirectory: 'Output Directory',
    language: 'Language'
  },

  // Language options
  languages: {
    'zh-CN': '简体中文',
    'en-US': 'English'
  },

  // Selector
  selector: {
    title: 'Select Area',
    hint: 'Drag to select area • ESC to cancel • Enter to confirm',
    coordinates: 'X: {x}, Y: {y}',
    dimensions: 'W: {width}, H: {height}',
    tooSmall: 'Selection too small. Minimum size is {minWidth}x{minHeight} pixels.'
  },

  // Messages
  messages: {
    recordingSaved: 'Recording saved to:\n{path}',
    recordingError: 'Recording error: {error}',
    unknownError: 'Unknown error'
  }
};

// Export language pack
if (typeof module !== 'undefined' && module.exports) {
  module.exports = enUS;
}
