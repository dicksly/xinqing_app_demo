export const MATCH3_KINDS = ['sprout', 'sun', 'moon', 'cloud', 'leaf', 'rain']

function pickKind(random = Math.random, kinds = MATCH3_KINDS) {
  return kinds[Math.floor(random() * kinds.length)] || kinds[0]
}

function cloneBoard(board = []) {
  return board.map((row) => [...row])
}

export function createMatch3Board({ rows = 6, cols = 6, random = Math.random, kinds = MATCH3_KINDS } = {}) {
  return Array.from({ length: rows }, () => (
    Array.from({ length: cols }, () => pickKind(random, kinds))
  ))
}

export function areAdjacentCells(a = {}, b = {}) {
  const rowDelta = Math.abs(Number(a.row) - Number(b.row))
  const colDelta = Math.abs(Number(a.col) - Number(b.col))
  return rowDelta + colDelta === 1
}

export function hasAvailableMatch(board = []) {
  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < (board[row] || []).length; col += 1) {
      const kind = board[row][col]
      if (!kind) continue

      const right = board[row]?.[col + 1]
      const down = board[row + 1]?.[col]
      if (right === kind || down === kind) {
        return true
      }
    }
  }
  return false
}

function isValidSelection(board, selection) {
  if (!Array.isArray(selection) || selection.length < 3) return false

  const first = selection[0]
  const kind = board[first.row]?.[first.col]
  if (!kind) return false

  const seen = new Set()
  for (let index = 0; index < selection.length; index += 1) {
    const cell = selection[index]
    const cellKind = board[cell.row]?.[cell.col]
    const key = `${cell.row}:${cell.col}`
    if (cellKind !== kind || seen.has(key)) return false
    if (index > 0 && !areAdjacentCells(selection[index - 1], cell)) return false
    seen.add(key)
  }

  return true
}

export function resolveMatch3Selection(board = [], selection = [], random = Math.random) {
  if (!isValidSelection(board, selection)) {
    return {
      valid: false,
      board: cloneBoard(board),
      cleared: 0,
      score: 0,
    }
  }

  const nextBoard = cloneBoard(board)
  for (const cell of selection) {
    nextBoard[cell.row][cell.col] = pickKind(random)
  }

  const cleared = selection.length
  return {
    valid: true,
    board: nextBoard,
    cleared,
    score: cleared * 15,
  }
}
