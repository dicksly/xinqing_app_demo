export const FRUIT_KINDS = ['peach', 'berry', 'orange', 'kiwi', 'apple']

function nextId(prefix, index) {
  return `${prefix}-${Date.now()}-${index + 1}`
}

export function createFruitSliceRound({ count = 8, width = 320, height = 360, random = Math.random } = {}) {
  return Array.from({ length: count }, (_, index) => {
    const isStone = random() > 0.82
    return {
      id: nextId(isStone ? 'stone' : 'fruit', index),
      type: isStone ? 'stone' : 'fruit',
      kind: isStone ? 'calm-stone' : FRUIT_KINDS[Math.floor(random() * FRUIT_KINDS.length)] || FRUIT_KINDS[0],
      x: Math.round(24 + random() * Math.max(1, width - 48)),
      y: Math.round(24 + random() * Math.max(1, height - 48)),
      sliced: false,
    }
  })
}

function distance(a, b) {
  return Math.hypot(Number(a.x) - Number(b.x), Number(a.y) - Number(b.y))
}

export function sliceFruitItems(items = [], point = {}, radius = 28) {
  let slicedFruit = 0
  let hitStones = 0

  const nextItems = items.map((item) => {
    if (item.sliced || distance(item, point) > radius) {
      return item
    }

    if (item.type === 'stone') {
      hitStones += 1
    } else {
      slicedFruit += 1
    }

    return {
      ...item,
      sliced: true,
    }
  })

  return {
    items: nextItems,
    slicedFruit,
    hitStones,
    scoreDelta: slicedFruit * 10 - hitStones * 5,
  }
}
