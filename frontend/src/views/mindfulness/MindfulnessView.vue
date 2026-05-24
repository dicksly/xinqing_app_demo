<template>
  <div class="mindfulness-view">
    <!-- 冥想引导卡片 -->
    <section class="meditation-card card">
      <header class="card-header">
        <component :is="Moon" class="header-icon" />
        <div class="header-copy">
          <h2 class="card-title">{{ t('mindfulness.meditationTitle') }}</h2>
          <p class="card-subtitle">{{ locale === 'zh-CN' ? '给自己一小段安静时间，从呼吸和引导开始。' : 'Give yourself a quiet moment and begin with breath and guidance.' }}</p>
        </div>
        <span class="panel-chip">{{ locale === 'zh-CN' ? 'Today' : 'Today' }}</span>
      </header>

      <div class="single-meditation-panel">
        <div class="type-icon icon-purple">
          <component :is="Moon" />
        </div>
        <div class="type-info">
          <span class="type-label">{{ locale === 'zh-CN' ? '每日冥想' : 'Daily Meditation' }}</span>
          <span class="type-desc">{{ locale === 'zh-CN' ? '一个入口，直接开始。背景音按月份切换。' : 'One entry, ready to start. Backgrounds follow monthly themes.' }}</span>
        </div>
      </div>

      <!-- 时长选择 -->
      <div class="section">
        <h3 class="section-title">{{ t('mindfulness.selectDuration') }}</h3>
        <el-radio-group v-model="selectedDuration" class="duration-group">
          <el-radio-button :label="3">{{ locale === 'zh-CN' ? '3分钟' : '3 min' }}</el-radio-button>
          <el-radio-button :label="10">{{ locale === 'zh-CN' ? '10分钟' : '10 min' }}</el-radio-button>
          <el-radio-button :label="20">{{ locale === 'zh-CN' ? '20分钟' : '20 min' }}</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 音量控制 -->
      <div class="section">
        <h3 class="section-title">{{ t('mindfulness.volumeControl') }}</h3>
        <div class="volume-control">
          <div class="volume-item">
            <span class="volume-label">{{ t('mindfulness.voice') }}</span>
            <el-slider
              v-model="voiceVolume"
              :show-tooltip="false"
              active-color="#10b981"
            />
          </div>
          <div class="volume-item">
            <span class="volume-label">{{ t('mindfulness.bgMusic') }}</span>
            <el-slider
              v-model="bgVolume"
              :show-tooltip="false"
              active-color="#8b5cf6"
            />
          </div>
        </div>
        <div class="bg-music-selector">
          <span class="selector-label">{{ locale === 'zh-CN' ? '12个月主题背景音' : '12 Monthly Backgrounds' }}</span>
          <el-select v-model="bgMusicType" :placeholder="locale === 'zh-CN' ? '选择背景音' : 'Select background'" size="small">
            <el-option
              v-for="theme in monthlyBackgroundThemes"
              :key="theme.key"
              :label="locale === 'zh-CN' ? theme.zh : theme.en"
              :value="theme.key"
            />
          </el-select>
        </div>
      </div>

      <!-- 开始按钮 -->
      <el-button
        type="primary"
        size="large"
        @click="startMeditation"
        class="start-btn"
        round
      >
        <component :is="isPlaying ? VideoPause : VideoPlay" />
        <span>{{ isPlaying ? t('mindfulness.pauseMeditation') : t('mindfulness.startMeditation') }}</span>
      </el-button>
    </section>

    <!-- 呼吸训练卡片 -->
    <section class="breathing-card card">
      <header class="card-header">
        <component :is="DataLine" class="header-icon" />
        <h2 class="card-title">{{ t('mindfulness.breathingTitle') }}</h2>
      </header>

      <div class="breathing-animation">
        <div class="breathing-circle" :class="{ inhaling: isInhaling, holding: isHolding, exhaling: isExhaling }" :style="breathingCircleStyle">
          <span class="breathing-text">{{ breathingText }}</span>
        </div>
      </div>

      <div class="breathing-info">
        <p class="info-text">{{ t('mindfulness.breathing.description') }}</p>
        <div class="steps">
          <div class="step">
            <span class="step-num">1</span>
            <span class="step-text">{{ t('mindfulness.breathing.step1') }}</span>
          </div>
          <div class="step">
            <span class="step-num">2</span>
            <span class="step-text">{{ t('mindfulness.breathing.step2') }}</span>
          </div>
          <div class="step">
            <span class="step-num">3</span>
            <span class="step-text">{{ t('mindfulness.breathing.step3') }}</span>
          </div>
          <div class="step">
            <span class="step-num">4</span>
            <span class="step-text">{{ t('mindfulness.breathing.step4') }}</span>
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
        <span>{{ isBreathingActive ? t('mindfulness.breathing.pauseTraining') : t('mindfulness.breathing.startTraining') }}</span>
      </el-button>
    </section>

    <!-- 解压小游戏 -->
    <section class="games-card card">
      <header class="card-header">
        <div class="header-left">
          <component :is="Grid" class="header-icon" />
          <h2 class="card-title">{{ t('mindfulness.gamesTitle') }}</h2>
        </div>
        <div class="header-right">
          <template v-if="authStore.isAuthenticated">
            <span class="user-name">{{ authStore.user?.username }}</span>
            <el-button size="small" @click="handleLogout" text type="info">{{ t('common.logout') }}</el-button>
          </template>
          <template v-else>
            <el-button size="small" type="primary" @click="showAuthDialog = true">
              {{ t('common.login') }}
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
          <span v-if="!game.implemented" class="coming-soon">{{ t('mindfulness.games.comingSoon') }}</span>
        </div>
      </div>
    </section>

    <!-- 游戏弹窗 -->
    <el-dialog
      v-model="showGameModal"
      :title="currentGame?.title"
      width="90%"
      :style="{ maxWidth: '450px' }"
      :close-on-click-modal="false"
      destroy-on-close
      class="game-dialog"
    >
      <BubbleGame v-if="currentGame?.id === 'bubble'" @close="closeGame" />
      <SoapGame v-else-if="currentGame?.id === 'soap'" @close="closeGame" />
      <OrganizeGame v-else-if="currentGame?.id === 'organize'" @close="closeGame" />
      <MandalaGame v-else-if="currentGame?.id === 'mandala'" @close="closeGame" />
      <div v-else class="game-placeholder">
        <p>{{ locale === 'zh-CN' ? '游戏开发中，敬请期待...' : 'Game in development, coming soon...' }}</p>
      </div>
    </el-dialog>

    <!-- 登录弹窗 -->
    <AuthDialog v-model="showAuthDialog" @success="onAuthSuccess" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Moon,
  DataLine,
  Grid,
  VideoPause,
  VideoPlay,
  Grid as GridIcon,
  Scissor,
  Box,
  Brush
} from '@element-plus/icons-vue'
import { mindfulnessApi } from '../../api'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../../stores/auth'
import { useGamesStore } from '../../stores/games'
import { getMonthlyTheme, MONTHLY_BACKGROUND_THEMES } from '../../utils/meditation-themes'
import AuthDialog from '../../components/auth/AuthDialog.vue'
import BubbleGame from './games/BubbleGame.vue'
import SoapGame from './games/SoapGame.vue'
import OrganizeGame from './games/OrganizeGame.vue'
import MandalaGame from './games/MandalaGame.vue'

