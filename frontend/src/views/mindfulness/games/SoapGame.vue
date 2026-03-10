<template>
  <div class="soap-game" ref="gameContainer">
    <!-- 顶部信息栏 -->
    <div class="game-header">
      <div class="stats">
        <span class="stat-item">
          <span class="stat-label">切割</span>
          <span class="stat-value">{{ progress.stats?.totalCuts || 0 }}</span>
        </span>
        <span class="stat-item">
          <span class="stat-label">连击</span>
          <span class="stat-value">{{ currentCombo }}</span>
        </span>
      </div>
      <div class="skin-selector">
        <el-select
          v-model="currentSkin"
          size="small"
          placeholder="选择肥皂"
          @change="onSkinChange"
        >
          <el-option
            v-for="skin in availableSkins"
            :key="skin.name"
            :label="skin.label"
            :value="skin.name"
            :disabled="!progress.unlockedSkins?.includes(skin.name)"
          />
        </el-select>
      </div>
    </div>

    <!-- 游戏区域 -->
    <div
      class="game-area"
      ref="gameArea"
      @mousedown="startCut"
      @mousemove="onCut"
      @mouseup="endCut"
      @mouseleave="endCut"
      @touchstart.prevent="startCut"
      @touchmove.prevent="onCut"
      @touchend="endCut"
    >
      <!-- 刀痕效果 -->
      <div
        v-for="slash in activeSlashes"
        :key="slash.id"
        class="slash-effect"
        :style="slash.style"
      />

      <!-- 肥皂块 -->
      <div
        v-if="currentSoap"
        :key="currentSoap.id"
        class="soap-container"
        :class="{ cutting: isCutting }"
      >
        <!-- 左半边 -->
        <div
          v-if="currentSoap.sliced"
          class="soap-half soap-left"
          :class="{ falling: currentSoap.falling }"
          :style="leftHalfStyle"
        >
          <div class="soap-piece" :style="soapStyle">
            <div class="soap-inner"></div>
            <div class="soap-cut-surface"></div>
          </div>
        </div>

        <!-- 右半边 -->
        <div
          v-if="currentSoap.sliced"
          class="soap-half soap-right"
          :class="{ falling: currentSoap.falling }"
          :style="rightHalfStyle"
        >
          <div class="soap-piece" :style="soapStyle">
            <div class="soap-inner"></div>
            <div class="soap-cut-surface"></div>
          </div>
        </div>

        <!-- 完整肥皂 -->
        <div
          v-if="!currentSoap.sliced"
          class="soap-whole"
          :style="soapStyle"
        >
          <div class="soap-inner"></div>
          <div class="soap-shine"></div>
        </div>
      </div>

      <!-- 泡沫粒子 -->
      <div
        v-for="particle in particles"
        :key="particle.id"
        class="bubble-particle"
        :style="particle.style"
      />
    </div>

    <!-- 底部操作栏 -->
    <div class="game-footer">
      <el-button type="primary" @click="resetSoap">
        <el-icon><Refresh /></el-icon>
        新肥皂
      </el-button>
      <el-button @click="handleClose">
        关闭
      </el-button>
    </div>

    <!-- 解锁提示 -->
    <el-dialog
      v-model="showUnlockDialog"
      title="解锁新肥皂!"
      width="300px"
      center
    >
      <div class="unlock-content">
        <div class="unlock-icon">🧼</div>
        <div class="unlock-name">{{ unlockedSkinLabel }}</div>
      </div>
      <template #footer>
        <el-button type="primary" @click="showUnlockDialog = false">
          太棒了！
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { useGamesStore } from '../../../stores/games'
import soundGenerator from '../../../utils/sound'
import vibrationHelper from '../../../utils/vibration'

const emit = defineEmits(['close'])

const gamesStore = useGamesStore()

