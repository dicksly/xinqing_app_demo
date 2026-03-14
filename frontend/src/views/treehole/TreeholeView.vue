<template>
  <div class="treehole-view">
    <!-- 倾诉卡片 -->
    <section class="confess-card card">
      <header class="card-header">
        <component :is="ChatDotRound" class="header-icon" />
        <h2 class="card-title">{{ t('treehole.title') }}</h2>
      </header>

      <!-- 文字输入 -->
      <div class="content-input">
        <el-input
          v-model="entryForm.content"
          type="textarea"
          :rows="4"
          :placeholder="t('treehole.placeholder')"
          maxlength="1000"
          show-word-limit
          resize="none"
        />
      </div>

      <div class="composer-toolbar">
        <button
          type="button"
          class="tool-chip"
          :class="{ active: activeComposerPanel === 'voice' || recordingTime > 0 }"
          @click="toggleComposerPanel('voice')"
        >
          <component :is="Microphone" class="tool-chip-icon" />
          <span>{{ locale === 'zh-CN' ? '语音' : 'Voice' }}</span>
          <span v-if="recordingTime > 0" class="tool-chip-badge">{{ recordingTime }}s</span>
        </button>

        <button
          type="button"
          class="tool-chip"
          :class="{ active: activeComposerPanel === 'image' || !!uploadedImage }"
          @click="toggleComposerPanel('image')"
        >
          <component :is="Picture" class="tool-chip-icon" />
          <span>{{ locale === 'zh-CN' ? '图片' : 'Image' }}</span>
        </button>
      </div>

      <transition name="panel-fade">
        <div v-if="activeComposerPanel === 'voice'" class="compact-panel voice-panel">
          <div class="voice-recorder compact-recorder">
            <button
              type="button"
              class="record-btn touchable compact-record-btn"
              :class="{ recording: isRecording }"
              @click="toggleRecording"
            >
              <component :is="isRecording ? VideoPause : Microphone" class="record-icon compact-record-icon" />
            </button>
            <div class="voice-panel-meta">
              <div class="panel-title">{{ locale === 'zh-CN' ? '录制语音' : 'Record voice' }}</div>
              <div class="record-hint">{{ isRecording ? t('treehole.stopRecording') : t('treehole.startRecording') }}</div>
            </div>
            <div v-if="recordingTime > 0" class="recording-time compact-time">
              {{ recordingTime }}s
            </div>
          </div>

          <div class="voice-option compact-option">
            <el-checkbox v-model="entryForm.hasVoiceChange">
              <component :is="Switch" class="check-icon" />
              <span>{{ t('treehole.voiceChange') }}</span>
            </el-checkbox>
          </div>
        </div>
      </transition>

      <transition name="panel-fade">
        <div v-if="activeComposerPanel === 'image'" class="compact-panel image-panel">
          <div v-if="!uploadedImage" class="compact-upload-card">
            <el-upload
              class="image-uploader compact-uploader"
              action="#"
              :show-file-list="false"
              :before-upload="beforeUpload"
              accept="image/*"
            >
              <div class="compact-upload-content">
                <component :is="Plus" class="compact-upload-icon" />
                <span>{{ locale === 'zh-CN' ? '添加图片' : 'Add image' }}</span>
              </div>
            </el-upload>
          </div>
          <div v-else class="image-preview compact-image-preview">
            <img :src="uploadedImage" alt="preview" />
            <el-button size="small" type="danger" @click="removeImage" circle class="remove-btn">
              <component :is="CircleClose" />
            </el-button>
          </div>
        </div>
      </transition>

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
              v-for="entry in paginatedEntries"
              :key="entry.id"
              class="entry-item"
              @click="showDetail(entry)"
            >
              <div class="entry-header">
                <div class="entry-type" :class="'type-' + entry.content_type">
                  <component :is="getTypeIcon(entry.content_type)" />
                </div>
                <span class="entry-time">{{ formatTime(entry.created_at) }}</span>
              </div>
              <p v-if="entry.content" class="entry-text">
                {{ entry.content?.substring(0, 100) }}{{ entry.content?.length > 100 ? '...' : '' }}
              </p>
              <p v-if="entry.duration > 0" class="entry-text voice-entry">
                <component :is="Microphone" class="voice-icon" />
                {{ locale === 'zh-CN' ? '语音记录' : 'Voice recording' }} ({{ entry.duration || 0 }}s)
              </p>
              <div v-if="entry.image_data" class="entry-image">
                <img v-if="entry.image_data" :src="entry.image_data" alt="entry image" />
                <span v-else class="image-placeholder">{{ locale === 'zh-CN' ? '图片' : 'Image' }}</span>
              </div>
              <!-- AI 回应 -->
              <div v-if="entry.ai_response" class="entry-ai-response">
                <component :is="Promotion" class="ai-icon-small" />
                <span>{{ entry.ai_response?.substring(0, 50) }}...</span>
              </div>
            </div>
            <el-pagination
              v-if="entries.length > pageSize"
              v-model:current-page="latestPage"
              class="list-pagination"
              layout="prev, pager, next"
              :page-size="pageSize"
              :total="entries.length"
              small
            />
          </div>
        </el-tab-pane>
        <el-tab-pane :label="t('treehole.mine')" name="mine">
          <el-empty v-if="myEntries.length === 0" :description="locale === 'zh-CN' ? '暂无记录' : 'No records'" :image-size="60" />
          <div v-else class="entries-list">
            <div
              v-for="entry in paginatedMyEntries"
              :key="entry.id"
              class="entry-item"
              @click="showDetail(entry)"
            >
              <div class="entry-header">
                <div class="entry-type" :class="'type-' + entry.content_type">
                  <component :is="getTypeIcon(entry.content_type)" />
                </div>
                <span class="entry-time">{{ formatTime(entry.created_at) }}</span>
                <el-tag v-if="entry.is_published" size="small" type="success">{{ locale === 'zh-CN' ? '已公开' : 'Public' }}</el-tag>
                <el-button
                  type="danger"
                  size="small"
                  text
                  class="delete-entry-btn"
                  @click.stop="removeEntry(entry.id)"
                >
                  <component :is="Delete" />
                </el-button>
              </div>
              <p v-if="entry.content" class="entry-text">
                {{ entry.content?.substring(0, 100) }}{{ entry.content?.length > 100 ? '...' : '' }}
              </p>
              <p v-if="entry.duration > 0" class="entry-text">
                {{ locale === 'zh-CN' ? '语音记录' : 'Voice recording' }} ({{ entry.duration }}s)
              </p>
              <div v-if="entry.image_data" class="entry-image">
                <img :src="entry.image_data" alt="entry image" />
              </div>
              <div v-if="entry.ai_response" class="entry-ai-response">
                <component :is="Promotion" class="ai-icon-small" />
                <span>{{ entry.ai_response?.substring(0, 50) }}...</span>
              </div>
            </div>
            <el-pagination
              v-if="myEntries.length > pageSize"
              v-model:current-page="minePage"
              class="list-pagination"
              layout="prev, pager, next"
              :page-size="pageSize"
              :total="myEntries.length"
              small
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </section>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      :title="locale === 'zh-CN' ? '树洞详情' : 'Treehole Detail'"
      width="90%"
      class="detail-dialog"
    >
      <div class="detail-content" v-if="selectedEntry">
        <!-- 头部 -->
        <div class="detail-header">
          <div class="detail-type-icon" :class="'type-' + selectedEntry.content_type">
            <component :is="getTypeIcon(selectedEntry.content_type)" />
          </div>
          <div class="detail-meta">
            <div class="detail-type-label">
              {{ getTypeLabel(selectedEntry.content_type) }}
            </div>
            <div class="detail-time">{{ formatTime(selectedEntry.created_at) }}</div>
          </div>
        </div>

        <div class="detail-body" v-if="selectedEntry.content">
          <p class="detail-text-content">{{ selectedEntry.content }}</p>
        </div>

        <div class="detail-body" v-if="selectedEntry.duration > 0">
          <div class="detail-voice-content">
            <div class="voice-player">
              <component :is="Microphone" class="voice-icon-large" />
              <div class="voice-duration">{{ selectedEntry.duration || 0 }}s</div>
              <div class="voice-hint">{{ locale === 'zh-CN' ? '点击播放语音' : 'Tap to play' }}</div>
            </div>
          </div>
        </div>

        <div class="detail-body" v-if="selectedEntry.image_data">
          <div class="detail-image-content">
            <img v-if="selectedEntry.image_data" :src="selectedEntry.image_data" alt="treehole image" />
            <div v-else class="image-placeholder-large">
              <component :is="Picture" class="placeholder-icon" />
              <span>{{ locale === 'zh-CN' ? '图片已上传' : 'Image uploaded' }}</span>
            </div>
          </div>
        </div>

        <!-- AI 回复 -->
        <div v-if="selectedEntry.ai_response" class="ai-reply-section">
          <div class="ai-reply-header">
            <component :is="Promotion" class="ai-icon" />
            <span class="ai-label">{{ locale === 'zh-CN' ? 'AI 回复' : 'AI Response' }}</span>
          </div>
          <div class="ai-reply-text">{{ selectedEntry.ai_response }}</div>
        </div>
      </div>

      <template #footer>
        <el-button @click="closeDetail" type="primary" round>
          {{ locale === 'zh-CN' ? '关闭' : 'Close' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
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
import {
  deleteLocalEntry,
  getPageItems,
  mergePublishedEntries,
  sortEntriesByNewest
} from '../../utils/treehole-feed'
import { compressImageDataUrl } from '../../utils/image-upload'
import { togglePanel } from '../../utils/treehole-composer'

const { t, locale } = useI18n()

// 表单数据
const entryForm = ref({
  content: '',
  hasVoiceChange: false,
  isAnonymous: true,
  isPublished: false,
  image_data: null,
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
const pageSize = 5
const latestPage = ref(1)
const minePage = ref(1)

// 详情弹窗
const detailVisible = ref(false)
const selectedEntry = ref(null)
const activeComposerPanel = ref(null)

const paginatedEntries = computed(() => getPageItems(entries.value, latestPage.value, pageSize))
const paginatedMyEntries = computed(() => getPageItems(myEntries.value, minePage.value, pageSize))

// 获取类型图标
function getTypeIcon(type) {
  const icons = {
    text: Document,
    voice: Microphone,
    image: Picture
  }
  return icons[type] || Document
}

// 获取类型标签
function getTypeLabel(type) {
  const labels = {
    text: locale.value === 'zh-CN' ? '文字' : 'Text',
    voice: locale.value === 'zh-CN' ? '语音' : 'Voice',
    image: locale.value === 'zh-CN' ? '图片' : 'Image'
  }
  return (labels[type] || type) + (locale.value === 'zh-CN' ? '内容' : ' Content')
}

function toggleComposerPanel(panelName) {
  activeComposerPanel.value = togglePanel(activeComposerPanel.value, panelName)
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
async function beforeUpload(file) {
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
  reader.onload = async (e) => {
    const compressedImage = await compressImageDataUrl(e.target.result)
    uploadedImage.value = compressedImage
    entryForm.value.image_data = compressedImage
  }
  reader.readAsDataURL(file)

  return false
}

// 移除图片
function removeImage() {
  uploadedImage.value = null
  entryForm.value.image_data = null
}

// 提交倾诉
async function handleSubmit() {
  const hasText = Boolean(entryForm.value.content?.trim())
  const hasVoice = recordingTime.value > 0
  const hasImage = Boolean(uploadedImage.value)

  if (!hasText && !hasVoice && !hasImage) {
    ElMessage.warning(locale.value === 'zh-CN' ? '请至少输入文字、录音或上传图片中的一种' : 'Please add text, voice, or image')
    return
  }

  submitting.value = true
  try {
    const entryData = {
      ...entryForm.value,
      duration: hasVoice ? recordingTime.value : 0,
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
      content: '',
      hasVoiceChange: false,
      isAnonymous: true,
      isPublished: false,
      image_data: null,
    }
    uploadedImage.value = null
    recordingTime.value = 0
    activeComposerPanel.value = null

    ElMessage.success(locale.value === 'zh-CN' ? '发送成功！' : 'Sent successfully!')
    loadEntries()
    loadMyEntries()
  } catch (error) {
    console.error('发送失败:', error)
    // 即使API失败也保存到本地
    const entryData = {
      ...entryForm.value,
      duration: recordingTime.value > 0 ? recordingTime.value : 0,
      created_at: new Date().toISOString(),
      id: Date.now(),
    }
    const savedEntries = JSON.parse(localStorage.getItem('xinqing_treehole_records') || '[]')
    savedEntries.unshift(entryData)
    localStorage.setItem('xinqing_treehole_records', JSON.stringify(savedEntries))

    ElMessage.success(locale.value === 'zh-CN' ? '已保存到本地！' : 'Saved locally!')
    activeComposerPanel.value = null
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
    const backendEntries = response.data || []
    const localEntries = JSON.parse(localStorage.getItem('xinqing_treehole_records') || '[]')
    entries.value = mergePublishedEntries(backendEntries, localEntries)
    latestPage.value = 1
  } catch (error) {
    console.error('加载条目失败:', error)
    const localEntries = JSON.parse(localStorage.getItem('xinqing_treehole_records') || '[]')
    entries.value = mergePublishedEntries([], localEntries)
    latestPage.value = 1
  } finally {
    loading.value = false
  }
}

// 加载我的条目
function loadMyEntries() {
  try {
    const savedEntries = JSON.parse(localStorage.getItem('xinqing_treehole_records') || '[]')
    myEntries.value = sortEntriesByNewest(savedEntries)
    const totalPages = Math.max(1, Math.ceil(myEntries.value.length / pageSize))
    minePage.value = Math.min(minePage.value, totalPages)
  } catch (error) {
    console.error('加载我的条目失败:', error)
    myEntries.value = []
    minePage.value = 1
  }
}

function removeEntry(entryId) {
  try {
    const savedEntries = JSON.parse(localStorage.getItem('xinqing_treehole_records') || '[]')
    const nextEntries = deleteLocalEntry(savedEntries, entryId)
    localStorage.setItem('xinqing_treehole_records', JSON.stringify(nextEntries))

    if (selectedEntry.value?.id === entryId) {
      closeDetail()
    }

    loadMyEntries()
    loadEntries()
    ElMessage.success(locale.value === 'zh-CN' ? '已删除' : 'Deleted')
  } catch (error) {
    console.error('删除条目失败:', error)
    ElMessage.error(locale.value === 'zh-CN' ? '删除失败' : 'Delete failed')
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

// 显示详情
function showDetail(entry) {
  selectedEntry.value = entry
  detailVisible.value = true
}

// 关闭详情
function closeDetail() {
  detailVisible.value = false
  selectedEntry.value = null
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

/* 内容输入 */
.content-input {
  margin-bottom: var(--spacing-sm, 10px);
}

/* 紧凑工具条 */
.composer-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.tool-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid var(--color-border, #dbe3ec);
  border-radius: 999px;
  background: #fff;
  color: var(--color-text-secondary, #64748b);
  font-size: 12px;
  transition: all 0.2s ease;
}

.tool-chip.active {
  border-color: rgba(16, 185, 129, 0.35);
  background: rgba(16, 185, 129, 0.08);
  color: var(--color-primary, #10b981);
}

.tool-chip-icon {
  width: 14px;
  height: 14px;
}

.tool-chip-badge {
  font-size: 11px;
  color: var(--color-text-muted, #94a3b8);
}

.compact-panel {
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid var(--color-border-light, #e8eef5);
  border-radius: 14px;
  background: #fbfcfd;
}

.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.panel-fade-enter-from,
.panel-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.voice-recorder {
  display: flex;
  align-items: center;
  gap: 12px;
}

.compact-recorder {
  justify-content: flex-start;
}

.voice-panel-meta {
  flex: 1;
}

.panel-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary, #1e293b);
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
  border: 0;
}

.record-btn.recording {
  background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
  animation: pulse 1.5s infinite;
}

.compact-record-btn {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
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

.compact-record-icon {
  width: 18px;
  height: 18px;
}

.recording-time {
  font-size: var(--font-xl, 20px);
  font-weight: 600;
  color: var(--color-text-primary, #1e293b);
}

.compact-time {
  font-size: 13px;
  min-width: 38px;
  text-align: right;
}

.record-hint {
  font-size: var(--font-xs, 11px);
  color: var(--color-text-muted, #94a3b8);
}

.compact-option {
  margin-top: 10px;
}

.check-icon {
  width: 14px;
  height: 14px;
  margin-right: var(--spacing-xs, 4px);
}

/* 图片上传 */
.image-uploader {
  width: 100%;
}

.compact-uploader :deep(.el-upload) {
  width: 100%;
}

.compact-uploader :deep(.el-upload-dragger),
.compact-uploader :deep(.el-upload) {
  width: 100%;
}

.compact-upload-card {
  border-radius: 12px;
  background: var(--color-bg-tertiary, #f8fafc);
}

.compact-uploader :deep(.el-upload-dragger) {
  width: 100%;
  height: 84px;
  border: 1px dashed var(--color-border, #dbe3ec);
  border-radius: 12px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base, 0.2s ease);
}

.compact-uploader :deep(.el-upload-dragger:hover) {
  border-color: var(--color-primary, #10b981);
  background: rgba(16, 185, 129, 0.05);
}

.compact-upload-content {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-secondary, #64748b);
}

.compact-upload-icon {
  width: 16px;
  height: 16px;
  color: var(--color-primary, #10b981);
}

.compact-image-preview {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}

.compact-image-preview img {
  width: 100%;
  max-height: 180px;
  object-fit: cover;
}

/* 发布选项 */
.publish-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 14px;
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

.dark .record-btn {
  background: linear-gradient(135deg, var(--color-primary, #a78bfa) 0%, var(--color-primary-light, #c4b5fd) 100%);
}

.dark .tool-chip {
  background: rgba(31, 28, 42, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark .tool-chip.active {
  border-color: rgba(167, 139, 250, 0.35);
  background: rgba(167, 139, 250, 0.12);
  color: #c4b5fd;
}

.dark .compact-panel {
  background: rgba(31, 28, 42, 0.8);
  border-color: rgba(255, 255, 255, 0.08);
}

.dark .compact-uploader :deep(.el-upload-dragger) {
  background: rgba(31, 28, 42, 0.4);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark .compact-uploader :deep(.el-upload-dragger:hover) {
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

/* 详情弹窗 */
.entry-item {
  cursor: pointer;
  transition: all 0.2s ease;
}

.entry-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.detail-dialog :deep(.el-dialog) {
  border-radius: 16px;
}

.detail-content {
  padding: 8px 0;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.detail-type-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-type-icon.type-text {
  background: rgba(16, 185, 129, 0.15);
}

.detail-type-icon.type-text svg {
  color: #10b981;
}

.detail-type-icon.type-voice {
  background: rgba(139, 92, 246, 0.15);
}

.detail-type-icon.type-voice svg {
  color: #8b5cf6;
}

.detail-type-icon.type-image {
  background: rgba(251, 191, 36, 0.15);
}

.detail-type-icon.type-image svg {
  color: #fbbf24;
}

.detail-type-icon svg {
  width: 20px;
  height: 20px;
}

.detail-meta {
  flex: 1;
}

.detail-type-label {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.detail-time {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

.detail-body {
  margin-bottom: 16px;
}

.detail-text-content {
  font-size: 15px;
  color: #334155;
  line-height: 1.8;
  white-space: pre-wrap;
  margin: 0;
}

.detail-voice-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #f1f5f9;
  border-radius: 12px;
}

.voice-player {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.voice-icon-large {
  width: 48px;
  height: 48px;
  color: #8b5cf6;
}

.voice-duration {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
}

.voice-hint {
  font-size: 12px;
  color: #94a3b8;
}

.detail-image-content {
  text-align: center;
}

.detail-image-content img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 12px;
  object-fit: contain;
}

.image-placeholder-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 150px;
  background: #f1f5f9;
  border-radius: 12px;
  color: #94a3b8;
}

.placeholder-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 8px;
}

.ai-reply-section {
  padding: 12px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%);
  border-radius: 12px;
}

.ai-reply-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.ai-reply-header .ai-icon {
  width: 16px;
  height: 16px;
  color: #8b5cf6;
}

.ai-label {
  font-size: 13px;
  font-weight: 500;
  color: #8b5cf6;
}

.ai-reply-text {
  font-size: 14px;
  color: #334155;
  line-height: 1.7;
}
</style>
