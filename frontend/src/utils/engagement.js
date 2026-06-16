const DAY_MS = 24 * 60 * 60 * 1000

export const STREAK_LEVELS = [
  { days: 1, name: 'seed', color: '#9ad58b', accessory: '芽芽帽', action: '轻轻摇晃' },
  { days: 20, name: 'sprout', color: '#67c587', accessory: '小围巾', action: '开心挥手' },
  { days: 50, name: 'clover', color: '#78d4cf', accessory: '星星发夹', action: '转圈圈' },
  { days: 100, name: 'guardian', color: '#b99cff', accessory: '月亮披风', action: '发光拥抱' },
]

export function toDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

export function daysBetween(dateKeyA, dateKeyB) {
  if (!dateKeyA || !dateKeyB) return 0
  const start = new Date(`${dateKeyA}T00:00:00.000Z`).getTime()
  const end = new Date(`${dateKeyB}T00:00:00.000Z`).getTime()
  return Math.round((end - start) / DAY_MS)
}

export function normalizeEngagementState(state = {}) {
  const bestStreak = Math.max(0, Number(state.bestStreak || 0))
  const rawCurrent = Math.max(0, Number(state.currentStreak || 0))
  const currentStreak = bestStreak > 0 ? Math.min(rawCurrent, bestStreak) : rawCurrent

  return {
    ...state,
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
    missedDays: Math.max(0, Number(state.missedDays || 0)),
  }
}

export function updateStreakState(state = {}, now = new Date()) {
  const normalizedState = normalizeEngagementState(state)
  const today = toDateKey(now)
  const lastSeenDate = normalizedState.lastSeenDate || null
  const gapDays = lastSeenDate ? daysBetween(lastSeenDate, today) : 0
  const currentStreak = Number(normalizedState.currentStreak || 0)

  let nextStreak = currentStreak
  if (!lastSeenDate) {
    nextStreak = 1
  } else if (gapDays === 0) {
    nextStreak = Math.max(currentStreak, 1)
  } else if (gapDays === 1) {
    nextStreak = currentStreak + 1
  } else {
    nextStreak = 1
  }

  return {
    ...normalizedState,
    currentStreak: nextStreak,
    bestStreak: Math.max(Number(normalizedState.bestStreak || 0), nextStreak),
    lastSeenDate: today,
    missedDays: gapDays > 1 ? gapDays - 1 : 0,
  }
}

export function getMascotLevel(streakDays = 0) {
  return STREAK_LEVELS.reduce((matched, level) => (
    streakDays >= level.days ? level : matched
  ), STREAK_LEVELS[0])
}

export function getNextMascotLevel(streakDays = 0) {
  return STREAK_LEVELS.find((level) => level.days > streakDays) || null
}

export function getMascotMood(mood) {
  const moods = {
    anxious: { face: 'worried', emoji: '•́ ᴖ •̀', message: '我陪你慢慢呼吸' },
    sad: { face: 'sad', emoji: '｡°(°.◜ᯅ◝°)°｡', message: '今天先轻一点' },
    calm: { face: 'calm', emoji: '˘ᵕ˘', message: '安静也很好' },
    happy: { face: 'happy', emoji: 'ᵔᗜᵔ', message: '这份亮光我收到了' },
    energetic: { face: 'bright', emoji: '๑>ᴗ<๑', message: '能量在发芽' },
  }
  return moods[mood] || { face: 'neutral', emoji: '•ᴗ•', message: '今天也见面啦' }
}

export function shouldShowReturnPrompt(state = {}) {
  return Number(state.missedDays || 0) >= 2
}