// 皮肤配置
const SKIN_CONFIG = {
  default: {
    label: '经典白',
    colors: {
      main: '#F5F5DC',
      light: '#FFFEF0',
      dark: '#E8E4C9',
      inner: '#FFFACD',
    },
  },
  lavender: {
    label: '薰衣草紫',
    colors: {
      main: '#E6E6FA',
      light: '#F8F8FF',
      dark: '#D8BFD8',
      inner: '#DDA0DD',
    },
  },
  mint: {
    label: '薄荷绿',
    colors: {
      main: '#98FB98',
      light: '#F0FFF0',
      dark: '#90EE90',
      inner: '#7FFFD4',
    },
  },
  rose: {
    label: '玫瑰粉',
    colors: {
      main: '#FFB6C1',
      light: '#FFF0F5',
      dark: '#FF69B4',
      inner: '#FFC0CB',
    },
  },
}

// 状态
const gameContainer = ref(null)
const gameArea = ref(null)
const currentSoap = ref(null)
const soapId = ref(0) // 用于强制重新渲染
const currentSkin = ref('default')
const currentCombo = ref(0)
const isCutting = ref(false)
const cutStartPos = ref({ x: 0, y: 0 })
const cutEndPos = ref({ x: 0, y: 0 })
const showUnlockDialog = ref(false)
const unlockedSkinLabel = ref('')
const particles = ref([])
const activeSlashes = ref([])
const comboTimer = ref(null)
const startTime = ref(0)
let particleId = 0
let slashId = 0

// 计算属性
const progress = computed(() => gamesStore.getProgress('soap') || {
  stats: { totalCuts: 0, maxCombo: 0 },
  unlockedSkins: ['default'],
  currentSkin: 'default',
})

const availableSkins = computed(() =>
  Object.entries(SKIN_CONFIG).map(([name, config]) => ({
    name,
    label: config.label,
  }))
)

// 肥皂样式
const soapStyle = computed(() => {
  const config = SKIN_CONFIG[currentSkin.value]
  return {
    background: `linear-gradient(135deg, ${config.colors.light} 0%, ${config.colors.main} 50%, ${config.colors.dark} 100%)`,
    boxShadow: `
      0 10px 30px rgba(0, 0, 0, 0.15),
      inset 0 -5px 20px rgba(0, 0, 0, 0.05),
      inset 0 5px 20px rgba(255, 255, 255, 0.5)
    `,
  }
})

// 切割后两半的样式
const leftHalfStyle = computed(() => ({
  transform: currentSoap.value?.falling
    ? `translateX(-60px) translateY(100px) rotate(-15deg)`
    : 'translateX(-5px)',
  opacity: currentSoap.value?.falling ? 0 : 1,
}))

const rightHalfStyle = computed(() => ({
  transform: currentSoap.value?.falling
    ? `translateX(60px) translateY(100px) rotate(15deg)`
    : 'translateX(5px)',
  opacity: currentSoap.value?.falling ? 0 : 1,
}))

// 初始化肥皂
const initSoap = () => {
  soapId.value++ // 递增 ID 强制重新渲染
  currentSoap.value = {
    id: soapId.value,
    sliced: false,
    falling: false,
  }
  soundGenerator.playSoapAppear()
}

// 开始切割
const startCut = (e) => {
  if (currentSoap.value?.sliced) return

  isCutting.value = true
  const pos = getEventPosition(e)
  cutStartPos.value = pos
  cutEndPos.value = pos
}

// 切割中
const onCut = (e) => {
  if (!isCutting.value) return
  cutEndPos.value = getEventPosition(e)
}

// 结束切割
const endCut = (e) => {
  if (!isCutting.value) return
  isCutting.value = false

  // 检测是否有效切割（滑动距离足够）
  const dx = cutEndPos.value.x - cutStartPos.value.x
  const dy = cutEndPos.value.y - cutStartPos.value.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  if (distance > 50 && !currentSoap.value?.sliced) {
    performCut(cutStartPos.value, cutEndPos.value)
  }
}

// 获取事件位置
const getEventPosition = (e) => {
  if (e.touches && e.touches.length > 0) {
    const rect = gameArea.value.getBoundingClientRect()
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top,
    }
  }
  return {
    x: e.offsetX,
    y: e.offsetY,
  }
}

