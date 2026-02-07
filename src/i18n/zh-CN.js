// 中文语言包
const zhCN = {
  // 应用标题
  appTitle: '屏幕录制工具',

  // 状态
  status: {
    ready: '就绪',
    recording: '录制中',
    paused: '已暂停',
    processing: '处理视频中...',
    processingProgress: '处理视频中... {progress}%',
    error: '错误',
    areaSelected: '已选择区域: {width}x{height}'
  },

  // 按钮
  buttons: {
    selectArea: '选择',
    start: '开始',
    pause: '暂停',
    resume: '恢复',
    stop: '停止',
    browse: '浏览'
  },

  // 设置
  settings: {
    title: '设置',
    resolution: '分辨率',
    audioRecording: '音频录制',
    audioNone: '关闭',
    audioMicrophone: '麦克风',
    audioSystem: '系统声音',
    audioBoth: '麦克风 + 系统声音',
    outputDirectory: '输出目录',
    language: '语言'
  },

  // 语言选项
  languages: {
    'zh-CN': '简体中文',
    'en-US': 'English'
  },

  // 选择器
  selector: {
    title: '选择区域',
    hint: '拖动选择区域 • ESC 取消 • Enter 确认',
    coordinates: 'X: {x}, Y: {y}',
    dimensions: 'W: {width}, H: {height}',
    tooSmall: '选区太小。最小尺寸为 {minWidth}x{minHeight} 像素。'
  },

  // 消息
  messages: {
    recordingSaved: '录制已保存到:\n{path}',
    recordingError: '录制错误: {error}',
    unknownError: '未知错误'
  },

  // 菜单
  menu: {
    file: '文件',
    selectArea: '选择区域',
    openOutputFolder: '打开输出文件夹',
    view: '视图',
    compactMode: '简化模式',
    language: '语言',
    window: '窗口',
    minimize: '最小化',
    close: '关闭'
  }
};

// 导出语言包
if (typeof module !== 'undefined' && module.exports) {
  module.exports = zhCN;
}