const { t, locale } = useI18n()
const authStore = useAuthStore()
const gamesStore = useGamesStore()

// ============ 音频资源配置 ============
// 可以是本地路径或远程 URL
const audioResources = {
  // 背景音乐
  bgMusic: Object.fromEntries(MONTHLY_BACKGROUND_THEMES.map((theme) => [theme.key, theme.audio])),
  // 引导语音（按冥想类型）
  voiceGuide: {
    meditation: '/audio/meditation/voice/stress.mp3',
  }
}

// 音频播放器实例
let bgAudioPlayer = ref(null)
let voiceAudioPlayer = ref(null)
const meditationTimer = ref(null)
const elapsedTime = ref(0)

// 解压游戏 - 使用 SVG 图标
const games = computed(() => [
  { id: 'bubble', title: t('mindfulness.games.bubble'), icon: GridIcon, iconClass: 'icon-primary', desc: t('mindfulness.games.bubbleDesc'), implemented: true },
  { id: 'soap', title: t('mindfulness.games.soap'), icon: Scissor, iconClass: 'icon-secondary', desc: t('mindfulness.games.soapDesc'), implemented: true },
  { id: 'organize', title: t('mindfulness.games.organize'), icon: Box, iconClass: 'icon-warm', desc: t('mindfulness.games.organizeDesc'), implemented: true },
  { id: 'mandala', title: t('mindfulness.games.mandala'), icon: Brush, iconClass: 'icon-pink', desc: t('mindfulness.games.mandalaDesc'), implemented: true },
])

