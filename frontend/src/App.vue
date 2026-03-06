<template>
  <div id="app" class="xinqing-app">
    <!-- 顶部导航 -->
    <el-container class="main-container">
      <el-header class="app-header">
        <div class="logo">
          <el-icon><Sunny /></el-icon>
          <span>心情疗愈</span>
        </div>
        <el-menu
          :default-active="activeTab"
          mode="horizontal"
          @select="handleMenuSelect"
          class="main-menu"
        >
          <el-menu-item index="/emotion">
            <el-icon><Histogram /></el-icon>
            <span>情绪气象站</span>
          </el-menu-item>
          <el-menu-item index="/mindfulness">
            <el-icon><Moon /></el-icon>
            <span>正念实验室</span>
          </el-menu-item>
          <el-menu-item index="/treehole">
            <el-icon><ChatDotRound /></el-icon>
            <span>秘密树洞</span>
          </el-menu-item>
          <el-menu-item index="/knowledge">
            <el-icon><Reading /></el-icon>
            <span>心灵充电站</span>
          </el-menu-item>
        </el-menu>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Sunny, Histogram, Moon, ChatDotRound, Reading } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const activeTab = ref('/emotion')

// 监听路由变化，更新当前选中的菜单
watch(
  () => route.path,
  (newPath) => {
    // 确保匹配到正确的菜单项
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

const handleMenuSelect = (index) => {
  router.push(index)
}
</script>

<style scoped>
.xinqing-app {
  min-height: 100vh;
  background: linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%);
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.app-header {
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: #8b7e74;
}

.logo .el-icon {
  font-size: 28px;
  margin-right: 8px;
  color: #d4a373;
}

.main-menu {
  border-bottom: none;
  flex: 1;
  margin-left: 60px;
}

.main-content {
  padding: 40px 0;
  min-height: calc(100vh - 80px);
}
</style>
