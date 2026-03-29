<template>
  <div class="app-container">
    <div class="ambient-orb orb-one"></div>
    <div class="ambient-orb orb-two"></div>
    <div class="ambient-orb orb-three"></div>

    <div class="top-controls">
      <button
        v-if="isHome"
        class="control-btn control-btn-icon"
        @click="shareCurrentPage"
        :title="locale === 'zh-CN' ? '分享首页' : 'Share home'"
      >
        <component :is="Share" class="control-icon" />
      </button>

      <button class="control-btn lang-toggle" @click="toggleLanguage" :title="currentLangName">
        <span class="lang-text">{{ currentLangCode }}</span>
      </button>

      <button class="control-btn theme-toggle" @click="toggleTheme" :title="themeStore.isDark ? t('theme.lightMode') : t('theme.darkMode')">
        <component :is="themeStore.isDark ? Sunny : Moon" class="control-icon" />
      </button>
    </div>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <nav class="bottom-nav">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: activeTab === item.path }"
      >
        <component :is="item.icon" class="nav-icon" />
        <span class="nav-label">{{ item.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { House, Histogram, Moon, Sunny, ChatDotRound, Reading, User, Share } from '@element-plus/icons-vue'
import { useThemeStore } from './stores/theme'
import { setLocale } from './locales'
import { ElMessage } from 'element-plus'

const { t, locale } = useI18n()
const route = useRoute()
const themeStore = useThemeStore()

const activeTab = ref('/home')

const currentLangCode = computed(() => locale.value === 'zh-CN' ? 'EN' : '中')
const currentLangName = computed(() => locale.value === 'zh-CN' ? 'Switch to English' : '切换到中文')
const isHome = computed(() => activeTab.value === '/home')

const navItems = computed(() => [
  { path: '/home', label: t('nav.home'), icon: House },
  { path: '/emotion', label: t('nav.emotion'), icon: Histogram },
  { path: '/mindfulness', label: t('nav.mindfulness'), icon: Moon },
  { path: '/treehole', label: t('nav.treehole'), icon: ChatDotRound },
  { path: '/knowledge', label: t('nav.knowledge'), icon: Reading },
  { path: '/profile', label: t('nav.profile'), icon: User },
])

function toggleTheme() {
  themeStore.toggleTheme()
}

function toggleLanguage() {
  const newLocale = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
  setLocale(newLocale)
}

async function shareCurrentPage() {
  const shareData = {
    title: locale.value === 'zh-CN' ? '心灵疗愈站' : 'Healing Orchard',
    text: locale.value === 'zh-CN' ? '来看看这个更柔和的疗愈首页。' : 'Take a look at this softer healing home.',
    url: window.location.href
  }

  try {
    if (navigator.share) {
      await navigator.share(shareData)
      return
    }

    await navigator.clipboard.writeText(shareData.url)
    ElMessage.success(locale.value === 'zh-CN' ? '链接已复制' : 'Link copied')
  } catch {
    ElMessage.info(locale.value === 'zh-CN' ? '已取消分享' : 'Share cancelled')
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
    } else if (newPath.startsWith('/profile')) {
      activeTab.value = '/profile'
    }
  },
  { immediate: true }
)

onMounted(() => {
  themeStore.init()
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

.ambient-orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(18px);
  pointer-events: none;
  z-index: 0;
}

.orb-one {
  width: 220px;
  height: 220px;
  top: -42px;
  left: -70px;
  background: var(--app-orb-1);
}

.orb-two {
  width: 200px;
  height: 200px;
  top: 18%;
  right: -82px;
  background: var(--app-orb-2);
}

.orb-three {
  width: 180px;
  height: 180px;
  bottom: 10%;
  left: 8%;
  background: var(--app-orb-3);
}

.top-controls {
  position: fixed;
  top: 14px;
  right: 14px;
  display: flex;
  gap: 8px;
  z-index: 1001;
}

.control-btn {
  min-width: 34px;
  height: 34px;
  padding: 0 10px;
  border-radius: 50%;
  border: 1px solid color-mix(in srgb, var(--color-outline) 86%, rgba(255, 255, 255, 0.38));
  background: color-mix(in srgb, var(--surface-1) 92%, rgba(255, 255, 255, 0.26));
  box-shadow:
    0 10px 18px rgba(203, 180, 175, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
  -webkit-tap-highlight-color: transparent;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.control-btn-icon {
  padding: 0;
}

.control-btn:hover {
  transform: translateY(-1px);
  box-shadow:
    0 14px 24px rgba(203, 180, 175, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.76);
}

.control-btn:active {
  transform: scale(0.95);
}

.control-icon {
  width: 17px;
  height: 17px;
  color: color-mix(in srgb, var(--color-text-secondary) 88%, white);
  transition: all 0.3s ease;
  opacity: 0.92;
}

.lang-text {
  font-size: 10px;
  font-weight: 700;
  color: color-mix(in srgb, var(--color-text-secondary) 88%, white);
  letter-spacing: 0.04em;
}

.theme-pill {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--nav-active-color);
}

.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  padding-top: 72px;
  padding-bottom: calc(102px + env(safe-area-inset-bottom, 0px));
  -webkit-overflow-scrolling: touch;
  position: relative;
  z-index: 1;
}

.bottom-nav {
  position: fixed;
  bottom: 10px;
  left: 12px;
  right: 12px;
  min-height: 70px;
  padding: 8px 10px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
  background: var(--nav-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--color-outline);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-slow);
  border-radius: 28px;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 8px 0;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  min-height: 44px;
  text-decoration: none;
  border-radius: 16px;
  min-width: 0;
}

.nav-icon {
  width: 20px;
  height: 20px;
  color: var(--color-text-muted);
  transition: all 0.2s ease;
}

.nav-label {
  font-size: 10px;
  color: var(--color-text-muted);
  font-weight: 600;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.nav-item.active {
  background: var(--nav-active-bg);
}

.nav-item.active .nav-icon {
  color: var(--nav-active-color);
  transform: scale(1.1);
}

.nav-item.active .nav-label {
  color: var(--nav-active-color);
  font-weight: 700;
}

.nav-item:active {
  opacity: 0.7;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (min-width: 768px) {
  .app-container {
    max-width: var(--shell-max-width);
    margin: 0 auto;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.12);
  }

  .bottom-nav {
    max-width: calc(var(--shell-max-width) - 24px);
    left: 50%;
    transform: translateX(-50%);
  }

  .top-controls {
    right: calc(50% - (var(--shell-max-width) / 2) + 16px);
  }
}
</style>
