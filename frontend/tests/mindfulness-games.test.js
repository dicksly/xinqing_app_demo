import test from 'node:test'
import assert from 'node:assert/strict'

import {
  createMatch3Board,
  hasAvailableMatch,
  resolveMatch3Selection,
} from '../src/utils/match3-game.js'
import {
  createFruitSliceRound,
  sliceFruitItems,
} from '../src/utils/fruit-slice-game.js'

test('match3 board initializes as a playable six by six board', () => {
  const board = createMatch3Board({
    rows: 6,
    cols: 6,
    random: () => 0,
  })

  assert.equal(board.length, 6)
  assert.equal(board[0].length, 6)
  assert.equal(hasAvailableMatch(board), true)
})

test('match3 resolves adjacent same-kind selections and refills cleared cells', () => {
  const board = [
    ['sprout', 'sprout', 'sprout', 'moon', 'moon', 'sun'],
    ['cloud', 'rain', 'leaf', 'sun', 'moon', 'cloud'],
    ['leaf', 'sun', 'cloud', 'rain', 'leaf', 'sun'],
  ]

  const result = resolveMatch3Selection(
    board,
    [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
    ],
    () => 0.75
  )

  assert.equal(result.valid, true)
  assert.equal(result.cleared, 3)
  assert.equal(result.score, 45)
  assert.notDeepEqual(result.board[0].slice(0, 3), ['sprout', 'sprout', 'sprout'])
})

test('match3 rejects disconnected or mixed selections', () => {
  const board = [
    ['sprout', 'sprout', 'moon'],
    ['cloud', 'sprout', 'sun'],
    ['leaf', 'sun', 'cloud'],
  ]

  assert.equal(resolveMatch3Selection(board, [{ row: 0, col: 0 }, { row: 2, col: 2 }]).valid, false)
  assert.equal(resolveMatch3Selection(board, [{ row: 0, col: 0 }, { row: 0, col: 2 }]).valid, false)
})

test('fruit slice round spawns fruit and calm stones', () => {
  const round = createFruitSliceRound({
    count: 4,
    random: (() => {
      const values = [0, 0.1, 0.2, 0.3, 0.94, 0.4, 0.5, 0.6, 0.1, 0.7, 0.8, 0.9]
      let index = 0
      return () => values[index++ % values.length]
    })(),
  })

  assert.equal(round.length, 4)
  assert.ok(round.some((item) => item.type === 'fruit'))
  assert.ok(round.some((item) => item.type === 'stone'))
  assert.ok(round.every((item) => Number.isFinite(item.x) && Number.isFinite(item.y)))
})

test('fruit slicing scores fruit and penalizes calm stones once', () => {
  const result = sliceFruitItems(
    [
      { id: 'fruit-1', type: 'fruit', x: 50, y: 50, sliced: false },
      { id: 'stone-1', type: 'stone', x: 54, y: 50, sliced: false },
      { id: 'fruit-2', type: 'fruit', x: 200, y: 200, sliced: false },
    ],
    { x: 52, y: 50 },
    10
  )

  assert.equal(result.slicedFruit, 1)
  assert.equal(result.hitStones, 1)
  assert.equal(result.scoreDelta, 5)
  assert.equal(result.items.find((item) => item.id === 'fruit-1').sliced, true)
  assert.equal(result.items.find((item) => item.id === 'stone-1').sliced, true)

  const secondPass = sliceFruitItems(result.items, { x: 52, y: 50 }, 10)
  assert.equal(secondPass.slicedFruit, 0)
  assert.equal(secondPass.hitStones, 0)
  assert.equal(secondPass.scoreDelta, 0)
})
