// i18n Manager - 国际化管理器
class I18n {
  constructor() {
    this.currentLocale = 'zh-CN';
    this.locales = {};
    this.fallbackLocale = 'en-US';
  }

  // 注册语言包
  registerLocale(locale, messages) {
    this.locales[locale] = messages;
  }

  // 设置当前语言
  setLocale(locale) {
    if (this.locales[locale]) {
      this.currentLocale = locale;
      return true;
    }
    return false;
  }

  // 获取当前语言
  getLocale() {
    return this.currentLocale;
  }

  // 获取翻译文本
  t(key, params = {}) {
    const keys = key.split('.');
    let value = this.locales[this.currentLocale];

    // 遍历键路径
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        // 如果找不到，尝试使用备用语言
        value = this.locales[this.fallbackLocale];
        for (const k2 of keys) {
          if (value && typeof value === 'object') {
            value = value[k2];
          } else {
            return key; // 返回键本身作为备用
          }
        }
        break;
      }
    }

    // 如果值不是字符串，返回键
    if (typeof value !== 'string') {
      return key;
    }

    // 替换参数
    return this.interpolate(value, params);
  }

  // 插值替换
  interpolate(template, params) {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }

  // 获取所有可用语言
  getAvailableLocales() {
    return Object.keys(this.locales);
  }
}

// 创建全局实例
const i18n = new I18n();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = i18n;
}
