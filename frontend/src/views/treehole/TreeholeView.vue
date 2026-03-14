<template>
  <div class="treehole-view">
    <!-- 倾诉卡片 -->
    <section class="confess-card card">
      <header class="card-header">
        <component :is="ChatDotRound" class="header-icon" />
        <h2 class="card-title">{{ t('treehole.title') }}</h2>
      </header>

      <!-- 内容类型选择 -->
      <div class="content-type-selector">
        <el-radio-group v-model="entryForm.contentType" class="type-group">
          <el-radio-button label="text">
            <component :is="Document" class="btn-icon" />
            <span>{{ t('treehole.contentType.text') }}</span>
          </el-radio-button>
          <el-radio-button label="voice">
            <component :is="Microphone" class="btn-icon" />
            <span>{{ t('treehole.contentType.voice') }}</span>
          </el-radio-button>
          <el-radio-button label="image">
            <component :is="Picture" class="btn-icon" />
            <span>{{ t('treehole.contentType.image') }}</span>
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 文字输入 -->
      <div v-if="entryForm.contentType === 'text'" class="content-input">
        <el-input
          v-model="entryForm.content"
          type="textarea"
          :rows="5"
          :placeholder="t('treehole.placeholder')"
          maxlength="1000"
          show-word-limit
          resize="none"
        />
      </div>

      <!-- 语音输入（模拟） -->
      <div v-if="entryForm.contentType === 'voice'" class="voice-input">
        <div class="voice-recorder">
          <div
            class="record-btn touchable"
            :class="{ recording: isRecording }"
            @click="toggleRecording"
          >
            <component :is="isRecording ? VideoPause : Microphone" class="record-icon" />
          </div>
          <div v-if="recordingTime > 0" class="recording-time">
            {{ recordingTime }}s
          </div>
          <span class="record-hint">{{ isRecording ? t('treehole.stopRecording') : t('treehole.startRecording') }}</span>
        </div>

        <div class="voice-option">
          <el-checkbox v-model="entryForm.hasVoiceChange">
            <component :is="Switch" class="check-icon" />
            <span>{{ t('treehole.voiceChange') }}</span>
          </el-checkbox>
        </div>
      </div>

      <!-- 图片输入 -->
      <div v-if="entryForm.contentType === 'image'" class="image-input">
        <div v-if="!uploadedImage" class="image-upload-area">
          <el-upload
            class="image-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="beforeUpload"
            accept="image/*"
            drag
          >
            <div class="uploader-content">
              <component :is="Plus" class="uploader-icon" />
              <span class="uploader-text">{{ locale === 'zh-CN' ? '点击或拖拽上传图片' : 'Click or drag to upload' }}</span>
            </div>
          </el-upload>
        </div>
        <div v-else class="image-preview">
          <img :src="uploadedImage" alt="preview" />
          <el-button size="small" type="danger" @click="removeImage" circle class="remove-btn">
            <component :is="CircleClose" />
          </el-button>
        </div>
      </div>

      <!-- 发布选项 -->
      <div class="publish-options">
        <el-checkbox v-model="entryForm.isAnonymous">
          <component :is="Lock" class="check-icon" />
          <span>{{ t('treehole.anonymous') }}</span>
        </el-checkbox>
        <el-checkbox v-model="entryForm.isPublished">
          <component :is="Share" class="check-icon" />
          <span>{{ t('treehole.publishToSquare') }}</span>
        </el-checkbox>
      </div>

      <!-- 提交按钮 -->
      <el-button
        type="primary"
        size="large"
        :loading="submitting"
        @click="handleSubmit"
        class="submit-btn"
        round
      >
        {{ t('treehole.sendToTreehole') }}
      </el-button>
    </section>

    <!-- AI 响应卡片 -->
    <section v-if="aiResponse" class="ai-response-card card">
      <header class="card-header">
        <component :is="Promotion" class="header-icon ai-icon" />
        <h2 class="card-title">{{ t('treehole.aiResponse') }}</h2>
      </header>

      <div class="ai-response-content">
        {{ aiResponse }}
      </div>

      <!-- 风险预警 -->
      <div v-if="riskLevel !== 'safe'" class="risk-alert" :class="riskLevel">
        <div class="alert-header">
          <component :is="riskLevel === 'severe' ? WarningFilled : InfoFilled" class="alert-icon" />
          <span class="alert-title">{{ riskLevel === 'severe' ? t('treehole.caringReminder') : t('treehole.gentleReminder') }}</span>
        </div>

        <div v-if="riskLevel === 'severe'" class="severe-warning">
          <p>{{ locale === 'zh-CN' ? '如果您有危险的想法，请立即寻求帮助：' : 'If you have dangerous thoughts, please seek help immediately:' }}</p>
          <div class="help-links">
            <a href="tel:400-161-9995" class="help-link">
              <component :is="PhoneFilled" />
              <span>{{ t('treehole.helpHotline') }}：400-161-9995</span>
            </a>
            <a href="tel:021-62798990" class="help-link">
              <component :is="PhoneFilled" />
              <span>{{ t('treehole.lifeHotline') }}：021-62798990</span>
            </a>
          </div>
        </div>

        <div v-else class="mild-warning">
          <p>{{ locale === 'zh-CN' ? '我感受到了你现在的痛苦。建议你：' : 'I feel your pain. Suggestions:' }}</p>
          <ul>
            <li>{{ locale === 'zh-CN' ? '深呼吸几次，让自己先平静下来' : 'Take a few deep breaths to calm down' }}</li>
            <li>{{ locale === 'zh-CN' ? '去"正念实验室"试试冥想练习' : 'Try meditation in the Mindfulness Lab' }}</li>
            <li>{{ locale === 'zh-CN' ? '如果持续困扰，可以考虑找专业咨询师聊聊' : 'Consider talking to a professional counselor' }}</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 公开树洞广场 -->
    <section class="public-square-card card">
      <header class="card-header">
        <component :is="Reading" class="header-icon" />
        <h2 class="card-title">{{ t('treehole.squareTitle') }}</h2>
      </header>

      <el-tabs v-model="activeTab" class="square-tabs">
        <el-tab-pane :label="t('treehole.latest')" name="latest">
          <div v-if="loading" class="loading">
            <div class="skeleton-list">
              <div v-for="i in 3" :key="i" class="skeleton-item">
                <div class="skeleton-line short"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line medium"></div>
              </div>
            </div>
          </div>
          <el-empty v-else-if="entries.length === 0" :description="locale === 'zh-CN' ? '暂无公开条目' : 'No public entries'" :image-size="60" />
          <div v-else class="entries-list">
            <div
              v-for="entry in entries"
              :key="entry.id"
              class="entry-item"
            >
              <div class="entry-header">
                <div class="entry-type" :class="'type-' + entry.content_type">
                  <component :is="getTypeIcon(entry.content_type)" />
                </div>
                <span class="entry-time">{{ formatTime(entry.created_at) }}</span>
              </div>
              <!-- 文字内容 -->
              <p v-if="entry.content_type === 'text'" class="entry-text">
                {{ entry.content?.substring(0, 100) }}{{ entry.content?.length > 100 ? '...' : '' }}
              </p>
              <!-- 语音内容 -->
              <p v-else-if="entry.content_type === 'voice'" class="entry-text voice-entry">
                <component :is="Microphone" class="voice-icon" />
                {{ locale === 'zh-CN' ? '语音记录' : 'Voice recording' }} ({{ entry.duration || 0 }}s)
              </p>
              <!-- 图片内容 -->
              <div v-else-if="entry.content_type === 'image'" class="entry-image">
                <img v-if="entry.image_data" :src="entry.image_data" alt="entry image" />
                <span v-else class="image-placeholder">{{ locale === 'zh-CN' ? '图片' : 'Image' }}</span>
              </div>
              <!-- AI 回应 -->
              <div v-if="entry.ai_response" class="entry-ai-response">
                <component :is="Promotion" class="ai-icon-small" />
                <span>{{ entry.ai_response?.substring(0, 50) }}...</span>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="t('treehole.mine')" name="mine">
          <el-empty v-if="myEntries.length === 0" :description="locale === 'zh-CN' ? '暂无记录' : 'No records'" :image-size="60" />
          <div v-else class="entries-list">
            <div
              v-for="entry in myEntries"
              :key="entry.id"
              class="entry-item"
            >
              <div class="entry-header">
                <div class="entry-type" :class="'type-' + entry.content_type">
                  <component :is="getTypeIcon(entry.content_type)" />
                </div>
                <span class="entry-time">{{ formatTime(entry.created_at) }}</span>
                <el-tag v-if="entry.is_published" size="small" type="success">{{ locale === 'zh-CN' ? '已公开' : 'Public' }}</el-tag>
              </div>
              <p v-if="entry.content_type === 'text'" class="entry-text">
                {{ entry.content?.substring(0, 100) }}{{ entry.content?.length > 100 ? '...' : '' }}
              </p>
              <p v-else-if="entry.content_type === 'voice'" class="entry-text">
                {{ locale === 'zh-CN' ? '语音记录' : 'Voice recording' }} ({{ entry.duration }}s)
              </p>
              <div v-else-if="entry.content_type === 'image'" class="entry-image">
                <img :src="entry.image_data" alt="entry image" />
              </div>
              <div v-if="entry.ai_response" class="entry-ai-response">
                <component :is="Promotion" class="ai-icon-small" />
                <span>{{ entry.ai_response?.substring(0, 50) }}...</span>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ChatDotRound,
  Document,
  Microphone,
  Picture,
  Plus,
  Lock,
  Share,
  Promotion,
  Reading,
  VideoPause,
  Switch,
  WarningFilled,
  InfoFilled,
  PhoneFilled,
  CircleClose,
  Delete
} from '@element-plus/icons-vue'
import { treeholeApi } from '../../api'
import { ElMessage } from 'element-plus'

