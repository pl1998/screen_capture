# Bug 修复：自定义菜单被主界面遮挡

## 问题描述

自定义菜单栏的下拉菜单在打开时被主界面内容遮挡，导致菜单无法正常显示和使用。

## 问题原因

CSS z-index 层级设置不当，导致菜单元素的层级关系混乱：

1. **菜单栏缺少 z-index**
   - `.custom-menubar` 没有设置 `z-index` 和 `position`
   - 无法创建独立的层叠上下文

2. **下拉菜单 z-index 过低**
   - `.menu-dropdown` 的 `z-index: 1000` 不够高
   - 可能被其他元素覆盖

3. **容器层级未明确**
   - `.container` 没有明确的 z-index 设置
   - 可能与菜单产生层级冲突

## 解决方案

### 1. 设置菜单栏层级

为 `.custom-menubar` 添加 `position: relative` 和高 z-index：

```css
.custom-menubar {
  display: flex;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  padding: 0 8px;
  height: 32px;
  align-items: center;
  gap: 4px;
  -webkit-app-region: no-drag;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;      /* 新增：创建层叠上下文 */
  z-index: 9999;          /* 新增：确保菜单栏在最上层 */
}
```

### 2. 提高下拉菜单层级

将 `.menu-dropdown` 的 z-index 提高到更高的值：

```css
.menu-dropdown {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  min-width: 200px;
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  z-index: 10000;         /* 修改：从 1000 提高到 10000 */
}
```

### 3. 明确容器层级

为 `.container` 设置较低的 z-index：

```css
.container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 32px);
  padding: 20px;
  padding-top: 20px;
  position: relative;
  z-index: 1;             /* 新增：设置较低的层级 */
  -webkit-app-region: no-drag;
}
```

## 层级结构

修复后的 z-index 层级结构：

```
z-index: 10000  → .menu-dropdown (下拉菜单)
z-index: 9999   → .custom-menubar (菜单栏)
z-index: 1      → .container (主容器)
z-index: -1     → .gradient-bg (背景)
```

## 技术说明

### CSS 层叠上下文

1. **position + z-index**
   - 元素必须有 `position: relative/absolute/fixed` 才能使用 z-index
   - z-index 只在同一层叠上下文中比较

2. **层级数值选择**
   - 背景：-1
   - 普通内容：1-100
   - 菜单栏：9999
   - 下拉菜单：10000

3. **为什么使用高数值**
   - 确保菜单始终在最上层
   - 避免与未来添加的元素冲突
   - 预留足够的层级空间

## 测试验证

### 测试步骤

1. **基本显示测试**
   - 启动应用
   - 点击菜单栏的任意菜单项
   - 验证下拉菜单正常显示

2. **层级测试**
   - 打开下拉菜单
   - 验证菜单在所有内容之上
   - 验证菜单不被主界面遮挡

3. **交互测试**
   - 点击菜单项
   - 验证菜单项可以正常点击
   - 验证菜单功能正常工作

4. **多菜单测试**
   - 依次打开所有菜单（文件、视图、语言、窗口）
   - 验证每个菜单都能正常显示

## 相关文件

- `src/styles.css` - 样式修复
- `src/index.html` - 菜单 HTML 结构
- `src/renderer.js` - 菜单交互逻辑

## 版本信息

- 修复版本：1.0.2
- 修复日期：2026-02-07
- 相关 Issue：自定义菜单被主界面遮挡

## 注意事项

1. **避免过度使用高 z-index**
   - 只在必要时使用高数值
   - 保持层级结构清晰

2. **测试不同场景**
   - 正常模式和简化模式
   - 不同的窗口大小
   - 不同的操作系统

3. **未来扩展**
   - 如需添加新的浮层元素，确保 z-index 合理
   - 保持层级文档更新