// 执行切割
const performCut = (start, end) => {
  if (!currentSoap.value || currentSoap.value.sliced) return

  // 播放切割音效和震动
  soundGenerator.playSlice()
  vibrationHelper.medium()

  // 标记已切割
  currentSoap.value.sliced = true

  // 添加刀痕效果
  addSlashEffect(start, end)

  // 生成泡沫粒子
  createParticles(start, end)

  // 更新连击
  currentCombo.value++
  resetComboTimer()

  // 记录进度
  const hasNewUnlock = gamesStore.recordCut(currentCombo.value)

  // 检查解锁
  if (hasNewUnlock) {
    showUnlockNotification()
  }

  // 延迟后让肥皂掉落并生成新的
  setTimeout(() => {
    if (currentSoap.value) {
      currentSoap.value.falling = true
      soundGenerator.playSoapFall()
    }
  }, 150)

  // 等掉落动画完成后再生成新肥皂（掉落动画400ms + 缓冲）
  setTimeout(() => {
    initSoap()
  }, 700)
}

// 添加刀痕效果
const addSlashEffect = (start, end) => {
  const angle = Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI
  const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))

  const slash = {
    id: slashId++,
    style: {
      left: `${start.x}px`,
      top: `${start.y}px`,
      width: `${length}px`,
      transform: `rotate(${angle}deg)`,
    },
  }

  activeSlashes.value.push(slash)

  // 移除刀痕
  setTimeout(() => {
    activeSlashes.value = activeSlashes.value.filter(s => s.id !== slash.id)
  }, 300)
}

// 生成泡沫粒子
const createParticles = (start, end) => {
  const midX = (start.x + end.x) / 2
  const midY = (start.y + end.y) / 2
  const count = 8 + Math.floor(Math.random() * 5)

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 50 + Math.random() * 100
    const size = 4 + Math.random() * 8

    const particle = {
      id: particleId++,
      style: {
        left: `${midX}px`,
        top: `${midY}px`,
        width: `${size}px`,
        height: `${size}px`,
        opacity: 1,
        transform: 'translate(-50%, -50%) scale(1)',
        transition: 'none',
      },
    }

    particles.value.push(particle)

    // 动画
    requestAnimationFrame(() => {
      const targetX = midX + Math.cos(angle) * speed
      const targetY = midY + Math.sin(angle) * speed

      particle.style = {
        ...particle.style,
        left: `${targetX}px`,
        top: `${targetY}px`,
        opacity: 0,
        transform: 'translate(-50%, -50%) scale(0.3)',
        transition: 'all 0.5s ease-out',
      }
    })

    // 移除粒子
    setTimeout(() => {
      particles.value = particles.value.filter(p => p.id !== particle.id)
    }, 500)
  }
}

// 重置连击计时器
const resetComboTimer = () => {
  if (comboTimer.value) {
    clearTimeout(comboTimer.value)
  }
  comboTimer.value = setTimeout(() => {
    currentCombo.value = 0
  }, 1500)
}

// 显示解锁通知
const showUnlockNotification = () => {
  const unlockedSkins = progress.value.unlockedSkins || ['default']
  const latestSkin = unlockedSkins[unlockedSkins.length - 1]
  if (latestSkin && SKIN_CONFIG[latestSkin]) {
    unlockedSkinLabel.value = SKIN_CONFIG[latestSkin].label
    showUnlockDialog.value = true
    soundGenerator.playUnlock()
    vibrationHelper.double()
  }
}

// 重置肥皂
const resetSoap = () => {
  // 记录本次游戏时长
  const playTime = Math.floor((Date.now() - startTime.value) / 1000)
  if (playTime > 0) {
    gamesStore.recordSession('soap', playTime)
  }

  soundGenerator.playReset()
  vibrationHelper.medium()
  startTime.value = Date.now()
  initSoap()
}

// 切换皮肤
const onSkinChange = (skinName) => {
  gamesStore.setCurrentSkin('soap', skinName)
  soundGenerator.playClick()
}

