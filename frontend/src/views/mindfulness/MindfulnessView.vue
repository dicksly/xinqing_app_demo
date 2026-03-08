<template>
  <div class="mindfulness-view">
    <!-- 冥想引导卡片 -->
    <section class="meditation-card card">
      <header class="card-header">
        <component :is="Moon" class="header-icon" />
        <h2 class="card-title">场景化冥想</h2>
      </header>

      <!-- 冥想分类 -->
      <div class="meditation-types">
        <div
          v-for="type in meditationTypes"
          :key="type.value"
          class="type-item touchable"
          :class="{ active: selectedType === type.value }"
          @click="selectedType = type.value"
        >
          <div class="type-icon" :class="type.iconClass">
            <component :is="type.icon" />
          </div>
          <div class="type-info">
            <span class="type-label">{{ type.label }}</span>
            <span class="type-desc">{{ type.desc }}</span>
          </div>
        </div>
      </div>

      <!-- 时长选择 -->
      <div v-if="selectedType" class="section">
        <h3 class="section-title">选择时长</h3>
        <el-radio-group v-model="selectedDuration" class="duration-group">
          <el-radio-button :label="3">3分钟</el-radio-button>
          <el-radio-button :label="10">10分钟</el-radio-button>
          <el-radio-button :label="20">20分钟</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 音量控制 -->
      <div v-if="selectedType" class="section">
        <h3 class="section-title">音量调节</h3>
        <div class="volume-control">
          <div class="volume-item">
            <span class="volume-label">人声</span>
            <el-slider
              v-model="voiceVolume"
              :show-tooltip="false"
              active-color="#10b981"
            />
          </div>
          <div class="volume-item">
            <span class="volume-label">背景音</span>
            <el-slider
              v-model="bgVolume"
              :show-tooltip="false"
              active-color="#8b5cf6"
            />
          </div>
        </div>
        <div class="bg-music-selector">
          <span class="selector-label">背景音类型</span>
          <el-select v-model="bgMusicType" placeholder="选择背景音" size="small">
            <el-option label="白噪音" value="white-noise" />
            <el-option label="雨声" value="rain" />
            <el-option label="森林" value="forest" />
            <el-option label="阿尔法波" value="alpha-wave" />
          </el-select>
        </div>
      </div>

      <!-- 开始按钮 -->
      <el-button
        v-if="selectedType"
        type="primary"
        size="large"
        @click="startMeditation"
        :loading="isPlaying"
        class="start-btn"
        round
      >
        <component :is="isPlaying ? VideoPause : VideoPlay" />
        <span>{{ isPlaying ? '暂停冥想' : '开始冥想' }}</span>
      </el-button>
    </section>

    <!-- 呼吸训练卡片 -->
    <section class="breathing-card card">
      <header class="card-header">
        <component :is="DataLine" class="header-icon" />
        <h2 class="card-title">4-7-8 呼吸训练</h2>
      </header>

      <div class="breathing-animation">
        <div class="breathing-circle" :class="{ inhaling: isInhaling, exhaling: isExhaling }">
          <span class="breathing-text">{{ breathingText }}</span>
        </div>
      </div>

      <div class="breathing-info">
        <p class="info-text">4-7-8 呼吸法是一种简单但有效的放松技巧</p>
        <div class="steps">
          <div class="step">
            <span class="step-num">1</span>
            <span class="step-text">用鼻子吸气 4 秒</span>
          </div>
          <div class="step">
            <span class="step-num">2</span>
            <span class="step-text">屏住呼吸 7 秒</span>
          </div>
          <div class="step">
            <span class="step-num">3</span>
            <span class="step-text">用嘴巴呼气 8 秒</span>
          </div>
          <div class="step">
            <span class="step-num">4</span>
            <span class="step-text">重复 3-4 次</span>
          </div>
        </div>
      </div>

      <el-button
        type="primary"
        @click="toggleBreathing"
        class="breathing-btn"
        round
      >
        <component :is="isBreathingActive ? VideoPause : VideoPlay" />
        <span>{{ isBreathingActive ? '暂停训练' : '开始训练' }}</span>
      </el-button>
    </section>

    <!-- 解压小游戏 -->
    <section class="games-card card">
      <header class="card-header">
        <div class="header-left">
          <component :is="Grid" class="header-icon" />
          <h2 class="card-title">解压小游戏</h2>
        </div>
        <div class="header-right">
          <template v-if="authStore.isAuthenticated">
            <span class="user-name">{{ authStore.user?.username }}</span>
            <el-button size="small" @click="handleLogout" text type="info">退出</el-button>
          </template>
          <template v-else>
            <el-button size="small" type="primary" @click="showAuthDialog = true">
              登录
            </el-button>
          </template>
        </div>
      </header>

      <div class="games-grid">
        <div
          v-for="game in games"
          :key="game.id"
          class="game-item touchable"
          :class="{ disabled: !game.implemented }"
          @click="openGame(game)"
        >
          <div class="game-icon" :class="game.iconClass">
            <component :is="game.icon" />
          </div>
          <span class="game-title">{{ game.title }}</span>
          <span class="game-desc">{{ game.desc }}</span>
          <span v-if="!game.implemented" class="coming-soon">即将推出</span>
        </div>
      </div>
    </section>

    <!-- 游戏弹窗 -->
    <el-dialog
      v-model="showGameModal"
      :title="currentGame?.title"
      width="90%"
      :style="{ maxWidth: '400px' }"
      :close-on-click-modal="false"
      destroy-on-close
      class="game-dialog"
    >
      <BubbleGame v-if="currentGame?.id === 'bubble'" @close="closeGame" />
      <div v-else class="game-placeholder">
        <p>游戏开发中，敬请期待...</p>
      </div>
    </el-dialog>

    <!-- 登录弹窗 -->
    <AuthDialog v-model="showAuthDialog" @success="onAuthSuccess" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Moon,
  DataLine,
  Grid,
  VideoPause,
  VideoPlay,
  MoonNight,
  Sunrise,
  Trophy,
  FirstAidKit,
  Grid as GridIcon,
  Scissor,
  Box,
  Brush
} from '@element-plus/icons-vue'
import { mindfulnessApi } from '../../api'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../../stores/auth'
import { useGamesStore } from '../../stores/games'
import AuthDialog from '../../components/auth/AuthDialog.vue'
import BubbleGame from './games/BubbleGame.vue'