const { t, locale } = useI18n()

// 表单数据
const entryForm = ref({
  contentType: 'text',
  content: '',
  hasVoiceChange: false,
  isAnonymous: true,
  isPublished: false,
})

const submitting = ref(false)
const isRecording = ref(false)
const recordingTime = ref(0)
const recordingTimer = ref(null)
const aiResponse = ref('')
const riskLevel = ref('safe')
const uploadedImage = ref(null)

// 公开广场
const entries = ref([])
const myEntries = ref([])
const loading = ref(false)
const activeTab = ref('latest')

// 获取类型图标
function getTypeIcon(type) {
  const icons = {
    text: Document,
    voice: Microphone,
    image: Picture
  }
  return icons[type] || Document
}

// 切换录音状态
function toggleRecording() {
  isRecording.value = !isRecording.value

  if (isRecording.value) {
    recordingTime.value = 0
    recordingTimer.value = setInterval(() => {
      recordingTime.value++
      if (recordingTime.value >= 60) {
        toggleRecording()
      }
    }, 1000)

    ElMessage.info(locale === 'zh-CN' ? '开始录音...' : 'Recording started...')
  } else {
    if (recordingTimer.value) {
      clearInterval(recordingTimer.value)
      recordingTimer.value = null
    }

    if (recordingTime.value > 0) {
      ElMessage.success(locale === 'zh-CN' ? `录音完成，时长 ${recordingTime.value} 秒` : `Recording complete, ${recordingTime.value}s`)
    } else {
      ElMessage.warning(t('treehole.recordingTooShort'))
    }
  }
}

