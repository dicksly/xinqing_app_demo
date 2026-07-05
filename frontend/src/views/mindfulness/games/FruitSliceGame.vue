<template>
  <div class="fruit-slice-game">
    <header class="game-head">
      <div>
        <span>清爽分数</span>
        <strong>{{ score }}</strong>
      </div>
      <div>
        <span>生命</span>
        <strong>{{ lives }}</strong>
      </div>
      <div>
        <span>等级</span>
        <strong>{{ level }}</strong>
      </div>
      <div>
        <span>连切</span>
        <strong>{{ combo }}</strong>
      </div>
    </header>

    <div
      ref="arenaRef"
      class="slice-arena"
      @pointerdown.prevent="handlePointerStart"
      @pointermove.prevent="handlePointerMove"
      @pointerup.prevent="handlePointerEnd"
      @pointercancel.prevent="handlePointerEnd"
      @pointerleave.prevent="handlePointerEnd"
    >
      <img
        class="arena-character"
        :src="FRUIT_SLASH_ASSETS.characterIdle"
        alt=""
        aria-hidden="true"
        draggable="false"
      >
      <img
        v-for="item in items"
        :key="item.id"
        class="slice-item"
        :class="[item.type, { sliced: item.sliced }]"
        :src="item.image"
        :alt="itemLabel(item)"
        draggable="false"
        :style="{
          left: `${item.x}px`,
          top: `${item.y}px`,
          transform: `translate(-50%, -50%) rotate(${item.rotation || 0}deg) scale(${item.sliced ? 0.82 : 1})`,
        }"
      >
      <span
        v-for="(point, index) in trailPoints"
        :key="`${point.x}-${point.y}-${index}`"
        class="trail-dot"
        :style="{ left: `${point.x}px`, top: `${point.y}px`, opacity: 1 - index / Math.max(1, trailPoints.length) }"
      />
      <p v-if="!running" class="arena-note">轻划果子，避开炸弹，收集奖杯。</p>
    </div>

    <div class="round-row">
      <span>倒计时 {{ timeLeft }}s</span>
      <span>奖杯 {{ trophies }}/3</span>
    </div>

    <p class="game-message">{{ message }}</p>

    <footer class="game-actions">
      <el-button round @click="startRound">再来一局</el-button>
      <el-button type="primary" round @click="emit('close')">收好</el-button>
    </footer>

    <audio ref="giftAudioRef" :src="FRUIT_SLASH_ASSETS.music.gift" preload="auto" />
    <audio ref="winAudioRef" :src="FRUIT_SLASH_ASSETS.music.win" preload="auto" />
    <audio ref="loseAudioRef" :src="FRUIT_SLASH_ASSETS.music.lose" preload="auto" />
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import {
  advanceFruitSlashItems,
  createFruitSlashRound,
  FRUIT_SLASH_ASSETS,
  sliceFruitSlashItems,
} from '../../../utils/fruit-slice-game'
import { useGamesStore } from '../../../stores/games'

const emit = defineEmits(['close'])
const gamesStore = useGamesStore()

const arenaRef = ref(null)
const giftAudioRef = ref(null)
const winAudioRef = ref(null)
const loseAudioRef = ref(null)
const items = ref([])
const trailPoints = ref([])
const score = ref(0)
const combo = ref(0)
const lives = ref(3)
const level = ref(1)
const trophies = ref(0)
const timeLeft = ref(45)
const running = ref(false)
const message = ref('切开水果，躲开炸弹，奖杯会让节奏升一级。')

let timer = null
let frameId = null
let lastFrameTime = 0
let spawnElapsed = 0
let pointerActive = false
let trailTimer = null

function arenaSize() {
  return {
    width: arenaRef.value?.clientWidth || 320,
    height: arenaRef.value?.clientHeight || 360,
  }
}

function playAudio(audioRef) {
  const audio = audioRef.value
  if (!audio) return
  audio.currentTime = 0
  audio.play().catch(() => {})
}

function spawnItems(count = 3, includeSpecials = false) {
  const { width, height } = arenaSize()
  items.value = [
    ...items.value,
    ...createFruitSlashRound({
      count,
      width,
      height,
      level: level.value,
      includeSpecials,
    }),
  ]
}

function startRound() {
  stopLoops()
  items.value = []
  trailPoints.value = []
  score.value = 0
  combo.value = 0
  lives.value = 3
  level.value = 1
  trophies.value = 0
  timeLeft.value = 45
  running.value = true
  spawnElapsed = 0
  pointerActive = false
  message.value = '切开水果，躲开炸弹，奖杯会让节奏升一级。'

  spawnItems(8, true)
  timer = setInterval(() => {
    timeLeft.value -= 1
    if (timeLeft.value <= 0) {
      finishRound('time')
    }
  }, 1000)
  startAnimation()
}

function startAnimation() {
  lastFrameTime = performance.now()
  frameId = requestAnimationFrame(tick)
}