const authStore = useAuthStore()
const gamesStore = useGamesStore()

// 冥想类型 - 使用 SVG 图标
const meditationTypes = [
  { value: 'sleep', label: '睡眠助眠', icon: MoonNight, iconClass: 'icon-purple', desc: '帮助进入深度睡眠' },
  { value: 'wake', label: '晨间唤醒', icon: Sunrise, iconClass: 'icon-orange', desc: '开启元气满满的一天' },
  { value: 'stress', label: '抗压训练', icon: Trophy, iconClass: 'icon-blue', desc: '提升专注力和信心' },
  { value: 'emergency', label: '情绪急救', icon: FirstAidKit, iconClass: 'icon-red', desc: '快速平复情绪' },
]

const selectedType = ref('')
const selectedDuration = ref(10)
const voiceVolume = ref(80)
const bgVolume = ref(50)
const bgMusicType = ref('white-noise')
const isPlaying = ref(false)

// 呼吸训练
const isInhaling = ref(false)
const isExhaling = ref(false)
const isBreathingActive = ref(false)
const breathingText = ref('准备')
const breathingTimer = ref(null)

// 解压游戏 - 使用 SVG 图标
const games = [
  { id: 'bubble', title: '捏泡泡纸', icon: GridIcon, iconClass: 'icon-primary', desc: '释放压力', implemented: true },
  { id: 'soap', title: '切肥皂', icon: Scissor, iconClass: 'icon-secondary', desc: '看着泡沫破裂', implemented: false },
  { id: 'organize', title: '整理收纳', icon: Box, iconClass: 'icon-warm', desc: '秩序感带来平静', implemented: false },
  { id: 'mandala', title: '曼陀罗涂色', icon: Brush, iconClass: 'icon-pink', desc: '专注当下', implemented: false },
]

