<template>
  <div class="mandala-game">
    <!-- 顶部信息栏 -->
    <div class="game-header">
      <div class="stats">
        <span class="stat-item">
          <span class="stat-label">进度</span>
          <span class="stat-value">{{ coloredCount }}/{{ totalRegions }}</span>
        </span>
        <span class="stat-item">
          <span class="stat-label">作品</span>
          <span class="stat-value">{{ progress.stats?.completedWorks || 0 }}</span>
        </span>
      </div>
      <div class="pattern-selector">
        <el-select
          v-model="currentCategory"
          size="small"
          placeholder="选择分类"
          @change="onCategoryChange"
        >
          <el-option
            v-for="category in availableCategories"
            :key="category.value"
            :label="category.label"
            :value="category.value"
          />
        </el-select>
        <el-select
          v-model="currentPattern"
          size="small"
          placeholder="选择图案"
          @change="onPatternChange"
        >
          <el-option
            v-for="pattern in filteredTemplates"
            :key="pattern.name"
            :label="pattern.label"
            :value="pattern.name"
            :disabled="!progress.unlockedSkins?.includes(pattern.name)"
          />
        </el-select>
      </div>
    </div>

    <!-- 涂色区域 -->
    <div class="coloring-area">
      <!-- SVG 曼陀罗图案 -->
      <svg
        viewBox="0 0 300 300"
        class="mandala-svg"
        :class="`pattern-${currentPattern}`"
      >
        <!-- 外圈 -->
        <circle
          v-for="(region, index) in outerRegions"
          :key="'outer-' + index"
          class="mandala-region"
          :class="{ colored: region.color, filled: region.color === currentColor }"
          :cx="region.cx"
          :cy="region.cy"
          :r="region.r"
          :style="{ fill: region.color || 'transparent' }"
          @click="fillRegion(region, 'outer', index)"
        />
        <!-- 中圈 -->
        <circle
          v-for="(region, index) in middleRegions"
          :key="'middle-' + index"
          class="mandala-region"
          :class="{ colored: region.color, filled: region.color === currentColor }"
          :cx="region.cx"
          :cy="region.cy"
          :r="region.r"
          :style="{ fill: region.color || 'transparent' }"
          @click="fillRegion(region, 'middle', index)"
        />
        <!-- 内圈 -->
        <circle
          v-for="(region, index) in innerRegions"
          :key="'inner-' + index"
          class="mandala-region"
          :class="{ colored: region.color, filled: region.color === currentColor }"
          :cx="region.cx"
          :cy="region.cy"
          :r="region.r"
          :style="{ fill: region.color || 'transparent' }"
          @click="fillRegion(region, 'inner', index)"
        />
        <!-- 中心 -->
        <circle
          class="mandala-center"
          :class="{ colored: centerRegion.color }"
          :cx="centerRegion.cx"
          :cy="centerRegion.cy"
          :r="centerRegion.r"
          :style="{ fill: centerRegion.color }"
          @click="fillRegion(centerRegion, 'center', 0)"
        />
      </svg>
    </div>

    <!-- 调色板 -->
    <div class="color-palette">
      <div class="palette-label">选择颜色</div>
      <div class="palette-colors">
        <div
          v-for="color in colors"
          :key="color"
          class="palette-color"
          :class="{ active: color === currentColor }"
          :style="{ backgroundColor: color }"
          @click="selectColor(color)"
        />
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button
        size="small"
        :disabled="!canUndo"
        @click="undo"
      >
        <el-icon><Back /></el-icon>
        撤销
      </el-button>
      <el-button
        size="small"
        :disabled="!canRedo"
        @click="redo"
      >
        <el-icon><Right /></el-icon>
        重做
      </el-button>
      <el-button
        size="small"
        @click="clearAll"
      type="danger"
      plain
      >
        <el-icon><Delete /></el-icon>
        清空
      </el-button>
    </div>

    <!-- 完成提示 -->
    <transition name="celebrate">
      <div v-if="showComplete" class="complete-overlay">
        <div class="complete-content">
          <div class="complete-icon">🎨</div>
          <div class="complete-text">作品完成！</div>
          <div class="complete-stats">
            <span>使用了 {{ usedColorsCount }} 种颜色</span>
          </div>
          <el-button type="primary" @click="startNewWork" size="large">
            新作品
          </el-button>
        </div>
      </div>
    </transition>

    <!-- 底部操作栏 -->
    <div class="game-footer">
      <el-button @click="handleClose">
        关闭
      </el-button>
    </div>

    <!-- 解锁提示 -->
    <el-dialog
      v-model="showUnlockDialog"
      title="解锁新图案!"
      width="300px"
      center
    >
      <div class="unlock-content">
        <div class="unlock-icon">🎉</div>
        <div class="unlock-name">{{ unlockedPatternLabel }}</div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Back, Right, Delete } from '@element-plus/icons-vue'