const selectedType = ref('meditation')
const selectedDuration = ref(10)
const voiceVolume = ref(80)
const bgVolume = ref(50)
const monthlyBackgroundThemes = MONTHLY_BACKGROUND_THEMES
const bgMusicType = ref(getMonthlyTheme(new Date().getMonth() + 1).key)
const isPlaying = ref(false)

// 呼吸训练
const isInhaling = ref(false)
const isHolding = ref(false)
const isExhaling = ref(false)
const isBreathingActive = ref(false)
const breathingText = ref('')
const breathingTimer = ref(null)
const tickInterval = ref(null)
const transitionDuration = ref(0)
let audioContext = null

// 游戏弹窗
const showGameModal = ref(false)
const currentGame = ref(null)
const showAuthDialog = ref(false)

// 呼吸文本
const breathingTexts = computed(() => ({
  ready: locale.value === 'zh-CN' ? '准备' : 'Ready',
  inhale: t('mindfulness.breathing.inhale'),
  hold: t('mindfulness.breathing.hold'),
  exhale: t('mindfulness.breathing.exhale'),
}))

// 呼吸圆圈动态样式 - 根据阶段设置过渡时间
const breathingCircleStyle = computed(() => ({
  transition: `transform ${transitionDuration.value}s ease-in-out, box-shadow ${transitionDuration.value}s ease-in-out`
}))

// 初始化呼吸文本
onMounted(() => {
  breathingText.value = breathingTexts.value.ready
  initAudioPlayers()
})

// 初始化音频播放器
function initAudioPlayers() {
  bgAudioPlayer.value = new Audio()
  bgAudioPlayer.value.loop = true

  voiceAudioPlayer.value = new Audio()
  voiceAudioPlayer.value.loop = false

  // 初始化 AudioContext 用于滴答声
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  } catch (e) {
    console.warn('AudioContext 不支持:', e)
  }
}

// 播放滴答声（每秒提示音）
function playTickSound() {
  if (!audioContext) return

  try {
    // 确保 AudioContext 处于运行状态
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }

    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // 设置滴答声的频率和音色
    oscillator.frequency.value = 800 // 频率
    oscillator.type = 'sine' // 正弦波

    // 设置音量包络
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

    // 播放
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.1)
  } catch (e) {
    console.warn('滴答声播放失败:', e)
  }
}

// 开始滴答计时
function startTickTimer(duration) {
  stopTickTimer()
  let remaining = duration
  playTickSound() // 立即播放一次

  tickInterval.value = setInterval(() => {
    remaining--
    if (remaining > 0 && isBreathingActive.value) {
      playTickSound()
    }
    if (remaining <= 0) {
      stopTickTimer()
    }
  }, 1000)
}

// 停止滴答计时
function stopTickTimer() {
  if (tickInterval.value) {
    clearInterval(tickInterval.value)
    tickInterval.value = null
  }
}

// 开始冥想
async function startMeditation() {
  isPlaying.value = !isPlaying.value

  if (isPlaying.value) {
    try {
      // 播放背景音乐
      await playBgMusic()

      // 播放引导语音
      await playVoiceGuide()

      // 开始计时
      startMeditationTimer()

      // 记录到后端
      await mindfulnessApi.create({
        session_type: selectedType.value,
        duration_minutes: selectedDuration.value,
        completed: false,
      })

      ElMessage.success(locale.value === 'zh-CN' ? '开始冥想！' : 'Meditation started!')
    } catch (error) {
      console.error('冥想启动失败:', error)
      ElMessage.error(locale.value === 'zh-CN' ? '音频加载失败，请检查资源' : 'Audio failed to load')
    }
  } else {
    // 暂停冥想
    stopAllAudio()
    stopMeditationTimer()
    ElMessage.info(locale.value === 'zh-CN' ? '冥想已暂停' : 'Meditation paused')
  }
}

// 播放背景音乐
async function playBgMusic() {
  const audioSrc = audioResources.bgMusic[bgMusicType.value]
  if (!audioSrc) return

  bgAudioPlayer.value.src = audioSrc
  bgAudioPlayer.value.volume = bgVolume.value / 100

  try {
    await bgAudioPlayer.value.play()
  } catch (e) {
    console.warn('背景音乐播放失败:', e)
    // 如果本地文件不存在，可以尝试使用在线资源或忽略
  }
}

