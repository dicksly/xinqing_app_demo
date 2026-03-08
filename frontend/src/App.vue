<template>
  <div class="app-container">
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
      <div
        v-for="item in navItems"
        :key="item.path"
        class="nav-item"
        :class="{ active: activeTab === item.path }"
        @click="navigateTo(item.path)"
      >
        <component :is="item.icon" class="nav-icon" />
        <span class="nav-label">{{ item.label }}</span>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Histogram, Moon, ChatDotRound, Reading } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const activeTab = ref('/emotion')

// 底部导航配置
const navItems = [
  { path: '/emotion', label: '情绪', icon: Histogram },
  { path: '/mindfulness', label: '正念', icon: Moon },
  { path: '/treehole', label: '树洞', icon: ChatDotRound },
  { path: '/knowledge', label: '充电站', icon: Reading },
]

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
    }
  },
  { immediate: true }
)

// 导航到指定页面
function navigateTo(path) {
  router.push(path)
}
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
  min-height: 100dvh; /* 动态视口高度，更好支持移动端 */
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f8fafb 0%, #f0f4f8 50%, #e8f0f4 100%);
  position: relative;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  padding-bottom: calc(70px + env(safe-area-inset-bottom, 0px)); /* 为底部导航留空间 */
  -webkit-overflow-scrolling: touch;
}

/* 底部导航栏 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  padding-bottom: env(safe-area-inset-bottom, 0px); /* 适配刘海屏 */
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.03);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 0;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  min-height: 44px; /* 触摸目标最小尺寸 */
}

.nav-icon {
  width: 24px;
  height: 24px;
  color: #94a3b8;
  transition: all 0.2s ease;
}

.nav-label {
  font-size: 11px;
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
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .app-container {
    background: linear-gradient(180deg, #1a1f2e 0%, #151922 50%, #0f1318 100%);
  }

  .bottom-nav {
    background: rgba(30, 35, 50, 0.95);
    border-top-color: rgba(255, 255, 255, 0.08);
  }

  .nav-icon,
  .nav-label {
    color: #64748b;
  }

  .nav-item.active .nav-icon,
  .nav-item.active .nav-label {
    color: #34d399;
  }
}
</style>
