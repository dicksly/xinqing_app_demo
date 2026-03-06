<template>
  <div class="treehole-view">
    <!-- 倾诉卡片 -->
    <el-card class="倾诉卡片" shadow="hover">
      <template #header>
          <div class="card-header">
            <el-icon><ChatDotRound /></el-icon>
            <span>倾诉你的心声</span>
          </div>
      </template>

      <!-- 内容类型选择 -->
      <div class="content-type-selector">
        <el-radio-group v-model="entryForm.contentType">
          <el-radio-button label="text">
            <el-icon><Document /></el-icon>
            文字
          </el-radio-button>
          <el-radio-button label="voice">
            <el-icon><Microphone /></el-icon>
            语音
          </el-radio-button>
          <el-radio-button label="image">
            <el-icon><Picture /></el-icon>
            图片
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 文字输入 -->
      <div v-if="entryForm.contentType === 'text'" class="content-input">
        <el-input
          v-model="entryForm.content"
          type="textarea"
          :rows="6"
          placeholder="把这里当作树洞，说出你的烦恼、痛苦或心事..."
          maxlength="1000"
          show-word-limit
        />
      </div>

      <!-- 语音输入（模拟） -->
      <div v-if="entryForm.contentType === 'voice'" class="voice-input">
        <div class="voice-recorder">
          <el-button
            :icon="isRecording ? 'VideoPause' : 'Microphone'"
            :type="isRecording ? 'danger' : 'primary'"
            circle
            size="large"
            @click="toggleRecording"
          >
            {{ isRecording ? '停止' : '开始' }}录音
          </el-button>
          <div v-if="recordingTime > 0" class="recording-time">
            {{ recordingTime }}s
          </div>
        </div>
        
        <el-checkbox v-model="entryForm.hasVoiceChange" class="voice-change">
          <el-icon><Switch /></el-icon>
          变声处理（保护隐私）
        </el-checkbox>
      </div>

      <!-- 图片输入（模拟） -->
      <div v-if="entryForm.contentType === 'image'" class="image-input">
        <el-upload
          class="image-uploader"
          action="#"
          :show-file-list="false"
          :before-upload="beforeUpload"
          accept="image/*"
        >
          <el-icon class="uploader-icon"><Plus /></el-icon>
          <div class="uploader-text">点击上传图片</div>
        </el-upload>
      </div>

      <!-- 发布选项 -->
      <div class="publish-options">
        <el-checkbox v-model="entryForm.isAnonymous">
          <el-icon><Lock /></el-icon>
          匿名发布
        </el-checkbox>
        <el-checkbox v-model="entryForm.isPublished">
          <el-icon><Share /></el-icon>
          发布到广场（脱敏后）
        </el-checkbox>
      </div>

      <!-- 提交按钮 -->
      <el-button
        type="primary"
        size="large"
        :loading="submitting"
        @click="handleSubmit"
        class="submit-btn"
      >
        发送到树洞
      </el-button>
    </el-card>

    <!-- AI 响应卡片 -->
    <el-card v-if="aiResponse" class="ai-response-card" shadow="hover">
      <template #header>
          <div class="card-header ai-header">
            <el-icon><Promotion /></el-icon>
            <span>AI 倾听回应</span>
          </div>
      </template>

      <div class="ai-response-content">
        {{ aiResponse }}
      </div>

      <!-- 风险预警 -->
      <el-alert
        v-if="riskLevel !== 'safe'"
        :title="riskLevel === 'severe' ? '⚠️ 关心提醒' : '💚 温馨提示'"
        :type="riskLevel === 'severe' ? 'error' : 'warning'"
        :description="riskDescription"
        :closable="false"
        class="risk-alert"
      >
        <template #default>
          <div v-if="riskLevel === 'severe'" class="severe-warning">
            <p>如果您有危险的想法，请立即寻求帮助：</p>
            <ul class="help-links">
              <li>📞 全国24小时心理援助热线：<strong>400-161-9995</strong></li>
              <li>📞 生命热线：<strong>021-62798990</strong></li>
              <li>🏥 当地危机干预中心</li>
            </ul>
          </div>
          <div v-else class="mild-warning">
            <p>我感受到了你现在的痛苦。建议你：</p>
            <ul>
              <li>深呼吸几次，让自己先平静下来</li>
              <li>去"正念与放松实验室"试试冥想练习</li>
              <li>如果觉得持续困扰，可以考虑找专业的心理咨询师聊聊</li>
            </ul>
          </div>
        </template>
      </el-alert>
    </el-card>

    <!-- 公开树洞广场 -->
    <el-card class="public-square-card" shadow="hover">
      <template #header>
          <div class="card-header">
            <el-icon><Reading /></el-icon>
            <span>树洞广场 - 匿名倾诉</span>
          </div>
      </template>

      <el-tabs v-model="activeTab" class="square-tabs">
        <el-tab-pane label="最新" name="latest">
          <div v-if="loading" class="loading">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else-if="entries.length === 0" class="empty">
            <el-empty description="暂无公开条目" />
          </div>
          <div v-else class="entries-list">
            <div
              v-for="entry in entries"
              :key="entry.id"
              class="entry-item"
            >
              <div class="entry-content-type">
                <el-icon v-if="entry.content_type === 'text'"><Document /></el-icon>
                <el-icon v-else-if="entry.content_type === 'voice'"><Microphone /></el-icon>
                <el-icon v-else><Picture /></el-icon>
              </div>
              <div class="entry-text">
                {{ entry.content ? entry.content.substring(0, 100) + '...' : '[媒体内容]' }}
              </div>
              <div class="entry-footer">
                <span class="entry-time">{{ formatTime(entry.created_at) }}</span>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="我的" name="mine">
          <el-empty description="功能开发中..." />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ChatDotRound, Document, Microphone, Picture, Plus, Lock, Share, Promotion, Reading } from '@element-plus/icons-vue'