import { useGamesStore } from '../../../stores/games'
import soundGenerator from '../../../utils/sound'
import vibrationHelper from '../../../utils/vibration'

const emit = defineEmits(['close'])

const gamesStore = useGamesStore()

const TEMPLATE_CATEGORIES = {
  mandala: '曼陀罗',
  geometric: '几何',
  nature: '自然',
  sky: '星空',
  animal: '动物',
  advanced: '进阶',
}

// 图案配置
const PATTERN_CONFIG = {
  default: {
    category: 'mandala',
    label: '简单圆形',
    description: '基础曼陀罗图案',
    layout: {
      outer: { count: 8, distance: 96, radius: 18 },
      middle: { count: 8, distance: 60, radius: 16 },
      inner: { count: 4, distance: 28, radius: 12 },
      center: { cx: 150, cy: 150, r: 16 },
    },
  },
  lotus: {
    category: 'mandala',
    label: '莲花曼陀罗',
    description: '柔和的花瓣环形',
    layout: {
      outer: { count: 12, distance: 98, radius: 16 },
      middle: { count: 8, distance: 58, radius: 14 },
      inner: { count: 6, distance: 28, radius: 10 },
      center: { cx: 150, cy: 150, r: 14 },
    },
  },
  sunburst: {
    category: 'mandala',
    label: '日芒曼陀罗',
    description: '放射状层次纹样',
    layout: {
      outer: { count: 14, distance: 102, radius: 15 },
      middle: { count: 10, distance: 64, radius: 13 },
      inner: { count: 6, distance: 30, radius: 10 },
      center: { cx: 150, cy: 150, r: 14 },
    },
  },
  geometric: {
    category: 'geometric',
    label: '几何之美',
    description: '对称几何图案',
    layout: {
      outer: { count: 12, distance: 94, radius: 16 },
      middle: { count: 6, distance: 56, radius: 15 },
      inner: { count: 6, distance: 28, radius: 11 },
      center: { cx: 150, cy: 150, r: 14 },
    },
  },
  hexagon: {
    category: 'geometric',
    label: '六角拼图',
    description: '规则块面排列',
    layout: {
      outer: { count: 6, distance: 88, radius: 20 },
      middle: { count: 6, distance: 48, radius: 16 },
      inner: { count: 6, distance: 22, radius: 9 },
      center: { cx: 150, cy: 150, r: 14 },
    },
  },
  spiral: {
    category: 'geometric',
    label: '旋涡轨迹',
    description: '旋转感几何图形',
    layout: {
      outer: { count: 10, distance: 92, radius: 14, offset: 0.3 },
      middle: { count: 8, distance: 56, radius: 13, offset: 0.6 },
      inner: { count: 5, distance: 24, radius: 10, offset: 0.9 },
      center: { cx: 150, cy: 150, r: 12 },
    },
  },
  floral: {
    category: 'nature',
    label: '花朵绽放',
    description: '花瓣形图案',
    layout: {
      outer: { count: 10, distance: 96, radius: 18 },
      middle: { count: 8, distance: 58, radius: 14 },
      inner: { count: 5, distance: 25, radius: 10 },
      center: { cx: 150, cy: 150, r: 16 },
    },
  },
  moonstars: {
    category: 'sky',
    label: '月夜星辰',
    description: '月亮与星点构图',
    layout: {
      outer: {
        custom: [
          { cx: 90, cy: 86, r: 18 },
          { cx: 125, cy: 66, r: 11 },
          { cx: 170, cy: 78, r: 13 },
          { cx: 215, cy: 100, r: 10 },
          { cx: 110, cy: 220, r: 12 },
          { cx: 190, cy: 216, r: 16 },
        ],
      },
      middle: {
        custom: [
          { cx: 82, cy: 146, r: 12 },
          { cx: 216, cy: 154, r: 12 },
          { cx: 142, cy: 108, r: 10 },
          { cx: 162, cy: 196, r: 10 },
        ],
      },
      inner: {
        custom: [
          { cx: 132, cy: 152, r: 18 },
          { cx: 154, cy: 144, r: 18 },
          { cx: 170, cy: 166, r: 16 },
        ],
      },
      center: { cx: 150, cy: 150, r: 10 },
    },
  },
  fish: {
    category: 'animal',
    label: '游鱼图',
    description: '小鱼轮廓填色',
    layout: {
      outer: {
        custom: [
          { cx: 88, cy: 150, r: 14 },
          { cx: 112, cy: 128, r: 18 },
          { cx: 112, cy: 172, r: 18 },
          { cx: 146, cy: 118, r: 18 },
          { cx: 146, cy: 182, r: 18 },
          { cx: 184, cy: 128, r: 18 },
          { cx: 184, cy: 172, r: 18 },
          { cx: 220, cy: 150, r: 14 },
        ],
      },
      middle: {
        custom: [
          { cx: 118, cy: 150, r: 14 },
          { cx: 150, cy: 150, r: 16 },
          { cx: 182, cy: 150, r: 14 },
          { cx: 204, cy: 150, r: 10 },
        ],
      },
      inner: {
        custom: [
          { cx: 94, cy: 138, r: 9 },
          { cx: 94, cy: 162, r: 9 },
          { cx: 150, cy: 132, r: 9 },
          { cx: 150, cy: 168, r: 9 },
        ],
      },
      center: { cx: 198, cy: 140, r: 5 },
    },
  },
  complex: {
    category: 'advanced',
    label: '复杂精美',
    description: '多层复杂图案',
    layout: {
      outer: { count: 16, distance: 104, radius: 14 },
      middle: { count: 12, distance: 66, radius: 12 },
      inner: { count: 8, distance: 34, radius: 10 },
      center: { cx: 150, cy: 150, r: 13 },
    },
  },
}

