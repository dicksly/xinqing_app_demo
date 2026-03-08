<template>
  <div class="app-container">
    <!-- 主题切换按钮 -->
    <button class="theme-toggle" @click="toggleTheme" :title="themeStore.isDark ? '切换到亮色模式' : '切换到暗色模式'">
      <component :is="themeStore.isDark ? Sunny : Moon" class="theme-icon" />
    </button>

    <!-- 主内容区域 -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 底部导航栏 -->
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
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Histogram, Moon, Sunny, ChatDotRound, Reading, User } from '@element-plus/icons-vue'
import { useThemeStore } from './stores/theme'

const route = useRoute()
const themeStore = useThemeStore()

const activeTab = ref('/emotion')

// 底部导航配置 - 5个标签
const navItems = [
  { path: '/emotion', label: '情绪', icon: Histogram },
  { path: '/mindfulness', label: '正念', icon: Moon },
  { path: '/treehole', label: '树洞', icon: ChatDotRound },
  { path: '/knowledge', label: '充电站', icon: Reading },
  { path: '/profile', label: '我的', icon: User },
]

// 切换主题
function toggleTheme() {
  themeStore.toggleTheme()
}

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    if (newPath.startsWith('/emotion')) {
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

<style>
/* 全局重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100%;
}
</style>

<style scoped>
.app-container {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #fefefe 0%, #f8f6f4 50%, #f2eeea 100%);
  position: relative;
  transition: background 0.3s ease;
}

/* 主题切换按钮 */
.theme-toggle {
  position: fixed;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  transition: all 0.3s ease;
  -webkit-tap-highlight-color: transparent;
}

.theme-toggle:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.theme-toggle:active {
  transform: scale(0.95);
}

.theme-icon {
  width: 20px;
  height: 20px;
  color: #64748b;
  transition: all 0.3s ease;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  padding-top: 60px;
  padding-bottom: calc(70px + env(safe-area-inset-bottom, 0px));
  -webkit-overflow-scrolling: touch;
}

/* 底部导航栏 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 6px 0;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  min-height: 44px;
  text-decoration: none;
}

.nav-icon {
  width: 22px;
  height: 22px;
  color: #94a3b8;
  transition: all 0.2s ease;
}

.nav-label {
  font-size: 10px;
  color: #94a3b8;
  font-weight: 500;
  transition: all 0.2s ease;
}

/* 激活状态 */
.nav-item.active .nav-icon {
  color: #10b981;
  transform: scale(1.1);
}

.nav-item.active .nav-label {
  color: #10b981;
  font-weight: 600;
}

/* 点击反馈 */
.nav-item:active {
  opacity: 0.7;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式适配 */
@media (min-width: 768px) {
  .app-container {
    max-width: 480px;
    margin: 0 auto;
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.08);
  }

  .bottom-nav {
    max-width: 480px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 20px 20px 0 0;
  }

  .theme-toggle {
    right: calc(50% - 240px + 16px);
  }
}

/* 深色模式 - 温暖柔和的紫色系 */
.dark .app-container {
  background: linear-gradient(180deg, #2d2a3e 0%, #252233 50%, #1f1c2a 100%);
}

.dark .bottom-nav {
  background: rgba(45, 42, 62, 0.95);
  border-top-color: rgba(255, 255, 255, 0.06);
}

.dark .nav-icon,
.dark .nav-label {
  color: #9ca3af;
}

.dark .nav-item.active .nav-icon {
  color: #a78bfa;
}

.dark .nav-item.active .nav-label {
  color: #a78bfa;
}

.dark .theme-toggle {
  background: rgba(45, 42, 62, 0.95);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.dark .theme-icon {
  color: #fbbf24;
}
</style>
