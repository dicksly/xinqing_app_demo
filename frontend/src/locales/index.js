import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'

// 从 localStorage 获取保存的语言，默认中文
const savedLocale = localStorage.getItem('locale') || 'zh-CN'

// 设置 html lang 属性
document.querySelector('html').setAttribute('lang', savedLocale)

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  globalInjection: true, // 全局注入 $t
  locale: savedLocale,
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
})

// 导出切换语言的辅助函数
export function setLocale(locale) {
  i18n.global.locale.value = locale
  localStorage.setItem('locale', locale)
  document.querySelector('html').setAttribute('lang', locale)
}

// 获取当前语言
export function getLocale() {
  return i18n.global.locale.value
}

export default i18n