// 颜色配置
const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F8B500', '#FF8C94', '#00CED1',
  '#E8E8E8', '#B8B8B8', '#A8E6CF', '#C4B5FD', '#FFD700',
]
const colors = COLORS

// 状态
const currentCategory = ref('mandala')
const currentPattern = ref('default')
const currentColor = ref('#4ECDC4')
const showUnlockDialog = ref(false)
const unlockedPatternLabel = ref('')
const showComplete = ref(false)
const startTime = ref(0)

// 区域颜色状态
const outerRegions = ref([])
const middleRegions = ref([])
const innerRegions = ref([])
const centerRegion = ref({ color: null })

// 历史记录（用于撤销/重做）
const history = ref([])
const historyIndex = ref(-1)

// 计算属性
const progress = computed(() => gamesStore.getProgress('mandala') || {
  stats: { totalColored: 0, completedWorks: 0 },
  unlockedSkins: ['default'],
  currentSkin: 'default',
})

const availableCategories = computed(() =>
  Object.entries(TEMPLATE_CATEGORIES).map(([value, label]) => ({ value, label }))
)

const filteredTemplates = computed(() =>
  Object.entries(PATTERN_CONFIG)
    .filter(([, config]) => config.category === currentCategory.value)
    .map(([name, config]) => ({
      name,
      label: config.label,
    }))
)

const totalRegions = computed(() => {
  return (
    outerRegions.value.length +
    middleRegions.value.length +
    innerRegions.value.length +
    (centerRegion.value?.r ? 1 : 0)
  )
})

const coloredCount = computed(() => {
  let count = 0
  outerRegions.value.forEach(r => { if (r.color) count++ })
  middleRegions.value.forEach(r => { if (r.color) count++ })
  innerRegions.value.forEach(r => { if (r.color) count++ })
  if (centerRegion.value.color) count++
  return count
})

const usedColorsCount = computed(() => {
  const usedColors = new Set()
  outerRegions.value.forEach(r => { if (r.color) usedColors.add(r.color) })
  middleRegions.value.forEach(r => { if (r.color) usedColors.add(r.color) })
  innerRegions.value.forEach(r => { if (r.color) usedColors.add(r.color) })
  if (centerRegion.value.color) usedColors.add(centerRegion.value.color)
  return usedColors.size
})

