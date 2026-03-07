import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { gamesApi } from '../api'
import { useAuthStore } from './auth'

const LOCAL_PROGRESS_KEY = 'xinqing_game_progress'

// 皮肤解锁条件
const SKIN_UNLOCK_CONDITIONS = {
  bubble: [
    { name: 'default', condition: 0 },
    { name: 'rainbow', condition: 50 },
    { name: 'starry', condition: 200 },
  ],
}

// 默认进度模板
const defaultProgress = {
  bubble: {
    gameType: 'bubble',
    totalPlayCount: 0,
    totalPlayTime: 0,
    unlockedSkins: ['default'],
    currentSkin: 'default',
    stats: { totalPops: 0, maxCombo: 0 },
  },
}

export const useGamesStore = defineStore('games', () => {
  // 状态
  const progressMap = ref({})
  const isGuest = ref(true)

  // 初始化
  function init() {
    const authStore = useAuthStore()
    isGuest.value = !authStore.isAuthenticated

    if (isGuest.value) {
      // 游客模式：从 localStorage 读取
      loadLocalProgress()
    } else {
      // 登录模式：从服务器获取
      fetchProgress()
    }
  }

  // 从 localStorage 加载进度
  function loadLocalProgress() {
    try {
      const saved = localStorage.getItem(LOCAL_PROGRESS_KEY)
      if (saved) {
        progressMap.value = JSON.parse(saved)
      } else {
        progressMap.value = { ...defaultProgress }
      }
    } catch {
      progressMap.value = { ...defaultProgress }
    }
  }

  // 保存到 localStorage
  function saveLocalProgress() {
    if (isGuest.value) {
      localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(progressMap.value))
    }
  }

  // 从服务器获取进度
  async function fetchProgress() {
    try {
      const response = await gamesApi.getProgress()
      const list = response.data
      const map = {}
      list.forEach((p) => {
        map[p.gameType] = p
      })
      // 合并默认值
      progressMap.value = { ...defaultProgress, ...map }
    } catch (error) {
      console.error('获取游戏进度失败:', error)
      // 失败时使用本地数据
      loadLocalProgress()
    }
  }

  // 获取单个游戏进度
  function getProgress(gameType) {
    return progressMap.value[gameType] || defaultProgress[gameType] || null
  }

  // 更新游戏进度
  async function updateProgress(gameType, data) {
    const current = progressMap.value[gameType] || { ...defaultProgress[gameType] }

    // 合并数据
    progressMap.value[gameType] = {
      ...current,
      ...data,
    }

    if (isGuest.value) {
      saveLocalProgress()
    } else {
      try {
        await gamesApi.updateProgress(gameType, data)
      } catch (error) {
        console.error('更新游戏进度失败:', error)
      }
    }
  }

  // 泡泡游戏：记录捏泡泡
  function recordPop(gameType = 'bubble', combo = 1) {
    const progress = getProgress(gameType)
    if (!progress) return

    const newTotalPops = (progress.stats.totalPops || 0) + 1
    const newMaxCombo = Math.max(progress.stats.maxCombo || 0, combo)
    const newPlayCount = (progress.totalPlayCount || 0) + 1

    // 检查解锁皮肤
    const newSkins = checkUnlocks(gameType, newTotalPops, progress.unlockedSkins)

    updateProgress(gameType, {
      totalPlayCount: newPlayCount,
      stats: {
        ...progress.stats,
        totalPops: newTotalPops,
        maxCombo: newMaxCombo,
      },
      unlockedSkins: newSkins,
    })

    // 返回是否有新解锁
    return newSkins.length > progress.unlockedSkins.length
  }

  // 检查皮肤解锁
  function checkUnlocks(gameType, totalPops, currentSkins) {
    const conditions = SKIN_UNLOCK_CONDITIONS[gameType] || []
    const newSkins = [...currentSkins]

    conditions.forEach((skin) => {
      if (totalPops >= skin.condition && !newSkins.includes(skin.name)) {
        newSkins.push(skin.name)
      }
    })

    return newSkins
  }

  // 设置当前皮肤
  function setCurrentSkin(gameType, skinName) {
    const progress = getProgress(gameType)
    if (progress && progress.unlockedSkins.includes(skinName)) {
      updateProgress(gameType, { currentSkin: skinName })
      return true
    }
    return false
  }

  // 同步本地数据到服务器（登录后调用）
  async function syncLocalToServer() {
    const localData = localStorage.getItem(LOCAL_PROGRESS_KEY)
    if (!localData) return

    try {
      const localProgress = JSON.parse(localData)
      const progressList = Object.values(localProgress)

      await gamesApi.sync({ progressList })

      // 同步成功后清除本地数据
      localStorage.removeItem(LOCAL_PROGRESS_KEY)

      // 重新从服务器获取
      await fetchProgress()
    } catch (error) {
      console.error('同步游戏数据失败:', error)
    }
  }

  // 记录游戏会话
  async function recordSession(gameType, playTime, stats = {}) {
    const progress = getProgress(gameType)
    if (!progress) return

    updateProgress(gameType, {
      totalPlayTime: (progress.totalPlayTime || 0) + playTime,
      stats: { ...progress.stats, ...stats },
    })

    if (!isGuest.value) {
      try {
        await gamesApi.recordSession({
          gameType,
          playTime,
          stats,
        })
      } catch (error) {
        console.error('记录游戏会话失败:', error)
      }
    }
  }

  return {
    progressMap,
    isGuest,
    init,
    getProgress,
    updateProgress,
    recordPop,
    setCurrentSkin,
    syncLocalToServer,
    recordSession,
  }
})
