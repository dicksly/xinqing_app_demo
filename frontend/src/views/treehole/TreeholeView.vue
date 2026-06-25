<template>
  <div class="treehole-view">
    <div class="care-page treehole-redesign">
      <header class="care-page-header">
        <h1 class="care-page-title">{{ t('treehole.title') }}</h1>
        <p class="care-page-subtitle">{{ locale === 'zh-CN' ? '这里会安静地接住你想说的话' : 'A quiet place to hold what you need to say.' }}</p>
      </header>

      <section class="care-card pad treehole-composer">
        <el-input
          v-model="entryForm.content"
          class="quiet-field letter-input"
          type="textarea"
          :rows="7"
          :placeholder="t('treehole.placeholder')"
          maxlength="1000"
          show-word-limit
          resize="none"
        />

        <div class="composer-tools">
          <button
            type="button"
            class="tool-pill care-touch"
            :class="{ active: activeComposerPanel === 'voice' || recordingTime > 0 }"
            @click="toggleComposerPanel('voice')"
          >
            <img :src="voiceToolIcon" class="tool-image" :alt="locale === 'zh-CN' ? '语音' : 'Voice'" />
            <span>{{ locale === 'zh-CN' ? '语音' : 'Voice' }}</span>
            <small v-if="recordingTime > 0">{{ recordingTime }}s</small>
          </button>
          <button
            type="button"
            class="tool-pill care-touch"
            :class="{ active: activeComposerPanel === 'image' || !!uploadedImage }"
            @click="toggleComposerPanel('image')"
          >
            <img :src="imageToolIcon" class="tool-image" :alt="locale === 'zh-CN' ? '图片' : 'Image'" />
            <span>{{ locale === 'zh-CN' ? '图片' : 'Image' }}</span>
          </button>
        </div>

        <transition name="panel-fade">
          <div v-if="activeComposerPanel === 'voice'" class="care-card soft composer-panel">
            <button type="button" class="record-button" :class="{ recording: isRecording }" @click="toggleRecording">
              {{ isRecording ? (locale === 'zh-CN' ? '停止录音' : 'Stop') : (locale === 'zh-CN' ? '开始录音' : 'Record') }}
            </button>
            <span v-if="recordingTime > 0">{{ recordingTime }}s</span>
            <el-checkbox v-model="entryForm.hasVoiceChange">{{ t('treehole.voiceChange') }}</el-checkbox>
            <audio v-if="voiceBlobUrl" :src="voiceBlobUrl" controls />
          </div>
        </transition>

        <transition name="panel-fade">
          <div v-if="activeComposerPanel === 'image'" class="care-card soft composer-panel">
            <el-upload
              v-if="!uploadedImage"
              class="image-uploader"
              action="#"
              :show-file-list="false"
              :before-upload="beforeUpload"
              accept="image/*"
            >
              <button type="button" class="record-button">{{ locale === 'zh-CN' ? '添加图片' : 'Add Image' }}</button>
            </el-upload>
            <div v-else class="image-preview compact-image-preview">
              <img :src="uploadedImage" alt="preview" />
              <el-button size="small" type="danger" @click="removeImage" circle class="remove-btn">
                <component :is="CircleClose" />
              </el-button>
            </div>
          </div>
        </transition>

        <div class="privacy-switches">
          <button
            type="button"
            class="privacy-option"
            :class="{ active: entryForm.isAnonymous }"
            @click="entryForm.isAnonymous = !entryForm.isAnonymous"
          >
            <img :src="anonymousIcon" alt="" />
            {{ t('treehole.anonymous') }}
          </button>
          <button
            type="button"
            class="privacy-option"
            :class="{ active: entryForm.isPublished }"
            @click="entryForm.isPublished = !entryForm.isPublished"
          >
            {{ t('treehole.publishToSquare') }}
          </button>
        </div>

        <el-button
          type="primary"
          size="large"
          :loading="submitting"
          @click="handleSubmit"
          class="submit-btn send-button"
          round
        >
          {{ t('treehole.sendToTreehole') }}
        </el-button>
      </section>

      <section v-if="aiResponse" class="care-card pad ai-redesign" :class="riskLevel">
        <h2 class="care-card-title">{{ t('treehole.aiResponse') }}</h2>
        <p>{{ aiResponse }}</p>
      </section>

      <section class="care-card pad square-redesign">
        <h2 class="care-card-title">{{ t('treehole.squareTitle') }}</h2>
        <div class="segmented-row square-tabs-redesign" style="--segment-count: 2">
          <button class="segment-button" :class="{ active: activeTab === 'latest' }" type="button" @click="activeTab = 'latest'">
            {{ t('treehole.latest') }}
          </button>
          <button class="segment-button" :class="{ active: activeTab === 'mine' }" type="button" @click="activeTab = 'mine'">
            {{ t('treehole.mine') }}
          </button>
        </div>

        <div v-if="loading" class="treehole-empty">{{ locale === 'zh-CN' ? '正在轻轻加载...' : 'Loading softly...' }}</div>
        <div v-else-if="activeTab === 'latest' && entries.length === 0" class="treehole-empty">
          <span class="image2-badge sage">
            <img :src="treeholeIcon" class="image2-icon" alt="树洞" />
          </span>
          <p>暂无公开条目，等第一句话慢慢长出来。</p>
        </div>
        <div v-else class="entries-list redesign-list">
          <article
            v-for="entry in activeTab === 'latest' ? paginatedEntries : paginatedMyEntries"
            :key="entry.id"
            class="entry-item-redesign"
            @click="showDetail(entry)"
          >
            <h3>{{ entry.is_anonymous ? '有人刚刚放下了一点心事' : '一条新的树洞记录' }}</h3>
            <p v-if="entry.content">{{ entry.content?.substring(0, 86) }}{{ entry.content?.length > 86 ? '...' : '' }}</p>
            <p v-else>{{ entry.duration > 0 ? '语音记录' : '图片记录' }}</p>
            <div class="entry-meta">
              <span>{{ formatTime(entry.created_at) }}</span>
              <button
                type="button"
                class="entry-social-button"
                :class="{ active: getEntryInteraction(entry).liked }"
                @click.stop="toggleLike(entry)"
              >
                点赞 {{ getEntryInteraction(entry).likeCount }}
              </button>
              <span class="entry-social-count">评论 {{ getEntryInteraction(entry).comments.length }}</span>
              <button
                v-if="activeTab === 'mine'"
                type="button"
                class="delete-inline"
                @click.stop="removeEntry(entry.id)"
              >
                删除
              </button>
            </div>
          </article>
          <el-pagination
            v-if="activeTab === 'latest' && entries.length > pageSize"
            v-model:current-page="latestPage"
            class="list-pagination"
            layout="prev, pager, next"
            :page-size="pageSize"
            :total="entries.length"
            small
          />
          <el-pagination
            v-if="activeTab === 'mine' && myEntries.length > pageSize"
            v-model:current-page="minePage"
            class="list-pagination"
            layout="prev, pager, next"
            :page-size="pageSize"
            :total="myEntries.length"
            small
          />
        </div>
      </section>
    </div>

    <!-- 倾诉卡片 -->
    <section class="confess-card card">
      <header class="card-header">
        <component :is="ChatDotRound" class="header-icon" />
        <div class="header-copy">
          <h2 class="card-title">{{ t('treehole.title') }}</h2>
          <p class="card-subtitle">{{ locale === 'zh-CN' ? '把今天想说的话放下来，先让情绪有个出口。' : 'Set down what you need to say and give today an emotional outlet.' }}</p>
        </div>
        <span class="panel-chip">{{ locale === 'zh-CN' ? 'Safe space' : 'Safe space' }}</span>
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
          <div v-if="voiceBlobUrl" class="voice-playback">
            <audio :src="voiceBlobUrl" controls />
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
              <audio v-if="selectedEntry.voice_url" :src="selectedEntry.voice_url" controls />
              <div v-else class="voice-hint">{{ locale === 'zh-CN' ? '音频未上传，仅保留时长记录' : 'Audio is not uploaded; duration only' }}</div>
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

        <div class="interaction-section">
          <button
            type="button"
            class="detail-like-button"
            :class="{ active: getEntryInteraction(selectedEntry).liked }"
            @click="toggleLike(selectedEntry)"
          >
            点赞 {{ getEntryInteraction(selectedEntry).likeCount }}
          </button>

          <div class="comment-composer">
            <el-input
              v-model="commentDraft"
              size="large"
              placeholder="写一句温柔的评论"
              maxlength="120"
            />
            <el-button type="primary" round @click="submitComment(selectedEntry)">评论</el-button>
          </div>

          <div v-if="getEntryInteraction(selectedEntry).comments.length > 0" class="comment-list">
            <article
              v-for="comment in getEntryInteraction(selectedEntry).comments"
              :key="comment.id"
              class="comment-item"
            >
              <p>{{ comment.content }}</p>
              <div v-if="comment.replies.length > 0" class="reply-list">
                <p v-for="reply in comment.replies" :key="reply.id" class="reply-row">
                  {{ reply.content }}
                </p>
              </div>
              <div class="reply-composer">
                <el-input
                  v-model="replyDrafts[comment.id]"
                  size="small"
                  placeholder="回复"
                  maxlength="100"
                />
                <el-button size="small" round @click="submitReply(selectedEntry, comment.id)">回复</el-button>
              </div>
            </article>
          </div>
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
import { computed, ref, onBeforeUnmount, onMounted } from 'vue'
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
  hasLocalEntry,
  mergePublishedEntries,
  sortEntriesByNewest,
  upsertSavedEntry
} from '../../utils/treehole-feed'
import {
  addTreeholeComment,
  addTreeholeReply,
  detectTreeholeSensitivity,
  getTreeholeInteraction,
  normalizeTreeholeInteractions,
  toggleTreeholeLike
} from '../../utils/treehole-interactions'
import { compressImageDataUrl } from '../../utils/image-upload'
import { togglePanel } from '../../utils/treehole-composer'
import voiceToolIcon from '../../assets/icons/image2-utility-voice.png'
import imageToolIcon from '../../assets/icons/image2-utility-image.png'
import anonymousIcon from '../../assets/icons/image2-utility-anonymous.png'
import treeholeIcon from '../../assets/icons/image2-treehole.png'

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
const mediaRecorder = ref(null)
const recordingStream = ref(null)
const audioChunks = ref([])
const voiceBlobUrl = ref(null)
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
const interactionState = ref(normalizeTreeholeInteractions(readTreeholeInteractions()))
const commentDraft = ref('')
const replyDrafts = ref({})

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