// 图片上传
function beforeUpload(file) {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error(locale.value === 'zh-CN' ? '只能上传图片文件' : 'Only image files allowed')
    return false
  }
  if (!isLt5M) {
    ElMessage.error(locale.value === 'zh-CN' ? '图片大小不能超过 5MB' : 'Image size cannot exceed 5MB')
    return false
  }

  // 读取并预览图片
  const reader = new FileReader()
  reader.onload = (e) => {
    uploadedImage.value = e.target.result
    entryForm.value.content = `[${locale.value === 'zh-CN' ? '图片' : 'Image'}：${file.name}]`
    entryForm.value.image_data = e.target.result
  }
  reader.readAsDataURL(file)

  return false
}

// 移除图片
function removeImage() {
  uploadedImage.value = null
  entryForm.value.content = ''
  entryForm.value.image_data = null
}

// 提交倾诉
async function handleSubmit() {
  if (entryForm.value.contentType === 'text' && !entryForm.value.content) {
    ElMessage.warning(locale.value === 'zh-CN' ? '请输入内容' : 'Please enter content')
    return
  }

  if (entryForm.value.contentType === 'voice' && recordingTime.value === 0) {
    ElMessage.warning(locale.value === 'zh-CN' ? '请先录音' : 'Please record first')
    return
  }

  if (entryForm.value.contentType === 'image' && !uploadedImage.value) {
    ElMessage.warning(locale.value === 'zh-CN' ? '请先上传图片' : 'Please upload an image first')
    return
  }

  submitting.value = true
  try {
    const entryData = {
      ...entryForm.value,
      duration: entryForm.value.contentType === 'voice' ? recordingTime.value : 0,
      created_at: new Date().toISOString(),
      id: Date.now(),
    }

    const response = await treeholeApi.create(entryData)

    // 显示 AI 响应和风险等级
    if (response.data?.ai_response) {
      aiResponse.value = response.data.ai_response
      riskLevel.value = response.data.risk_level
      entryData.ai_response = response.data.ai_response
    }

    // 保存到本地存储
    const savedEntries = JSON.parse(localStorage.getItem('xinqing_treehole_records') || '[]')
    savedEntries.unshift(entryData)
    localStorage.setItem('xinqing_treehole_records', JSON.stringify(savedEntries))

    // 重置表单
    entryForm.value = {
      contentType: 'text',
      content: '',
      hasVoiceChange: false,
      isAnonymous: true,
      isPublished: false,
      image_data: null,
    }
    uploadedImage.value = null
    recordingTime.value = 0

    ElMessage.success(locale.value === 'zh-CN' ? '发送成功！' : 'Sent successfully!')
    loadEntries()
    loadMyEntries()
  } catch (error) {
    console.error('发送失败:', error)
    // 即使API失败也保存到本地
    const entryData = {
      ...entryForm.value,
      duration: entryForm.value.contentType === 'voice' ? recordingTime.value : 0,
      created_at: new Date().toISOString(),
      id: Date.now(),
    }
    const savedEntries = JSON.parse(localStorage.getItem('xinqing_treehole_records') || '[]')
    savedEntries.unshift(entryData)
    localStorage.setItem('xinqing_treehole_records', JSON.stringify(savedEntries))

    ElMessage.success(locale.value === 'zh-CN' ? '已保存到本地！' : 'Saved locally!')
    loadMyEntries()
  } finally {
    submitting.value = false
  }
}

