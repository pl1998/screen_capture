// 初始化 i18n
i18n.registerLocale('zh-CN', zhCN);
i18n.registerLocale('en-US', enUS);

// 从主窗口获取语言设置
async function initLanguage() {
  try {
    const settings = await window.electronAPI.getSettings();
    const language = settings.language || 'zh-CN';
    i18n.setLocale(language);
    updateUIText();
  } catch (error) {
    console.error('Failed to load language settings:', error);
    i18n.setLocale('zh-CN');
    updateUIText();
  }
}

// 更新界面文本
function updateUIText() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const text = i18n.t(key);

    if (element.tagName === 'TITLE') {
      element.textContent = text;
      document.title = text;
    } else {
      element.textContent = text;
    }
  });
}

// Selection state
let isSelecting = false;
let startX = 0;
let startY = 0;
let currentX = 0;
let currentY = 0;

// Minimum selection size (100x100 pixels as per requirements)
const MIN_WIDTH = 100;
const MIN_HEIGHT = 100;

// DOM elements
const overlay = document.getElementById('overlay');
const selectionBox = document.getElementById('selectionBox');
const coordinates = document.getElementById('coordinates');
const dimensions = document.getElementById('dimensions');

// Mouse event handlers
overlay.addEventListener('mousedown', (e) => {
  isSelecting = true;
  startX = e.clientX;
  startY = e.clientY;
  currentX = e.clientX;
  currentY = e.clientY;

  selectionBox.classList.add('active');
  updateSelectionBox();
});

overlay.addEventListener('mousemove', (e) => {
  if (!isSelecting) return;

  currentX = e.clientX;
  currentY = e.clientY;
  updateSelectionBox();
});

overlay.addEventListener('mouseup', () => {
  if (!isSelecting) return;

  isSelecting = false;
  const bounds = getSelectionBounds();

  // Check minimum size
  if (bounds.width < MIN_WIDTH || bounds.height < MIN_HEIGHT) {
    alert(i18n.t('selector.tooSmall', {
      minWidth: MIN_WIDTH,
      minHeight: MIN_HEIGHT
    }));
    resetSelection();
    return;
  }

  // Selection is valid, wait for confirmation
});

// Keyboard event handlers
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // Cancel selection
    window.electronAPI.closeSelector();
  } else if (e.key === 'Enter') {
    // Confirm selection
    const bounds = getSelectionBounds();
    if (bounds.width >= MIN_WIDTH && bounds.height >= MIN_HEIGHT) {
      confirmSelection(bounds);
    }
  }
});

function updateSelectionBox() {
  const bounds = getSelectionBounds();

  selectionBox.style.left = bounds.x + 'px';
  selectionBox.style.top = bounds.y + 'px';
  selectionBox.style.width = bounds.width + 'px';
  selectionBox.style.height = bounds.height + 'px';

  // Update info panel with i18n
  coordinates.textContent = i18n.t('selector.coordinates', {
    x: bounds.x,
    y: bounds.y
  });
  dimensions.textContent = i18n.t('selector.dimensions', {
    width: bounds.width,
    height: bounds.height
  });
}

function getSelectionBounds() {
  const x = Math.min(startX, currentX);
  const y = Math.min(startY, currentY);
  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);

  return { x, y, width, height };
}

function resetSelection() {
  selectionBox.classList.remove('active');
  startX = 0;
  startY = 0;
  currentX = 0;
  currentY = 0;
  coordinates.textContent = i18n.t('selector.coordinates', { x: 0, y: 0 });
  dimensions.textContent = i18n.t('selector.dimensions', { width: 0, height: 0 });
}

async function confirmSelection(bounds) {
  await window.electronAPI.areaSelected(bounds);
  // The selector window will be closed by the main process
}

// Prevent context menu
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

// 初始化语言
initLanguage();
