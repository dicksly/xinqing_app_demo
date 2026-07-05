const FRUIT_SLASH_PUBLIC_BASE = '/vendor/fruit-slash-saga/public'
const FRUIT_IMAGE_BASE = `${FRUIT_SLASH_PUBLIC_BASE}/image/fruits`

export const FRUIT_KINDS = [
  'peach',
  'green_apple',
  'watermelon',
  'orange',
  'pear',
  'avocado',
  'lemon',
  'strawberry',
  'red_apple',
]

const FRUIT_ASSETS = FRUIT_KINDS.map((kind) => ({
  kind,
  image: `${FRUIT_IMAGE_BASE}/${kind}.png`,
  cutImage: `${FRUIT_IMAGE_BASE}/cut_${kind}.png`,
}))

export const FRUIT_SLASH_ASSETS = {
  fruits: FRUIT_ASSETS,
  bomb: `${FRUIT_IMAGE_BASE}/fruitbomb.png`,
  trophy: `${FRUIT_IMAGE_BASE}/winingcup.png`,
  music: {
    background: `${FRUIT_SLASH_PUBLIC_BASE}/music/background-music.mp3`,
    win: `${FRUIT_SLASH_PUBLIC_BASE}/music/win-game-music.wav`,
    lose: `${FRUIT_SLASH_PUBLIC_BASE}/music/lose-game.wav`,
    gift: `${FRUIT_SLASH_PUBLIC_BASE}/music/gift-music.wav`,
  },
  characterIdle: `${FRUIT_SLASH_PUBLIC_BASE}/image/character/Idle__000.png`,
}

let itemCounter = 0

function normalizedRandom(random = Math.random) {
  const value = Number(random())
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(0.999999, value))
}

function nextId(type) {
  itemCounter += 1
  return `${type}-${Date.now()}-${itemCounter}`
}

function pickFruit(random) {
  return FRUIT_ASSETS[Math.floor(normalizedRandom(random) * FRUIT_ASSETS.length)] || FRUIT_ASSETS[0]
}

function randomBetween(random, min, max) {
  return min + normalizedRandom(random) * (max - min)
}

function createItem(type, options) {
  const {
    index,
    width,
    height,
    level,
    random,
  } = options
  const x = Math.round(randomBetween(random, 36, Math.max(37, width - 36)))
  const y = Math.round(-56 - randomBetween(random, 0, Math.max(40, height * 0.24)))
  const speedBoost = Math.max(0, level - 1) * 18
  const vx = Math.round(randomBetween(random, -30, 30))
  const vy = Math.round(randomBetween(random, 92 + speedBoost, 150 + speedBoost))
  const spin = Math.round(randomBetween(random, -90, 90))

  if (type === 'bomb') {
    return {
      id: nextId('bomb'),
      type: 'bomb',
      kind: 'fruitbomb',
      image: FRUIT_SLASH_ASSETS.bomb,
      x,
      y,
      vx,
      vy,
      radius: 28,
      rotation: index * 13,
      spin,
      sliced: false,
    }
  }

  if (type === 'trophy') {
    return {
      id: nextId('trophy'),
      type: 'trophy',
      kind: 'winingcup',
      image: FRUIT_SLASH_ASSETS.trophy,
      x,
      y,
      vx,
      vy: Math.round(vy * 0.9),
      radius: 30,
      rotation: index * -11,
      spin,
      sliced: false,
    }
  }

  const fruit = pickFruit(random)
  return {
    id: nextId('fruit'),
    type: 'fruit',
    kind: fruit.kind,
    image: fruit.image,
    cutImage: fruit.cutImage,
    x,
    y,
    vx,
    vy,
    radius: 27,
    rotation: index * 17,
    spin,
    sliced: false,
  }
}

function pickItemType(index, count, includeSpecials, random) {
  if (includeSpecials && index === 0 && count > 0) return 'trophy'
  if (includeSpecials && index === 1 && count > 1) return 'bomb'

  const roll = normalizedRandom(random)
  if (roll > 0.91) return 'trophy'
  if (roll > 0.76) return 'bomb'
  return 'fruit'
}

