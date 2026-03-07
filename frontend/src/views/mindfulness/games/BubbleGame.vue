<template>
  <div class="bubble-game">
    <!-- 顶部信息栏 -->
    <div class="game-header">
      <div class="stats">
        <span class="stat-item">
          <span class="stat-label">总数</span>
          <span class="stat-value">{{ progress.stats?.totalPops || 0 }}</span>
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
          placeholder="选择皮肤"
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

    <!-- 泡泡网格 -->
    <div class="bubble-grid" :class="`skin-${currentSkin}`">
      <div
        v-for="(bubble, index) in bubbles"
        :key="index"
        class="bubble"
        :class="{ popped: bubble.popped, pressing: bubble.pressing }"
        :style="getBubbleStyle(index)"
        @mousedown="startPress(index)"
        @mouseup="endPress(index)"
        @mouseleave="cancelPress(index)"
        @touchstart.prevent="startPress(index)"
        @touchend="endPress(index)"
      >
        <span v-if="!bubble.popped" class="bubble-inner"></span>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="game-footer">
      <el-button type="primary" @click="resetBubbles">
        <el-icon><Refresh /></el-icon>
        重置泡泡
      </el-button>
      <el-button @click="handleClose">
        关闭
      </el-button>
    </div>

    <!-- 解锁提示 -->
    <el-dialog
      v-model="showUnlockDialog"
      title="解锁新皮肤!"
      width="300px"
      center
    >
      <div class="unlock-content">
        <div class="unlock-icon">🎉</div>
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
    label: '经典',
    colors: ['rgba(173, 216, 230, 0.8)', 'rgba(135, 206, 250, 0.8)'],
  },
  rainbow: {
    label: '彩虹泡泡',
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'],
  },
  starry: {
    label: '星空泡泡',
    colors: ['#1a1a2e', '#16213e', '#0f3460'],
    glow: true,
  },
}

// 状态
const bubbles = ref([])
const currentCombo = ref(0)
const currentSkin = ref('default')
const showUnlockDialog = ref(false)
const unlockedSkinLabel = ref('')
const pressTimers = reactive({})
const comboTimer = ref(null)
const startTime = ref(0)

// 游戏配置
const ROWS = 6
const COLS = 8
const TOTAL_BUBBLES = ROWS * COLS

// 计算属性
const progress = computed(() => gamesStore.getProgress('bubble') || {
  stats: { totalPops: 0, maxCombo: 0 },
  unlockedSkins: ['default'],
  currentSkin: 'default',
})

const availableSkins = computed(() =>
  Object.entries(SKIN_CONFIG).map(([name, config]) => ({
    name,
    label: config.label,
  }))
)

// 初始化泡泡
const initBubbles = () => {
  bubbles.value = Array(TOTAL_BUBBLES).fill(null).map(() => ({
    popped: false,
    pressing: false,
  }))
  currentCombo.value = 0
  startTime.value = Date.now()
}

// 获取泡泡样式
const getBubbleStyle = (index) => {
  const skinConfig = SKIN_CONFIG[currentSkin.value]
  let bgColor

  if (currentSkin.value === 'rainbow') {
    bgColor = skinConfig.colors[index % skinConfig.colors.length]
  } else if (currentSkin.value === 'starry') {
    bgColor = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), ${skinConfig.colors[index % skinConfig.colors.length]})`
  } else {
    bgColor = `radial-gradient(circle at 30% 30%, ${skinConfig.colors[0]}, ${skinConfig.colors[1]})`
  }

  const style = {
    backgroundColor: bgColor,
  }

  if (skinConfig.glow) {
    style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.2)'
  }

  return style
}

// 开始按压
const startPress = (index) => {
  if (bubbles.value[index].popped) return

  bubbles.value[index].pressing = true

  // 长按检测（300ms）
  pressTimers[index] = setTimeout(() => {
    popBubble(index)
  }, 300)
}

// 结束按压
const endPress = (index) => {
  if (pressTimers[index]) {
    clearTimeout(pressTimers[index])
    delete pressTimers[index]
  }

  if (bubbles.value[index].popped) return

  bubbles.value[index].pressing = false

  // 快速点击
  popBubble(index)
}

// 取消按压
const cancelPress = (index) => {
  if (pressTimers[index]) {
    clearTimeout(pressTimers[index])
    delete pressTimers[index]
  }
  if (!bubbles.value[index].popped) {
    bubbles.value[index].pressing = false
  }
}

// 爆破泡泡
const popBubble = (index) => {
  if (bubbles.value[index].popped) return

  bubbles.value[index].popped = true
  bubbles.value[index].pressing = false

  // 播放音效和震动
  soundGenerator.playPop()
  vibrationHelper.short()

  // 更新连击
  currentCombo.value++
  resetComboTimer()

  // 记录进度
  const hasNewUnlock = gamesStore.recordPop('bubble', currentCombo.value)

  // 检查解锁
  if (hasNewUnlock) {
    showUnlockNotification()
  }
}

// 重置连击计时器
const resetComboTimer = () => {
  if (comboTimer.value) {
    clearTimeout(comboTimer.value)
  }
  comboTimer.value = setTimeout(() => {
    currentCombo.value = 0
  }, 1000)
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

// 重置泡泡
const resetBubbles = () => {
  // 记录本次游戏时长
  const playTime = Math.floor((Date.now() - startTime.value) / 1000)
  if (playTime > 0) {
    gamesStore.recordSession('bubble', playTime)
  }

  soundGenerator.playReset()
  vibrationHelper.medium()
  initBubbles()
}

// 切换皮肤
const onSkinChange = (skinName) => {
  gamesStore.setCurrentSkin('bubble', skinName)
  soundGenerator.playClick()
}

// 关闭游戏
const handleClose = () => {
  // 记录本次游戏时长
  const playTime = Math.floor((Date.now() - startTime.value) / 1000)
  if (playTime > 0) {
    gamesStore.recordSession('bubble', playTime)
  }
  emit('close')
}

// 初始化
onMounted(() => {
  gamesStore.init()
  currentSkin.value = progress.value.currentSkin || 'default'
  initBubbles()
})

// 清理
onUnmounted(() => {
  if (comboTimer.value) {
    clearTimeout(comboTimer.value)
  }
  Object.values(pressTimers).forEach(timer => clearTimeout(timer))
})
</script>

<style scoped>
.bubble-game {
  display: flex;
  flex-direction: column;
  min-height: 400px;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  color: white;
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
  opacity: 0.8;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}

.skin-selector :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: none;
}

.skin-selector :deep(.el-input__inner) {
  color: white;
}

.bubble-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(6, 1fr);
  gap: 8px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.bubble {
  position: relative;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.15s ease;
  aspect-ratio: 1;
}

.bubble:not(.popped):hover {
  transform: scale(1.05);
}

.bubble.pressing:not(.popped) {
  transform: scale(0.9);
  opacity: 0.8;
}

.bubble.popped {
  background: rgba(255, 255, 255, 0.1) !important;
  cursor: default;
  box-shadow: none !important;
}

.bubble-inner {
  position: absolute;
  top: 15%;
  left: 20%;
  width: 30%;
  height: 30%;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
}

/* 星空皮肤特效 */
.skin-starry .bubble:not(.popped) {
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.2);
}

.game-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
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

@media (max-width: 480px) {
  .bubble-grid {
    gap: 4px;
    padding: 8px;
  }

  .bubble-inner {
    display: none;
  }
}
</style>