// 游戏弹窗
const showGameModal = ref(false)
const currentGame = ref(null)
const showAuthDialog = ref(false)

// 开始冥想
async function startMeditation() {
  if (!selectedType.value) {
    ElMessage.warning('请选择冥想类型')
    return
  }

  isPlaying.value = !isPlaying.value

  if (isPlaying.value) {
    try {
      await mindfulnessApi.create({
        session_type: selectedType.value,
        duration_minutes: selectedDuration.value,
        completed: false,
      })

      ElMessage.success('开始冥想！')
    } catch (error) {
      console.error('记录冥想失败:', error)
    }
  } else {
    ElMessage.info('冥想已暂停')
  }
}

// 切换呼吸训练
function toggleBreathing() {
  isBreathingActive.value = !isBreathingActive.value

  if (isBreathingActive.value) {
    startBreathingCycle()
  } else {
    stopBreathingCycle()
  }
}

function startBreathingCycle() {
  let cycleCount = 0

  const cycle = () => {
    if (!isBreathingActive.value) return

    // 吸气 4 秒
    isInhaling.value = true
    isExhaling.value = false
    breathingText.value = '吸气...'

    setTimeout(() => {
      if (!isBreathingActive.value) return

      // 屏息 7 秒
      isInhaling.value = false
      isExhaling.value = false
      breathingText.value = '屏息...'

      setTimeout(() => {
        if (!isBreathingActive.value) return

        // 呼气 8 秒
        isInhaling.value = false
        isExhaling.value = true
        breathingText.value = '呼气...'

        setTimeout(() => {
          if (!isBreathingActive.value) return

          // 完成一次循环
          breathingText.value = '准备'
          cycleCount++

          if (cycleCount < 4) {
            breathingTimer.value = setTimeout(cycle, 100)
          } else {
            isBreathingActive.value = false
            ElMessage.success('训练完成！')
          }
        }, 8000)
      }, 7000)
    }, 4000)
  }

  cycle()
}

function stopBreathingCycle() {
  isInhaling.value = false
  isExhaling.value = false
  breathingText.value = '准备'

  if (breathingTimer.value) {
    clearTimeout(breathingTimer.value)
    breathingTimer.value = null
  }
}

// 打开游戏
function openGame(game) {
  if (!game.implemented) {
    ElMessage.info(`${game.title} 即将推出，敬请期待！`)
    return
  }

  currentGame.value = game
  showGameModal.value = true

  // 初始化游戏数据
  gamesStore.init()
}

// 关闭游戏
function closeGame() {
  showGameModal.value = false
  currentGame.value = null
}

// 登录成功回调
function onAuthSuccess() {
  ElMessage.success('登录成功，游戏数据已同步')
}

// 登出
function handleLogout() {
  authStore.logout()
  ElMessage.success('已退出登录')
}

// 初始化
onMounted(() => {
  authStore.checkAuth()
})
</script>

<style scoped>
.mindfulness-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 16px);
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md, 16px);
  padding-bottom: var(--spacing-sm, 8px);
  border-bottom: 1px solid var(--color-border-light, #f1f5f9);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 8px);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 4px);
}

