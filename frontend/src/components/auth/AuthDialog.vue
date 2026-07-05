<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="90%"
    :style="{ maxWidth: '360px' }"
    :close-on-click-modal="false"
    @close="resetForm"
    class="auth-dialog"
  >
    <el-form v-if="!isReset" ref="formRef" :model="formData" :rules="rules" label-width="0">
      <el-form-item prop="username">
        <el-input
          v-model="formData.username"
          placeholder="用户名"
          size="large"
          class="auth-input"
        >
          <template #prefix>
            <component :is="User" class="input-icon" />
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model="formData.password"
          type="password"
          placeholder="密码"
          size="large"
          show-password
          class="auth-input"
        >
          <template #prefix>
            <component :is="Lock" class="input-icon" />
          </template>
        </el-input>
      </el-form-item>

      <el-form-item v-if="!isLogin" prop="confirmPassword">
        <el-input
          v-model="formData.confirmPassword"
          type="password"
          placeholder="确认密码"
          size="large"
          show-password
          class="auth-input"
        >
          <template #prefix>
            <component :is="Lock" class="input-icon" />
          </template>
        </el-input>
      </el-form-item>
    </el-form>

    <div v-else class="reset-panel">
      <el-input
        v-model="formData.account"
        placeholder="用户名或邮箱"
        size="large"
        class="auth-input"
      >
        <template #prefix>
          <component :is="User" class="input-icon" />
        </template>
      </el-input>
      <el-input
        v-model="formData.resetCode"
        placeholder="验证码"
        size="large"
        class="auth-input"
      >
        <template #prefix>
          <component :is="Key" class="input-icon" />
        </template>
      </el-input>
      <el-input
        v-model="formData.newPassword"
        type="password"
        placeholder="新密码"
        size="large"
        show-password
        class="auth-input"
      >
        <template #prefix>
          <component :is="Lock" class="input-icon" />
        </template>
      </el-input>
      <p v-if="resetHint" class="reset-hint">{{ resetHint }}</p>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <div class="switch-row">
          <el-button v-if="!isReset" @click="switchMode" text type="primary" class="switch-btn">
            {{ isLogin ? '没有账号？去注册' : '已有账号？去登录' }}
          </el-button>
          <el-button v-if="isLogin && !isReset" @click="switchReset" text type="info" class="switch-btn">
            忘记密码
          </el-button>
          <el-button v-if="isReset" @click="switchLogin" text type="primary" class="switch-btn">
            返回登录
          </el-button>
        </div>
        <div class="action-btns">
          <el-button @click="handleCancel">取消</el-button>
          <template v-if="isReset">
            <el-button :loading="resetRequesting" @click="requestResetCode">
              获取验证码
            </el-button>
            <el-button type="primary" :loading="loading" @click="confirmResetPassword">
              重置密码
            </el-button>
          </template>
          <el-button v-else type="primary" :loading="loading" @click="handleSubmit">
            {{ isLogin ? '登录' : '注册' }}
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Lock, Key } from '@element-plus/icons-vue'
import { useAuthStore } from '../../stores/auth'
import { useGamesStore } from '../../stores/games'
import { authApi } from '../../api'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'success'])

const authStore = useAuthStore()
const gamesStore = useGamesStore()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const mode = ref('login')
const isLogin = computed(() => mode.value === 'login')
const isReset = computed(() => mode.value === 'reset')
const dialogTitle = computed(() => {
  if (isReset.value) return '找回密码'
  return isLogin.value ? '登录' : '注册'
})
const loading = ref(false)
const resetRequesting = ref(false)
const resetHint = ref('')
const formRef = ref(null)

const formData = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  account: '',
  resetCode: '',
  newPassword: '',
})

