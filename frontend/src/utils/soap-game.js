export function getRandomSoapSkin(skinNames = [], previousSkin = null, random = Math.random) {
  const available = skinNames.filter((skin) => skin !== previousSkin)
  const pool = available.length > 0 ? available : skinNames
  if (pool.length === 0) return previousSkin
  return pool[Math.floor(random() * pool.length)]
}

export function getCutRatio(pointerX, rectLeft, rectWidth) {
  if (!rectWidth) return 0.5
  const raw = (pointerX - rectLeft) / rectWidth
  return Math.min(0.82, Math.max(0.18, raw))
}
