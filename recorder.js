const { BrowserWindow, desktopCapturer } = require('electron');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

class ScreenRecorder {
  constructor() {
    this.recordingWindow = null;
    this.isRecording = false;
    this.isPaused = false;
    this.settings = null;
    this.bounds = null;
    this.recordingData = null;
  }

  async initialize() {
    // Create hidden recording window
    this.recordingWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    await this.recordingWindow.loadFile('src/recording.html');

    // Set up IPC listeners
    this.setupListeners();
  }

  setupListeners() {
    const { ipcMain } = require('electron');

    ipcMain.on('recording-started', (event, data) => {
      this.isRecording = true;
      if (this.onStatusChange) {
        this.onStatusChange({ status: 'recording' });
      }
    });

    ipcMain.on('recording-paused', () => {
      this.isPaused = true;
      if (this.onStatusChange) {
        this.onStatusChange({ status: 'paused' });
      }
    });

    ipcMain.on('recording-resumed', () => {
      this.isPaused = false;
      if (this.onStatusChange) {
        this.onStatusChange({ status: 'recording' });
      }
    });

    ipcMain.on('recording-stopped', async (event, buffer) => {
      this.isRecording = false;
      this.isPaused = false;
      await this.processRecording(buffer);
    });

    ipcMain.on('recording-error', (event, data) => {
      console.error('Recording error:', data.error);
      this.cleanup();
      if (this.onStatusChange) {
        this.onStatusChange({ status: 'error', error: data.error });
      }
    });
  }

  async startRecording(bounds, settings) {
    if (this.isRecording) {
      throw new Error('Recording already in progress');
    }

    this.settings = settings;
    this.bounds = bounds;

    try {
      // Get available sources
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width: 1920, height: 1080 }
      });

      if (sources.length === 0) {
        throw new Error('No screen sources available');
      }

      // Use primary screen
      const primarySource = sources[0];

      // Send start command to recording window
      this.recordingWindow.webContents.send('start-capture', {
        sourceId: primarySource.id,
        bounds: bounds
      });

      return { success: true };
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  pauseRecording() {
    if (!this.isRecording || this.isPaused) {
      return { success: false };
    }

    this.recordingWindow.webContents.send('pause-capture');
    return { success: true };
  }

  resumeRecording() {
    if (!this.isRecording || !this.isPaused) {
      return { success: false };
    }

    this.recordingWindow.webContents.send('resume-capture');
    return { success: true };
  }

  stopRecording() {
    if (!this.isRecording) {
      return { success: false };
    }

    this.recordingWindow.webContents.send('stop-capture');
    return { success: true };
  }

  async processRecording(buffer) {
    try {
      const outputDir = this.settings.outputPath;
      const resolution = this.getResolution(this.settings.resolution);

      // Generate filenames
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' +
                       new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
      const tempPath = path.join(outputDir, `temp-${timestamp}.webm`);
      const outputPath = path.join(outputDir, `recording-${timestamp}.mp4`);

      // Save temporary WebM file
      fs.writeFileSync(tempPath, buffer);

      // Convert to MP4 with FFmpeg
      await this.convertToMP4(tempPath, outputPath, resolution);

      // Delete temporary file
      try {
        fs.unlinkSync(tempPath);
      } catch (err) {
        console.error('Error deleting temp file:', err);
      }

      if (this.onStatusChange) {
        this.onStatusChange({
          status: 'completed',
          outputPath: outputPath
        });
      }

      return outputPath;
    } catch (error) {
      console.error('Error processing recording:', error);
      if (this.onStatusChange) {
        this.onStatusChange({ status: 'error', error: error.message });
      }
      throw error;
    }
  }

  convertToMP4(inputPath, outputPath, resolution) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .size(`${resolution.width}x${resolution.height}`)
        .fps(30)
        .outputOptions([
          '-preset fast',
          '-crf 23',
          '-pix_fmt yuv420p',
          '-movflags +faststart'
        ])
        .on('start', (cmd) => {
          console.log('FFmpeg command:', cmd);
        })
        .on('progress', (progress) => {
          if (this.onStatusChange) {
            this.onStatusChange({
              status: 'processing',
              progress: progress.percent
            });
          }
        })
        .on('end', () => {
          console.log('Conversion completed');
          resolve();
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(err);
        })
        .save(outputPath);
    });
  }

  getResolution(resolutionSetting) {
    const resolutions = {
      '720p': { width: 1280, height: 720 },
      '1080p': { width: 1920, height: 1080 }
    };

    return resolutions[resolutionSetting] || resolutions['1080p'];
  }

  cleanup() {
    this.isRecording = false;
    this.isPaused = false;
    this.bounds = null;
  }

  destroy() {
    if (this.recordingWindow) {
      this.recordingWindow.close();
      this.recordingWindow = null;
    }
  }

  getStatus() {
    return {
      isRecording: this.isRecording,
      isPaused: this.isPaused
    };
  }
}

module.exports = ScreenRecorder;