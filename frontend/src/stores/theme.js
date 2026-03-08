import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 从 localStorage 读取主题设置，默认跟随系统
  const isDark = ref(false)

  // 初始化主题
  function init() {
    const savedTheme = localStorage.getItem('theme')

    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      // 跟随系统
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    applyTheme()
  }

  // 应用主题
  function applyTheme() {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 切换主题
  function toggleTheme() {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    applyTheme()
  }

  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const savedTheme = localStorage.getItem('theme')
    // 只有用户没有手动设置时才跟随系统
    if (!savedTheme) {
      isDark.value = e.matches
      applyTheme()
    }
  })

  // 监听 isDark 变化
  watch(isDark, () => {
    applyTheme()
  })

  return {
    isDark,
    init,
    toggleTheme
  }
})
