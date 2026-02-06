# 快速入门指南

## 安装

### Windows
1. 双击运行 `setup.bat`
2. 等待依赖安装完成
3. 运行 `npm start`

### macOS/Linux
1. 运行 `./setup.sh`（或 `bash setup.sh`）
2. 等待依赖安装完成
3. 运行 `npm start`

### 手动安装
```bash
npm install
npm start
```

## 首次设置

1. 应用启动后，进入设置部分
2. 点击"浏览"设置输出目录
3. 选择首选分辨率（720p 或 1080p）
4. 音频录制开关可用（尚未实现功能）

## 录制第一个视频

1. 点击 **"选择区域"** 按钮
2. 将出现全屏覆盖层
3. 点击并拖动以选择要录制的区域
   - 最小尺寸：100x100 像素
   - 坐标和尺寸显示在顶部
4. 按 **Enter** 确认（或按 **ESC** 取消）
5. 主窗口将显示所选区域大小
6. 点击 **"开始"** 按钮开始录制
7. 计时器将启动，状态显示"录制中"
8. 点击 **"暂停"** 临时暂停（再次点击恢复）
9. 完成后点击 **"停止"**
10. 等待视频处理（WebM → MP4 转换）
11. 通知将显示保存的文件位置

## 键盘快捷键

### 在选择器窗口中
- **Enter**: 确认选择并返回主窗口
- **ESC**: 取消选择并关闭选择器

## 提示

- 选择较小的区域以获得更好的性能
- 使用 720p 获得较小的文件大小
- 使用 1080p 获得更高的质量
- 首次录制可能需要更长时间，因为需要初始化
- 视频以时间戳命名保存：`recording-YYYY-MM-DD_HH-MM-SS.mp4`

## 故障排除

### "录制启动失败"
- 检查屏幕录制权限（macOS：系统偏好设置 → 安全性与隐私 → 屏幕录制）
- 确保输出目录存在且可写

### "选区太小"
- 确保选区至少为 100x100 像素
- 拖动时会实时显示尺寸

### 视频质量问题
- 尝试在 720p 和 1080p 之间切换
- 确保录制区域不大于屏幕分辨率

### 应用无法启动
- 重新运行 `npm install`
- 检查 Node.js 版本是否为 16 或更高：`node --version`
- 检查控制台错误消息

## 构建分发版本

### Windows
```bash
npm run build:win
```
输出：`dist/Screen Recorder Setup.exe`

### macOS
```bash
npm run build:mac
```
输出：`dist/Screen Recorder.dmg`

### 所有平台
```bash
npm run build
```

## 系统要求

- **Node.js**: 16.x 或更高版本
- **npm**: 8.x 或更高版本
- **操作系统**: Windows 10+、macOS 10.13+ 或 Linux
- **内存**: 最低 4GB，推荐 8GB
- **磁盘空间**: 应用程序 500MB + 录制文件空间

## 默认设置

- **分辨率**: 1080p (1920x1080)
- **帧率**: 30 fps
- **视频编码**: H.264
- **质量**: CRF 23（高质量）
- **输出目录**: 系统视频文件夹
- **音频**: 禁用（尚未实现）

## 文件位置

### 设置文件
- **Windows**: `%APPDATA%/screen-recorder/settings.json`
- **macOS**: `~/Library/Application Support/screen-recorder/settings.json`
- **Linux**: `~/.config/screen-recorder/settings.json`

### 默认输出
- **Windows**: `C:\\Users\\[用户名]\\Videos`
- **macOS**: `~/Movies`
- **Linux**: `~/Videos`

## 支持

如有问题或疑问：
1. 查看 README.md 获取详细文档
2. 查看 IMPLEMENTATION.md 获取技术细节
3. 查看控制台日志获取错误消息
4. 确保所有依赖项已正确安装
