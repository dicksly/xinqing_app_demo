<template>
  <div class="admin-content-view">
    <div class="admin-content-header">
      <div>
        <p class="eyebrow">Content Admin</p>
        <h1>充电站内容后台</h1>
      </div>
      <el-button @click="handleLogout">退出登录</el-button>
    </div>
    <el-card shadow="never">
      <p>后台内容管理入口已就绪。</p>
    </el-card>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

import { useAdminStore } from '../../stores/admin'

const router = useRouter()
const adminStore = useAdminStore()

function handleLogout() {
  adminStore.logout()
  router.push('/admin/login')
}
</script>

<style scoped>
.admin-content-view {
  min-height: 100vh;
  padding: 24px;
  background: #f4f1e8;
}

.admin-content-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #7a6a3a;
}

h1 {
  margin: 0;
}
</style>
