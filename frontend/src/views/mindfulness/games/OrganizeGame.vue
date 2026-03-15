<template>
  <div class="organize-game">
    <!-- 顶部信息栏 -->
    <div class="game-header">
      <div class="stats">
        <span class="stat-item">
          <span class="stat-label">已整理</span>
          <span class="stat-value">{{ organizedCount }}/{{ totalItems }}</span>
        </span>
        <span class="stat-item">
          <span class="stat-label">总计</span>
          <span class="stat-value">{{ progress.stats?.totalOrganized || 0 }}</span>
        </span>
      </div>
      <div class="skin-selector">
        <el-select
          v-model="currentSkin"
          size="small"
          placeholder="选择主题"
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
    <div class="game-area" :class="`skin-${currentSkin}`">
      <!-- 冰箱 -->
      <div class="fridge">
        <!-- 门侧区域（酱料区） -->
        <div class="fridge-door">
          <div class="zone-label">🫙 酱料</div>
          <div class="door-shelves">
            <div
              v-for="(slot, index) in doorSlots"
              :key="'door-' + index"
              class="door-slot drop-zone"
              :class="{ correct: slot.correct, wrong: slot.wrong }"
              :data-zone="'door'"
              :data-index="index"
              @dragover.prevent
              @drop="onDrop($event, 'door', index)"
            >
              <div
                v-if="slot.item"
                class="item placed"
                :style="getItemStyle(slot.item)"
                draggable="false"
              >
                {{ slot.item.emoji }}
              </div>
            </div>
          </div>
        </div>

        <!-- 主体区域 -->
        <div class="fridge-main">
          <!-- 上层：饮料区 -->
          <div class="fridge-shelf shelf-top">
            <div class="zone-label">🥤 饮料</div>
            <div class="shelf-content">
              <div
                v-for="(slot, index) in topShelfSlots"
                :key="'top-' + index"
                class="shelf-slot drop-zone"
                :class="{ correct: slot.correct, wrong: slot.wrong }"
                :data-zone="'top'"
                :data-index="index"
                @dragover.prevent
                @drop="onDrop($event, 'top', index)"
              >
                <div
                  v-if="slot.item"
                  class="item placed"
                  :style="getItemStyle(slot.item)"
                  draggable="false"
                >
                  {{ slot.item.emoji }}
                </div>
              </div>
            </div>
          </div>

          <!-- 中层：食物区 -->
          <div class="fridge-shelf shelf-middle">
            <div class="zone-label">🍱 食物</div>
            <div class="shelf-content">
              <div
                v-for="(slot, index) in middleShelfSlots"
                :key="'middle-' + index"
                class="shelf-slot drop-zone"
                :class="{ correct: slot.correct, wrong: slot.wrong }"
                :data-zone="'middle'"
                :data-index="index"
                @dragover.prevent
                @drop="onDrop($event, 'middle', index)"
              >
                <div
                  v-if="slot.item"
                  class="item placed"
                  :style="getItemStyle(slot.item)"
                  draggable="false"
                >
                  {{ slot.item.emoji }}
                </div>
              </div>
            </div>
          </div>

          <!-- 下层：蔬菜水果区 -->
          <div class="fridge-shelf shelf-bottom">
            <div class="zone-label">🥬 蔬果</div>
            <div class="shelf-content drawer">
              <div
                v-for="(slot, index) in bottomShelfSlots"
                :key="'bottom-' + index"
                class="shelf-slot drop-zone"
                :class="{ correct: slot.correct, wrong: slot.wrong }"
                :data-zone="'bottom'"
                :data-index="index"
                @dragover.prevent
                @drop="onDrop($event, 'bottom', index)"
              >
                <div
                  v-if="slot.item"
                  class="item placed"
                  :style="getItemStyle(slot.item)"
                  draggable="false"
                >
                  {{ slot.item.emoji }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 待整理物品区 -->
      <div class="items-area">
        <div class="items-label">待整理物品</div>
        <div class="items-container">
          <div
            v-for="item in unplacedItems"
            :key="item.id"
            class="item draggable"
            :style="getItemStyle(item)"
            :draggable="true"
            @dragstart="onDragStart($event, item)"
            @dragend="onDragEnd"
          >
            {{ item.emoji }}
          </div>
        </div>
      </div>
    </div>

    <!-- 完成提示 -->
    <transition name="celebrate">
      <div v-if="showComplete" class="complete-overlay">
        <div class="complete-content">
          <div class="complete-icon">✨</div>
          <div class="complete-text">整理完成！</div>
          <el-button type="primary" @click="startNewRound" size="large">
            再来一局
          </el-button>
        </div>
      </div>
    </transition>

    <!-- 底部操作栏 -->
    <div class="game-footer">
      <el-button type="primary" @click="shuffleItems">
        <el-icon><Refresh /></el-icon>
        重新打乱
      </el-button>
      <el-button @click="handleClose">
        关闭
      </el-button>
    </div>

    <!-- 解锁提示 -->
    <el-dialog
      v-model="showUnlockDialog"
      title="解锁新主题!"
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { useGamesStore } from '../../../stores/games'
import soundGenerator from '../../../utils/sound'
import vibrationHelper from '../../../utils/vibration'

const emit = defineEmits(['close'])

const gamesStore = useGamesStore()

// 皮肤配置
const SKIN_CONFIG = {
  default: {
    label: '家用冰箱',
    fridgeBg: '#f8f9fa',
    shelfBg: '#ffffff',
    border: '#e0e0e0',
  },
  retro: {
    label: '复古绿',
    fridgeBg: '#2d5a4a',
    shelfBg: '#3d7a6a',
    border: '#1d4a3a',
  },
  modern: {
    label: '现代银',
    fridgeBg: '#c0c0c0',
    shelfBg: '#e8e8e8',
    border: '#a0a0a0',
  },
  cute: {
    label: '可爱粉',
    fridgeBg: '#ffb6c1',
    shelfBg: '#fff0f5',
    border: '#ff69b4',
  },
}

// 物品配置 - 按区域分类
const ITEM_CONFIG = {
  top: [ // 饮料区
    { emoji: '🥤', name: '可乐', size: 'tall' },
    { emoji: '🧃', name: '果汁', size: 'medium' },
    { emoji: '🍼', name: '牛奶', size: 'tall' },
    { emoji: '🍺', name: '啤酒', size: 'tall' },
    { emoji: '🫗', name: '水瓶', size: 'tall' },
    { emoji: '🍵', name: '茶饮', size: 'medium' },
  ],
  middle: [ // 食物区
    { emoji: '🍱', name: '便当', size: 'large' },
    { emoji: '🥡', name: '外卖', size: 'large' },
    { emoji: '🍰', name: '蛋糕', size: 'medium' },
    { emoji: '🍕', name: '披萨', size: 'large' },
    { emoji: '🍜', name: '面条', size: 'medium' },
    { emoji: '🥪', name: '三明治', size: 'medium' },
    { emoji: '🍣', name: '寿司', size: 'medium' },
  ],
  bottom: [ // 蔬果区
    { emoji: '🥬', name: '白菜', size: 'large' },
    { emoji: '🥕', name: '胡萝卜', size: 'medium' },
    { emoji: '🍅', name: '番茄', size: 'medium' },
    { emoji: '🥒', name: '黄瓜', size: 'medium' },
    { emoji: '🍎', name: '苹果', size: 'medium' },
    { emoji: '🍊', name: '橙子', size: 'medium' },
    { emoji: '🍇', name: '葡萄', size: 'small' },
    { emoji: '🍓', name: '草莓', size: 'small' },
  ],
  door: [ // 门侧酱料区
    { emoji: '🫙', name: '果酱', size: 'small' },
    { emoji: '🍯', name: '蜂蜜', size: 'small' },
    { emoji: '🧈', name: '黄油', size: 'small' },
    { emoji: '🥫', name: '罐头', size: 'small' },
    { emoji: '🧴', name: '酱料', size: 'small' },
  ],
}

// 状态
const currentSkin = ref('default')
const showUnlockDialog = ref(false)
const unlockedSkinLabel = ref('')
const showComplete = ref(false)
const startTime = ref(0)

// 槽位状态
const topShelfSlots = ref([])
const middleShelfSlots = ref([])
const bottomShelfSlots = ref([])
const doorSlots = ref([])
const unplacedItems = ref([])

// 拖拽状态
const draggingItem = ref(null)

// 计算属性
const progress = computed(() => gamesStore.getProgress('organize') || {
  stats: { totalOrganized: 0, completedRounds: 0 },
  unlockedSkins: ['default'],
  currentSkin: 'default',
})

const availableSkins = computed(() =>
  Object.entries(SKIN_CONFIG).map(([name, config]) => ({
    name,
    label: config.label,
  }))
)

const totalItems = computed(() => {
  return unplacedItems.value.length +
    topShelfSlots.value.filter(s => s.item).length +
    middleShelfSlots.value.filter(s => s.item).length +
    bottomShelfSlots.value.filter(s => s.item).length +
    doorSlots.value.filter(s => s.item).length
})

const organizedCount = computed(() => {
  let count = 0
  count += topShelfSlots.value.filter(s => s.correct).length
  count += middleShelfSlots.value.filter(s => s.correct).length
  count += bottomShelfSlots.value.filter(s => s.correct).length
  count += doorSlots.value.filter(s => s.correct).length
  return count
})

// 初始化槽位
const initSlots = () => {
  // 上层4个槽位
  topShelfSlots.value = Array(4).fill(null).map(() => ({ item: null, correct: false, wrong: false }))
  // 中层4个槽位
  middleShelfSlots.value = Array(4).fill(null).map(() => ({ item: null, correct: false, wrong: false }))
  // 下层6个槽位
  bottomShelfSlots.value = Array(6).fill(null).map(() => ({ item: null, correct: false, wrong: false }))
  // 门侧4个槽位
  doorSlots.value = Array(4).fill(null).map(() => ({ item: null, correct: false, wrong: false }))
}

// 生成随机物品
const generateItems = () => {
  unplacedItems.value = []
  let itemId = 0

  // 从每个区域随机选一些物品
  const pickItems = (zone, count) => {
    const items = [...ITEM_CONFIG[zone]]
    for (let i = 0; i < count && items.length > 0; i++) {
      const randIndex = Math.floor(Math.random() * items.length)
      const item = items.splice(randIndex, 1)[0]
      unplacedItems.value.push({
        id: itemId++,
        ...item,
        correctZone: zone,
      })
    }
  }

  pickItems('top', 2)
  pickItems('middle', 2)
  pickItems('bottom', 3)
  pickItems('door', 2)

  // 打乱顺序
  unplacedItems.value.sort(() => Math.random() - 0.5)
}

// 获取物品样式
const getItemStyle = (item) => {
  const sizeMap = {
    small: { width: '28px', height: '28px', fontSize: '16px' },
    medium: { width: '36px', height: '36px', fontSize: '20px' },
    large: { width: '44px', height: '44px', fontSize: '24px' },
    tall: { width: '28px', height: '44px', fontSize: '18px' },
  }
  return sizeMap[item.size] || sizeMap.medium
}

// 拖拽开始
const onDragStart = (e, item) => {
  draggingItem.value = item
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', item.id.toString())
  e.target.style.opacity = '0.5'
  soundGenerator.playPickup()
}

// 拖拽结束
const onDragEnd = (e) => {
  e.target.style.opacity = '1'
  draggingItem.value = null
}

// 放置物品
const onDrop = (e, zone, index) => {
  e.preventDefault()

  if (!draggingItem.value) return

  const item = draggingItem.value
  const slots = getSlotsByZone(zone)

  // 检查槽位是否已有物品
  if (slots[index].item) {
    // 槽位已占用，物品返回
    slots[index].wrong = true
    setTimeout(() => { slots[index].wrong = false }, 500)
    soundGenerator.playPlaceWrong()
    vibrationHelper.short()
    return
  }

  // 检查是否放对区域
  const isCorrect = item.correctZone === zone

  // 放置物品
  slots[index].item = item
  slots[index].correct = isCorrect
  slots[index].wrong = !isCorrect

  // 从待整理区移除
  unplacedItems.value = unplacedItems.value.filter(i => i.id !== item.id)

  if (isCorrect) {
    soundGenerator.playPlaceCorrect()
    vibrationHelper.short()
  } else {
    soundGenerator.playPlaceWrong()
    vibrationHelper.medium()
    setTimeout(() => { slots[index].wrong = false }, 500)
  }

  // 清除拖拽状态
  draggingItem.value = null

  // 检查是否全部完成
  checkCompletion()
}

// 获取区域槽位
const getSlotsByZone = (zone) => {
  switch (zone) {
    case 'top': return topShelfSlots.value
    case 'middle': return middleShelfSlots.value
    case 'bottom': return bottomShelfSlots.value
    case 'door': return doorSlots.value
    default: return []
  }
}

// 检查是否完成
const checkCompletion = () => {
  if (unplacedItems.value.length === 0) {
    // 所有物品都放好了
    const allCorrect =
      topShelfSlots.value.every(s => !s.item || s.correct) &&
      middleShelfSlots.value.every(s => !s.item || s.correct) &&
      bottomShelfSlots.value.every(s => !s.item || s.correct) &&
      doorSlots.value.every(s => !s.item || s.correct)

    if (allCorrect) {
      // 完美完成！
      showComplete.value = true
      soundGenerator.playOrganizeComplete()
      vibrationHelper.double()

      // 记录进度
      const organizedCount = topShelfSlots.value.filter(s => s.item).length +
        middleShelfSlots.value.filter(s => s.item).length +
        bottomShelfSlots.value.filter(s => s.item).length +
        doorSlots.value.filter(s => s.item).length

      const hasNewUnlock = gamesStore.recordOrganize(organizedCount)

      if (hasNewUnlock) {
        setTimeout(() => showUnlockNotification(), 1000)
      }
    }
  }
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

// 开始新一局
const startNewRound = () => {
  showComplete.value = false
  initSlots()
  generateItems()
  startTime.value = Date.now()
}

// 重新打乱
const shuffleItems = () => {
  // 收集所有已放置的物品
  const items = []

  const collectItems = (slots) => {
    slots.forEach(s => {
      if (s.item) {
        items.push(s.item)
        s.item = null
        s.correct = false
        s.wrong = false
      }
    })
  }

  collectItems(topShelfSlots.value)
  collectItems(middleShelfSlots.value)
  collectItems(bottomShelfSlots.value)
  collectItems(doorSlots.value)

  // 合并待整理物品并打乱
  unplacedItems.value = [...unplacedItems.value, ...items]
  unplacedItems.value.sort(() => Math.random() - 0.5)

  soundGenerator.playReset()
  vibrationHelper.medium()
}

// 切换皮肤
const onSkinChange = (skinName) => {
  gamesStore.setCurrentSkin('organize', skinName)
  soundGenerator.playClick()
}

// 关闭游戏
const handleClose = () => {
  const playTime = Math.floor((Date.now() - startTime.value) / 1000)
  if (playTime > 0) {
    gamesStore.recordSession('organize', playTime)
  }
  emit('close')
}

// 初始化
onMounted(() => {
  gamesStore.init()
  currentSkin.value = progress.value.currentSkin || 'default'
  startTime.value = Date.now()
  initSlots()
  generateItems()
})
</script>

<style scoped>
.organize-game {
  display: flex;
  flex-direction: column;
  min-height: 500px;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
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

.stats {
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
  color: var(--color-text-secondary);
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.skin-selector :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.6);
  box-shadow: none;
}

.game-area {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 16px;
  overflow: auto;
}

/* 冰箱样式 */
.fridge {
  flex: 1;
  display: flex;
  gap: 8px;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 12px;
  box-shadow:
    inset 0 2px 10px rgba(0, 0, 0, 0.1),
    0 4px 20px rgba(0, 0, 0, 0.1);
}

.fridge-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fridge-door {
  width: 80px;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  padding: 8px;
}

.door-shelves {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.door-slot {
  flex: 1;
  min-height: 40px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  border: 2px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.door-slot:hover {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
}

.fridge-shelf {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  padding: 8px;
}

.shelf-content {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 4px;
}

.shelf-content.drawer {
  background: rgba(200, 230, 201, 0.3);
  border-radius: 6px;
}

.shelf-slot {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  border: 2px dashed #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.shelf-slot:hover {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
}

.drop-zone.correct {
  border-color: #4caf50 !important;
  border-style: solid !important;
  background: rgba(76, 175, 80, 0.2) !important;
  animation: correct-pulse 0.3s ease;
}

.drop-zone.wrong {
  border-color: #f44336 !important;
  border-style: solid !important;
  background: rgba(244, 67, 54, 0.2) !important;
  animation: wrong-shake 0.3s ease;
}

@keyframes correct-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes wrong-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.zone-label {
  font-size: 10px;
  color: var(--color-text-muted);
  margin-bottom: 4px;
}

/* 物品样式 */
.items-area {
  width: 120px;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 12px;
}

.items-label {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
  text-align: center;
}

.items-container {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 8px;
  justify-content: center;
}

.item {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.item.draggable {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: grab;
}

.item.draggable:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.item.draggable:active {
  cursor: grabbing;
}

.item.placed {
  pointer-events: none;
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
  background: var(--color-bg-card);
  padding: 32px;
  border-radius: 16px;
  text-align: center;
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-lg);
}

.complete-icon {
  font-size: 48px;
  margin-bottom: 16px;
  animation: bounce 0.5s ease infinite alternate;
}

@keyframes bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-10px); }
}

.complete-text {
  font-size: 24px;
  font-weight: bold;
  color: #4caf50;
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
  gap: 16px;
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
  color: #409eff;
}

/* 皮肤主题 */
.skin-retro .fridge {
  background: #2d5a4a;
}

.skin-retro .fridge-shelf,
.skin-retro .fridge-door {
  background: rgba(61, 122, 106, 0.5);
}

.skin-retro .shelf-slot,
.skin-retro .door-slot {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.skin-retro .zone-label {
  color: rgba(255, 255, 255, 0.7);
}

.skin-modern .fridge {
  background: linear-gradient(135deg, #c0c0c0, #e0e0e0);
}

.skin-cute .fridge {
  background: linear-gradient(135deg, #ffb6c1, #ffc0cb);
}

.skin-cute .fridge-shelf,
.skin-cute .fridge-door {
  background: rgba(255, 255, 255, 0.6);
}

/* 深色模式 */
:global(.dark) .organize-game {
  background: linear-gradient(135deg, #1a2f1a 0%, #2d4a2d 100%);
}

:global(.dark) .game-header,
:global(.dark) .game-footer {
  background: color-mix(in srgb, var(--color-bg-secondary) 82%, transparent);
}

:global(.dark) .stat-label {
  color: var(--color-text-secondary);
}

:global(.dark) .stat-value {
  color: var(--color-text-primary);
}

:global(.dark) .fridge {
  background: #2a3a2a;
}

:global(.dark) .fridge-shelf,
:global(.dark) .fridge-door {
  background: color-mix(in srgb, var(--color-bg-secondary) 76%, transparent);
}

:global(.dark) .shelf-slot,
:global(.dark) .door-slot {
  background: color-mix(in srgb, var(--color-bg-card) 68%, transparent);
  border-color: color-mix(in srgb, var(--color-text-primary) 18%, var(--color-border));
}

:global(.dark) .zone-label {
  color: var(--color-text-muted);
}

:global(.dark) .items-area {
  background: color-mix(in srgb, var(--color-bg-secondary) 76%, transparent);
}

:global(.dark) .items-label {
  color: var(--color-text-secondary);
}

:global(.dark) .item.draggable {
  background: color-mix(in srgb, var(--color-bg-card) 72%, transparent);
}

:global(.dark) .complete-content {
  background: color-mix(in srgb, var(--color-bg-card) 92%, #284228);
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

:global(.dark) .complete-text {
  color: #81c784;
}

:global(.dark) .skin-selector :deep(.el-input__wrapper) {
  background: color-mix(in srgb, var(--color-bg-secondary) 80%, transparent);
  box-shadow: inset 0 0 0 1px var(--color-border);
}

:global(.dark) .skin-selector :deep(.el-input__inner) {
  color: var(--color-text-primary);
}

@media (max-width: 480px) {
  .game-area {
    flex-direction: column;
  }

  .fridge {
    flex-direction: column;
  }

  .fridge-door {
    width: 100%;
    flex-direction: row;
  }

  .door-shelves {
    flex-direction: row;
  }

  .items-area {
    width: 100%;
  }

  .items-container {
    justify-content: flex-start;
  }
}
</style>
