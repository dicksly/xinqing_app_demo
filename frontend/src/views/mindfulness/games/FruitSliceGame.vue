<template>
  <div class="fruit-slice-game">
    <header class="game-head">
      <div>
        <span>清爽分数</span>
        <strong>{{ score }}</strong>
      </div>
      <div>
        <span>倒计时</span>
        <strong>{{ timeLeft }}s</strong>
      </div>
      <div>
        <span>连切</span>
        <strong>{{ combo }}</strong>
      </div>
    </header>

    <div
      ref="arenaRef"
      class="slice-arena"
      @pointerdown="handlePointer"
      @pointermove="handlePointer"
    >
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        class="slice-item"
        :class="[item.type, item.kind, { sliced: item.sliced }]"
        :style="{ left: `${item.x}px`, top: `${item.y}px` }"
        :aria-label="item.type"
        @pointerdown.stop="sliceAtItem(item)"
      >
        <span></span>
      </button>
      <p v-if="!running" class="arena-note">轻划果子，把烦恼切成小块。</p>
    </div>

    <p class="game-message">{{ message }}</p>

    <footer class="game-actions">
      <el-button round @click="startRound">再来一局</el-button>
      <el-button type="primary" round @click="emit('close')">收好</el-button>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { createFruitSliceRound, sliceFruitItems } from '../../../utils/fruit-slice-game'
import { useGamesStore } from '../../../stores/games'

const emit = defineEmits(['close'])
const gamesStore = useGamesStore()

const arenaRef = ref(null)
const items = ref([])
const score = ref(0)
const combo = ref(0)
const timeLeft = ref(30)
const running = ref(false)
const message = ref('避开安静石，切开会发光的果子。')
let timer = null

function startRound() {
  stopTimer()
  const rect = arenaRef.value?.getBoundingClientRect()
  items.value = createFruitSliceRound({
    width: rect?.width || 320,
    height: rect?.height || 360,
    count: 9,
  })
  score.value = 0
  combo.value = 0
  timeLeft.value = 30
  running.value = true
  message.value = '避开安静石，切开会发光的果子。'
  timer = setInterval(() => {
    timeLeft.value -= 1
    if (timeLeft.value <= 0) {
      finishRound()
    }
  }, 1000)
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function finishRound() {
  running.value = false
  stopTimer()
  gamesStore.recordFruitSlice(score.value, combo.value)
  message.value = '这一局已经收好，手指和心都慢一点。'
}

function handlePointer(event) {
  if (!running.value || event.buttons === 0) return
  const rect = arenaRef.value.getBoundingClientRect()
  sliceAt({
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  })
}

function sliceAtItem(item) {
  if (!running.value) return
  sliceAt({ x: item.x, y: item.y })
}

function sliceAt(point) {
  const result = sliceFruitItems(items.value, point, 30)
  items.value = result.items
  if (result.slicedFruit > 0 || result.hitStones > 0) {
    score.value = Math.max(0, score.value + result.scoreDelta)
    combo.value = result.slicedFruit > 0 && result.hitStones === 0 ? combo.value + result.slicedFruit : 0
    message.value = result.hitStones > 0
      ? '碰到安静石了，下一刀慢一点。'
      : `切开 ${result.slicedFruit} 个果子，注意力回来了。`
  }

  if (items.value.every((item) => item.sliced || item.type === 'stone')) {
    items.value = [
      ...items.value.filter((item) => item.type === 'stone' && !item.sliced),
      ...createFruitSliceRound({
        width: arenaRef.value?.clientWidth || 320,
        height: arenaRef.value?.clientHeight || 360,
        count: 5,
      }),
    ]
  }
}

onMounted(() => {
  startRound()
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
.fruit-slice-game {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.game-head {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.game-head div {
  border-radius: 16px;
  padding: 10px;
  background: #FBF7F3;
}

.game-head span,
.game-message {
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 800;
}

.game-head strong {
  display: block;
  margin-top: 4px;
  color: var(--color-text-primary);
  font-size: 20px;
  font-weight: 900;
}

.slice-arena {
  height: 360px;
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  background:
    radial-gradient(circle at 20% 18%, rgba(255, 240, 200, 0.78), transparent 28%),
    linear-gradient(145deg, #E7F2EA 0%, #FFF8EF 100%);
  touch-action: none;
}

.slice-item {
  position: absolute;
  width: 48px;
  height: 48px;
  margin: -24px 0 0 -24px;
  border: 0;
  border-radius: 48% 48% 52% 52%;
  background: #E85D75;
  box-shadow: inset 0 -9px 14px rgba(0, 0, 0, 0.1), 0 10px 18px rgba(89, 75, 66, 0.12);
}

.slice-item span {
  position: absolute;
  top: 8px;
  left: 16px;
  width: 12px;
  height: 7px;
  border-radius: 999px 999px 0 999px;
  background: rgba(255, 255, 255, 0.72);
  transform: rotate(-28deg);
}

.slice-item.berry { background: #D95E76; }
.slice-item.orange { background: #F39A74; }
.slice-item.kiwi { background: #77BE8A; }
.slice-item.apple { background: #E86D68; }
.slice-item.peach { background: #F2A6A6; }

.slice-item.stone {
  border-radius: 44% 56% 50% 48%;
  background: #B9B0A8;
}

.slice-item.stone span {
  display: none;
}

.slice-item.sliced {
  opacity: 0.28;
  transform: scale(0.72) rotate(18deg);
}

.arena-note {
  position: absolute;
  left: 18px;
  right: 18px;
  top: 18px;
  margin: 0;
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 800;
}

.game-message {
  min-height: 18px;
  margin: 0;
  line-height: 1.5;
}

.game-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
