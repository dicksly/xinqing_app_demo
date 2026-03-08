<template>
  <div class="mindfulness-view">
    <!-- 冥想引导卡片 -->
    <section class="meditation-card card">
      <header class="card-header">
        <component :is="Moon" class="header-icon" />
        <h2 class="card-title">{{ t('mindfulness.meditationTitle') }}</h2>
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
        <h3 class="section-title">{{ t('mindfulness.selectDuration') }}</h3>
        <el-radio-group v-model="selectedDuration" class="duration-group">
          <el-radio-button :label="3">{{ locale === 'zh-CN' ? '3分钟' : '3 min' }}</el-radio-button>
          <el-radio-button :label="10">{{ locale === 'zh-CN' ? '10分钟' : '10 min' }}</el-radio-button>
          <el-radio-button :label="20">{{ locale === 'zh-CN' ? '20分钟' : '20 min' }}</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 音量控制 -->
      <div v-if="selectedType" class="section">
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
          <span class="selector-label">{{ t('mindfulness.bgMusicType') }}</span>
          <el-select v-model="bgMusicType" :placeholder="locale === 'zh-CN' ? '选择背景音' : 'Select background'" size="small">
            <el-option :label="t('mindfulness.bgMusic.whiteNoise')" value="white-noise" />
            <el-option :label="t('mindfulness.bgMusic.rain')" value="rain" />
            <el-option :label="t('mindfulness.bgMusic.forest')" value="forest" />
            <el-option :label="t('mindfulness.bgMusic.alphaWave')" value="alpha-wave" />
          </el-select>
        </div>
      </div>

      <!-- 开始按钮 -->
      <el-button
        v-if="selectedType"
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
        <div class="breathing-circle" :class="{ inhaling: isInhaling, exhaling: isExhaling }">
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
      :style="{ maxWidth: '400px' }"
      :close-on-click-modal="false"
      destroy-on-close
      class="game-dialog"
    >
      <BubbleGame v-if="currentGame?.id === 'bubble'" @close="closeGame" />
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

const { t, locale } = useI18n()
const authStore = useAuthStore()
const gamesStore = useGamesStore()

// ============ 音频资源配置 ============
// 可以是本地路径或远程 URL
const audioResources = {
  // 背景音乐
  bgMusic: {
    'white-noise': '/audio/meditation/white-noise.mp3',
    'rain': '/audio/meditation/rain.mp3',
    'forest': '/audio/meditation/forest.mp3',
    'alpha-wave': '/audio/meditation/alpha-wave.mp3',
  },
  // 引导语音（按冥想类型）
  voiceGuide: {
    'sleep': '/audio/meditation/voice/sleep.mp3',
    'wake': '/audio/meditation/voice/wake.mp3',
    'stress': '/audio/meditation/voice/stress.mp3',
    'emergency': '/audio/meditation/voice/emergency.mp3',
  }
}

// 音频播放器实例
let bgAudioPlayer = ref(null)
let voiceAudioPlayer = ref(null)
const meditationTimer = ref(null)
const elapsedTime = ref(0)

// 冥想类型 - 使用 SVG 图标
const meditationTypes = computed(() => [
  { value: 'sleep', label: t('mindfulness.meditation.sleep'), icon: MoonNight, iconClass: 'icon-purple', desc: t('mindfulness.meditation.sleepDesc') },
  { value: 'wake', label: t('mindfulness.meditation.wake'), icon: Sunrise, iconClass: 'icon-orange', desc: t('mindfulness.meditation.wakeDesc') },
  { value: 'stress', label: t('mindfulness.meditation.stress'), icon: Trophy, iconClass: 'icon-blue', desc: t('mindfulness.meditation.stressDesc') },
  { value: 'emergency', label: t('mindfulness.meditation.emergency'), icon: FirstAidKit, iconClass: 'icon-red', desc: t('mindfulness.meditation.emergencyDesc') },
])

// 解压游戏 - 使用 SVG 图标
const games = computed(() => [
  { id: 'bubble', title: t('mindfulness.games.bubble'), icon: GridIcon, iconClass: 'icon-primary', desc: t('mindfulness.games.bubbleDesc'), implemented: true },
  { id: 'soap', title: t('mindfulness.games.soap'), icon: Scissor, iconClass: 'icon-secondary', desc: t('mindfulness.games.soapDesc'), implemented: false },
  { id: 'organize', title: t('mindfulness.games.organize'), icon: Box, iconClass: 'icon-warm', desc: t('mindfulness.games.organizeDesc'), implemented: false },
  { id: 'mandala', title: t('mindfulness.games.mandala'), icon: Brush, iconClass: 'icon-pink', desc: t('mindfulness.games.mandalaDesc'), implemented: false },
])

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
const breathingText = ref('')
const breathingTimer = ref(null)

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
}

// 开始冥想
async function startMeditation() {
  if (!selectedType.value) {
    ElMessage.warning(locale.value === 'zh-CN' ? '请选择冥想类型' : 'Please select meditation type')
    return
  }

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

    // 吸气 4 秒
    isInhaling.value = true
    isExhaling.value = false
    breathingText.value = breathingTexts.value.inhale

    setTimeout(() => {
      if (!isBreathingActive.value) return

      // 屏息 7 秒
      isInhaling.value = false
      isExhaling.value = false
      breathingText.value = breathingTexts.value.hold

      setTimeout(() => {
        if (!isBreathingActive.value) return

        // 呼气 8 秒
        isInhaling.value = false
        isExhaling.value = true
        breathingText.value = breathingTexts.value.exhale

        setTimeout(() => {
          if (!isBreathingActive.value) return

          // 完成一次循环
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
  isExhaling.value = false
  breathingText.value = breathingTexts.value.ready

  if (breathingTimer.value) {
    clearTimeout(breathingTimer.value)
    breathingTimer.value = null
  }
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
