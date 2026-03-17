<template>
  <div class="admin-login-view">
    <el-card class="admin-login-card" shadow="never">
      <h1>内容后台登录</h1>
      <el-form @submit.prevent="handleSubmit">
        <el-form-item label="用户名">
          <el-input v-model="form.username" autocomplete="username" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            autocomplete="current-password"
          />
        </el-form-item>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          登录
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

import { useAdminStore } from '../../stores/admin'

const router = useRouter()
const adminStore = useAdminStore()
const submitting = ref(false)
const form = reactive({
  username: '',
  password: '',
})

async function handleSubmit() {
  submitting.value = true
  try {
    await adminStore.login(form.username, form.password)
    router.push('/admin/content')
  } catch (error) {
    ElMessage.error(error?.response?.data?.detail || '登录失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.admin-login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(180deg, #f5f7f2 0%, #e9efe3 100%);
}

.admin-login-card {
  width: min(100%, 420px);
}
</style>