import { treeholeApi } from '../../api'
import { ElMessage } from 'element-plus'

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

// 公开广场
const entries = ref([])
const loading = ref(false)
const activeTab = ref('latest')

// 计算属性
const riskDescription = computed(() => {
  if (riskLevel.value === 'severe') {
    return '我们检测到您可能处于危险的状况，请不要独自承受。'
  } else if (riskLevel.value === 'mild') {
    return '我们注意到您情绪有些低落，这是可以理解的。'
  }
  return ''
})

// 切换录音状态
function toggleRecording() {
  isRecording.value = !isRecording.value

  if (isRecording.value) {
    // 开始录音
    recordingTime.value = 0
    recordingTimer.value = setInterval(() => {
      recordingTime.value++
    }, 1000)
    
    ElMessage.info('开始录音...')
  } else {
    // 停止录音
    if (recordingTimer.value) {
      clearInterval(recordingTimer.value)
      recordingTimer.value = null
    }
    
    if (recordingTime.value > 0) {
      ElMessage.success(`录音完成，时长 ${recordingTime.value} 秒`)
    } else {
      ElMessage.warning('录音时间太短，请重新录制')
    }
  }
}

// 图片上传（模拟）
function beforeUpload(file) {
  ElMessage.success('图片上传成功（模拟）')
  entryForm.value.content = `[图片：${file.name}]`
  return false
}

// 提交倾诉
async function handleSubmit() {
  if (entryForm.value.contentType === 'text' && !entryForm.value.content) {
    ElMessage.warning('请输入内容')
    return
  }

  submitting.value = true
  try {
    const response = await treeholeApi.create({
      ...entryForm.value,
    })

    // 显示 AI 响应和风险等级
    if (response.data.ai_response) {
      aiResponse.value = response.data.ai_response
      riskLevel.value = response.data.risk_level
    }

    // 重置表单
    entryForm.value = {
      contentType: 'text',
      content: '',
      hasVoiceChange: false,
      isAnonymous: true,
      isPublished: false,
    }

    ElMessage.success('发送成功！')
    loadEntries()
  } catch (error) {
    console.error('发送失败:', error)
    ElMessage.error('发送失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 加载公开条目
async function loadEntries() {
  loading.value = true
  try {
    const response = await treeholeApi.getPublished()
    entries.value = response.data
  } catch (error) {
    console.error('加载条目失败:', error)
  } finally {
    loading.value = false
  }
}

// 格式化时间
function formatTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return date.toLocaleDateString()
}

onMounted(() => {
  loadEntries()
})
</script>

<style scoped>
.treehole-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  color: #8b7e74;
}

.card-header .el-icon {
  font-size: 22px;
  margin-right: 8px;
}

.ai-header {
  color: #d4a373;
}

.content-type-selector {
  margin-bottom: 20px;
}

.content-type-selector .el-radio-button {
  margin-right: 12px;
}

.content-input {
  margin-bottom: 20px;
}

.voice-input {
  margin-bottom: 20px;
}

.voice-recorder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 0;
  background: #faf8f6;
  border-radius: 12px;
}

.recording-time {
  font-size: 24px;
  font-weight: bold;
  color: #6b5e54;
}

.voice-change {
  margin-top: 16px;
  color: #8b7e74;
}

.image-input {
  margin-bottom: 20px;
}

.image-uploader {
  width: 100%;
  height: 200px;
  border: 2px dashed #e8dcd4;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.image-uploader:hover {
  border-color: #d4a373;
  background: #f8f4f0;
}

.uploader-icon {
  font-size: 48px;
  color: #d4a373;
  margin-bottom: 12px;
}

.uploader-text {
  font-size: 14px;
  color: #8b7e74;
}

.publish-options {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.publish-options .el-checkbox {
  margin: 0;
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  background: linear-gradient(135deg, #d4a373 0%, #e6ccb2 100%);
  border: none;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #c59463 0%, #d6bca2 100%);
}

.ai-response-card {
  border-color: #d4a373;
}

.ai-response-content {
  padding: 16px 0;
  color: #6b5e54;
  line-height: 1.8;
  font-size: 15px;
}

.risk-alert {
  margin-top: 16px;
}

.severe-warning {
  padding: 16px;
}

.severe-warning p {
  margin: 8px 0;
  font-weight: bold;
}

.help-links {
  list-style: none;
  padding: 0;
}

.help-links li {
  margin: 8px 0;
  padding: 8px 12px;
  background: #fef9f3;
  border-left: 4px solid #d4a373;
  border-radius: 4px;
}

.mild-warning ul {
  margin: 8px 0;
  padding-left: 20px;
}

.square-tabs {
  margin-top: 24px;
}

.entries-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.entry-item {
  padding: 16px;
  border: 1px solid #e8dcd4;
  border-radius: 8px;
  transition: all 0.3s;
}

.entry-item:hover {
  border-color: #d4a373;
  background: #faf8f6;
}

.entry-content-type {
  font-size: 20px;
  margin-bottom: 8px;
}

.entry-text {
  color: #6b5e54;
  line-height: 1.6;
  margin-bottom: 8px;
}

.entry-footer {
  display: flex;
  justify-content: flex-end;
}

.entry-time {
  font-size: 12px;
  color: #8b7e74;
}

.loading {
  padding: 20px 0;
}

.empty {
  padding: 40px 0;
}
</style>