// 播放引导语音
async function playVoiceGuide() {
  const audioSrc = audioResources.voiceGuide[selectedType.value]
  if (!audioSrc) return

  voiceAudioPlayer.value.src = audioSrc
  voiceAudioPlayer.value.volume = voiceVolume.value / 100

  try {
    await voiceAudioPlayer.value.play()
  } catch (e) {
    console.warn('引导语音播放失败:', e)
  }
}

// 开始冥想计时器
function startMeditationTimer() {
  elapsedTime.value = 0
  const durationInSeconds = selectedDuration.value * 60

  meditationTimer.value = setInterval(() => {
    elapsedTime.value++

    // 时间到了自动停止
    if (elapsedTime.value >= durationInSeconds) {
      stopMeditation()
      ElMessage.success(locale.value === 'zh-CN' ? '冥想完成！' : 'Meditation complete!')
    }
  }, 1000)
}

// 停止冥想计时器
function stopMeditationTimer() {
  if (meditationTimer.value) {
    clearInterval(meditationTimer.value)
    meditationTimer.value = null
  }
}

// 停止所有音频
function stopAllAudio() {
  if (bgAudioPlayer.value) {
    bgAudioPlayer.value.pause()
    bgAudioPlayer.value.currentTime = 0
  }
  if (voiceAudioPlayer.value) {
    voiceAudioPlayer.value.pause()
    voiceAudioPlayer.value.currentTime = 0
  }
}

// 完全停止冥想
function stopMeditation() {
  isPlaying.value = false
  stopAllAudio()
  stopMeditationTimer()
}

// 监听音量变化
watch(bgVolume, (newVal) => {
  if (bgAudioPlayer.value) {
    bgAudioPlayer.value.volume = newVal / 100
  }
})

watch(voiceVolume, (newVal) => {
  if (voiceAudioPlayer.value) {
    voiceAudioPlayer.value.volume = newVal / 100
  }
})

// 监听背景音乐类型变化
watch(bgMusicType, async (newType) => {
  if (isPlaying.value) {
    // 切换背景音乐
    if (bgAudioPlayer.value) {
      bgAudioPlayer.value.pause()
    }
    await playBgMusic()
  }
})

// 组件卸载时清理
onUnmounted(() => {
  stopMeditation()
  stopTickTimer()
  if (audioContext) {
    audioContext.close()
    audioContext = null
  }
})

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

    // 吸气阶段 - 4秒
    isInhaling.value = true
    isHolding.value = false
    isExhaling.value = false
    transitionDuration.value = 4 // 吸气过渡时间4秒
    breathingText.value = breathingTexts.value.inhale

    // 启动滴答声（每秒一次）
    startTickTimer(4)

    setTimeout(() => {
      if (!isBreathingActive.value) return
      stopTickTimer()

      // 屏息阶段 - 7秒，保持扩张状态
      isInhaling.value = false
      isHolding.value = true
      isExhaling.value = false
      transitionDuration.value = 0 // 屏息时不需要过渡
      breathingText.value = breathingTexts.value.hold

      // 启动屏息滴答声
      startTickTimer(7)

      setTimeout(() => {
        if (!isBreathingActive.value) return
        stopTickTimer()

        // 呼气阶段 - 8秒
        isInhaling.value = false
        isHolding.value = false
        isExhaling.value = true
        transitionDuration.value = 8 // 呼气过渡时间8秒
        breathingText.value = breathingTexts.value.exhale

        // 启动呼气滴答声
        startTickTimer(8)

        setTimeout(() => {
          if (!isBreathingActive.value) return
          stopTickTimer()

          // 完成一次循环
          isInhaling.value = false
          isHolding.value = false
          isExhaling.value = false
          transitionDuration.value = 0.5
          breathingText.value = breathingTexts.value.ready
          cycleCount++

          if (cycleCount < 4) {
            breathingTimer.value = setTimeout(cycle, 100)
          } else {
            isBreathingActive.value = false
            ElMessage.success(t('mindfulness.breathing.trainingComplete'))
          }
        }, 8000)
      }, 7000)
    }, 4000)
  }

  cycle()
}

