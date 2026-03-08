<template>
  <div class="profile-view">
    <!-- 用户信息卡片 -->
    <section class="user-card card">
      <div v-if="authStore.isAuthenticated" class="user-info">
        <div class="avatar">
          <component :is="UserFilled" class="avatar-icon" />
        </div>
        <div class="user-details">
          <h2 class="username">{{ authStore.user?.username }}</h2>
          <span class="user-id">ID: {{ authStore.user?.id }}</span>
        </div>
        <el-button type="danger" size="small" @click="handleLogout" round>
          退出登录
        </el-button>
      </div>

      <div v-else class="login-prompt">
        <div class="prompt-icon">
          <component :is="User" />
        </div>
        <h3 class="prompt-title">登录解锁更多功能</h3>
        <p class="prompt-desc">登录后可以同步您的数据，跨设备使用</p>
        <el-button type="primary" @click="showAuthDialog = true" round>
          登录 / 注册
        </el-button>
      </div>
    </section>

    <!-- 数据统计卡片 -->
    <section v-if="authStore.isAuthenticated" class="stats-card card">
      <header class="card-header">
        <component :is="DataLine" class="header-icon" />
        <h2 class="card-title">我的数据</h2>
      </header>

      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-value">{{ userStats.checkinDays }}</span>
          <span class="stat-label">打卡天数</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ userStats.meditationMinutes }}</span>
          <span class="stat-label">冥想时长(分)</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ userStats.treeholeCount }}</span>
          <span class="stat-label">树洞倾诉</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ userStats.gameCount }}</span>
          <span class="stat-label">游戏次数</span>
        </div>
      </div>
    </section>

    <!-- 功能列表 -->
    <section class="menu-card card">
      <div class="menu-list">
        <div class="menu-item touchable" @click="handleMenuClick('records')">
          <div class="menu-icon">
            <component :is="Document" />
          </div>
          <span class="menu-label">历史记录</span>
          <component :is="ArrowRight" class="menu-arrow" />
        </div>

        <div class="menu-item touchable" @click="handleMenuClick('favorites')">
          <div class="menu-icon">
            <component :is="Star" />
          </div>
          <span class="menu-label">我的收藏</span>
          <component :is="ArrowRight" class="menu-arrow" />
        </div>

        <div class="menu-item touchable" @click="handleMenuClick('settings')">
          <div class="menu-icon">
            <component :is="Setting" />
          </div>
          <span class="menu-label">设置</span>
          <component :is="ArrowRight" class="menu-arrow" />
        </div>

        <div class="menu-item touchable" @click="handleMenuClick('about')">
          <div class="menu-icon">
            <component :is="InfoFilled" />
          </div>
          <span class="menu-label">关于我们</span>
          <component :is="ArrowRight" class="menu-arrow" />
        </div>
      </div>
    </section>

    <!-- 版本信息 -->
    <div class="version-info">
      <span>心情疗愈 v1.0.0</span>
    </div>

    <!-- 登录弹窗 -->
    <AuthDialog v-model="showAuthDialog" @success="onAuthSuccess" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  User,
  UserFilled,
  DataLine,
  Document,
  Star,
  Setting,
  InfoFilled,
  ArrowRight
} from '@element-plus/icons-vue'
import { useAuthStore } from '../../stores/auth'
import { useGamesStore } from '../../stores/games'
import { useEmotionStore } from '../../stores/emotion'
import { ElMessage } from 'element-plus'
import AuthDialog from '../../components/auth/AuthDialog.vue'

const authStore = useAuthStore()
const gamesStore = useGamesStore()
const emotionStore = useEmotionStore()

const showAuthDialog = ref(false)

// 用户统计数据
const userStats = reactive({
  checkinDays: 0,
  meditationMinutes: 0,
  treeholeCount: 0,
  gameCount: 0
})

// 退出登录
function handleLogout() {
  authStore.logout()
  ElMessage.success('已退出登录')
}

// 登录成功回调
function onAuthSuccess() {
  ElMessage.success('登录成功')
  loadUserStats()
}

