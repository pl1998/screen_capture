const { BrowserWindow, desktopCapturer, app } = require('electron');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

// Set FFmpeg path
// 在打包后的应用中，需要使用正确的资源路径
let ffmpegPath;

// 检查是否是打包后的应用
if (app.isPackaged) {
  // 打包后，不使用 ffmpeg-static 模块
  const platform = process.platform;
  const ffmpegName = platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';

  // 尝试多个可能的路径
  const possiblePaths = [
    // 方案1: extraResources 配置的路径
    path.join(process.resourcesPath, 'ffmpeg', ffmpegName),
    // 方案2: app.asar.unpacked 路径
    path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', 'ffmpeg-static', ffmpegName),
    // 方案3: 直接在 resources 下
    path.join(process.resourcesPath, ffmpegName)
  ];

  console.log('Searching for FFmpeg in packaged app...');
  console.log('Resources path:', process.resourcesPath);

  for (const testPath of possiblePaths) {
    console.log('Trying path:', testPath);
    if (fs.existsSync(testPath)) {
      ffmpegPath = testPath;
      console.log('Found FFmpeg at:', ffmpegPath);
      break;
    }
  }

  if (!ffmpegPath) {
    console.error('FFmpeg not found in any expected location!');
    console.error('Tried paths:', possiblePaths);
    // 使用第一个路径作为回退（即使不存在，也能显示预期路径）
    ffmpegPath = possiblePaths[0];
  }
} else {
  // 开发环境，使用 ffmpeg-static
  const ffmpegStatic = require('ffmpeg-static');
  ffmpegPath = ffmpegStatic;
  console.log('Development mode, using ffmpeg-static:', ffmpegPath);
}

console.log('Final FFmpeg path:', ffmpegPath);
console.log('FFmpeg exists:', fs.existsSync(ffmpegPath));
ffmpeg.setFfmpegPath(ffmpegPath);

class ScreenRecorder {
  constructor() {
    this.recordingWindow = null;
    this.isRecording = false;
    this.isPaused = false;
    this.settings = null;
    this.bounds = null;
    this.recordingData = null;
    this.ffmpegCommand = null; // 存储 FFmpeg 命令引用以便清理
    this.ipcListeners = []; // 存储 IPC 监听器以便清理
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

    // 存储监听器引用以便清理
    const recordingStartedHandler = (event, data) => {
      this.isRecording = true;
      if (this.onStatusChange) {
        this.onStatusChange({ status: 'recording' });
      }
    };

    const recordingPausedHandler = () => {
      this.isPaused = true;
      if (this.onStatusChange) {
        this.onStatusChange({ status: 'paused' });
      }
    };

    const recordingResumedHandler = () => {
      this.isPaused = false;
      if (this.onStatusChange) {
        this.onStatusChange({ status: 'recording' });
      }
    };

    const recordingStoppedHandler = async (event, buffer) => {
      this.isRecording = false;
      this.isPaused = false;
      await this.processRecording(buffer);
    };

    const recordingErrorHandler = (event, data) => {
      console.error('Recording error:', data.error);
      this.cleanup();
      if (this.onStatusChange) {
        this.onStatusChange({ status: 'error', error: data.error });
      }
    };

    // 注册监听器
    ipcMain.on('recording-started', recordingStartedHandler);
    ipcMain.on('recording-paused', recordingPausedHandler);
    ipcMain.on('recording-resumed', recordingResumedHandler);
    ipcMain.on('recording-stopped', recordingStoppedHandler);
    ipcMain.on('recording-error', recordingErrorHandler);

    // 保存监听器引用以便清理
    this.ipcListeners = [
      { event: 'recording-started', handler: recordingStartedHandler },
      { event: 'recording-paused', handler: recordingPausedHandler },
      { event: 'recording-resumed', handler: recordingResumedHandler },
      { event: 'recording-stopped', handler: recordingStoppedHandler },
      { event: 'recording-error', handler: recordingErrorHandler }
    ];
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

      // Convert to MP4 with FFmpeg (with cropping)
      await this.convertToMP4(tempPath, outputPath, resolution, this.bounds);

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

  convertToMP4(inputPath, outputPath, resolution, bounds) {
    return new Promise((resolve, reject) => {
      this.ffmpegCommand = ffmpeg(inputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .fps(30)
        .outputOptions([
          '-preset fast',
          '-crf 23',
          '-pix_fmt yuv420p',
          '-movflags +faststart'
        ]);

      // 如果有选中区域，使用 crop 滤镜裁剪视频
      if (bounds) {
        // FFmpeg crop 滤镜: crop=width:height:x:y
        const cropFilter = `crop=${bounds.width}:${bounds.height}:${bounds.x}:${bounds.y}`;

        // 裁剪后再缩放到目标分辨率
        const scaleFilter = `scale=${resolution.width}:${resolution.height}`;

        // 组合滤镜
        this.ffmpegCommand.videoFilters([cropFilter, scaleFilter]);
      } else {
        // 如果没有选中区域，只缩放
        this.ffmpegCommand.size(`${resolution.width}x${resolution.height}`);
      }

      this.ffmpegCommand
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
          this.ffmpegCommand = null; // 清除引用
          resolve();
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          this.ffmpegCommand = null; // 清除引用
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

    // 终止正在运行的 FFmpeg 进程
    if (this.ffmpegCommand) {
      try {
        this.ffmpegCommand.kill('SIGKILL');
        console.log('FFmpeg process killed');
      } catch (err) {
        console.error('Error killing FFmpeg process:', err);
      }
      this.ffmpegCommand = null;
    }
  }

  destroy() {
    console.log('Destroying ScreenRecorder...');

    // 停止正在进行的录制
    if (this.isRecording) {
      this.stopRecording();
    }

    // 清理资源
    this.cleanup();

    // 移除所有 IPC 监听器
    if (this.ipcListeners && this.ipcListeners.length > 0) {
      const { ipcMain } = require('electron');
      this.ipcListeners.forEach(({ event, handler }) => {
        ipcMain.removeListener(event, handler);
      });
      this.ipcListeners = [];
      console.log('IPC listeners removed');
    }

    // 关闭录制窗口
    if (this.recordingWindow && !this.recordingWindow.isDestroyed()) {
      // 通知录制窗口停止所有流
      try {
        this.recordingWindow.webContents.send('cleanup-streams');
      } catch (err) {
        console.error('Error sending cleanup signal:', err);
      }

      this.recordingWindow.close();
      this.recordingWindow = null;
      console.log('Recording window closed');
    }

    console.log('ScreenRecorder destroyed');
  }

  getStatus() {
    return {
      isRecording: this.isRecording,
      isPaused: this.isPaused
    };
  }
}

module.exports = ScreenRecorder;