// 加载公开条目
async function loadEntries() {
  loading.value = true
  try {
    const response = await treeholeApi.getPublished()
    entries.value = response.data || []
  } catch (error) {
    console.error('加载条目失败:', error)
    entries.value = []
  } finally {
    loading.value = false
  }
}

// 加载我的条目
function loadMyEntries() {
  try {
    const savedEntries = JSON.parse(localStorage.getItem('xinqing_treehole_records') || '[]')
    myEntries.value = savedEntries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  } catch (error) {
    console.error('加载我的条目失败:', error)
    myEntries.value = []
  }
}

// 格式化时间
function formatTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return locale === 'zh-CN' ? '刚刚' : 'Just now'
  if (diff < 3600000) return locale === 'zh-CN' ? `${Math.floor(diff / 60000)}分钟前` : `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return locale === 'zh-CN' ? `${Math.floor(diff / 3600000)}小时前` : `${Math.floor(diff / 3600000)}h ago`
  return date.toLocaleDateString()
}

onMounted(() => {
  loadEntries()
  loadMyEntries()
})
</script>

<style scoped>
.treehole-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 16px);
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 8px);
  margin-bottom: var(--spacing-md, 16px);
  padding-bottom: var(--spacing-sm, 8px);
  border-bottom: 1px solid var(--color-border-light, #f1f5f9);
}

.header-icon {
  width: 20px;
  height: 20px;
  color: var(--color-primary, #10b981);
}

.ai-icon {
  color: var(--color-secondary, #8b5cf6);
}

.card-title {
  font-size: var(--font-lg, 17px);
  font-weight: 600;
  color: var(--color-text-primary, #1e293b);
  margin: 0;
}

/* 内容类型选择 */
.content-type-selector {
  margin-bottom: var(--spacing-md, 16px);
}

.type-group {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-xs, 4px);
}

.type-group :deep(.el-radio-button) {
  margin: 0;
}

.type-group :deep(.el-radio-button__inner) {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs, 4px);
  padding: var(--spacing-sm, 8px);
}

.btn-icon {
  width: 14px;
  height: 14px;
}

/* 内容输入 */
.content-input {
  margin-bottom: var(--spacing-md, 16px);
}

/* 语音输入 */
.voice-input {
  margin-bottom: var(--spacing-md, 16px);
}

.voice-recorder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm, 8px);
  padding: var(--spacing-lg, 24px);
  background: var(--color-bg-tertiary, #f1f5f9);
  border-radius: var(--radius-lg, 16px);
}

.record-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary, #10b981) 0%, var(--color-primary-light, #34d399) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base, 0.2s ease);
}

.record-btn.recording {
  background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.record-icon {
  width: 28px;
  height: 28px;
  color: white;
}

.recording-time {
  font-size: var(--font-xl, 20px);
  font-weight: 600;
  color: var(--color-text-primary, #1e293b);
}

.record-hint {
  font-size: var(--font-xs, 11px);
  color: var(--color-text-muted, #94a3b8);
}

.voice-option {
  margin-top: var(--spacing-sm, 8px);
}

.check-icon {
  width: 14px;
  height: 14px;
  margin-right: var(--spacing-xs, 4px);
}

/* 图片上传 */
.image-input {
  margin-bottom: var(--spacing-md, 16px);
}

.image-uploader {
  width: 100%;
}

.image-uploader :deep(.el-upload-dragger) {
  width: 100%;
  height: 140px;
  border: 2px dashed var(--color-border, #e2e8f0);
  border-radius: var(--radius-lg, 16px);
  background: var(--color-bg-tertiary, #f1f5f9);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base, 0.2s ease);
}

.image-uploader :deep(.el-upload-dragger:hover) {
  border-color: var(--color-primary, #10b981);
  background: rgba(16, 185, 129, 0.05);
}

.uploader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs, 4px);
}

.uploader-icon {
  width: 32px;
  height: 32px;
  color: var(--color-primary, #10b981);
}

.uploader-text {
  font-size: var(--font-sm, 13px);
  color: var(--color-text-muted, #94a3b8);
}

/* 发布选项 */
.publish-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 8px);
  margin-bottom: var(--spacing-md, 16px);
}

.publish-options :deep(.el-checkbox__label) {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 4px);
  font-size: var(--font-sm, 13px);
  color: var(--color-text-secondary, #64748b);
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, var(--color-primary, #10b981) 0%, var(--color-primary-light, #34d399) 100%);
  border: none;
  font-weight: 500;
}

/* AI 响应卡片 */
.ai-response-card {
  border: 1px solid rgba(139, 92, 246, 0.2);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.03) 0%, rgba(16, 185, 129, 0.03) 100%);
}

.ai-response-content {
  padding: var(--spacing-sm, 8px) 0;
  color: var(--color-text-primary, #1e293b);
  line-height: 1.7;
  font-size: var(--font-sm, 13px);
}

/* 风险预警 */
.risk-alert {
  margin-top: var(--spacing-md, 16px);
  padding: var(--spacing-md, 16px);
  border-radius: var(--radius-md, 12px);
}

.risk-alert.severe {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.risk-alert.mild {
  background: rgba(251, 191, 36, 0.08);
  border: 1px solid rgba(251, 191, 36, 0.2);
}

.alert-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 4px);
  margin-bottom: var(--spacing-sm, 8px);
}

.alert-icon {
  width: 18px;
  height: 18px;
}

.severe .alert-icon {
  color: #ef4444;
}

.mild .alert-icon {
  color: #fbbf24;
}

.alert-title {
  font-size: var(--font-sm, 13px);
  font-weight: 500;
  color: var(--color-text-primary, #1e293b);
}

.severe-warning p,
.mild-warning p {
  font-size: var(--font-xs, 11px);
  color: var(--color-text-secondary, #64748b);
  margin: 0 0 var(--spacing-sm, 8px) 0;
}

.help-links {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs, 4px);
}

.help-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 4px);
  padding: var(--spacing-sm, 8px);
  background: var(--color-bg-card, #ffffff);
  border-radius: var(--radius-sm, 8px);
  font-size: var(--font-xs, 11px);
  color: var(--color-text-primary, #1e293b);
  text-decoration: none;
}

.help-link svg {
  width: 14px;
  height: 14px;
  color: var(--color-primary, #10b981);
}

.mild-warning ul {
  margin: 0;
  padding-left: var(--spacing-md, 16px);
}

.mild-warning li {
  font-size: var(--font-xs, 11px);
  color: var(--color-text-secondary, #64748b);
  line-height: 1.8;
}

/* 标签页 */
.square-tabs {
  margin-top: var(--spacing-sm, 8px);
}

.square-tabs :deep(.el-tabs__header) {
  margin-bottom: var(--spacing-md, 16px);
}

/* 骨架屏 */
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 8px);
}

.skeleton-item {
  padding: var(--spacing-sm, 8px);
  background: var(--color-bg-tertiary, #f1f5f9);
  border-radius: var(--radius-md, 12px);
}

.skeleton-line {
  height: 12px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm, 8px);
  margin-bottom: var(--spacing-xs, 4px);
}

.skeleton-line.short {
  width: 30%;
}

.skeleton-line.medium {
  width: 60%;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 条目列表 */
.entries-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 8px);
}

.entry-item {
  padding: var(--spacing-sm, 8px);
  border-radius: var(--radius-md, 12px);
  background: var(--color-bg-tertiary, #f1f5f9);
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs, 4px);
}

.entry-type {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm, 8px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.entry-type svg {
  width: 14px;
  height: 14px;
}

.type-text {
  background: rgba(16, 185, 129, 0.15);
}

.type-text svg {
  color: var(--color-primary, #10b981);
}

.type-voice {
  background: rgba(139, 92, 246, 0.15);
}

.type-voice svg {
  color: var(--color-secondary, #8b5cf6);
}

.type-image {
  background: rgba(251, 191, 36, 0.15);
}

.type-image svg {
  color: var(--color-warm, #fbbf24);
}

.entry-time {
  font-size: 10px;
  color: var(--color-text-muted, #94a3b8);
}

.entry-text {
  font-size: var(--font-xs, 11px);
  color: var(--color-text-secondary, #64748b);
  line-height: 1.6;
  margin: 0;
}

.entry-text.voice-entry {
  display: flex;
  align-items: center;
  gap: 4px;
}

.voice-icon {
  width: 14px;
  height: 14px;
  color: var(--color-secondary, #8b5cf6);
}

.entry-image {
  margin-top: var(--spacing-xs, 4px);
  border-radius: var(--radius-sm, 8px);
  overflow: hidden;
}

.entry-image img {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  background: var(--color-bg-tertiary, #f1f5f9);
  border-radius: var(--radius-sm, 8px);
  color: var(--color-text-muted, #94a3b8);
  font-size: var(--font-xs, 11px);
}

.entry-ai-response {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  margin-top: var(--spacing-xs, 4px);
  padding: var(--spacing-xs, 4px);
  background: rgba(139, 92, 246, 0.08);
  border-radius: var(--radius-sm, 8px);
  font-size: 10px;
  color: var(--color-secondary, #8b5cf6);
}

.ai-icon-small {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

.loading {
  padding: var(--spacing-md, 16px) 0;
}

/* 深色模式 */
.dark .ai-response-card {
  background: rgba(45, 42, 62, 0.8);
  border: 1px solid rgba(167, 139, 250, 0.2);
}

.dark .type-group :deep(.el-radio-button__inner) {
  background: rgba(31, 28, 42, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark .voice-recorder {
  background: rgba(31, 28, 42, 0.8);
}

.dark .record-btn {
  background: linear-gradient(135deg, var(--color-primary, #a78bfa) 0%, var(--color-primary-light, #c4b5fd) 100%);
}

.dark .image-uploader :deep(.el-upload-dragger) {
  background: rgba(31, 28, 42, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark .image-uploader :deep(.el-upload-dragger:hover) {
  border-color: var(--color-primary, #a78bfa);
  background: rgba(167, 139, 250, 0.1);
}

.dark .submit-btn {
  background: linear-gradient(135deg, var(--color-primary, #a78bfa) 0%, var(--color-primary-light, #c4b5fd) 100%);
}

.dark .skeleton-item {
  background: rgba(31, 28, 42, 0.8);
}

.dark .skeleton-line {
  background: linear-gradient(90deg, #3d3a4e 25%, #4a4658 50%, #3d3a4e 75%);
  background-size: 200% 100%;
}

.dark .entry-item {
  background: rgba(31, 28, 42, 0.8);
}

.dark .help-link {
  background: rgba(45, 42, 62, 0.8);
}

.dark .help-link svg {
  color: var(--color-primary, #a78bfa);
}
</style>