function tick(now) {
  if (!running.value) return

  const deltaMs = Math.min(80, Math.max(0, now - lastFrameTime))
  lastFrameTime = now
  spawnElapsed += deltaMs

  const { width, height } = arenaSize()
  items.value = advanceFruitSlashItems(items.value, { deltaMs, width, height })
    .filter((item) => item.y < height + 72)

  const activeItems = items.value.filter((item) => !item.sliced).length
  if (spawnElapsed > 850 && activeItems < 9) {
    spawnItems(level.value >= 2 ? 3 : 2, level.value >= 2 && trophies.value === 0)
    spawnElapsed = 0
  }

  frameId = requestAnimationFrame(tick)
}

function stopLoops() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  if (frameId) {
    cancelAnimationFrame(frameId)
    frameId = null
  }
  if (trailTimer) {
    clearTimeout(trailTimer)
    trailTimer = null
  }
}

function finishRound(reason) {
  if (!running.value) return
  running.value = false
  pointerActive = false
  stopLoops()
  gamesStore.recordFruitSlice(score.value, combo.value)

  if (reason === 'bomb') {
    playAudio(loseAudioRef)
    message.value = `炸弹太多啦，本局获得 ${score.value} 分。`
    return
  }

  playAudio(winAudioRef)
  message.value = `这一局收好啦，共获得 ${score.value} 分。`
}

function pointFromEvent(event) {
  const rect = arenaRef.value.getBoundingClientRect()
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}

function handlePointerStart(event) {
  if (!running.value) {
    startRound()
  }
  pointerActive = true
  arenaRef.value?.setPointerCapture?.(event.pointerId)
  const point = pointFromEvent(event)
  trailPoints.value = [point]
  sliceAtTrail()
}

function handlePointerMove(event) {
  if (!running.value || !pointerActive) return
  const point = pointFromEvent(event)
  trailPoints.value = [...trailPoints.value.slice(-8), point]
  sliceAtTrail()
}

function handlePointerEnd(event) {
  pointerActive = false
  arenaRef.value?.releasePointerCapture?.(event.pointerId)
  if (trailTimer) clearTimeout(trailTimer)
  trailTimer = setTimeout(() => {
    trailPoints.value = []
  }, 120)
}

function sliceAtTrail() {
  const result = sliceFruitSlashItems(items.value, trailPoints.value, 8)
  items.value = result.items

  if (!result.slicedFruit && !result.hitBombs && !result.collectedTrophies) {
    return
  }

  score.value = Math.max(0, score.value + result.scoreDelta)

  if (result.hitBombs > 0) {
    lives.value = Math.max(0, lives.value + result.livesDelta)
    combo.value = 0
    message.value = '碰到炸弹了，下一刀慢一点。'
    if (lives.value <= 0) {
      finishRound('bomb')
    }
    return
  }

  combo.value += result.comboDelta
  if (result.collectedTrophies > 0) {
    trophies.value += result.collectedTrophies
    playAudio(giftAudioRef)
  }
  if (trophies.value >= 3) {
    trophies.value -= 3
    level.value += 1
    spawnItems(4, true)
    message.value = `奖杯集齐，进入第 ${level.value} 级。`
    return
  }

  message.value = result.collectedTrophies > 0
    ? '收下奖杯，节奏更亮一点。'
    : `切开 ${result.slicedFruit} 个水果，注意力回来了。`
}

function itemLabel(item) {
  if (item.type === 'bomb') return '炸弹'
  if (item.type === 'trophy') return '奖杯'
  return '水果'
}

onMounted(async () => {
  await nextTick()
  startRound()
})

onUnmounted(() => {
  stopLoops()
})
</script>

<style scoped>
.fruit-slice-game {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.game-head {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.game-head div {
  border-radius: 16px;
  padding: 9px;
  background: #FBF7F3;
}

.game-head span,
.game-message,
.round-row {
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 800;
}

.game-head strong {
  display: block;
  margin-top: 4px;
  color: var(--color-text-primary);
  font-size: 19px;
  font-weight: 900;
}

.slice-arena {
  height: 368px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(118, 95, 89, 0.1);
  border-radius: 24px;
  background:
    radial-gradient(circle at 22% 18%, rgba(255, 240, 200, 0.84), transparent 26%),
    linear-gradient(145deg, #E7F2EA 0%, #FFF8EF 100%);
  touch-action: none;
  user-select: none;
}

.arena-character {
  position: absolute;
  left: 12px;
  bottom: -8px;
  width: 72px;
  opacity: 0.34;
  pointer-events: none;
  filter: saturate(0.82);
}

.slice-item {
  position: absolute;
  width: 54px;
  height: 54px;
  object-fit: contain;
  pointer-events: none;
  transition: opacity 0.14s ease, filter 0.14s ease;
  filter: drop-shadow(0 10px 12px rgba(89, 75, 66, 0.16));
  z-index: 2;
}

.slice-item.bomb {
  width: 58px;
  height: 58px;
}

.slice-item.trophy {
  width: 62px;
  height: 62px;
}

.slice-item.sliced {
  opacity: 0.58;
  filter: drop-shadow(0 7px 10px rgba(89, 75, 66, 0.12)) saturate(0.9);
}

.trail-dot {
  position: absolute;
  z-index: 3;
  width: 14px;
  height: 14px;
  margin: -7px 0 0 -7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 0 16px rgba(217, 94, 118, 0.32);
  pointer-events: none;
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
  z-index: 4;
}

.round-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
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
