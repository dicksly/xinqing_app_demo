export const MATCH3_KINDS = ['sprout', 'sun', 'moon', 'cloud', 'leaf', 'rain']

function normalizedRandom(random = Math.random) {
  const value = Number(random())
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(0.999999, value))
}

function pickKind(random = Math.random, kinds = MATCH3_KINDS) {
  return kinds[Math.floor(normalizedRandom(random) * kinds.length)] || kinds[0]
}

function cloneBoard(board = []) {
  return board.map((row) => [...row])
}

function boardDimensions(board = []) {
  return {
    rows: board.length,
    cols: Math.max(0, ...board.map((row) => row?.length || 0)),
  }
}

function uniqueCells(clusters = []) {
  const cells = new Map()
  for (const cluster of clusters) {
    for (const cell of cluster.cells) {
      cells.set(`${cell.row}:${cell.col}`, cell)
    }
  }
  return [...cells.values()]
}

function createPatternBoard(rows, cols, kinds = MATCH3_KINDS) {
  const board = Array.from({ length: rows }, (_, row) => (
    Array.from({ length: cols }, (_, col) => kinds[(row * 2 + col) % kinds.length])
  ))

  if (rows >= 3 && cols >= 3 && kinds.length >= 5) {
    const [a, b, c, d, e] = kinds
    board[0][0] = a
    board[0][1] = b
    board[0][2] = a
    board[1][0] = c
    board[1][1] = a
    board[1][2] = d
    board[2][0] = b
    board[2][1] = c
    board[2][2] = e
  }

  return board
}

function hasImmediateRun(board, row, col, kind) {
  return (
    (board[row]?.[col - 1] === kind && board[row]?.[col - 2] === kind) ||
    (board[row - 1]?.[col] === kind && board[row - 2]?.[col] === kind)
  )
}

export function createMatch3Board({ rows = 8, cols = 8, random = Math.random, kinds = MATCH3_KINDS } = {}) {
  const safeRows = Math.max(3, Number(rows) || 8)
  const safeCols = Math.max(3, Number(cols) || 8)
  const safeKinds = kinds.length >= 5 ? kinds : MATCH3_KINDS

  const board = []
  for (let row = 0; row < safeRows; row += 1) {
    board[row] = []
    for (let col = 0; col < safeCols; col += 1) {
      const blockedKinds = safeKinds.filter((kind) => hasImmediateRun(board, row, col, kind))
      const choices = safeKinds.filter((kind) => !blockedKinds.includes(kind))
      board[row][col] = pickKind(random, choices.length ? choices : safeKinds)
    }
  }

  if (findMatch3Clusters(board).length === 0 && hasAvailableMatch(board)) {
    return board
  }

  return createPatternBoard(safeRows, safeCols, safeKinds)
}

export function areAdjacentCells(a = {}, b = {}) {
  const rowDelta = Math.abs(Number(a.row) - Number(b.row))
  const colDelta = Math.abs(Number(a.col) - Number(b.col))
  return rowDelta + colDelta === 1
}

export function findMatch3Clusters(board = []) {
  const clusters = []
  const { rows, cols } = boardDimensions(board)

  for (let row = 0; row < rows; row += 1) {
    let col = 0
    while (col < (board[row]?.length || 0)) {
      const kind = board[row][col]
      if (!kind) {
        col += 1
        continue
      }

      let end = col + 1
      while (board[row]?.[end] === kind) {
        end += 1
      }

      if (end - col >= 3) {
        clusters.push({
          kind,
          direction: 'row',
          cells: Array.from({ length: end - col }, (_, offset) => ({ row, col: col + offset })),
        })
      }
      col = end
    }
  }

  for (let col = 0; col < cols; col += 1) {
    let row = 0
    while (row < rows) {
      const kind = board[row]?.[col]
      if (!kind) {
        row += 1
        continue
      }

      let end = row + 1
      while (board[end]?.[col] === kind) {
        end += 1
      }

      if (end - row >= 3) {
        clusters.push({
          kind,
          direction: 'col',
          cells: Array.from({ length: end - row }, (_, offset) => ({ row: row + offset, col })),
        })
      }
      row = end
    }
  }

  return clusters
}

function swapCells(board, from, to) {
  const fromKind = board[from.row]?.[from.col]
  board[from.row][from.col] = board[to.row]?.[to.col]
  board[to.row][to.col] = fromKind
}

export function findMatch3Moves(board = []) {
  const moves = []
  const { rows, cols } = boardDimensions(board)

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (!board[row]?.[col]) continue

      for (const to of [{ row, col: col + 1 }, { row: row + 1, col }]) {
        if (!board[to.row]?.[to.col] || board[row][col] === board[to.row][to.col]) continue

        const nextBoard = cloneBoard(board)
        swapCells(nextBoard, { row, col }, to)
        const clusters = findMatch3Clusters(nextBoard)
        if (clusters.length > 0) {
          moves.push({
            from: { row, col },
            to,
            clears: uniqueCells(clusters).length,
          })
        }
      }
    }
  }

  return moves
}

export function hasAvailableMatch(board = []) {
  return findMatch3Moves(board).length > 0
}

function collapseAndRefill(board, random, kinds) {
  const { rows, cols } = boardDimensions(board)
  for (let col = 0; col < cols; col += 1) {
    const settled = []
    for (let row = rows - 1; row >= 0; row -= 1) {
      if (board[row]?.[col]) {
        settled.push(board[row][col])
      }
    }

    let writeRow = rows - 1
    for (const kind of settled) {
      board[writeRow][col] = kind
      writeRow -= 1
    }
    while (writeRow >= 0) {
      board[writeRow][col] = pickKind(random, kinds)
      writeRow -= 1
    }
  }
}

export function resolveMatch3Swap(board = [], from = {}, to = {}, random = Math.random, options = {}) {
  if (!areAdjacentCells(from, to) || !board[from.row]?.[from.col] || !board[to.row]?.[to.col]) {
    return {
      valid: false,
      board: cloneBoard(board),
      cleared: 0,
      cascades: 0,
      score: 0,
      clusters: [],
    }
  }

  const kinds = options.kinds || MATCH3_KINDS
  const nextBoard = cloneBoard(board)
  swapCells(nextBoard, from, to)

  let clusters = findMatch3Clusters(nextBoard)
  if (clusters.length === 0) {
    return {
      valid: false,
      board: cloneBoard(board),
      cleared: 0,
      cascades: 0,
      score: 0,
      clusters: [],
    }
  }

  let cascades = 0
  let cleared = 0
  const resolvedClusters = []
  const maxCascades = options.maxCascades || 10

  while (clusters.length > 0 && cascades < maxCascades) {
    cascades += 1
    resolvedClusters.push(...clusters)

    const cells = uniqueCells(clusters)
    cleared += cells.length
    for (const cell of cells) {
      nextBoard[cell.row][cell.col] = null
    }

    collapseAndRefill(nextBoard, random, kinds)
    clusters = findMatch3Clusters(nextBoard)
  }

  return {
    valid: true,
    board: nextBoard,
    cleared,
    cascades,
    score: cleared * 20 + Math.max(0, cascades - 1) * 30,
    clusters: resolvedClusters,
  }
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

  return {
    valid: true,
    board: nextBoard,
    cleared: selection.length,
    score: selection.length * 15,
  }
}
