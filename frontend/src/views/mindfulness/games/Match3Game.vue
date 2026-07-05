<template>
  <div class="match3-game">
    <header class="game-head">
      <div>
        <span>交换分数</span>
        <strong>{{ score }}</strong>
      </div>
      <div>
        <span>剩余步数</span>
        <strong>{{ movesLeft }}</strong>
      </div>
      <div>
        <span>本次清除</span>
        <strong>{{ lastCleared }}</strong>
      </div>
    </header>

    <div class="match3-board" :style="{ '--cols': board[0]?.length || 8 }">
      <button
        v-for="tile in flatTiles"
        :key="tile.key"
        type="button"
        class="match3-tile"
        :class="[tile.kind, { selected: isSelected(tile.row, tile.col) }]"
        :aria-label="tile.kind"
        @click="tapTile(tile.row, tile.col)"
      >
        <span></span>
      </button>
    </div>

    <p class="game-message">{{ message }}</p>

    <footer class="game-actions">
      <el-button round @click="resetGame">新一局</el-button>
      <el-button type="primary" round @click="emit('close')">收好</el-button>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  areAdjacentCells,
  createMatch3Board,
  hasAvailableMatch,
  resolveMatch3Swap,
} from '../../../utils/match3-game'
import { useGamesStore } from '../../../stores/games'

const emit = defineEmits(['close'])
const gamesStore = useGamesStore()

const board = ref(createMatch3Board())
const selected = ref(null)
const score = ref(0)
const movesLeft = ref(20)
const lastCleared = ref(0)
const message = ref('交换相邻小芽，连成 3 个就会轻轻消散。')

const flatTiles = computed(() => (
  board.value.flatMap((row, rowIndex) => (
    row.map((kind, colIndex) => ({
      key: `${rowIndex}-${colIndex}-${kind}-${score.value}`,
      row: rowIndex,
      col: colIndex,
      kind,
    }))
  ))
))

function isSelected(row, col) {
  return selected.value?.row === row && selected.value?.col === col
}

function tapTile(row, col) {
  if (movesLeft.value <= 0) {
    ElMessage.info('这一局已经结束啦')
    return
  }

  const cell = { row, col }
  if (!selected.value) {
    selected.value = cell
    return
  }

  if (isSelected(row, col)) {
    selected.value = null
    return
  }

  const from = selected.value
  if (!areAdjacentCells(from, cell)) {
    selected.value = cell
    message.value = '请交换挨在一起的小芽。'
    return
  }

  const result = resolveMatch3Swap(board.value, from, cell)
  selected.value = null
  if (!result.valid) {
    message.value = '这一步还不能连成 3 个，换个方向试试。'
    return
  }

  board.value = result.board
  score.value += result.score
  lastCleared.value = result.cleared
  movesLeft.value -= 1
  gamesStore.recordMatch3(result.cleared, result.score)
  message.value = result.cascades > 1
    ? `连续释放 ${result.cleared} 个小芽，获得 ${result.score} 分。`
    : `释放 ${result.cleared} 个小芽，获得 ${result.score} 分。`

  if (!hasAvailableMatch(board.value)) {
    board.value = createMatch3Board()
    message.value = '棋盘重新长出了一片可交换的小芽。'
  }

  if (movesLeft.value <= 0) {
    message.value = `这一局收好啦，共获得 ${score.value} 分。`
  }
}

function resetGame() {
  board.value = createMatch3Board()
  selected.value = null
  score.value = 0
  movesLeft.value = 20
  lastCleared.value = 0
  message.value = '交换相邻小芽，连成 3 个就会轻轻消散。'
}
</script>

<style scoped>
.match3-game {
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

.match3-board {
  display: grid;
  grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
  gap: 6px;
  padding: 10px;
  border: 1px solid rgba(118, 95, 89, 0.1);
  border-radius: 22px;
  background:
    linear-gradient(145deg, rgba(255, 248, 239, 0.94), rgba(233, 245, 234, 0.9));
}

.match3-tile {
  aspect-ratio: 1;
  border: 1px solid rgba(118, 95, 89, 0.12);
  border-radius: 13px;
  background: #F7D8E1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.16s ease, box-shadow 0.16s ease, outline-color 0.16s ease;
}

.match3-tile span {
  width: 58%;
  height: 58%;
  border-radius: 45% 45% 50% 50%;
  background: currentColor;
  box-shadow: inset 0 -8px 12px rgba(0, 0, 0, 0.08);
}

.match3-tile.selected {
  transform: translateY(-2px);
  box-shadow: 0 10px 16px rgba(217, 94, 118, 0.16);
  outline: 2px solid rgba(217, 94, 118, 0.36);
}

.match3-tile.sprout { color: #75B86F; background: #E5F2D8; }
.match3-tile.sun { color: #E8B84D; background: #FFF0C8; }
.match3-tile.moon { color: #83A7CF; background: #E2ECF8; }
.match3-tile.cloud { color: #B6A5CE; background: #F0E8F5; }
.match3-tile.leaf { color: #6E9C73; background: #DDEFE5; }
.match3-tile.rain { color: #6E9DD8; background: #E8F2FF; }

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
