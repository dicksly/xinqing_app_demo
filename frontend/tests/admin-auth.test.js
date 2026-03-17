import test from 'node:test'
import assert from 'node:assert/strict'

import { createPinia, setActivePinia } from 'pinia'

import { useAdminStore } from '../src/stores/admin.js'
import { adminApi } from '../src/api/index.js'
import { canAccessAdminRoute } from '../src/router/admin-guard.js'


function createLocalStorageMock() {
  const storage = new Map()
  return {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null
    },
    setItem(key, value) {
      storage.set(key, String(value))
    },
    removeItem(key) {
      storage.delete(key)
    },
    clear() {
      storage.clear()
    },
  }
}

test('login success stores admin auth state', async () => {
  global.localStorage = createLocalStorageMock()
  setActivePinia(createPinia())

  const originalLogin = adminApi.login
  adminApi.login = async () => ({
    data: {
      access_token: 'admin-token',
      user: { id: 1, username: 'admin' },
    },
  })

  try {
    const adminStore = useAdminStore()
    await adminStore.login('admin', 'admin123')

    assert.equal(adminStore.token, 'admin-token')
    assert.deepEqual(adminStore.user, { id: 1, username: 'admin' })
    assert.equal(global.localStorage.getItem('xinqing_admin_token'), 'admin-token')
  } finally {
    adminApi.login = originalLogin
    global.localStorage.clear()
  }
})

test('admin route requires admin auth', () => {
  const unauthenticatedStore = { isAuthenticated: false }
  const authenticatedStore = { isAuthenticated: true }

  assert.equal(canAccessAdminRoute('/admin/content', unauthenticatedStore), '/admin/login')
  assert.equal(canAccessAdminRoute('/admin/content', authenticatedStore), true)
  assert.equal(canAccessAdminRoute('/knowledge', unauthenticatedStore), true)
})
