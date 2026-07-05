import test from 'node:test'
import assert from 'node:assert/strict'

import {
  createMatch3Board,
  findMatch3Clusters,
  findMatch3Moves,
  hasAvailableMatch,
  resolveMatch3Swap,
} from '../src/utils/match3-game.js'
import {
  advanceFruitSlashItems,
  createFruitSlashRound,
  FRUIT_SLASH_ASSETS,
  sliceFruitSlashItems,
} from '../src/utils/fruit-slice-game.js'

function sequenceRandom(values) {
  let index = 0
  return () => {
    const value = values[index % values.length]
    index += 1
    return value
  }
}

test('match3 board initializes as a playable eight by eight board without starting clusters', () => {
  const board = createMatch3Board({
    random: sequenceRandom([0, 0.18, 0.34, 0.52, 0.68, 0.84, 0.12, 0.44, 0.76, 0.92]),
  })

  assert.equal(board.length, 8)
  assert.equal(board[0].length, 8)
  assert.deepEqual(findMatch3Clusters(board), [])
  assert.equal(hasAvailableMatch(board), true)
  assert.ok(findMatch3Moves(board).length > 0)
})

test('match3 resolves adjacent swaps with cascades and refills cleared cells', () => {
  const board = [
    ['sprout', 'sun', 'sprout', 'moon'],
    ['cloud', 'sprout', 'rain', 'leaf'],
    ['leaf', 'rain', 'cloud', 'sun'],
    ['moon', 'cloud', 'leaf', 'rain'],
  ]

  const result = resolveMatch3Swap(
    board,
    { row: 0, col: 1 },
    { row: 1, col: 1 },
    sequenceRandom([0.62, 0.82, 0.22, 0.42])
  )

  assert.equal(result.valid, true)
  assert.equal(result.cleared, 3)
  assert.equal(result.cascades, 1)
  assert.equal(result.score, 60)
  assert.notDeepEqual(result.board, board)
  assert.equal(findMatch3Clusters(result.board).length, 0)
})

test('match3 rejects non-adjacent or non-scoring swaps without mutating the board', () => {
  const board = [
    ['sprout', 'sun', 'moon'],
    ['cloud', 'leaf', 'rain'],
    ['sun', 'moon', 'cloud'],
  ]

  const distant = resolveMatch3Swap(board, { row: 0, col: 0 }, { row: 2, col: 2 })
  const deadSwap = resolveMatch3Swap(board, { row: 0, col: 0 }, { row: 0, col: 1 })

  assert.equal(distant.valid, false)
  assert.equal(deadSwap.valid, false)
  assert.deepEqual(distant.board, board)
  assert.deepEqual(deadSwap.board, board)
})

test('fruit slash round spawns migrated fruit, bomb, and trophy assets', () => {
  const round = createFruitSlashRound({
    count: 5,
    width: 320,
    height: 360,
    includeSpecials: true,
    random: sequenceRandom([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]),
  })

  assert.equal(round.length, 5)
  assert.ok(round.some((item) => item.type === 'fruit'))
  assert.ok(round.some((item) => item.type === 'bomb'))
  assert.ok(round.some((item) => item.type === 'trophy'))
  assert.equal(FRUIT_SLASH_ASSETS.bomb, '/vendor/fruit-slash-saga/public/image/fruits/fruitbomb.png')
  assert.ok(round.every((item) => item.image.startsWith('/vendor/fruit-slash-saga/public/image/fruits/')))
  assert.ok(round.every((item) => Number.isFinite(item.x) && Number.isFinite(item.y) && Number.isFinite(item.vy)))
})

test('fruit slash items fall over time', () => {
  const nextItems = advanceFruitSlashItems([
    { id: 'fruit-1', type: 'fruit', x: 80, y: 20, vx: 10, vy: 120, sliced: false },
  ], {
    deltaMs: 500,
    width: 320,
    height: 360,
  })

  assert.equal(nextItems[0].x, 85)
  assert.equal(nextItems[0].y, 80)
})

test('fruit slash path scores fruit, collects trophies, and punishes bombs once', () => {
  const items = [
    { id: 'fruit-1', type: 'fruit', x: 50, y: 50, radius: 24, sliced: false },
    { id: 'bomb-1', type: 'bomb', x: 54, y: 50, radius: 24, sliced: false },
    { id: 'trophy-1', type: 'trophy', x: 180, y: 80, radius: 24, sliced: false },
  ]

  const result = sliceFruitSlashItems(items, [{ x: 48, y: 50 }, { x: 58, y: 50 }], 12)

  assert.equal(result.slicedFruit, 1)
  assert.equal(result.hitBombs, 1)
  assert.equal(result.collectedTrophies, 0)
  assert.equal(result.scoreDelta, 12)
  assert.equal(result.livesDelta, -1)
  assert.equal(result.items.find((item) => item.id === 'fruit-1').sliced, true)
  assert.equal(result.items.find((item) => item.id === 'bomb-1').sliced, true)

  const trophyPass = sliceFruitSlashItems(result.items, [{ x: 180, y: 80 }], 12)
  assert.equal(trophyPass.collectedTrophies, 1)
  assert.equal(trophyPass.scoreDelta, 30)

  const secondPass = sliceFruitSlashItems(trophyPass.items, [{ x: 52, y: 50 }], 12)
  assert.equal(secondPass.slicedFruit, 0)
  assert.equal(secondPass.hitBombs, 0)
  assert.equal(secondPass.collectedTrophies, 0)
  assert.equal(secondPass.scoreDelta, 0)
})
