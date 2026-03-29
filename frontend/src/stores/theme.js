import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)
  const uiTheme = ref('healing-fruit')

  function init() {
    const savedTheme = localStorage.getItem('theme')

    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      isDark.value = false
    }

    applyTheme()
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-ui-theme', uiTheme.value)

    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  function toggleTheme() {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    applyTheme()
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const savedTheme = localStorage.getItem('theme')
    if (!savedTheme) {
      isDark.value = e.matches
      applyTheme()
    }
  })

  watch(isDark, () => {
    applyTheme()
  })

  return {
    isDark,
    uiTheme,
    init,
    toggleTheme
  }
})
