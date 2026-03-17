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
          {{ t('common.logout') }}
        </el-button>
      </div>

      <div v-else class="login-prompt">
        <div class="prompt-icon">
          <component :is="User" />
        </div>
        <h3 class="prompt-title">{{ t('profile.loginPrompt') }}</h3>
        <p class="prompt-desc">{{ t('profile.loginDesc') }}</p>
        <el-button type="primary" @click="showAuthDialog = true" round>
          {{ t('common.login') }} / {{ t('common.register') }}
        </el-button>
      </div>
    </section>

    <!-- 数据统计卡片 -->
    <section v-if="authStore.isAuthenticated" class="stats-card card">
      <header class="card-header">
        <component :is="DataLine" class="header-icon" />
        <h2 class="card-title">{{ t('profile.myData') }}</h2>
      </header>

      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-value">{{ userStats.checkinDays }}</span>
          <span class="stat-label">{{ t('profile.stats.checkinDays') }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ userStats.meditationMinutes }}</span>
          <span class="stat-label">{{ t('profile.stats.meditationMinutes') }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ userStats.treeholeCount }}</span>
          <span class="stat-label">{{ t('profile.stats.treeholeCount') }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ userStats.gameCount }}</span>
          <span class="stat-label">{{ t('profile.stats.gameCount') }}</span>
        </div>
      </div>
    </section>

    <!-- 功能列表 -->
    <section class="menu-card card">
      <div class="menu-list">
        <div class="menu-item touchable" @click="openPage('records')">
          <div class="menu-icon">
            <component :is="Document" />
          </div>
          <span class="menu-label">{{ t('profile.myRecords') }}</span>
          <component :is="ArrowRight" class="menu-arrow" />
        </div>

        <div class="menu-item touchable" @click="openPage('favorites')">
          <div class="menu-icon">
            <component :is="Star" />
          </div>
          <span class="menu-label">{{ t('profile.favorites') }}</span>
          <component :is="ArrowRight" class="menu-arrow" />
        </div>

        <div class="menu-item touchable" @click="openPage('settings')">
          <div class="menu-icon">
            <component :is="Setting" />
          </div>
          <span class="menu-label">{{ t('profile.settings') }}</span>
          <component :is="ArrowRight" class="menu-arrow" />
        </div>

        <div class="menu-item touchable" @click="openPage('admin')">
          <div class="menu-icon">
            <component :is="Management" />
          </div>
          <span class="menu-label">{{ locale === 'zh-CN' ? '后台入口' : 'Admin Console' }}</span>
          <component :is="ArrowRight" class="menu-arrow" />
        </div>

        <div class="menu-item touchable" @click="openPage('about')">
          <div class="menu-icon">
            <component :is="InfoFilled" />
          </div>
          <span class="menu-label">{{ t('profile.about') }}</span>
          <component :is="ArrowRight" class="menu-arrow" />
        </div>
      </div>
    </section>

    <!-- 版本信息 -->
    <div class="version-info">
      <span>{{ locale === 'zh-CN' ? '心情疗愈' : 'Mood Healing' }} v1.0.0</span>
    </div>

    <!-- 登录弹窗 -->
    <AuthDialog v-model="showAuthDialog" @success="onAuthSuccess" />

    <!-- 历史记录弹窗 -->
    <el-dialog
      v-model="showRecordsDialog"
      :title="t('profile.myRecords')"
      width="90%"
      :style="{ maxWidth: '400px' }"
      class="page-dialog"
    >
      <el-tabs v-model="recordsTab">
        <el-tab-pane :label="locale === 'zh-CN' ? '情绪记录' : 'Emotion'" name="emotion">
          <div v-if="emotionRecords.length > 0" class="records-list">
            <div v-for="record in emotionRecords" :key="record.id" class="record-item">
              <div class="record-header">
                <span class="record-mood">{{ getMoodLabel(record.mood) }}</span>
                <span class="record-date">{{ formatDate(record.created_at) }}</span>
              </div>
              <div class="record-detail">
                <span>{{ locale === 'zh-CN' ? '能量' : 'Energy' }}: {{ record.energy_level }}%</span>
                <span>{{ locale === 'zh-CN' ? '睡眠' : 'Sleep' }}: {{ record.sleep_quality }}/5</span>
              </div>
              <p v-if="record.happy_moment" class="record-note">{{ record.happy_moment }}</p>
            </div>
          </div>
          <el-empty v-else :description="locale === 'zh-CN' ? '暂无情绪记录' : 'No emotion records'" :image-size="60" />
        </el-tab-pane>
        <el-tab-pane :label="locale === 'zh-CN' ? '树洞记录' : 'Treehole'" name="treehole">
          <div v-if="treeholeRecords.length > 0" class="records-list">
            <div v-for="record in treeholeRecords" :key="record.id" class="record-item">
              <div class="record-header">
                <span class="record-type">{{ getContentType(record.content_type) }}</span>
                <span class="record-date">{{ formatDate(record.created_at) }}</span>
              </div>
              <p class="record-note">{{ record.content?.substring(0, 100) }}{{ record.content?.length > 100 ? '...' : '' }}</p>
            </div>
          </div>
          <el-empty v-else :description="locale === 'zh-CN' ? '暂无树洞记录' : 'No treehole records'" :image-size="60" />
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 收藏弹窗 -->
    <el-dialog
      v-model="showFavoritesDialog"
      :title="t('profile.favorites')"
      width="90%"
      :style="{ maxWidth: '400px' }"
      class="page-dialog"
    >
      <div v-if="favorites.length > 0" class="favorites-list">
        <div v-for="item in favorites" :key="item.id" class="favorite-item" @click="viewFavorite(item)">
          <div class="favorite-icon">
            <component :is="item.type === 'video' ? VideoPlay : Reading" />
          </div>
          <div class="favorite-info">
            <h4 class="favorite-title">{{ item.title }}</h4>
            <span class="favorite-category">{{ item.category }}</span>
          </div>
          <el-button size="small" text type="danger" @click.stop="removeFavorite(item.id)">
            <component :is="Delete" />
          </el-button>
        </div>
      </div>
      <el-empty v-else :description="locale === 'zh-CN' ? '暂无收藏内容' : 'No favorites yet'" :image-size="60" />
    </el-dialog>

    <!-- 设置弹窗 -->
    <el-dialog
      v-model="showSettingsDialog"
      :title="t('profile.settings')"
      width="90%"
      :style="{ maxWidth: '400px' }"
      class="page-dialog"
    >
      <div class="settings-list">
        <div class="setting-item">
          <span class="setting-label">{{ t('theme.darkMode') }}</span>
          <el-switch v-model="settings.darkMode" @change="toggleTheme" />
        </div>
        <div class="setting-item">
          <span class="setting-label">{{ locale === 'zh-CN' ? '语言' : 'Language' }}</span>
          <el-select
            v-model="settings.language"
            size="small"
            teleported="false"
            popper-class="settings-language-popper"
            @change="changeLanguage"
          >
            <el-option label="中文" value="zh-CN" />
            <el-option label="English" value="en-US" />
          </el-select>
        </div>
        <div class="setting-item">
          <span class="setting-label">{{ locale === 'zh-CN' ? '推送通知' : 'Push Notifications' }}</span>
          <el-switch v-model="settings.notifications" />
        </div>
        <div class="setting-item">
          <span class="setting-label">{{ locale === 'zh-CN' ? '每日提醒' : 'Daily Reminder' }}</span>
          <el-switch v-model="settings.dailyReminder" />
        </div>
      </div>
      <div class="settings-section">
        <h4>{{ locale === 'zh-CN' ? '数据管理' : 'Data Management' }}</h4>
        <el-button size="small" @click="exportData">{{ locale === 'zh-CN' ? '导出数据' : 'Export Data' }}</el-button>
        <el-button size="small" type="danger" @click="clearData">{{ locale === 'zh-CN' ? '清除本地数据' : 'Clear Local Data' }}</el-button>
      </div>
    </el-dialog>

    <!-- 关于弹窗 -->
    <el-dialog
      v-model="showAboutDialog"
      :title="t('profile.about')"
      width="90%"
      :style="{ maxWidth: '400px' }"
      class="page-dialog"
    >
      <div class="about-content">
        <div class="about-logo">
          <component :is="Sunny" class="logo-icon" />
          <h2>{{ locale === 'zh-CN' ? '心情疗愈' : 'Mood Healing' }}</h2>
          <span class="version">v1.0.0</span>
        </div>
        <p class="about-desc">
          {{ locale === 'zh-CN'
            ? '心情疗愈是一款专注于年轻人心理健康的轻量级应用。通过情绪追踪、冥想练习、树洞倾诉等功能，帮助你更好地了解和管理自己的情绪。'
            : 'Mood Healing is a lightweight app focused on mental health for young people. Through features like emotion tracking, meditation exercises, and anonymous sharing, it helps you better understand and manage your emotions.'
          }}
        </p>
        <div class="about-links">
          <a href="#" class="about-link">{{ t('profile.feedback') }}</a>
          <a href="#" class="about-link">{{ t('profile.privacy') }}</a>
        </div>
        <div class="about-footer">
          <span>© 2024 Mood Healing</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  User,
  UserFilled,
  DataLine,
  Document,
  Star,
  Setting,
  Management,
  InfoFilled,
  ArrowRight,
  VideoPlay,
  Reading,
  Delete,
  Sunny
} from '@element-plus/icons-vue'
import { useAuthStore } from '../../stores/auth'
import { useGamesStore } from '../../stores/games'
import { useEmotionStore } from '../../stores/emotion'
import { useThemeStore } from '../../stores/theme'
import { useAdminStore } from '../../stores/admin'
import { setLocale } from '../../locales'
import { getAdminEntryTarget } from '../../utils/admin-entry'
import { ElMessage, ElMessageBox } from 'element-plus'
import AuthDialog from '../../components/auth/AuthDialog.vue'

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const adminStore = useAdminStore()
const gamesStore = useGamesStore()
const emotionStore = useEmotionStore()
const themeStore = useThemeStore()

