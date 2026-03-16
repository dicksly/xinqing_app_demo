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
      <el-tabs v-model="activeTab">
        <el-tab-pane label="每日金句" name="quotes">
          <DailyQuoteManager />
        </el-tab-pane>
        <el-tab-pane label="内容管理" name="contents">
          <p>内容管理开发中。</p>
        </el-tab-pane>
        <el-tab-pane label="专题管理" name="topics">
          <p>专题管理开发中。</p>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import DailyQuoteManager from '../../components/admin/DailyQuoteManager.vue'
import { useAdminStore } from '../../stores/admin'

const router = useRouter()
const adminStore = useAdminStore()
const activeTab = ref('quotes')

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