.header-icon {
  width: 20px;
  height: 20px;
  color: var(--color-primary, #10b981);
}

.card-title {
  font-size: var(--font-lg, 17px);
  font-weight: 600;
  color: var(--color-text-primary, #1e293b);
  margin: 0;
}

.user-name {
  font-size: var(--font-xs, 11px);
  color: var(--color-text-muted, #94a3b8);
}

/* 冥想类型 */
.meditation-types {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm, 8px);
  margin-bottom: var(--spacing-md, 16px);
}

.type-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 8px);
  padding: var(--spacing-sm, 8px);
  border-radius: var(--radius-md, 12px);
  background: var(--color-bg-tertiary, #f1f5f9);
  transition: all var(--transition-base, 0.2s ease);
  min-height: 44px;
}

.type-item.active {
  background: rgba(16, 185, 129, 0.1);
  box-shadow: 0 0 0 2px var(--color-primary, #10b981);
}

.type-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm, 8px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.type-icon svg {
  width: 20px;
  height: 20px;
}

.icon-purple { background: rgba(139, 92, 246, 0.15); }
.icon-purple svg { color: #8b5cf6; }
.icon-orange { background: rgba(251, 191, 36, 0.15); }
.icon-orange svg { color: #fbbf24; }
.icon-blue { background: rgba(59, 130, 246, 0.15); }
.icon-blue svg { color: #3b82f6; }
.icon-red { background: rgba(239, 68, 68, 0.15); }
.icon-red svg { color: #ef4444; }

.type-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.type-label {
  font-size: var(--font-sm, 13px);
  font-weight: 500;
  color: var(--color-text-primary, #1e293b);
}

.type-desc {
  font-size: var(--font-xs, 11px);
  color: var(--color-text-muted, #94a3b8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 分区 */
.section {
  margin-bottom: var(--spacing-md, 16px);
}

.section-title {
  font-size: var(--font-sm, 13px);
  font-weight: 500;
  color: var(--color-text-secondary, #64748b);
  margin: 0 0 var(--spacing-sm, 8px) 0;
}

/* 时长选择 */
.duration-group {
  width: 100%;
}

.duration-group :deep(.el-radio-button) {
  width: 33.33%;
}

.duration-group :deep(.el-radio-button__inner) {
  width: 100%;
}

/* 音量控制 */
.volume-control {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 8px);
}

.volume-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 8px);
}

.volume-label {
  font-size: var(--font-xs, 11px);
  color: var(--color-text-muted, #94a3b8);
  width: 40px;
  flex-shrink: 0;
}

.volume-item :deep(.el-slider) {
  flex: 1;
}

/* 背景音选择 */
.bg-music-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--spacing-sm, 8px);
}

.selector-label {
  font-size: var(--font-xs, 11px);
  color: var(--color-text-muted, #94a3b8);
}

/* 开始按钮 */
.start-btn {
  width: 100%;
  margin-top: var(--spacing-sm, 8px);
  background: linear-gradient(135deg, var(--color-primary, #10b981) 0%, var(--color-primary-light, #34d399) 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs, 4px);
}

.start-btn svg {
  width: 16px;
  height: 16px;
}

/* 呼吸动画 */
.breathing-animation {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-lg, 24px) 0;
}

.breathing-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary, #10b981) 0%, var(--color-primary-light, #34d399) 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 2s ease-in-out;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
}

.breathing-circle.inhaling {
  transform: scale(1.3);
  box-shadow: 0 8px 30px rgba(16, 185, 129, 0.4);
}

.breathing-circle.exhaling {
  transform: scale(0.8);
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.2);
}

.breathing-text {
  font-size: var(--font-base, 15px);
  font-weight: 600;
  color: white;
}

/* 呼吸信息 */
.breathing-info {
  margin-bottom: var(--spacing-md, 16px);
}

.info-text {
  font-size: var(--font-sm, 13px);
  color: var(--color-text-secondary, #64748b);
  margin: 0 0 var(--spacing-sm, 8px) 0;
}

.steps {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-xs, 4px);
}

.step {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 4px);
  padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
  background: var(--color-bg-tertiary, #f1f5f9);
  border-radius: var(--radius-sm, 8px);
}

.step-num {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-primary, #10b981);
  color: white;
  font-size: var(--font-xs, 11px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-text {
  font-size: var(--font-xs, 11px);
  color: var(--color-text-secondary, #64748b);
}

/* 呼吸按钮 */
.breathing-btn {
  width: 100%;
  background: linear-gradient(135deg, var(--color-secondary, #8b5cf6) 0%, var(--color-secondary-light, #a78bfa) 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs, 4px);
}

.breathing-btn svg {
  width: 16px;
  height: 16px;
}

/* 游戏网格 */
.games-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm, 8px);
}

.game-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md, 16px);
  border-radius: var(--radius-md, 12px);
  background: var(--color-bg-tertiary, #f1f5f9);
  position: relative;
  transition: all var(--transition-base, 0.2s ease);
  min-height: 44px;
}

.game-item.disabled {
  opacity: 0.6;
}

.game-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md, 12px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-xs, 4px);
}

.game-icon svg {
  width: 22px;
  height: 22px;
}

.icon-primary { background: rgba(16, 185, 129, 0.15); }
.icon-primary svg { color: var(--color-primary, #10b981); }
.icon-secondary { background: rgba(139, 92, 246, 0.15); }
.icon-secondary svg { color: var(--color-secondary, #8b5cf6); }
.icon-warm { background: rgba(251, 191, 36, 0.15); }
.icon-warm svg { color: var(--color-warm, #fbbf24); }
.icon-pink { background: rgba(244, 114, 182, 0.15); }
.icon-pink svg { color: var(--color-energetic, #f472b6); }

.game-title {
  font-size: var(--font-sm, 13px);
  font-weight: 500;
  color: var(--color-text-primary, #1e293b);
}

.game-desc {
  font-size: var(--font-xs, 11px);
  color: var(--color-text-muted, #94a3b8);
}

.coming-soon {
  position: absolute;
  top: var(--spacing-xs, 4px);
  right: var(--spacing-xs, 4px);
  font-size: 9px;
  background: var(--color-bg-card, #ffffff);
  padding: 2px 6px;
  border-radius: var(--radius-full, 9999px);
  color: var(--color-text-muted, #94a3b8);
}

/* 游戏弹窗 */
.game-dialog :deep(.el-dialog__body) {
  padding: var(--spacing-md, 16px);
}

.game-placeholder {
  padding: var(--spacing-xl, 32px) 0;
  text-align: center;
  color: var(--color-text-muted, #94a3b8);
}

/* 响应式 */
@media (max-width: 360px) {
  .meditation-types {
    grid-template-columns: 1fr;
  }

  .steps {
    grid-template-columns: 1fr;
  }
}

/* 深色模式 - 温暖紫色系 */
.dark .meditation-card,
.dark .breathing-card,
.dark .games-card {
  background: rgba(45, 42, 62, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.dark .type-item {
  background: rgba(31, 28, 42, 0.8);
}

.dark .type-item.active {
  background: rgba(167, 139, 250, 0.15);
  box-shadow: 0 0 0 2px var(--color-primary, #a78bfa);
}

.dark .start-btn {
  background: linear-gradient(135deg, var(--color-primary, #a78bfa) 0%, var(--color-primary-light, #c4b5fd) 100%);
}

.dark .breathing-circle {
  background: linear-gradient(135deg, var(--color-primary, #a78bfa) 0%, var(--color-primary-light, #c4b5fd) 100%);
  box-shadow: 0 4px 20px rgba(167, 139, 250, 0.3);
}

.dark .breathing-circle.inhaling {
  box-shadow: 0 8px 30px rgba(167, 139, 250, 0.4);
}

.dark .step {
  background: rgba(31, 28, 42, 0.8);
}

.dark .step-num {
  background: var(--color-primary, #a78bfa);
}

.dark .breathing-btn {
  background: linear-gradient(135deg, var(--color-secondary, #8b5cf6) 0%, #a78bfa 100%);
}

.dark .game-item {
  background: rgba(31, 28, 42, 0.8);
}

.dark .coming-soon {
  background: rgba(45, 42, 62, 0.8);
}
</style>