const canUndo = computed(() => historyIndex.value >= 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

const createRingRegions = (count, distance, regionRadius, offset = 0) =>
  Array.from({ length: count }, (_, index) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2 + offset
    return {
      color: null,
      cx: 150 + Math.cos(angle) * distance,
      cy: 150 + Math.sin(angle) * distance,
      r: regionRadius,
    }
  })

const createRegions = (config) => {
  if (config.custom) {
    return config.custom.map((region) => ({ color: null, ...region }))
  }

  return createRingRegions(config.count, config.distance, config.radius, config.offset || 0)
}

// 初始化图案
const initPattern = () => {
  const config = PATTERN_CONFIG[currentPattern.value]

  outerRegions.value = createRegions(config.layout.outer)
  middleRegions.value = createRegions(config.layout.middle)
  innerRegions.value = createRegions(config.layout.inner)
  centerRegion.value = { color: null, ...config.layout.center }

  history.value = []
  historyIndex.value = -1
}

// 填充颜色
const fillRegion = (region, type, index) => {
  if (region.color === currentColor.value) {
    // 如果点击已填充的区域，清除颜色
    saveToHistory()
    region.color = null
  } else {
    saveToHistory()
    region.color = currentColor.value
    soundGenerator.playColorFill()
    vibrationHelper.short()
  }

  checkCompletion()
}

// 保存到历史
const saveToHistory = () => {
  // 删除当前位置之后的历史
  history.value = history.value.slice(0, historyIndex.value + 1)

  // 保存当前状态
  history.value.push({
    outer: outerRegions.value.map(r => ({ ...r })),
    middle: middleRegions.value.map(r => ({ ...r })),
    inner: innerRegions.value.map(r => ({ ...r })),
    center: { ...centerRegion.value },
  })

  historyIndex.value = history.value.length - 1
}

// 撤销
const undo = () => {
  if (historyIndex.value > 0) {
    historyIndex.value--
    restoreFromHistory()
    soundGenerator.playClick()
  }
}

// 重做
const redo = () => {
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++
    restoreFromHistory()
    soundGenerator.playClick()
  }
}

// 从历史恢复
const restoreFromHistory = () => {
  const state = history.value[historyIndex.value]
  if (state) {
    outerRegions.value = state.outer.map(r => ({ ...r }))
    middleRegions.value = state.middle.map(r => ({ ...r }))
    innerRegions.value = state.inner.map(r => ({ ...r }))
    centerRegion.value = { ...state.center }
  }
}

// 清空
const clearAll = () => {
  saveToHistory()
  initPattern()
  soundGenerator.playReset()
  vibrationHelper.medium()
}

// 选择颜色
const selectColor = (color) => {
  currentColor.value = color
  soundGenerator.playClick()
}

// 检查完成
const checkCompletion = () => {
  if (coloredCount.value === totalRegions.value) {
    showComplete.value = true
    soundGenerator.playColoringComplete()
    vibrationHelper.double()

    // 记录进度
    const hasNewUnlock = gamesStore.recordColoring(coloredCount.value)

    if (hasNewUnlock) {
      setTimeout(() => showUnlockNotification(), 1000)
    }
  }
}

// 显示解锁通知
const showUnlockNotification = () => {
  const unlockedSkins = progress.value.unlockedSkins || ['default']
  const latestSkin = unlockedSkins[unlockedSkins.length - 1]
  if (latestSkin && PATTERN_CONFIG[latestSkin]) {
    unlockedPatternLabel.value = PATTERN_CONFIG[latestSkin].label
    showUnlockDialog.value = true
    soundGenerator.playUnlock()
    vibrationHelper.double()
  }
}

// 开始新作品
const startNewWork = () => {
  showComplete.value = false
  initPattern()
}

// 切换图案
const onPatternChange = (patternName) => {
  currentPattern.value = patternName
  currentCategory.value = PATTERN_CONFIG[patternName]?.category || currentCategory.value
  gamesStore.setCurrentSkin('mandala', patternName)
  initPattern()
  soundGenerator.playClick()
}