export function createFruitSlashRound({
  count = 8,
  width = 320,
  height = 360,
  level = 1,
  includeSpecials = false,
  random = Math.random,
} = {}) {
  const safeCount = Math.max(1, Number(count) || 8)
  const safeWidth = Math.max(120, Number(width) || 320)
  const safeHeight = Math.max(160, Number(height) || 360)

  return Array.from({ length: safeCount }, (_, index) => {
    const type = pickItemType(index, safeCount, includeSpecials, random)
    return createItem(type, {
      index,
      width: safeWidth,
      height: safeHeight,
      level,
      random,
    })
  })
}

export function advanceFruitSlashItems(items = [], {
  deltaMs = 16,
  width = 320,
  height = 360,
} = {}) {
  const seconds = Math.max(0, Number(deltaMs) || 0) / 1000
  const safeWidth = Math.max(120, Number(width) || 320)
  const floor = Math.max(160, Number(height) || 360) + 72

  return items.map((item) => {
    const nextX = Number(item.x || 0) + Number(item.vx || 0) * seconds
    const nextY = Number(item.y || 0) + Number(item.vy || 0) * seconds
    const radius = Number(item.radius || 24)
    const clampedX = nextX < radius || nextX > safeWidth - radius
      ? Math.max(radius, Math.min(safeWidth - radius, nextX))
      : nextX

    return {
      ...item,
      x: Math.round(clampedX * 100) / 100,
      y: Math.round(Math.min(nextY, floor) * 100) / 100,
      rotation: Math.round(((Number(item.rotation || 0) + Number(item.spin || 0) * seconds) % 360) * 100) / 100,
    }
  })
}

function distance(a, b) {
  return Math.hypot(Number(a.x) - Number(b.x), Number(a.y) - Number(b.y))
}

function distanceToSegment(point, start, end) {
  const startX = Number(start.x)
  const startY = Number(start.y)
  const endX = Number(end.x)
  const endY = Number(end.y)
  const dx = endX - startX
  const dy = endY - startY
  const lengthSquared = dx * dx + dy * dy

  if (!lengthSquared) return distance(point, start)

  const t = Math.max(0, Math.min(1, ((Number(point.x) - startX) * dx + (Number(point.y) - startY) * dy) / lengthSquared))
  return distance(point, {
    x: startX + t * dx,
    y: startY + t * dy,
  })
}

function normalizePath(path) {
  if (Array.isArray(path)) {
    return path.filter((point) => Number.isFinite(Number(point.x)) && Number.isFinite(Number(point.y)))
  }
  if (Number.isFinite(Number(path?.x)) && Number.isFinite(Number(path?.y))) {
    return [path]
  }
  return []
}

function didPathHitItem(item, path, extraRadius) {
  if (path.length === 0) return false
  const hitRadius = Number(item.radius || 24) + Number(extraRadius || 0)

  if (path.length === 1) {
    return distance(item, path[0]) <= hitRadius
  }

  for (let index = 1; index < path.length; index += 1) {
    if (distanceToSegment(item, path[index - 1], path[index]) <= hitRadius) {
      return true
    }
  }
  return false
}

export function sliceFruitSlashItems(items = [], path = [], radius = 16) {
  const slicePath = normalizePath(path)
  let slicedFruit = 0
  let hitBombs = 0
  let collectedTrophies = 0
  let scoreDelta = 0
  let livesDelta = 0

  const nextItems = items.map((item) => {
    if (item.sliced || !didPathHitItem(item, slicePath, radius)) {
      return item
    }

    if (item.type === 'bomb') {
      hitBombs += 1
      livesDelta -= 1
    } else if (item.type === 'trophy') {
      collectedTrophies += 1
      scoreDelta += 30
    } else {
      slicedFruit += 1
      scoreDelta += 12
    }

    return {
      ...item,
      image: item.cutImage || item.image,
      sliced: true,
    }
  })

  return {
    items: nextItems,
    slicedFruit,
    hitBombs,
    collectedTrophies,
    scoreDelta,
    livesDelta,
    comboDelta: slicedFruit + collectedTrophies,
  }
}

export function createFruitSliceRound(options = {}) {
  return createFruitSlashRound(options)
}

export function sliceFruitItems(items = [], point = {}, radius = 28) {
  const result = sliceFruitSlashItems(items, [point], radius)
  return {
    ...result,
    hitStones: result.hitBombs,
  }
}
