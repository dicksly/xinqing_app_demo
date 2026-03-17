import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { adminApi } from '../api/index.js'

const TOKEN_KEY = 'xinqing_admin_token'
const USER_KEY = 'xinqing_admin_user'

function readStoredJson(key) {
  const rawValue = localStorage.getItem(key)
  return rawValue ? JSON.parse(rawValue) : null
}

export const useAdminStore = defineStore('admin', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const user = ref(readStoredJson(USER_KEY))

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  async function login(username, password) {
    const response = await adminApi.login({ username, password })
    const { access_token, user: userData } = response.data

    token.value = access_token
    user.value = userData
    localStorage.setItem(TOKEN_KEY, access_token)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))

    return userData
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  async function checkAuth() {
    if (!token.value) {
      return false
    }

    try {
      const response = await adminApi.getMe()
      user.value = response.data
      localStorage.setItem(USER_KEY, JSON.stringify(response.data))
      return true
    } catch {
      logout()
      return false
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  }
})

export { TOKEN_KEY as ADMIN_TOKEN_KEY, USER_KEY as ADMIN_USER_KEY }
