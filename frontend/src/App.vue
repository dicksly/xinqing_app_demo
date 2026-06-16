<template>
  <div class="app-container">
    <div class="top-controls" aria-label="App controls">
      <button
        class="control-btn profile-entry"
        type="button"
        :title="t('nav.profile')"
        @click="router.push('/profile')"
      >
        我
      </button>

      <button class="control-btn lang-toggle" type="button" @click="toggleLanguage" :title="currentLangName">
        <span class="lang-text">{{ currentLangCode }}</span>
      </button>

      <button
        class="control-btn theme-toggle"
        type="button"
        @click="toggleTheme"
        :title="themeStore.isDark ? t('theme.lightMode') : t('theme.darkMode')"
      >
        <span class="theme-pill">{{ themeStore.isDark ? '日' : '夜' }}</span>
      </button>
    </div>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <nav class="bottom-nav" aria-label="Primary">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: activeTab === item.path }"
      >
        <span class="nav-icon-shell" :style="item.iconStyle">
          <img :src="item.icon" class="image2-icon nav-image-icon" :class="item.iconClass" :alt="item.label" />
        </span>
        <span class="nav-label">{{ item.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from './stores/theme'
import { setLocale } from './locales'
import homeIcon from './assets/icons/image2-home.png'
import emotionIcon from './assets/icons/image2-emotion.png'
import mindfulnessIcon from './assets/icons/image2-mindfulness.png'
import treeholeIcon from './assets/icons/image2-treehole.png'
import knowledgeIcon from './assets/icons/image2-knowledge.png'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()

const activeTab = ref('/home')

const currentLangCode = computed(() => locale.value === 'zh-CN' ? 'EN' : '中')
const currentLangName = computed(() => locale.value === 'zh-CN' ? 'Switch to English' : '切换到中文')

const navItems = computed(() => [
  { path: '/home', label: locale.value === 'zh-CN' ? '首页' : t('nav.home'), icon: homeIcon, iconClass: 'home-nav-icon' },
  {
    path: '/emotion',
    label: locale.value === 'zh-CN' ? '情绪' : t('nav.emotion'),
    icon: emotionIcon,
    iconClass: 'emotion-nav-icon',
    iconStyle: {
      '--nav-icon-x': '-3px',
      '--nav-icon-y': '-1px',
      '--nav-icon-scale': '1.2',
    },
  },
  { path: '/mindfulness', label: locale.value === 'zh-CN' ? '正念' : t('nav.mindfulness'), icon: mindfulnessIcon, iconClass: 'mindfulness-nav-icon' },
  {
    path: '/treehole',
    label: locale.value === 'zh-CN' ? '树洞' : t('nav.treehole'),
    icon: treeholeIcon,
    iconClass: 'treehole-nav-icon',
    iconStyle: {
      '--nav-icon-x': '-1px',
      '--nav-icon-y': '-1px',
      '--nav-icon-scale': '1.08',
    },
  },
  { path: '/knowledge', label: locale.value === 'zh-CN' ? '知识' : t('nav.knowledge'), icon: knowledgeIcon, iconClass: 'knowledge-nav-icon' },
])

function toggleTheme() {
  themeStore.toggleTheme()
}

function toggleLanguage() {
  const newLocale = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
  setLocale(newLocale)
}

function applySavedFontScale() {
  try {
    const savedSettings = JSON.parse(localStorage.getItem('xinqing_settings') || '{}')
    const fontScale = savedSettings.fontSizeScale || savedSettings.fontScale || 'standard'
    const nextScale = ['compact', 'standard', 'large'].includes(fontScale) ? fontScale : 'standard'
    document.documentElement.dataset.fontScale = nextScale
  } catch (error) {
    console.error('加载字号设置失败:', error)
    document.documentElement.dataset.fontScale = 'standard'
  }
}

watch(
  () => route.path,
  (newPath) => {
    if (newPath.startsWith('/home')) {
      activeTab.value = '/home'
    } else if (newPath.startsWith('/emotion')) {
      activeTab.value = '/emotion'
    } else if (newPath.startsWith('/mindfulness')) {
      activeTab.value = '/mindfulness'
    } else if (newPath.startsWith('/treehole')) {
      activeTab.value = '/treehole'
    } else if (newPath.startsWith('/knowledge')) {
      activeTab.value = '/knowledge'
    }
  },
  { immediate: true }
)

onMounted(() => {
  themeStore.init()
  applySavedFontScale()
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--app-bg);
  position: relative;
  transition: background var(--transition-slow);
  isolation: isolate;
  overflow: hidden;
}

.top-controls {
  position: fixed;
  top: 14px;
  right: 14px;
  display: flex;
  gap: 10px;
  z-index: 1001;
}

.control-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--h5-border);
  background: color-mix(in srgb, var(--h5-surface) 92%, transparent);
  box-shadow: var(--h5-shadow-soft);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 800;
  transition: transform var(--transition-base), box-shadow var(--transition-base), color var(--transition-base);
  -webkit-tap-highlight-color: transparent;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.profile-entry {
  color: var(--h5-sage);
}

.theme-toggle {
  color: var(--h5-primary);
}

.control-btn:active {
  transform: scale(0.96);
}

.lang-text,
.theme-pill {
  line-height: 1;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  padding-top: 72px;
  padding-bottom: calc(106px + env(safe-area-inset-bottom, 0px));
  -webkit-overflow-scrolling: touch;
  position: relative;
  z-index: 1;
}

.bottom-nav {
  position: fixed;
  bottom: 10px;
  left: 12px;
  right: 12px;
  min-height: 72px;
  padding: 8px 8px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
  background: var(--nav-bg);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border: 1px solid var(--h5-border);
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  align-items: center;
  z-index: 1000;
  box-shadow: var(--h5-shadow-dock);
  border-radius: 28px;
}

.nav-item {
  min-width: 0;
  min-height: 56px;
  padding: 7px 0 6px;
  border-radius: 24px;
  color: var(--color-text-muted);
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  transition: background var(--transition-base), color var(--transition-base), transform var(--transition-base);
  -webkit-tap-highlight-color: transparent;
}

.nav-icon-shell {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.nav-image-icon {
  width: calc(24px * var(--nav-icon-scale, 1));
  height: calc(24px * var(--nav-icon-scale, 1));
  max-width: none;
  flex: 0 0 auto;
  transform: translate(var(--nav-icon-x, 0), var(--nav-icon-y, 0));
}

.nav-label {
  color: currentColor;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.15;
  white-space: nowrap;
}

.nav-item.active {
  color: #fff;
  background: var(--h5-primary);
}

.nav-item.active .nav-icon-shell {
  filter: drop-shadow(0 5px 7px rgba(95, 48, 60, 0.18));
}

.dark .nav-icon,
.dark .nav-label {
  color: var(--color-text-secondary);
}

.nav-item:active {
  transform: scale(0.97);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (min-width: 768px) {
  .app-container {
    max-width: var(--shell-max-width);
    margin: 0 auto;
    box-shadow: 0 24px 80px rgba(76, 61, 58, 0.12);
  }

  .bottom-nav {
    width: calc(var(--shell-max-width) - 24px);
    left: 50%;
    right: auto;
    transform: translateX(-50%);
  }

  .top-controls {
    right: calc(50% - (var(--shell-max-width) / 2) + 16px);
  }
}
</style>
