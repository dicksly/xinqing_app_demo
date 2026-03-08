<template>
  <el-dialog
    v-model="visible"
    :title="isLogin ? '登录' : '注册'"
    width="400px"
    :close-on-click-modal="false"
    @close="resetForm"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="0">
      <el-form-item prop="username">
        <el-input
          v-model="formData.username"
          placeholder="用户名"
          prefix-icon="User"
          size="large"
        />
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model="formData.password"
          type="password"
          placeholder="密码"
          prefix-icon="Lock"
          size="large"
          show-password
        />
      </el-form-item>

      <el-form-item v-if="!isLogin" prop="confirmPassword">
        <el-input
          v-model="formData.confirmPassword"
          type="password"
          placeholder="确认密码"
          prefix-icon="Lock"
          size="large"
          show-password
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="switchMode" text type="primary">
          {{ isLogin ? '没有账号？去注册' : '已有账号？去登录' }}
        </el-button>
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          {{ isLogin ? '登录' : '注册' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../../stores/auth'
import { useGamesStore } from '../../stores/games'

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

const isLogin = ref(true)
const loading = ref(false)
const formRef = ref(null)

const formData = reactive({
  username: '',
  password: '',
  confirmPassword: '',
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
  isLogin.value = !isLogin.value
  resetForm()
}

const resetForm = () => {
  formData.username = ''
  formData.password = ''
  formData.confirmPassword = ''
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
.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-dialog__footer) {
  padding-top: 0;
}
</style>
