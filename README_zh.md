# 屏幕录制工具

一个使用 Electron 和 FFmpeg 的跨平台高质量屏幕区域录制桌面应用程序。

## 功能特性

- 🎯 鼠标拖拽选择任意屏幕区域
- 🎥 支持 720p 或 1080p 质量录制
- 🎵 可选音频录制
- 🌓 深色/浅色主题（跟随系统）
- ⚙️ 可自定义输出目录
- 🎨 Fluent 2 设计风格

## 技术规格

- **框架**: Electron
- **视频编码**: H.264
- **帧率**: 30 fps
- **输出格式**: MP4
- **最小选区**: 100x100 像素

## 安装

1. 安装依赖：
```bash
npm install
```

2. 运行应用程序：
```bash
npm start
```

## 构建

### 快速设置
根据你的平台运行设置脚本：
- **Windows**: `setup.bat`
- **macOS/Linux**: `./setup.sh`

或手动安装：
```bash
npm install
```

### 开发模式
```bash
npm start
```

### 生产构建

#### Windows
```bash
npm run build:win
```
输出: `dist/Screen Recorder-1.0.0-x64.exe` (NSIS 安装程序)

#### macOS
```bash
npm run build:mac
```
输出: `dist/Screen Recorder-1.0.0-x64.dmg` (DMG 安装程序)

#### Linux
```bash
npm run build:linux
```
输出: `dist/Screen Recorder-1.0.0-x86_64.AppImage`

#### 所有平台
```bash
npm run build
```

### 图标
构建前，需要将应用程序图标添加到 `assets/` 目录：
- `icon.ico` (Windows)
- `icon.icns` (macOS)
- `icon.png` (Linux)

使用图标生成脚本：
- **Windows**: `generate-icons.bat`
- **macOS/Linux**: `./generate-icons.sh`

详细说明请参阅 `assets/README.md`。

完整的构建文档请参阅 [BUILD.md](BUILD.md)。

## 使用方法

1. 点击"选择区域"按钮选择要录制的屏幕区域
2. 拖动鼠标选择所需区域（最小 100x100 像素）
3. 按 Enter 确认或 ESC 取消
4. 点击"开始"按钮开始录制
5. 使用"暂停"按钮临时暂停录制
6. 点击"停止"按钮完成并保存视频

## 设置

- **分辨率**: 在 720p 和 1080p 输出之间选择
- **音频录制**: 开启/关闭音频捕获
- **输出目录**: 设置视频保存位置

## 项目结构

```
screen_capture/
├── main.js              # 主进程
├── preload.js           # IPC 预加载脚本
├── package.json         # 项目配置
├── src/
│   ├── index.html       # 主窗口 UI
│   ├── styles.css       # 主窗口样式
│   ├── renderer.js      # 主窗口逻辑
│   └── selector/
│       ├── selector.html    # 区域选择器 UI
│       ├── selector.css     # 区域选择器样式
│       └── selector.js      # 区域选择器逻辑
└── README.md
```

## 开发状态

- [x] 项目结构搭建
- [x] Fluent 2 设计的主界面
- [x] 区域选择界面
- [x] 设置管理
- [x] FFmpeg 集成
- [x] 录制功能（WebM 捕获 + MP4 转换）
- [x] 暂停/恢复支持
- [x] 打包配置
- [ ] 音频录制支持
- [ ] 应用程序图标

## 文档

- [QUICKSTART.md](QUICKSTART.md) - 用户快速入门指南
- [BUILD.md](BUILD.md) - 详细的构建和分发指南
- [IMPLEMENTATION.md](IMPLEMENTATION.md) - 技术实现细节
- [CHANGELOG.md](CHANGELOG.md) - 版本历史和更改
- [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) - 发布准备清单
- [assets/README.md](assets/README.md) - 图标创建指南

## 已知限制

- 音频录制尚未实现（UI 切换按钮存在但不起作用）
- 录制时捕获整个屏幕，然后在编码过程中裁剪到选定区域
- 首次录制可能需要更长时间，因为需要初始化 FFmpeg

## 故障排除

**录制无法启动：**
- 确保已授予屏幕录制权限（macOS）
- 检查输出目录是否存在且可写

**FFmpeg 错误：**
- 应用程序通过 ffmpeg-static 自动捆绑 FFmpeg
- 查看控制台日志以获取详细错误信息

**视频质量问题：**
- 尝试调整分辨率设置（720p vs 1080p）
- CRF 值设置为 23（良好质量）。较低的值 = 更高的质量但文件更大。

## 许可证

MIT
