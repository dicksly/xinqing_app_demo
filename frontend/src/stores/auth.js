import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api'

const TOKEN_KEY = 'xinqing_token'
const USER_KEY = 'xinqing_user'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const user = ref(JSON.parse(localStorage.getItem(USER_KEY) || 'null'))

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Actions
  async function login(username, password) {
    try {
      const response = await authApi.login({ username, password })
      const { access_token, user: userData } = response.data

      token.value = access_token
      user.value = userData

      localStorage.setItem(TOKEN_KEY, access_token)
      localStorage.setItem(USER_KEY, JSON.stringify(userData))

      return userData
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  async function register(username, email, password) {
    try {
      const response = await authApi.register({ username, email, password })
      const { access_token, user: userData } = response.data

      token.value = access_token
      user.value = userData

      localStorage.setItem(TOKEN_KEY, access_token)
      localStorage.setItem(USER_KEY, JSON.stringify(userData))

      return userData
    } catch (error) {
      console.error('注册失败:', error)
      throw error
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  async function checkAuth() {
    if (!token.value) return false

    try {
      const response = await authApi.getMe()
      user.value = response.data
      localStorage.setItem(USER_KEY, JSON.stringify(response.data))
      return true
    } catch (error) {
      // Token 无效，清除登录状态
      logout()
      return false
    }
  }

  function getToken() {
    return token.value
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
    getToken,
  }
})
