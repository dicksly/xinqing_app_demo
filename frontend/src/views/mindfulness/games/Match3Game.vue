<template>
  <div class="match3-game">
    <header class="game-head">
      <div>
        <span>连芽分数</span>
        <strong>{{ score }}</strong>
      </div>
      <div>
        <span>剩余步数</span>
        <strong>{{ movesLeft }}</strong>
      </div>
    </header>

    <div class="match3-board" :style="{ '--cols': board[0]?.length || 6 }">
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
import { createMatch3Board, resolveMatch3Selection } from '../../../utils/match3-game'
import { useGamesStore } from '../../../stores/games'

const emit = defineEmits(['close'])
const gamesStore = useGamesStore()

const board = ref(createMatch3Board())
const selection = ref([])
const score = ref(0)
const movesLeft = ref(12)
const message = ref('连起 3 个相同小芽，让紧绷慢慢散开。')

const flatTiles = computed(() => (
  board.value.flatMap((row, rowIndex) => (
    row.map((kind, colIndex) => ({
      key: `${rowIndex}-${colIndex}-${kind}`,
      row: rowIndex,
      col: colIndex,
      kind,
    }))
  ))
))

function isSelected(row, col) {
  return selection.value.some((cell) => cell.row === row && cell.col === col)
}

function tapTile(row, col) {
  if (movesLeft.value <= 0) {
    ElMessage.info('这一局已经结束啦')
    return
  }

  const kind = board.value[row][col]
  const current = selection.value
  if (current.length === 0) {
    selection.value = [{ row, col }]
    return
  }

  if (isSelected(row, col)) {
    selection.value = current.filter((cell) => !(cell.row === row && cell.col === col))
    return
  }

  const first = current[0]
  const last = current[current.length - 1]
  const sameKind = board.value[first.row][first.col] === kind
  const adjacent = Math.abs(last.row - row) + Math.abs(last.col - col) === 1
  if (!sameKind || !adjacent) {
    selection.value = [{ row, col }]
    message.value = '从同一种小芽重新开始连。'
    return
  }

  selection.value = [...current, { row, col }]
  if (selection.value.length >= 3) {
    const result = resolveMatch3Selection(board.value, selection.value)
    if (result.valid) {
      board.value = result.board
      score.value += result.score
      movesLeft.value -= 1
      gamesStore.recordMatch3(result.cleared, result.score)
      message.value = `释放了 ${result.cleared} 个小芽，呼吸变轻一点。`
    }
    selection.value = []
  }
}

function resetGame() {
  board.value = createMatch3Board()
  selection.value = []
  score.value = 0
  movesLeft.value = 12
  message.value = '连起 3 个相同小芽，让紧绷慢慢散开。'
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.game-head div {
  border-radius: 18px;
  padding: 12px;
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
  font-size: 22px;
  font-weight: 900;
}

.match3-board {
  display: grid;
  grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
  gap: 7px;
}

.match3-tile {
  aspect-ratio: 1;
  border: 1px solid rgba(118, 95, 89, 0.12);
  border-radius: 14px;
  background: #F7D8E1;
  display: flex;
  align-items: center;
  justify-content: center;
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