const showAuthDialog = ref(false)

// 对话框状态
const showRecordsDialog = ref(false)
const showFavoritesDialog = ref(false)
const showSettingsDialog = ref(false)
const showAboutDialog = ref(false)
const recordsTab = ref('emotion')

// 用户统计数据
const userStats = reactive({
  checkinDays: 0,
  meditationMinutes: 0,
  treeholeCount: 0,
  gameCount: 0
})

// 设置
const settings = reactive({
  darkMode: false,
  language: 'zh-CN',
  notifications: true,
  dailyReminder: true
})

// 记录数据
const emotionRecords = ref([])
const treeholeRecords = ref([])

// 收藏数据
const favorites = ref([])

// 心情标签映射
const moodLabels = {
  anxious: { zh: '焦虑', en: 'Anxious' },
  sad: { zh: '丧', en: 'Sad' },
  calm: { zh: '平静', en: 'Calm' },
  happy: { zh: '开心', en: 'Happy' },
  energetic: { zh: '元气', en: 'Energetic' }
}

function getMoodLabel(mood) {
  const label = moodLabels[mood]
  return label ? (locale.value === 'zh-CN' ? label.zh : label.en) : mood
}

function getContentType(type) {
  const types = {
    text: locale.value === 'zh-CN' ? '文字' : 'Text',
    voice: locale.value === 'zh-CN' ? '语音' : 'Voice',
    image: locale.value === 'zh-CN' ? '图片' : 'Image'
  }
  return types[type] || type
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value === 'zh-CN' ? 'zh-CN' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 打开页面
function openPage(type) {
  switch (type) {
    case 'records':
      loadRecords()
      showRecordsDialog.value = true
      break
    case 'favorites':
      loadFavorites()
      showFavoritesDialog.value = true
      break
    case 'settings':
      loadSettings()
      showSettingsDialog.value = true
      break
    case 'admin':
      router.push(getAdminEntryTarget(adminStore.isAuthenticated))
      break
    case 'about':
      showAboutDialog.value = true
      break
  }
}

// 加载记录
function loadRecords() {
  emotionRecords.value = emotionStore.records || []
  // 模拟树洞记录
  const savedTreehole = localStorage.getItem('xinqing_treehole_records')
  treeholeRecords.value = savedTreehole ? JSON.parse(savedTreehole) : []
}

// 加载收藏
function loadFavorites() {
  const saved = localStorage.getItem('xinqing_favorites')
  favorites.value = saved ? JSON.parse(saved) : []
}

// 查看收藏
function viewFavorite(item) {
  ElMessage.info(locale.value === 'zh-CN' ? `查看: ${item.title}` : `View: ${item.title}`)
}

// 移除收藏
function removeFavorite(id) {
  favorites.value = favorites.value.filter(f => f.id !== id)
  localStorage.setItem('xinqing_favorites', JSON.stringify(favorites.value))
  ElMessage.success(locale.value === 'zh-CN' ? '已移除收藏' : 'Removed from favorites')
}

// 加载设置
function loadSettings() {
  settings.darkMode = themeStore.isDark
  settings.language = locale.value
  const savedSettings = localStorage.getItem('xinqing_settings')
  if (savedSettings) {
    const parsed = JSON.parse(savedSettings)
    Object.assign(settings, parsed)
  }
}

// 切换主题
function toggleTheme() {
  themeStore.toggleTheme()
}

// 切换语言
function changeLanguage(lang) {
  setLocale(lang)
}

// 导出数据
function exportData() {
  const data = {
    emotions: emotionRecords.value,
    treehole: treeholeRecords.value,
    favorites: favorites.value,
    exportedAt: new Date().toISOString()
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mood-healing-data-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success(locale.value === 'zh-CN' ? '数据已导出' : 'Data exported')
}

// 清除数据
async function clearData() {
  try {
    await ElMessageBox.confirm(
      locale.value === 'zh-CN' ? '确定要清除所有本地数据吗？此操作不可恢复。' : 'Are you sure you want to clear all local data? This cannot be undone.',
      locale === 'zh-CN' ? '警告' : 'Warning',
      { confirmButtonText: locale.value === 'zh-CN' ? '确定' : 'Confirm', cancelButtonText: locale.value === 'zh-CN' ? '取消' : 'Cancel', type: 'warning' }
    )
    localStorage.removeItem('xinqing_favorites')
    localStorage.removeItem('xinqing_treehole_records')
    localStorage.removeItem('xinqing_game_data')
    favorites.value = []
    treeholeRecords.value = []
    ElMessage.success(locale.value === 'zh-CN' ? '本地数据已清除' : 'Local data cleared')
  } catch {
    // 用户取消
  }
}

// 退出登录
function handleLogout() {
  authStore.logout()
  ElMessage.success(locale.value === 'zh-CN' ? '已退出登录' : 'Logged out')
}

// 登录成功回调
function onAuthSuccess() {
  ElMessage.success(t('auth.loginSuccess'))
  loadUserStats()
}

// 加载用户统计数据
async function loadUserStats() {
  if (!authStore.isAuthenticated) return

  try {
    await emotionStore.fetchRecords()
    userStats.checkinDays = emotionStore.records.length
    userStats.gameCount = gamesStore.totalPops || 0
  } catch (error) {
    console.error('加载统计数据失败:', error)
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

/* 对话框样式 */
.page-dialog :deep(.el-dialog__body) {
  padding: var(--spacing-md, 16px);
  max-height: 60vh;
  overflow-y: auto;
}

.page-dialog :deep(.el-tabs__nav-wrap::after) {
  background: var(--color-border-light, #f1f5f9);
}

.page-dialog :deep(.el-tabs__item) {
  color: var(--color-text-secondary, #64748b);
}

.page-dialog :deep(.el-tabs__item.is-active),
.page-dialog :deep(.el-tabs__item:hover) {
  color: var(--color-primary, #10b981);
}

.page-dialog :deep(.el-tabs__active-bar) {
  background: var(--color-primary, #10b981);
}

/* 记录列表 */
.records-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 8px);
}

.record-item {
  padding: var(--spacing-sm, 8px);
  background: var(--color-bg-tertiary, #f1f5f9);
  border-radius: var(--radius-md, 12px);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs, 4px);
}

.record-mood {
  font-size: var(--font-sm, 13px);
  font-weight: 500;
  color: var(--color-primary, #10b981);
}

.record-type {
  font-size: var(--font-sm, 13px);
  font-weight: 500;
  color: var(--color-secondary, #8b5cf6);
}

.record-date {
  font-size: var(--font-xs, 11px);
  color: var(--color-text-muted, #94a3b8);
}

.record-detail {
  display: flex;
  gap: var(--spacing-sm, 8px);
  font-size: var(--font-xs, 11px);
  color: var(--color-text-secondary, #64748b);
  margin-bottom: var(--spacing-xs, 4px);
}

.record-note {
  font-size: var(--font-xs, 11px);
  color: var(--color-text-primary, #1e293b);
  margin: 0;
  line-height: 1.5;
}

/* 收藏列表 */
.favorites-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 8px);
}

.favorite-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 8px);
  padding: var(--spacing-sm, 8px);
  background: var(--color-bg-tertiary, #f1f5f9);
  border-radius: var(--radius-md, 12px);
  cursor: pointer;
}

.favorite-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm, 8px);
  background: rgba(16, 185, 129, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.favorite-icon svg {
  width: 18px;
  height: 18px;
  color: var(--color-primary, #10b981);
}

.favorite-info {
  flex: 1;
  min-width: 0;
}

.favorite-title {
  font-size: var(--font-sm, 13px);
  font-weight: 500;
  color: var(--color-text-primary, #1e293b);
  margin: 0 0 var(--spacing-xs, 4px) 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.favorite-category {
  font-size: var(--font-xs, 11px);
  color: var(--color-text-muted, #94a3b8);
}

/* 设置列表 */
.settings-list {
  display: flex;
  flex-direction: column;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md, 16px) 0;
  border-bottom: 1px solid var(--color-border-light, #f1f5f9);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: var(--font-base, 15px);
  color: var(--color-text-primary, #1e293b);
}

.settings-section {
  margin-top: var(--spacing-lg, 24px);
  padding-top: var(--spacing-md, 16px);
  border-top: 1px solid var(--color-border-light, #f1f5f9);
}

.settings-section h4 {
  font-size: var(--font-sm, 13px);
  color: var(--color-text-secondary, #64748b);
  margin: 0 0 var(--spacing-sm, 8px) 0;
}

.settings-section .el-button {
  margin-right: var(--spacing-sm, 8px);
}

/* 关于页面 */
.about-content {
  text-align: center;
}

.about-logo {
  margin-bottom: var(--spacing-md, 16px);
}

.logo-icon {
  width: 64px;
  height: 64px;
  color: var(--color-primary, #10b981);
  margin-bottom: var(--spacing-sm, 8px);
}

.about-logo h2 {
  font-size: var(--font-xl, 20px);
  color: var(--color-text-primary, #1e293b);
  margin: 0 0 var(--spacing-xs, 4px) 0;
}

.about-logo .version {
  font-size: var(--font-xs, 11px);
  color: var(--color-text-muted, #94a3b8);
}

.about-desc {
  font-size: var(--font-sm, 13px);
  color: var(--color-text-secondary, #64748b);
  line-height: 1.7;
  margin: 0 0 var(--spacing-md, 16px) 0;
  text-align: left;
}

.about-links {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg, 24px);
  margin-bottom: var(--spacing-md, 16px);
}

.about-link {
  font-size: var(--font-sm, 13px);
  color: var(--color-primary, #10b981);
  text-decoration: none;
}

.about-link:hover {
  text-decoration: underline;
}

.about-footer {
  padding-top: var(--spacing-md, 16px);
  border-top: 1px solid var(--color-border-light, #f1f5f9);
}

.about-footer span {
  font-size: var(--font-xs, 11px);
  color: var(--color-text-muted, #94a3b8);
}

/* 深色模式 */
.dark .record-item,
.dark .favorite-item {
  background: rgba(31, 28, 42, 0.8);
}

.dark .page-dialog :deep(.el-dialog) {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
}

.dark .page-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid var(--color-border);
  margin-right: 0;
  padding-bottom: var(--spacing-sm, 8px);
}

.dark .page-dialog :deep(.el-dialog__title),
.dark .page-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: var(--color-text-primary);
}

.dark .page-dialog :deep(.el-dialog__body),
.dark .page-dialog :deep(.el-dialog__footer) {
  color: var(--color-text-primary);
}

.dark .page-dialog :deep(.el-tabs__nav-wrap::after) {
  background: var(--color-border);
}

.dark .page-dialog :deep(.el-tabs__item) {
  color: var(--color-text-secondary);
}

.dark .page-dialog :deep(.el-tabs__item.is-active),
.dark .page-dialog :deep(.el-tabs__item:hover) {
  color: var(--color-text-primary);
}

.dark .page-dialog :deep(.el-tabs__active-bar) {
  background: var(--color-primary-light, #c4b5fd);
}

.dark .page-dialog :deep(.el-select__wrapper) {
  background: color-mix(in srgb, var(--color-bg-secondary) 82%, transparent);
  box-shadow: inset 0 0 0 1px var(--color-border);
}

.dark .page-dialog :deep(.el-select__placeholder),
.dark .page-dialog :deep(.el-select__selected-item),
.dark .page-dialog :deep(.el-select__caret),
.dark .page-dialog :deep(.el-input__inner) {
  color: var(--color-text-primary);
}

.dark .page-dialog :deep(.el-switch__core) {
  border-color: var(--color-border);
  background: color-mix(in srgb, var(--color-bg-secondary) 88%, transparent);
}

.dark .page-dialog :deep(.el-switch.is-checked .el-switch__core) {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.dark :deep(.settings-language-popper) {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
}

.dark :deep(.settings-language-popper .el-popper__arrow::before) {
  background: var(--color-bg-card);
  border-color: var(--color-border);
}

.dark :deep(.settings-language-popper .el-select-dropdown__item) {
  color: var(--color-text-secondary);
}

.dark :deep(.settings-language-popper .el-select-dropdown__item.hover),
.dark :deep(.settings-language-popper .el-select-dropdown__item:hover) {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.dark :deep(.settings-language-popper .el-select-dropdown__item.selected) {
  color: var(--color-primary-light, #c4b5fd);
  background: rgba(167, 139, 250, 0.12);
}

.dark .setting-item {
  border-bottom-color: rgba(255, 255, 255, 0.06);
}

.dark .settings-section {
  border-top-color: rgba(255, 255, 255, 0.06);
}

.dark .about-footer {
  border-top-color: rgba(255, 255, 255, 0.06);
}
</style>
