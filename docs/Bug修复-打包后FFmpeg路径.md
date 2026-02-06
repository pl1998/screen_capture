# Bug修复：打包后FFmpeg路径错误

## 问题描述

**错误信息**:
```
录制错误: spawn D:\git\3d66\screen_capture\node_modules\ffmpeg-static\ffmpeg.exeENOENT
```

**原因**: 打包后的应用中，FFmpeg 的路径与开发环境不同，导致找不到 FFmpeg 可执行文件。

## 问题分析

### 开发环境 vs 打包环境

| 环境 | FFmpeg 路径 |
|------|------------|
| 开发环境 | `node_modules/ffmpeg-static/ffmpeg.exe` |
| 打包环境 | `resources/ffmpeg/ffmpeg.exe` 或 `app.asar.unpacked/node_modules/ffmpeg-static/ffmpeg.exe` |

### 路径差异原因

1. **ASAR 打包**: Electron 将应用打包成 ASAR 文件
2. **资源提取**: `extraResources` 配置将 FFmpeg 提取到 `resources` 目录
3. **动态路径**: `ffmpeg-static` 模块返回的是开发环境的路径

## 解决方案

### 1. 检测打包状态

使用 `app.isPackaged` 判断是否是打包后的应用：

```javascript
if (app.isPackaged) {
  // 打包后的路径处理
} else {
  // 开发环境的路径
}
```

### 2. 构建正确路径

```javascript
let ffmpegPath = ffmpegStatic;

if (app.isPackaged) {
  const platform = process.platform;
  const ffmpegName = platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
  ffmpegPath = path.join(process.resourcesPath, 'ffmpeg', ffmpegName);

  // 如果文件不存在，尝试其他可能的路径
  if (!fs.existsSync(ffmpegPath)) {
    ffmpegPath = path.join(
      process.resourcesPath,
      'app.asar.unpacked',
      'node_modules',
      'ffmpeg-static',
      ffmpegName
    );
  }
}
```

### 3. 设置 FFmpeg 路径

```javascript
console.log('FFmpeg path:', ffmpegPath);
ffmpeg.setFfmpegPath(ffmpegPath);
```

## 关键路径

### Windows

**开发环境**:
```
D:\git\3d66\screen_capture\node_modules\ffmpeg-static\ffmpeg.exe
```

**打包后 (方案1 - extraResources)**:
```
C:\Program Files\Screen Recorder\resources\ffmpeg\ffmpeg.exe
```

**打包后 (方案2 - asarUnpack)**:
```
C:\Program Files\Screen Recorder\resources\app.asar.unpacked\node_modules\ffmpeg-static\ffmpeg.exe
```

### macOS

**开发环境**:
```
/path/to/project/node_modules/ffmpeg-static/ffmpeg
```

**打包后**:
```
/Applications/Screen Recorder.app/Contents/Resources/ffmpeg/ffmpeg
```

### Linux

**开发环境**:
```
/path/to/project/node_modules/ffmpeg-static/ffmpeg
```

**打包后**:
```
/opt/Screen Recorder/resources/ffmpeg/ffmpeg
```

## Electron 路径 API

### process.resourcesPath

**用途**: 获取应用资源目录

**开发环境**:
```javascript
// 返回项目根目录
/path/to/project
```

**打包环境**:
```javascript
// Windows
C:\Program Files\Screen Recorder\resources

// macOS
/Applications/Screen Recorder.app/Contents/Resources

// Linux
/opt/Screen Recorder/resources
```

### app.isPackaged

**用途**: 判断是否是打包后的应用

```javascript
if (app.isPackaged) {
  console.log('Running in production');
} else {
  console.log('Running in development');
}
```

### app.getAppPath()

**用途**: 获取应用路径

**开发环境**: 返回项目根目录
**打包环境**: 返回 `app.asar` 路径

## package.json 配置

### extraResources

```json
"extraResources": [
  {
    "from": "node_modules/ffmpeg-static",
    "to": "ffmpeg",
    "filter": ["**/*"]
  }
]
```