function stopBreathingCycle() {
  isInhaling.value = false
  isHolding.value = false
  isExhaling.value = false
  breathingText.value = breathingTexts.value.ready

  if (breathingTimer.value) {
    clearTimeout(breathingTimer.value)
    breathingTimer.value = null
  }

  // 停止滴答声
  stopTickTimer()
}

// 打开游戏
function openGame(game) {
  if (!game.implemented) {
    ElMessage.info(`${game.title} ${t('mindfulness.games.comingSoon')}`)
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
  ElMessage.success(t('auth.dataSynced'))
}

// 登出
function handleLogout() {
  authStore.logout()
  ElMessage.success(locale.value === 'zh-CN' ? '已退出登录' : 'Logged out')
}

// 初始化
onMounted(() => {
  authStore.checkAuth()
  breathingText.value = breathingTexts.value.ready
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
.single-meditation-panel {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 8px);
  padding: 14px;
  margin-bottom: var(--spacing-md, 16px);
  border: 1px solid var(--color-border-light, #e8eef5);
  border-radius: 16px;
  background: var(--color-bg-tertiary, #f1f5f9);
}

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

/* 场景描述 */
.scenario-description {
  margin-bottom: var(--spacing-md, 16px);
  padding: var(--spacing-sm, 8px) var(--spacing-md, 12px);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border-radius: var(--radius-md, 12px);
  border-left: 3px solid var(--color-primary, #10b981);
}

.scenario-description p {
  margin: 0;
  font-size: var(--font-sm, 13px);
  color: var(--color-text-secondary, #64748b);
  font-style: italic;
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
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
}

.breathing-circle.inhaling {
  transform: scale(1.3);
  box-shadow: 0 8px 30px rgba(16, 185, 129, 0.4);
}

.breathing-circle.holding {
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
  background: linear-gradient(135deg, var(--color-secondary, #8b5cf6) 0%, #a78bfa 100%);
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
.icon-pink svg { color: #f472b6; }

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

.dark .scenario-description {
  background: linear-gradient(135deg, rgba(167, 139, 250, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
  border-left-color: var(--color-primary, #a78bfa);
}

.dark .start-btn {
  background: linear-gradient(135deg, var(--color-primary, #a78bfa) 0%, var(--color-primary-light, #c4b5fd) 100%);
}

.dark .breathing-circle {
  background: linear-gradient(135deg, var(--color-primary, #a78bfa) 0%, var(--color-primary-light, #c4b5fd) 100%);
  box-shadow: 0 4px 20px rgba(167, 139, 250, 0.3);
}

.dark .breathing-circle.inhaling,
.dark .breathing-circle.holding {
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

.header-copy {
  flex: 1;
  min-width: 0;
}

.meditation-card .card-header {
  align-items: flex-start;
}

.meditation-card .header-icon {
  margin-top: 2px;
}

.card-subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.45;
  color: var(--color-text-muted);
}

.panel-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.58);
  border: 1px solid var(--color-border-light);
  color: var(--color-primary-dark);
  font-size: 11px;
  font-weight: 700;
}

.meditation-card,
.breathing-card,
.games-card {
  background: color-mix(in srgb, var(--surface-2) 92%, transparent);
}

.type-item,
.step,
.game-item {
  border: 1px solid var(--color-border-light);
  background: color-mix(in srgb, var(--surface-3) 84%, transparent);
}

.type-item.active {
  background: color-mix(in srgb, var(--color-primary) 12%, var(--surface-2));
  box-shadow: 0 12px 24px color-mix(in srgb, var(--color-primary) 14%, transparent);
}

.scenario-description {
  background: linear-gradient(135deg, rgba(240, 111, 137, 0.1) 0%, rgba(255, 204, 134, 0.14) 100%);
  border-left-color: var(--color-primary);
  border-radius: 18px;
}

.section {
  padding: 14px;
  border-radius: 18px;
  background: color-mix(in srgb, var(--surface-3) 84%, transparent);
  border: 1px solid var(--color-border-light);
}

.start-btn,
.breathing-btn {
  min-height: 50px;
  box-shadow: 0 14px 28px color-mix(in srgb, var(--color-primary) 24%, transparent);
}

.breathing-circle {
  background: var(--accent-gradient);
}

.game-item {
  border-radius: 20px;
}

.coming-soon {
  border: 1px solid var(--color-border-light);
}
</style>