const validateConfirmPassword = (rule, value, callback) => {
  if (isLogin.value) {
    callback()
  } else if (value === '') {
    callback(new Error('请确认密码'))
  } else if (value !== formData.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为 3-20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度为 6-50 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
}

const switchMode = () => {
  mode.value = isLogin.value ? 'register' : 'login'
  resetForm()
}

const switchReset = () => {
  mode.value = 'reset'
  resetForm()
}

const switchLogin = () => {
  mode.value = 'login'
  resetForm()
}

const resetForm = () => {
  formData.username = ''
  formData.password = ''
  formData.confirmPassword = ''
  formData.account = ''
  formData.resetCode = ''
  formData.newPassword = ''
  resetHint.value = ''
  formRef.value?.clearValidate()
}

const handleCancel = () => {
  visible.value = false
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    if (isLogin.value) {
      await authStore.login(formData.username, formData.password)
      ElMessage.success('登录成功')
    } else {
      await authStore.register(formData.username, formData.password)
      ElMessage.success('注册成功')
    }

    // 同步本地游戏数据到服务器
    await gamesStore.syncLocalToServer()
    gamesStore.init()

    visible.value = false
    emit('success')
  } catch (error) {
    const message = error.response?.data?.detail || (isLogin.value ? '登录失败' : '注册失败')
    ElMessage.error(message)
  } finally {
    loading.value = false
  }
}

const requestResetCode = async () => {
  if (!formData.account.trim()) {
    ElMessage.warning('请输入用户名或邮箱')
    return
  }

  resetRequesting.value = true
  try {
    const response = await authApi.requestPasswordReset({ account: formData.account.trim() })
    if (response.data.reset_code) {
      formData.resetCode = response.data.reset_code
      resetHint.value = `演示验证码：${response.data.reset_code}`
      ElMessage.success('验证码已生成')
      return
    }

    resetHint.value = response.data.message || '找回申请已提交，请联系管理员'
    ElMessage.success('找回申请已提交')
  } catch (error) {
    const message = error.response?.data?.detail || '验证码生成失败'
    ElMessage.error(message)
  } finally {
    resetRequesting.value = false
  }
}

const confirmResetPassword = async () => {
  if (!formData.account.trim()) {
    ElMessage.warning('请输入用户名或邮箱')
    return
  }
  if (!/^\d{6}$/.test(formData.resetCode.trim())) {
    ElMessage.warning('请输入 6 位验证码')
    return
  }
  if (formData.newPassword.length < 6) {
    ElMessage.warning('新密码至少 6 位')
    return
  }

  loading.value = true
  try {
    await authApi.confirmPasswordReset({
      account: formData.account.trim(),
      resetCode: formData.resetCode.trim(),
      newPassword: formData.newPassword,
    })
    ElMessage.success('密码已重置，请重新登录')
    mode.value = 'login'
    formData.username = formData.account.trim()
    formData.password = ''
    formData.confirmPassword = ''
    formData.resetCode = ''
    formData.newPassword = ''
    resetHint.value = ''
  } catch (error) {
    const message = error.response?.data?.detail || '密码重置失败'
    ElMessage.error(message)
  } finally {
    loading.value = false
  }
}

// 监听登录状态变化
watch(
  () => authStore.isAuthenticated,
  (newVal) => {
    if (newVal) {
      gamesStore.syncLocalToServer()
    }
  }
)
</script>

<style scoped>
.auth-dialog :deep(.el-dialog__header) {
  padding: var(--spacing-md, 16px);
  padding-bottom: 0;
}

.auth-dialog :deep(.el-dialog__title) {
  font-size: var(--font-lg, 17px);
  font-weight: 600;
  color: var(--color-text-primary, #1e293b);
}

.auth-dialog :deep(.el-dialog__body) {
  padding: var(--spacing-md, 16px);
}

.auth-input :deep(.el-input__wrapper) {
  border-radius: var(--radius-md, 12px);
  box-shadow: none;
  border: 1px solid var(--color-border, #e2e8f0);
  padding: 4px 12px;
}

.auth-input :deep(.el-input__wrapper:focus-within) {
  border-color: var(--color-primary, #10b981);
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
}

.input-icon {
  width: 16px;
  height: 16px;
  color: var(--color-text-muted, #94a3b8);
}

.dialog-footer {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 8px);
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.switch-btn {
  align-self: flex-start;
  padding: 0;
  font-size: var(--font-sm, 13px);
}

.action-btns {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm, 8px);
}

.action-btns .el-button:last-child {
  background: linear-gradient(135deg, var(--color-primary, #10b981) 0%, var(--color-primary-light, #34d399) 100%);
  border: none;
}

.reset-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.reset-hint {
  margin: 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(111, 175, 139, 0.12);
  color: var(--color-primary, #10b981);
  font-size: var(--font-sm, 13px);
  font-weight: 700;
}

:deep(.el-dialog__footer) {
  padding: var(--spacing-sm, 8px) var(--spacing-md, 16px) var(--spacing-md, 16px);
}
</style>
