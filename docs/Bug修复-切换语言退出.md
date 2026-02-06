# Bug修复：切换语言时应用退出

## 问题描述

**症状**: 在菜单栏切换语言时，应用自动退出/崩溃。

**影响**: 用户无法正常切换语言，严重影响使用体验。

## 问题分析

### 可能的原因

1. **菜单设置为 null**: `Menu.setApplicationMenu(null)` 可能导致应用状态异常
2. **窗口已销毁**: 向已销毁的窗口发送消息导致崩溃
3. **菜单重建错误**: 在菜单重建过程中出现错误

### 代码问题

**之前的代码**:
```javascript
function changeLanguage(language) {
  currentLanguage = language;
  const settings = loadSettings();
  settings.language = language;
  saveSettings(settings);

  // 问题1: 先设置为 null 可能导致问题
  Menu.setApplicationMenu(null);
  createMenu();

  // 问题2: 没有检查窗口是否已销毁
  if (mainWindow) {
    mainWindow.webContents.send('language-changed', language);
  }
}
```

## 解决方案

### 1. 移除 Menu.setApplicationMenu(null)

**原因**:
- `Menu.buildFromTemplate()` 和 `Menu.setApplicationMenu()` 会自动替换现有菜单
- 不需要先设置为 null
- 设置为 null 可能导致应用状态不一致

**修改**:
```javascript
// 之前
Menu.setApplicationMenu(null);
createMenu();

// 现在
createMenu();  // 直接重建，自动替换
```

### 2. 检查窗口状态

**原因**:
- 窗口可能已经被销毁
- 向已销毁的窗口发送消息会导致错误

**修改**:
```javascript
// 之前
if (mainWindow) {
  mainWindow.webContents.send('language-changed', language);
}

// 现在
if (mainWindow && !mainWindow.isDestroyed()) {
  mainWindow.webContents.send('language-changed', language);
}
```

## 完整修复代码

```javascript
// 切换语言
function changeLanguage(language) {
  currentLanguage = language;

  // 保存语言设置
  const settings = loadSettings();
  settings.language = language;
  saveSettings(settings);

  // 重新创建菜单（不需要先设置为 null）
  createMenu();

  // 通知渲染进程更新语言（检查窗口状态）
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('language-changed', language);
  }
}

// 切换简化模式
function toggleCompactMode() {
  isCompactMode = !isCompactMode;

  // 重新创建菜单以更新复选框状态
  createMenu();

  // 调整窗口大小
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (isCompactMode) {
      mainWindow.setSize(120, 600);
    } else {
      mainWindow.setSize(420, 600);
    }

    // 通知渲染进程切换模式
    mainWindow.webContents.send('compact-mode-changed', isCompactMode);
  }
}
```

## Electron Menu API 说明

### Menu.setApplicationMenu(menu)

**功能**: 设置应用程序菜单

**参数**:
- `menu`: Menu 对象或 null

**行为**:
- 传入 Menu 对象：设置新菜单（自动替换旧菜单）
- 传入 null：移除菜单（可能导致问题）

**最佳实践**:
```javascript
// 推荐：直接设置新菜单
const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

// 不推荐：先设置为 null
Menu.setApplicationMenu(null);
Menu.setApplicationMenu(menu);
```

### BrowserWindow.isDestroyed()

**功能**: 检查窗口是否已被销毁

**返回**: boolean

**用途**: 在操作窗口前检查状态

**示例**:
```javascript
if (mainWindow && !mainWindow.isDestroyed()) {
  // 安全地操作窗口
  mainWindow.webContents.send('message', data);
}
```

## 测试验证

### 测试步骤

1. **启动应用**
   - 运行 `npm start`
   - 应用正常启动

2. **切换语言**
   - 点击菜单：语言 → English
   - 验证：应用不退出
   - 验证：界面语言切换为英文

3. **再次切换**
   - 点击菜单：Language → 简体中文
   - 验证：应用不退出
   - 验证：界面语言切换为中文

4. **多次切换**
   - 快速切换语言多次
   - 验证：应用稳定运行
   - 验证：语言正确切换

### 预期结果

- ✅ 应用不退出
- ✅ 菜单语言正确更新
- ✅ 界面语言正确更新
- ✅ 设置正确保存

## 相关问题

### 问题1: 菜单闪烁

**症状**: 切换语言时菜单短暂消失

**原因**: 菜单重建需要时间

**解决**: 正常现象，无需处理（非常短暂）

### 问题2: 界面未更新

**症状**: 菜单语言更新，但界面语言未更新

**原因**: 渲染进程未收到消息

**检查**:
1. 确认 `mainWindow.webContents.send()` 被调用
2. 确认渲染进程有 `onLanguageChanged` 监听器
3. 检查控制台是否有错误

### 问题3: 设置未保存

**症状**: 重启应用后语言恢复默认

**原因**: 设置保存失败

**检查**:
1. 确认 `saveSettings()` 被调用
2. 检查设置文件路径
3. 检查文件写入权限

## 其他改进

### 添加错误处理

```javascript
function changeLanguage(language) {
  try {
    currentLanguage = language;

    const settings = loadSettings();
    settings.language = language;
    saveSettings(settings);

    createMenu();

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('language-changed', language);
    }
  } catch (error) {
    console.error('Error changing language:', error);
    // 可以显示错误对话框
    dialog.showErrorBox('Language Change Error', error.message);
  }
}
```

### 添加日志

```javascript
function changeLanguage(language) {
  console.log('Changing language to:', language);

  currentLanguage = language;

  const settings = loadSettings();
  settings.language = language;
  saveSettings(settings);
  console.log('Settings saved');

  createMenu();
  console.log('Menu recreated');

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('language-changed', language);
    console.log('Language change notification sent');
  }

  console.log('Language change completed');
}
```

## 文件变更

### 修改的文件

1. **main.js**
   - `changeLanguage()`: 移除 `Menu.setApplicationMenu(null)`，添加窗口状态检查
   - `toggleCompactMode()`: 移除 `Menu.setApplicationMenu(null)`

### 代码行数

- 修改行数: ~10 行
- 删除行数: ~2 行
- 新增行数: ~1 行

## 总结

### 修复内容

- ✅ 移除不必要的 `Menu.setApplicationMenu(null)`
- ✅ 添加窗口状态检查 `!mainWindow.isDestroyed()`
- ✅ 简化菜单更新逻辑

### 影响范围

- 语言切换功能
- 简化模式切换功能
- 菜单更新机制

### 测试状态

- ⏳ 需要完整测试
- ⏳ 需要验证稳定性

---

**修复日期**: 2026-02-06
**Bug ID**: #003
**严重程度**: 高
**状态**: 已修复，待测试