// 加载用户统计数据
async function loadUserStats() {
  if (!authStore.isAuthenticated) return

  try {
    // 获取情绪记录统计
    await emotionStore.fetchRecords()
    userStats.checkinDays = emotionStore.records.length

    // 获取游戏统计
    userStats.gameCount = gamesStore.totalPops || 0
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 菜单点击
function handleMenuClick(type) {
  switch (type) {
    case 'records':
      ElMessage.info('历史记录功能开发中')
      break
    case 'favorites':
      ElMessage.info('收藏功能开发中')
      break
    case 'settings':
      ElMessage.info('设置功能开发中')
      break
    case 'about':
      ElMessage.info('心情疗愈 - 您的心理健康伙伴')
      break
  }
}

onMounted(() => {
  authStore.checkAuth()
  if (authStore.isAuthenticated) {
    loadUserStats()
  }
})
</script>

<style scoped>
.profile-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 16px);
}

/* 用户卡片 */
.user-card {
  padding: var(--spacing-lg, 24px);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md, 16px);
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary, #10b981) 0%, var(--color-primary-light, #34d399) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-icon {
  width: 28px;
  height: 28px;
  color: white;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.username {
  font-size: var(--font-lg, 17px);
  font-weight: 600;
  color: var(--color-text-primary, #1e293b);
  margin: 0 0 var(--spacing-xs, 4px) 0;
}

.user-id {
  font-size: var(--font-xs, 11px);
  color: var(--color-text-muted, #94a3b8);
}

/* 登录提示 */
.login-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-lg, 24px) 0;
  text-align: center;
}

.prompt-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-bg-tertiary, #f1f5f9);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-md, 16px);
}

.prompt-icon svg {
  width: 32px;
  height: 32px;
  color: var(--color-text-muted, #94a3b8);
}

.prompt-title {
  font-size: var(--font-lg, 17px);
  font-weight: 600;
  color: var(--color-text-primary, #1e293b);
  margin: 0 0 var(--spacing-xs, 4px) 0;
}

.prompt-desc {
  font-size: var(--font-sm, 13px);
  color: var(--color-text-muted, #94a3b8);
  margin: 0 0 var(--spacing-md, 16px) 0;
}

/* 统计卡片 */
.stats-card {
  padding: var(--spacing-md, 16px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 8px);
  margin-bottom: var(--spacing-md, 16px);
}

.header-icon {
  width: 20px;
  height: 20px;
  color: var(--color-primary, #10b981);
}

.card-title {
  font-size: var(--font-base, 15px);
  font-weight: 600;
  color: var(--color-text-primary, #1e293b);
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-sm, 8px);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-sm, 8px);
  background: var(--color-bg-tertiary, #f1f5f9);
  border-radius: var(--radius-md, 12px);
}

.stat-value {
  font-size: var(--font-xl, 20px);
  font-weight: 600;
  color: var(--color-text-primary, #1e293b);
}

.stat-label {
  font-size: var(--font-xs, 11px);
  color: var(--color-text-muted, #94a3b8);
  margin-top: var(--spacing-xs, 4px);
}

/* 菜单卡片 */
.menu-card {
  padding: 0;
}

.menu-list {
  display: flex;
  flex-direction: column;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 8px);
  padding: var(--spacing-md, 16px);
  border-bottom: 1px solid var(--color-border-light, #f1f5f9);
  transition: background 0.2s ease;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: var(--color-bg-tertiary, #f1f5f9);
}

.menu-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm, 8px);
  background: var(--color-bg-tertiary, #f1f5f9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-icon svg {
  width: 18px;
  height: 18px;
  color: var(--color-primary, #10b981);
}

.menu-label {
  flex: 1;
  font-size: var(--font-base, 15px);
  color: var(--color-text-primary, #1e293b);
}

.menu-arrow {
  width: 16px;
  height: 16px;
  color: var(--color-text-muted, #94a3b8);
}

/* 版本信息 */
.version-info {
  text-align: center;
  padding: var(--spacing-lg, 24px) 0;
  font-size: var(--font-xs, 11px);
  color: var(--color-text-muted, #94a3b8);
}

/* 深色模式 */
.dark .avatar {
  background: linear-gradient(135deg, var(--color-primary, #a78bfa) 0%, var(--color-primary-light, #c4b5fd) 100%);
}

.dark .prompt-icon {
  background: rgba(31, 28, 42, 0.8);
}

.dark .stat-item {
  background: rgba(31, 28, 42, 0.8);
}

.dark .menu-item {
  border-bottom-color: rgba(255, 255, 255, 0.06);
}

.dark .menu-item:active {
  background: rgba(31, 28, 42, 0.8);
}

.dark .menu-icon {
  background: rgba(31, 28, 42, 0.8);
}

.dark .menu-icon svg {
  color: var(--color-primary, #a78bfa);
}
</style>
