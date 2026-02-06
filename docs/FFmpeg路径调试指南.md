# FFmpeg 路径调试指南

## 当前问题

**错误信息**:
```
spawn C:\Users\WIN10\AppData\Local\Programs\ScreenRecorder\resources\app.asar\node_modules\ffmpeg-static\ffmpeg.exe ENOENT
```

**问题**: 路径指向了 `app.asar` 内部，这是一个打包的归档文件，不能直接访问其中的可执行文件。

## 最新修复

### 代码改进

1. **完全不使用 ffmpeg-static 在打包环境**
2. **尝试多个可能的路径**
3. **添加详细的调试日志**

### 路径搜索顺序

```javascript
const possiblePaths = [
  // 1. extraResources 配置的路径
  'C:\Users\WIN10\AppData\Local\Programs\ScreenRecorder\resources\ffmpeg\ffmpeg.exe',

  // 2. app.asar.unpacked 路径
  'C:\Users\WIN10\AppData\Local\Programs\ScreenRecorder\resources\app.asar.unpacked\node_modules\ffmpeg-static\ffmpeg.exe',

  // 3. 直接在 resources 下
  'C:\Users\WIN10\AppData\Local\Programs\ScreenRecorder\resources\ffmpeg.exe'
];
```

## 调试步骤

### 1. 查看控制台日志

重新打包并运行应用，查看控制台输出：

```
Searching for FFmpeg in packaged app...
Resources path: C:\Users\WIN10\AppData\Local\Programs\ScreenRecorder\resources
Trying path: C:\Users\WIN10\AppData\Local\Programs\ScreenRecorder\resources\ffmpeg\ffmpeg.exe
Trying path: C:\Users\WIN10\AppData\Local\Programs\ScreenRecorder\resources\app.asar.unpacked\node_modules\ffmpeg-static\ffmpeg.exe
Found FFmpeg at: [实际路径]
Final FFmpeg path: [实际路径]
FFmpeg exists: true
```

### 2. 手动检查文件

打开文件资源管理器，检查以下位置：

**位置1**: `extraResources` 配置的位置
```
C:\Users\WIN10\AppData\Local\Programs\ScreenRecorder\resources\ffmpeg\
```

**位置2**: `asarUnpack` 配置的位置
```
C:\Users\WIN10\AppData\Local\Programs\ScreenRecorder\resources\app.asar.unpacked\node_modules\ffmpeg-static\
```

### 3. 检查文件大小

FFmpeg 可执行文件应该约 60-80 MB：

```bash
dir "C:\Users\WIN10\AppData\Local\Programs\ScreenRecorder\resources\ffmpeg\ffmpeg.exe"
```

## 可能的问题

### 问题1: FFmpeg 没有被复制

**症状**: 所有路径都不存在 FFmpeg

**原因**: `extraResources` 配置没有生效

**解决**:
1. 检查 `package.json` 中的 `extraResources` 配置
2. 确保 `node_modules/ffmpeg-static` 存在
3. 重新安装依赖：`npm install`
4. 重新打包：`npm run build:win`

### 问题2: FFmpeg 在错误的位置

**症状**: FFmpeg 存在但路径不匹配

**原因**: electron-builder 的版本或配置问题

**解决**:
1. 手动查找 FFmpeg 位置
2. 更新代码中的路径搜索列表
3. 或者手动复制 FFmpeg 到正确位置

### 问题3: 权限问题

**症状**: 文件存在但无法执行

**原因**: Windows 权限或防病毒软件阻止

**解决**:
1. 以管理员身份运行应用
2. 添加防病毒软件例外
3. 检查文件属性，取消"阻止"

## 临时解决方案

### 方案1: 手动复制 FFmpeg

1. 从开发环境复制 FFmpeg：
   ```
   node_modules\ffmpeg-static\ffmpeg.exe
   ```

2. 粘贴到安装目录：
   ```
   C:\Users\WIN10\AppData\Local\Programs\ScreenRecorder\resources\ffmpeg\ffmpeg.exe
   ```

3. 重新运行应用

### 方案2: 使用系统 FFmpeg

1. 下载 FFmpeg: https://ffmpeg.org/download.html
2. 解压到固定位置，如 `C:\ffmpeg\bin\ffmpeg.exe`
3. 修改代码使用固定路径：

```javascript
if (app.isPackaged) {
  ffmpegPath = 'C:\\ffmpeg\\bin\\ffmpeg.exe';
}
```

## 验证 FFmpeg

### 命令行测试

```bash
# 进入应用目录
cd "C:\Users\WIN10\AppData\Local\Programs\ScreenRecorder\resources\ffmpeg"

# 测试 FFmpeg
ffmpeg.exe -version
```

**预期输出**:
```
ffmpeg version ...
configuration: ...
libavutil      ...
```

### 代码测试

在 `recorder.js` 中添加测试代码：

```javascript
// 测试 FFmpeg
const { execSync } = require('child_process');
try {
  const version = execSync(`"${ffmpegPath}" -version`).toString();
  console.log('FFmpeg version:', version.split('\n')[0]);
} catch (error) {
  console.error('FFmpeg test failed:', error.message);
}
```

## 重新打包

修改代码后，需要重新打包：

```bash
# 1. 清理旧的构建
rm -rf dist

# 2. 重新打包
npm run build:win

# 3. 安装新的安装包
# 找到 dist 目录下的安装包并安装

# 4. 运行并查看日志
# 启动应用，查看控制台输出
```

## 查看日志

### Windows 控制台

应用启动时会输出日志到控制台。如果看不到控制台：

1. 修改 `main.js`，添加：
   ```javascript
   mainWindow.webContents.openDevTools();
   ```

2. 或者在应用中按 `Ctrl+Shift+I` 打开开发者工具

### 日志文件

可以将日志写入文件：

```javascript
const logFile = path.join(app.getPath('userData'), 'ffmpeg-debug.log');
const log = (msg) => {
  console.log(msg);
  fs.appendFileSync(logFile, msg + '\n');
};

log('FFmpeg path: ' + ffmpegPath);
log('FFmpeg exists: ' + fs.existsSync(ffmpegPath));
```

日志位置：
```
C:\Users\WIN10\AppData\Roaming\screen-recorder\ffmpeg-debug.log
```

## 预期结果

成功后，应该看到：

```
Searching for FFmpeg in packaged app...
Resources path: C:\Users\WIN10\AppData\Local\Programs\ScreenRecorder\resources
Trying path: C:\Users\WIN10\AppData\Local\Programs\ScreenRecorder\resources\ffmpeg\ffmpeg.exe
Found FFmpeg at: C:\Users\WIN10\AppData\Local\Programs\ScreenRecorder\resources\ffmpeg\ffmpeg.exe
Final FFmpeg path: C:\Users\WIN10\AppData\Local\Programs\ScreenRecorder\resources\ffmpeg\ffmpeg.exe
FFmpeg exists: true
```

录制功能应该正常工作。

## 联系支持

如果问题仍然存在，请提供：

1. 完整的错误信息
2. 控制台日志输出
3. FFmpeg 文件位置截图
4. `package.json` 配置
5. electron-builder 版本

---

**更新日期**: 2026-02-06
**版本**: 2.0
**状态**: 待测试