function getEntryId(entry) {
  return String(entry?.id ?? entry?.created_at ?? entry?.content ?? 'draft')
}

function readTreeholeInteractions() {
  try {
    return JSON.parse(localStorage.getItem('xinqing_treehole_interactions') || '{}')
  } catch (error) {
    console.error('读取树洞互动失败:', error)
    return {}
  }
}

function persistTreeholeInteractions(nextState) {
  interactionState.value = normalizeTreeholeInteractions(nextState)
  localStorage.setItem('xinqing_treehole_interactions', JSON.stringify(interactionState.value))
}

function getEntryInteraction(entry) {
  return getTreeholeInteraction(interactionState.value, getEntryId(entry))
}

function toggleLike(entry) {
  persistTreeholeInteractions(toggleTreeholeLike(interactionState.value, getEntryId(entry)))
}

function submitComment(entry) {
  const nextState = addTreeholeComment(interactionState.value, getEntryId(entry), commentDraft.value)
  persistTreeholeInteractions(nextState)
  commentDraft.value = ''
}

function submitReply(entry, commentId) {
  const draft = replyDrafts.value[commentId] ?? ''
  const nextState = addTreeholeReply(interactionState.value, getEntryId(entry), commentId, draft)
  persistTreeholeInteractions(nextState)
  replyDrafts.value = {
    ...replyDrafts.value,
    [commentId]: '',
  }
}