**作用**: 将 FFmpeg 复制到 `resources/ffmpeg` 目录

### asarUnpack

```json
"asarUnpack": [
  "node_modules/ffmpeg-static/**/*"
]
```

**作用**: 将 FFmpeg 从 ASAR 包中解包到 `app.asar.unpacked` 目录

### 两种方案对比

| 方案 | 优点 | 缺点 |
|------|------|------|
| extraResources | 路径简洁，易于访问 | 需要额外配置 |
| asarUnpack | 保持原有结构 | 路径较长 |

## 调试方法

### 1. 添加日志

```javascript
console.log('FFmpeg path:', ffmpegPath);
console.log('File exists:', fs.existsSync(ffmpegPath));
console.log('Resources path:', process.resourcesPath);
console.log('Is packaged:', app.isPackaged);
```

### 2. 检查文件

**Windows**:
```bash
dir "C:\Program Files\Screen Recorder\resources\ffmpeg"
```

**macOS**:
```bash
ls "/Applications/Screen Recorder.app/Contents/Resources/ffmpeg"
```

**Linux**:
```bash
ls "/opt/Screen Recorder/resources/ffmpeg"
```

### 3. 测试权限

确保 FFmpeg 可执行文件有执行权限：

**macOS/Linux**:
```bash
chmod +x ffmpeg
```

## 测试步骤

### 1. 开发环境测试

```bash
npm start
```

验证：
- ✅ 录制功能正常
- ✅ FFmpeg 路径正确
- ✅ 视频转换成功

### 2. 打包测试

```bash
npm run build:win
```

验证：
- ✅ 构建成功
- ✅ 安装程序正常
- ✅ 应用启动正常

### 3. 录制测试

在打包后的应用中：
- ✅ 选择录制区域
- ✅ 开始录制
- ✅ 停止录制
- ✅ 视频转换成功
- ✅ 文件保存正确

## 常见问题

### Q1: 仍然找不到 FFmpeg

**检查**:
1. 确认 `extraResources` 配置正确
2. 检查 FFmpeg 文件是否被复制
3. 验证文件路径是否正确

**解决**:
```javascript
// 添加更多路径尝试
const possiblePaths = [
  path.join(process.resourcesPath, 'ffmpeg', ffmpegName),
  path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', 'ffmpeg-static', ffmpegName),
  path.join(__dirname, 'node_modules', 'ffmpeg-static', ffmpegName)
];

for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    ffmpegPath = p;
    break;
  }
}
```

### Q2: 权限错误

**Windows**: 以管理员身份运行
**macOS**: 授予应用权限
**Linux**: 检查文件权限

### Q3: 路径包含空格

确保路径被正确引用：

```javascript
// 使用引号包裹路径
const quotedPath = `"${ffmpegPath}"`;
```

## 文件变更

### 修改的文件

1. **recorder.js**
   - 添加 `app` 导入
   - 添加打包环境检测
   - 添加路径构建逻辑
   - 添加路径验证
   - 添加日志输出

### 代码行数

- 修改行数: ~8 行
- 新增行数: ~20 行
- 删除行数: ~2 行

## 相关配置

### package.json

确保以下配置正确：

```json
{
  "build": {
    "extraResources": [
      {
        "from": "node_modules/ffmpeg-static",
        "to": "ffmpeg",
        "filter": ["**/*"]
      }
    ],
    "asar": true,
    "asarUnpack": [
      "node_modules/ffmpeg-static/**/*"
    ]
  }
}
```

## 总结

### 修复内容

- ✅ 添加打包环境检测
- ✅ 构建正确的 FFmpeg 路径
- ✅ 添加路径验证和回退
- ✅ 添加调试日志

### 影响范围

- 打包后的应用
- FFmpeg 路径解析
- 视频转换功能

### 测试状态

- ✅ 开发环境测试通过
- ⏳ 打包环境待测试

---

**修复日期**: 2026-02-06
**Bug ID**: #002
**严重程度**: 高
**状态**: 已修复，待测试