const onCategoryChange = (categoryName) => {
  currentCategory.value = categoryName
  const firstAvailable = filteredTemplates.value.find((template) =>
    progress.value.unlockedSkins?.includes(template.name)
  ) || filteredTemplates.value[0]

  if (firstAvailable) {
    onPatternChange(firstAvailable.name)
  }
}

// 关闭游戏
const handleClose = () => {
  const playTime = Math.floor((Date.now() - startTime.value) / 1000)
  if (playTime > 0) {
    gamesStore.recordSession('mandala', playTime)
  }
  emit('close')
}

// 初始化
onMounted(() => {
  gamesStore.init()
  currentPattern.value = progress.value.currentSkin || 'default'
  currentCategory.value = PATTERN_CONFIG[currentPattern.value]?.category || 'mandala'
  startTime.value = Date.now()
  initPattern()
})
</script>

<style scoped>
.mandala-game {
  display: flex;
  flex-direction: column;
  min-height: 500px;
  background: linear-gradient(135deg, #faf5ff 0%, #f0e6ff 100%);
  border-radius: 8px;
  overflow: hidden;
  user-select: none;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
}

.stats{
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-label {
  font-size: 11px;
  color: #666;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.pattern-selector :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.6);
  box-shadow: none;
}

/* 涂色区域 */
.coloring-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.mandala-svg {
  width: 280px;
  height: 280px;
  filter: drop-shadow(0 4px 20px rgba(0, 0, 0, 0.1));
}

.mandala-region {
  cursor: pointer;
  transition: all 0.2s ease;
  stroke: #e0e0e0;
  stroke-width: 2;
}

.mandala-region:hover {
  filter: brightness(1.1);
  stroke-width: 3;
}

.mandala-region.filled {
  stroke: rgba(0, 0, 0, 0.1);
}

.mandala-center {
  cursor: pointer;
  transition: all 0.2s ease;
  stroke: #e0e0e0;
  stroke-width: 2;
}

.mandala-center:hover {
  filter: brightness(1.1);
}

/* 调色板 */
.color-palette {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
}

.palette-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  text-align: center;
}

.palette-colors {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.palette-color {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 3px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.palette-color:hover {
  transform: scale(1.15);
}

.palette-color.active {
  border-color: #333;
  transform: scale(1.1);
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
}

/* 完成弹窗 */
.complete-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  border-radius: 8px;
}

.complete-content {
  background: white;
  padding: 32px;
  border-radius: 16px;
  text-align: center;
}

.complete-icon {
  font-size: 48px;
  margin-bottom: 16px;
  animation: spin 1s ease;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.complete-text {
  font-size: 24px;
  font-weight: bold;
  color: #9c27b0;
  margin-bottom: 8px;
}

.complete-stats {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.celebrate-enter-active,
.celebrate-leave-active {
  transition: opacity 0.3s ease;
}

.celebrate-enter-from,
.celebrate-leave-to {
  opacity: 0;
}

/* 底部操作栏 */
.game-footer {
  display: flex;
  justify-content: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.5);
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
  color: #9c27b0;
}

/* 深色模式 */
:global(.dark) .mandala-game {
  background: linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 100%);
}

:global(.dark) .game-header,
:global(.dark) .color-palette,
:global(.dark) .toolbar,
:global(.dark) .game-footer {
  background: rgba(0, 0, 0, 0.3);
}

:global(.dark) .stat-label,
:global(.dark) .palette-label {
  color: #aaa;
}

:global(.dark) .stat-value {
  color: #fff;
}

:global(.dark) .mandala-region,
:global(.dark) .mandala-center {
  stroke: rgba(255, 255, 255, 0.3);
}

:global(.dark) .palette-color {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

:global(.dark) .palette-color.active {
  border-color: #fff;
}

:global(.dark) .complete-content {
  background: #2d1b4e;
}

:global(.dark) .complete-text,
:global(.dark) .complete-stats {
  color: #fff;
}

:global(.dark) .complete-text {
  color: #ce93d8;
}

:global(.dark) .pattern-selector :deep(.el-input__wrapper) {
  background: rgba(0, 0, 0, 0.3);
}

:global(.dark) .pattern-selector :deep(.el-input__inner) {
  color: #fff;
}

@media (max-width: 480px) {
  .mandala-svg {
    width: 240px;
    height: 240px;
  }

  .palette-color {
    width: 28px;
    height: 28px;
  }
}
</style>