// 关闭游戏
const handleClose = () => {
  // 记录本次游戏时长
  const playTime = Math.floor((Date.now() - startTime.value) / 1000)
  if (playTime > 0) {
    gamesStore.recordSession('soap', playTime)
  }
  emit('close')
}

// 初始化
onMounted(() => {
  gamesStore.init()
  currentSkin.value = progress.value.currentSkin || 'default'
  startTime.value = Date.now()
  soapId.value = 0
  initSoap()
})

// 清理
onUnmounted(() => {
  if (comboTimer.value) {
    clearTimeout(comboTimer.value)
  }
})
</script>

<style scoped>
.soap-game {
  display: flex;
  flex-direction: column;
  min-height: 450px;
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  border-radius: 8px;
  overflow: hidden;
  user-select: none;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.skin-selector :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.5);
  box-shadow: none;
}

.game-area {
  flex: 1;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  cursor: crosshair;
  overflow: hidden;
}

/* 刀痕效果 */
.slash-effect {
  position: absolute;
  height: 3px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.9), transparent);
  transform-origin: left center;
  pointer-events: none;
  animation: slash-flash 0.3s ease-out forwards;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

@keyframes slash-flash {
  0% {
    opacity: 1;
    height: 3px;
  }
  100% {
    opacity: 0;
    height: 6px;
  }
}

/* 肥皂容器 */
.soap-container {
  position: relative;
  width: 180px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 完整肥皂 */
.soap-whole {
  width: 160px;
  height: 80px;
  border-radius: 20px;
  position: relative;
  transition: transform 0.1s ease;
}

.soap-container.cutting .soap-whole {
  transform: scale(0.98);
}

/* 肥皂内部高光 */
.soap-inner {
  position: absolute;
  top: 10%;
  left: 15%;
  width: 30%;
  height: 40%;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  filter: blur(5px);
}

.soap-shine {
  position: absolute;
  top: 5%;
  right: 15%;
  width: 20%;
  height: 20%;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  filter: blur(3px);
}

/* 切割后的两半 */
.soap-half {
  position: absolute;
  width: 85px;
  height: 80px;
  transition: all 0.4s ease-out;
  display: flex;
  justify-content: center;
  align-items: center;
}

.soap-left {
  left: 0;
  justify-content: flex-end;
}

.soap-right {
  right: 0;
  justify-content: flex-start;
}

.soap-piece {
  width: 80px;
  height: 80px;
  position: relative;
}

.soap-left .soap-piece {
  border-radius: 20px 0 0 20px;
}

.soap-right .soap-piece {
  border-radius: 0 20px 20px 0;
}

/* 切面效果 */
.soap-cut-surface {
  position: absolute;
  top: 0;
  width: 8px;
  height: 100%;
  background: linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1));
}

.soap-left .soap-cut-surface {
  right: 0;
}

.soap-right .soap-cut-surface {
  left: 0;
}

/* 泡沫粒子 */
.bubble-particle {
  position: absolute;
  background: radial-gradient(circle at 30% 30%, white, rgba(255, 255, 255, 0.5));
  border-radius: 50%;
  pointer-events: none;
}

.game-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.unlock-content {
  text-align: center;
  padding: 20px 0;
}

.unlock-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.unlock-name {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
}

/* 深色模式 */
.dark .soap-game {
  background: linear-gradient(135deg, #2d3a4a 0%, #4a3a5a 100%);
}

.dark .game-header,
.dark .game-footer {
  background: rgba(0, 0, 0, 0.2);
}

.dark .stat-label {
  color: #aaa;
}

.dark .stat-value {
  color: #fff;
}

.dark .slash-effect {
  background: linear-gradient(90deg, transparent, rgba(200, 200, 255, 0.9), transparent);
  box-shadow: 0 0 10px rgba(200, 200, 255, 0.8);
}

@media (max-width: 480px) {
  .soap-container {
    width: 150px;
    height: 90px;
  }

  .soap-whole {
    width: 130px;
    height: 65px;
  }

  .soap-half {
    width: 70px;
    height: 65px;
  }

  .soap-piece {
    width: 65px;
    height: 65px;
  }
}
</style>