// 切换录音状态
async function toggleRecording() {
  if (!isRecording.value) {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      ElMessage.error(locale.value === 'zh-CN' ? '当前浏览器不支持录音' : 'Recording is not supported in this browser')
      return
    }

    if (voiceBlobUrl.value) {
      URL.revokeObjectURL(voiceBlobUrl.value)
      voiceBlobUrl.value = null
    }

    try {
      recordingStream.value = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunks.value = []
      mediaRecorder.value = new MediaRecorder(recordingStream.value)
      mediaRecorder.value.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.value.push(event.data)
        }
      }
      mediaRecorder.value.onstop = () => {
        const blob = new Blob(audioChunks.value, { type: mediaRecorder.value?.mimeType || 'audio/webm' })
        if (blob.size > 0) {
          voiceBlobUrl.value = URL.createObjectURL(blob)
        }
      }
      mediaRecorder.value.start()
    } catch (error) {
      console.error('录音失败:', error)
      ElMessage.error(locale.value === 'zh-CN' ? '无法访问麦克风' : 'Could not access microphone')
      return
    }

    isRecording.value = true
    recordingTime.value = 0
    recordingTimer.value = setInterval(() => {
      recordingTime.value++
      if (recordingTime.value >= 60) {
        toggleRecording()
      }
    }, 1000)

    ElMessage.info(locale.value === 'zh-CN' ? '开始录音...' : 'Recording started...')
  } else {
    isRecording.value = false

    if (recordingTimer.value) {
      clearInterval(recordingTimer.value)
      recordingTimer.value = null
    }

    if (mediaRecorder.value?.state === 'recording') {
      mediaRecorder.value.stop()
    }
    if (recordingStream.value) {
      recordingStream.value.getTracks().forEach((track) => track.stop())
      recordingStream.value = null
    }

    if (recordingTime.value > 0) {
      ElMessage.success(locale.value === 'zh-CN' ? `录音完成，时长 ${recordingTime.value} 秒` : `Recording complete, ${recordingTime.value}s`)
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
  if (isRecording.value) {
    ElMessage.warning(locale.value === 'zh-CN' ? '请先结束录音' : 'Please stop recording first')
    return
  }

  const hasText = Boolean(entryForm.value.content?.trim())
  const hasVoice = recordingTime.value > 0
  const hasImage = Boolean(uploadedImage.value)

  if (!hasText && !hasVoice && !hasImage) {
    ElMessage.warning(locale.value === 'zh-CN' ? '请至少输入文字、录音或上传图片中的一种' : 'Please add text, voice, or image')
    return
  }

  const sensitivity = detectTreeholeSensitivity(entryForm.value.content)
  if (sensitivity.level === 'severe') {
    entryForm.value.isPublished = false
    ElMessage.warning(locale.value === 'zh-CN' ? '检测到高风险表达，我先帮你设为私密；如果此刻有危险，请立刻联系身边可信任的人或当地紧急援助。' : 'High-risk language detected. This entry will stay private. If you are in immediate danger, contact a trusted person or local emergency support now.')
  } else if (sensitivity.level === 'mild' && entryForm.value.isPublished) {
    ElMessage.warning(locale.value === 'zh-CN' ? '检测到比较沉重的表达，发布前请确认你愿意公开。' : 'Heavy language detected. Please make sure you want to publish it.')
  }

  submitting.value = true
  try {
    const entryData = {
      ...entryForm.value,
      duration: hasVoice ? recordingTime.value : 0,
      voice_url: hasVoice ? voiceBlobUrl.value : null,
      created_at: new Date().toISOString(),
      id: Date.now(),
    }

    const response = await treeholeApi.create(entryData)
    const savedEntry = {
      ...entryData,
      ...(response.data || {}),
      voice_url: entryData.voice_url,
    }

    // 显示 AI 响应和风险等级
    if (response.data?.ai_response) {
      aiResponse.value = response.data.ai_response
      riskLevel.value = response.data.risk_level
    }

    // 保存到本地存储
    const savedEntries = JSON.parse(localStorage.getItem('xinqing_treehole_records') || '[]')
    localStorage.setItem('xinqing_treehole_records', JSON.stringify(upsertSavedEntry(savedEntries, savedEntry, entryData.id)))

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
    voiceBlobUrl.value = null
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
      voice_url: recordingTime.value > 0 ? voiceBlobUrl.value : null,
      created_at: new Date().toISOString(),
      id: Date.now(),
    }
    const savedEntries = JSON.parse(localStorage.getItem('xinqing_treehole_records') || '[]')
    savedEntries.unshift(entryData)
    localStorage.setItem('xinqing_treehole_records', JSON.stringify(savedEntries))

    ElMessage.success(locale.value === 'zh-CN' ? '已保存到本地！' : 'Saved locally!')
    entryForm.value = {
      content: '',
      hasVoiceChange: false,
      isAnonymous: true,
      isPublished: false,
      image_data: null,
    }
    uploadedImage.value = null
    recordingTime.value = 0
    voiceBlobUrl.value = null
    activeComposerPanel.value = null
    loadEntries()
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

async function removeEntry(entryId) {
  const savedEntries = JSON.parse(localStorage.getItem('xinqing_treehole_records') || '[]')
  const isLocalEntry = hasLocalEntry(savedEntries, entryId)

  try {
    await treeholeApi.delete(entryId)
  } catch (error) {
    if (!isLocalEntry && error.response?.status !== 404) {
      console.error('删除后端条目失败:', error)
      ElMessage.error(locale.value === 'zh-CN' ? '删除失败' : 'Delete failed')
      return
    }
  }

  try {
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

  if (diff < 60000) return locale.value === 'zh-CN' ? '刚刚' : 'Just now'
  if (diff < 3600000) return locale.value === 'zh-CN' ? `${Math.floor(diff / 60000)}分钟前` : `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return locale.value === 'zh-CN' ? `${Math.floor(diff / 3600000)}小时前` : `${Math.floor(diff / 3600000)}h ago`
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

function cleanupRecordingResources() {
  if (recordingTimer.value) {
    clearInterval(recordingTimer.value)
    recordingTimer.value = null
  }
  if (mediaRecorder.value?.state === 'recording') {
    mediaRecorder.value.stop()
  }
  if (recordingStream.value) {
    recordingStream.value.getTracks().forEach((track) => track.stop())
    recordingStream.value = null
  }
}

onMounted(() => {
  loadEntries()
  loadMyEntries()
})

onBeforeUnmount(() => {
  cleanupRecordingResources()
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

.voice-playback {
  margin-top: 10px;
}

.voice-playback audio,
.voice-player audio {
  width: 100%;
  max-width: 260px;
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
  border-bottom: 1px solid var(--color-border-light);
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
  color: var(--color-text-primary);
}

.detail-time {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

.detail-body {
  margin-bottom: 16px;
}

.detail-text-content {
  font-size: 15px;
  color: var(--color-text-secondary);
  line-height: 1.8;
  white-space: pre-wrap;
  margin: 0;
}

.detail-voice-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--color-bg-tertiary);
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
  color: var(--color-text-primary);
}

.voice-hint {
  font-size: 12px;
  color: var(--color-text-muted);
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
  background: var(--color-bg-tertiary);
  border-radius: 12px;
  color: var(--color-text-muted);
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
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.header-copy {
  flex: 1;
  min-width: 0;
}

.confess-card .card-header,
.ai-response-card .card-header,
.public-square-card .card-header {
  align-items: flex-start;
}

.confess-card .header-icon,
.ai-response-card .header-icon,
.public-square-card .header-icon {
  margin-top: 2px;
}

.card-subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.45;
  color: var(--color-text-muted);
}

.panel-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.58);
  border: 1px solid var(--color-border-light);
  color: var(--color-primary-dark);
  font-size: 11px;
  font-weight: 700;
}

.confess-card {
  background:
    linear-gradient(160deg, color-mix(in srgb, var(--surface-2) 84%, transparent) 0%, color-mix(in srgb, var(--surface-1) 92%, transparent) 100%),
    var(--accent-gradient-secondary);
}

.content-input :deep(.el-textarea__inner) {
  min-height: 132px;
  border-radius: 20px;
}

.composer-toolbar {
  gap: 10px;
}

.tool-chip {
  min-height: 38px;
  padding: 0 14px;
  background: color-mix(in srgb, var(--surface-2) 90%, transparent);
}

.compact-panel {
  padding: 14px;
  border-radius: 18px;
  background: color-mix(in srgb, var(--surface-3) 84%, transparent);
}

.publish-options {
  gap: 10px;
}

.publish-options :deep(.el-checkbox) {
  display: flex;
  align-items: center;
  min-height: 46px;
  padding: 0 12px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--surface-3) 84%, transparent);
  border: 1px solid var(--color-border-light);
}

.submit-btn {
  min-height: 50px;
  box-shadow: 0 14px 28px color-mix(in srgb, var(--color-primary) 24%, transparent);
}

.ai-response-card {
  background:
    linear-gradient(160deg, color-mix(in srgb, var(--surface-2) 88%, transparent) 0%, color-mix(in srgb, var(--surface-1) 90%, transparent) 100%),
    var(--accent-gradient-soft);
}

.public-square-card {
  background: color-mix(in srgb, var(--surface-2) 92%, transparent);
}

.entry-item {
  padding: 12px;
  border: 1px solid var(--color-border-light);
  background: color-mix(in srgb, var(--surface-3) 86%, transparent);
}

.entry-item:hover {
  box-shadow: var(--shadow-sm);
}

.entry-ai-response,
.ai-reply-section {
  background: color-mix(in srgb, var(--color-secondary) 12%, var(--surface-2));
  border: 1px solid color-mix(in srgb, var(--color-secondary) 20%, transparent);
}

[data-ui-theme='glow-night'] .confess-card {
  background:
    linear-gradient(180deg, rgba(19, 26, 49, 0.92) 0%, rgba(10, 15, 28, 0.96) 100%),
    var(--accent-gradient-secondary);
}

[data-ui-theme='playful-bloom'] .tool-chip.active {
  background: color-mix(in srgb, var(--color-primary) 14%, white);
}

.treehole-view > .confess-card,
.treehole-view > .ai-response-card,
.treehole-view > .public-square-card {
  display: none;
}

.treehole-redesign {
  gap: 16px;
}

.treehole-composer {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.letter-input :deep(.el-textarea__inner) {
  min-height: 126px !important;
  padding: 18px;
  border-radius: 20px;
  background: #FBF7F3;
  color: var(--color-text-primary);
  font-size: 15px;
  line-height: 1.6;
  box-shadow: inset 0 0 0 1px var(--h5-border);
}

.composer-tools {
  display: flex;
  gap: 10px;
}

.tool-pill {
  min-height: 44px;
  padding: 0 15px;
  border-radius: 999px;
  border: 1px solid var(--h5-border);
  background: var(--h5-surface);
  color: var(--color-text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 900;
  cursor: pointer;
}

.tool-pill.active {
  color: var(--h5-primary);
  background: #F7D8E1;
  border-color: rgba(217, 94, 118, 0.22);
}

.tool-image {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.composer-panel {
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.record-button {
  min-height: 38px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  color: #fff;
  background: var(--h5-sage);
  font-weight: 900;
  cursor: pointer;
}

.record-button.recording {
  background: var(--h5-primary);
}

.privacy-switches {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.privacy-option {
  min-height: 46px;
  border-radius: 16px;
  border: 1px solid var(--h5-border);
  background: var(--h5-surface);
  color: var(--color-text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 900;
  cursor: pointer;
}

.privacy-option img {
  width: 26px;
  height: 26px;
  object-fit: contain;
}

.privacy-option.active {
  color: var(--h5-primary);
  background: #F7D8E1;
  border-color: rgba(217, 94, 118, 0.26);
}

.send-button {
  width: 100%;
  min-height: 56px;
  font-size: 18px;
  font-weight: 900;
}

.ai-redesign p {
  margin: 10px 0 0;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.square-redesign {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.treehole-empty {
  min-height: 118px;
  border-radius: 20px;
  background: #FBF7F3;
  color: var(--color-text-muted);
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
}

.treehole-empty p {
  margin: 0;
}

.redesign-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.entry-item-redesign {
  padding: 16px;
  border-radius: 18px;
  background: #F4ECE7;
  cursor: pointer;
}

.entry-item-redesign h3 {
  margin: 0;
  font-size: 16px;
  line-height: 1.3;
  font-weight: 900;
}

.entry-item-redesign p {
  margin: 10px 0 0;
  color: var(--color-text-secondary);
  line-height: 1.55;
  font-weight: 700;
}

.entry-meta {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 800;
}

.entry-social-button,
.detail-like-button {
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(217, 94, 118, 0.2);
  background: rgba(255, 255, 255, 0.72);
  color: var(--h5-primary);
  font-weight: 900;
  cursor: pointer;
}

.entry-social-button.active,
.detail-like-button.active {
  background: #F7D8E1;
  border-color: rgba(217, 94, 118, 0.34);
}

.entry-social-count {
  color: var(--h5-sage);
}

.delete-inline {
  border: 0;
  background: transparent;
  color: var(--h5-primary);
  font-weight: 900;
}

.interaction-section {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--h5-border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-like-button {
  align-self: flex-start;
  min-height: 36px;
  padding: 0 14px;
}

.comment-composer,
.reply-composer {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: center;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.comment-item {
  padding: 12px;
  border-radius: 16px;
  background: #FBF7F3;
}

.comment-item p {
  margin: 0;
  color: var(--color-text-primary);
  font-weight: 800;
  line-height: 1.5;
}

.reply-list {
  margin: 8px 0;
  padding-left: 10px;
  border-left: 2px solid rgba(117, 139, 111, 0.24);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.reply-row {
  color: var(--color-text-secondary) !important;
  font-size: 13px;
}
</style>
