<template>
  <div class="knowledge-view">
    <!-- 每日金句卡片 -->
    <section class="quote-card card">
      <header class="card-header">
        <component :is="Trophy" class="header-icon" />
        <h2 class="card-title">每日金句</h2>
        <span class="date-tag">{{ currentDate }}</span>
      </header>

      <div class="quote-content">
        <p class="quote-text">"{{ dailyQuote.text }}"</p>
        <p class="quote-author">— {{ dailyQuote.author }}</p>
      </div>
    </section>

    <!-- 内容分类标签页 -->
    <section class="content-section card">
      <el-tabs v-model="activeCategory" class="content-tabs">
        <!-- 短视频/条漫 -->
        <el-tab-pane label="视频" name="video">
          <div v-loading="loading" class="video-grid">
            <div
              v-for="item in videoContent"
              :key="item.id"
              class="video-item touchable"
              @click="viewContent(item)"
            >
              <div class="video-thumb">
                <component :is="VideoPlay" class="play-icon" />
              </div>
              <div class="video-info">
                <h3 class="video-title">{{ item.title }}</h3>
                <span class="video-category">{{ item.category }}</span>
                <div class="video-meta">
                  <component :is="View" />
                  <span>{{ item.view_count }}</span>
                </div>
              </div>
            </div>
          </div>
          <el-empty v-if="!loading && videoContent.length === 0" description="暂无内容" :image-size="60" />
        </el-tab-pane>

        <!-- 心理测试 -->
        <el-tab-pane label="测试" name="test">
          <div v-loading="loading" class="test-list">
            <div
              v-for="test in tests"
              :key="test.id"
              class="test-item touchable"
              @click="startTest(test)"
            >
              <div class="test-icon" :class="test.iconClass">
                <component :is="test.icon" />
              </div>
              <div class="test-info">
                <h3 class="test-title">{{ test.title }}</h3>
                <p class="test-desc">{{ test.desc }}</p>
                <div class="test-meta">
                  <span class="meta-tag">{{ test.duration }}</span>
                  <span class="meta-tag">{{ test.questions_count }}题</span>
                </div>
              </div>
              <el-button type="primary" size="small" round>开始</el-button>
            </div>
          </div>
        </el-tab-pane>

        <!-- 知识文章 -->
        <el-tab-pane label="文章" name="article">
          <div v-loading="loading" class="article-list">
            <div
              v-for="article in articles"
              :key="article.id"
              class="article-item touchable"
              @click="viewArticle(article)"
            >
              <div class="article-header">
                <h3 class="article-title">{{ article.title }}</h3>
                <span class="article-tag">{{ article.category }}</span>
              </div>
              <p class="article-preview">{{ article.content?.substring(0, 80) }}...</p>
              <div class="article-footer">
                <span class="article-time">{{ formatTime(article.created_at) }}</span>
                <div class="article-views">
                  <component :is="View" />
                  <span>{{ article.view_count }}</span>
                </div>
              </div>
            </div>
          </div>
          <el-empty v-if="!loading && articles.length === 0" description="暂无文章" :image-size="60" />
        </el-tab-pane>

        <!-- 专题策划 -->
        <el-tab-pane label="专题" name="topic">
          <div class="topic-list">
            <div
              v-for="topic in topics"
              :key="topic.id"
              class="topic-item"
            >
              <div class="topic-header">
                <div class="topic-title">
                  <component :is="FolderOpened" class="topic-icon" />
                  <span>{{ topic.title }}</span>
                </div>
                <span class="topic-status" :class="topic.statusClass">{{ topic.status }}</span>
              </div>
              <p class="topic-desc">{{ topic.desc }}</p>
              <div class="topic-footer">
                <span class="topic-count">{{ topic.content_count }}个内容</span>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </section>

    <!-- 内容详情对话框 -->
    <el-dialog
      v-model="showContentDialog"
      :title="currentContent.title"
      width="90%"
      :style="{ maxWidth: '400px' }"
      :close-on-click-modal="false"
      class="content-dialog"
    >
      <div class="content-detail">
        <span class="content-category">{{ currentContent.category }}</span>
        <div class="content-body">
          <p v-html="currentContent.content" class="content-text"></p>
        </div>
        <div class="content-tags" v-if="currentContent.tags">
          <span
            v-for="(tag, index) in parsedTags"
            :key="index"
            class="content-tag"
          >
            {{ tag }}
          </span>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showContentDialog = false">关闭</el-button>
          <el-button type="primary" @click="likeContent">
            <component :is="StarFilled" />
            <span>收藏</span>
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 测试对话框 -->
    <el-dialog
      v-model="showTestDialog"
      :title="currentTest.title"
      width="90%"
      :style="{ maxWidth: '400px' }"
      :close-on-click-modal="false"
      class="test-dialog"
    >
      <div v-if="!testCompleted" class="test-questions">
        <div
          v-for="(question, index) in currentTest.questions"
          :key="index"
          class="question-item"
        >
          <h4 class="question-title">问题 {{ index + 1 }}: {{ question.text }}</h4>
          <el-radio-group v-model="question.selectedAnswer" class="question-options">
            <el-radio
              v-for="option in question.options"
              :key="option.value"
              :label="option.value"
            >
              {{ option.text }}
            </el-radio>
          </el-radio-group>
        </div>
      </div>
      <div v-else class="test-result">
        <div class="result-header">
          <component :is="CircleCheckFilled" class="result-icon" />
          <h3>测试完成</h3>
        </div>
        <div class="result-detail">
          <h4>测试结果分析</h4>
          <p>{{ testResult }}</p>
          <div class="divider"></div>
          <h4>建议</h4>
          <p>{{ testSuggestion }}</p>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showTestDialog = false">取消</el-button>
          <el-button v-if="!testCompleted" type="primary" @click="submitTest">提交测试</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Trophy,
  View,
  FolderOpened,
  VideoPlay,
  StarFilled,
  CircleCheckFilled,
  Cpu,
  Timer,
  Connection
} from '@element-plus/icons-vue'
import { knowledgeApi } from '../../api'
import { ElMessage } from 'element-plus'

// 每日金句
const dailyQuote = ref({
  text: "生命中最重要的不是你遭遇了什么，而是你记住了什么。",
  author: "未知",
})

const currentDate = ref('')

// 内容数据
const activeCategory = ref('video')
const loading = ref(false)
const videoContent = ref([])
const tests = ref([])
const articles = ref([])
const topics = ref([])

// 对话框状态
const showContentDialog = ref(false)
const showTestDialog = ref(false)
const currentContent = ref({})
const currentTest = ref({})
const testCompleted = ref(false)
const testResult = ref('')
const testSuggestion = ref('')

// 解析标签
const parsedTags = computed(() => {
  if (!currentContent.value.tags) return []
  try {
    return JSON.parse(currentContent.value.tags)
  } catch {
    return []
  }
})

// 模拟数据 - 使用 SVG 图标
const mockTests = [
  {
    id: 1,
    title: 'MBTI 人格类型简化版',
    icon: Cpu,
    iconClass: 'icon-blue',
    desc: '探索你的性格类型，了解自己',
    duration: '5分钟',
    questions_count: 12,
    questions: [
      {
        text: '在社交场合中，你通常会？',
        options: [
          { value: 'A', text: '主动与人交谈' },
          { value: 'B', text: '偶尔参与对话' },
          { value: 'C', text: '更多时间倾听' },
          { value: 'D', text: '希望早点离开' },
        ],
        selectedAnswer: '',
      },
      {
        text: '做决定时，你更倾向于？',
        options: [
          { value: 'A', text: '凭感觉和直觉' },
          { value: 'B', text: '分析利弊后决定' },
          { value: 'C', text: '参考他人意见' },
          { value: 'D', text: '纠结很久才决定' },
        ],
        selectedAnswer: '',
      },
      {
        text: '面对压力时，你会？',
        options: [
          { value: 'A', text: '积极寻找解决方案' },
          { value: 'B', text: '先放松一下再处理' },
          { value: 'C', text: '寻求他人帮助' },
          { value: 'D', text: '感到焦虑和无助' },
        ],
        selectedAnswer: '',
      },
    ],
  },
  {
    id: 2,
    title: '压力自测表',
    icon: Timer,
    iconClass: 'icon-orange',
    desc: '评估你当前的压力水平',
    duration: '3分钟',
    questions_count: 10,
    questions: [],
  },
  {
    id: 3,
    title: '依恋类型测试',
    icon: Connection,
    iconClass: 'icon-pink',
    desc: '了解你在亲密关系中的依恋模式',
    duration: '8分钟',
    questions_count: 15,
    questions: [],
  },
]

const mockTopics = [
  {
    id: 1,
    title: '考试季抗压指南',
    status: '进行中',
    statusClass: 'status-active',
    desc: '帮助考生调整心态，发挥最佳水平',
    content_count: 12,
  },
  {
    id: 2,
    title: '毕业季迷茫破解',
    status: '即将开始',
    statusClass: 'status-pending',
    desc: '从校园到职场的心理过渡指南',
    content_count: 8,
  },
  {
    id: 3,
    title: '求职季心理建设',
    status: '规划中',
    statusClass: 'status-planned',
    desc: '在求职过程中保持良好心态',
    content_count: 10,
  },
]

// 格式化日期
function formatDate() {
  const options = { month: 'short', day: 'numeric', weekday: 'short' }
  return new Date().toLocaleDateString('zh-CN', options)
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

// 查看内容
function viewContent(item) {
  currentContent.value = item
  showContentDialog.value = true
}

// 开始测试
function startTest(test) {
  currentTest.value = test
  testCompleted.value = false
  showTestDialog.value = true
}

// 查看文章
function viewArticle(article) {
  currentContent.value = {
    ...article,
    type: 'article',
  }
  showContentDialog.value = true
}

// 提交测试
function submitTest() {
  // 检查是否所有问题都已回答
  const unanswered = currentTest.value.questions.filter(q => !q.selectedAnswer)
  if (unanswered.length > 0) {
    ElMessage.warning('请完成所有问题再提交')
    return
  }

  // 模拟计算结果
  const results = ['INTJ', 'INFJ', 'ISTJ', 'ISFJ', 'ENTP', 'ENFP', 'ESTP', 'ESFP']
  const randomResult = results[Math.floor(Math.random() * results.length)]

  testResult.value = `您的性格类型是：${randomResult}`
  testSuggestion.value = `${randomResult}型的人通常善于深度思考。建议你在面对压力时，给自己更多时间进行内省和规划。`

  testCompleted.value = true
  ElMessage.success('测试完成！')
}

// 收藏内容
function likeContent() {
  ElMessage.success('已收藏到我的收藏夹')
  showContentDialog.value = false
}

// 加载内容
async function loadContent() {
  loading.value = true
  try {
    const [videosResponse, articlesResponse] = await Promise.all([
      knowledgeApi.getList({ content_type: 'video' }),
      knowledgeApi.getList({ content_type: 'article' }),
    ])

    videoContent.value = videosResponse.data
    articles.value = articlesResponse.data

    // 使用模拟数据补充测试和专题
    tests.value = mockTests
    topics.value = mockTopics
  } catch (error) {
    console.error('加载内容失败:', error)
    // 使用模拟数据
    videoContent.value = [
      {
        id: 1,
        title: '什么是焦虑症',
        content_type: 'video',
        category: '心理健康',
        content: '焦虑症是一种常见的心理健康问题...',
        view_count: 1234,
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        title: '如何拒绝精神内耗',
        content_type: 'video',
        category: '情绪管理',
        content: '精神内耗是现代人常见的心理困扰...',
        view_count: 987,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ]

    tests.value = mockTests
    topics.value = mockTopics
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  currentDate.value = formatDate()
  loadContent()
})
</script>

<style scoped>
.knowledge-view {
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

.card-title {
  font-size: var(--font-lg, 17px);
  font-weight: 600;
  color: var(--color-text-primary, #1e293b);
  margin: 0;
  flex: 1;
}

.date-tag {
  font-size: var(--font-xs, 11px);
  color: var(--color-text-muted, #94a3b8);
  background: var(--color-bg-tertiary, #f1f5f9);
  padding: 2px 8px;
  border-radius: var(--radius-full, 9999px);
}

/* 金句卡片 */
.quote-card {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
}

.quote-content {
  text-align: center;
  padding: var(--spacing-sm, 8px) 0;
}

.quote-text {
  font-size: var(--font-base, 15px);
  color: var(--color-text-primary, #1e293b);
  line-height: 1.6;
  font-style: italic;
  margin: 0 0 var(--spacing-sm, 8px) 0;
}

.quote-author {
  font-size: var(--font-sm, 13px);
  color: var(--color-text-muted, #94a3b8);
  margin: 0;
}

/* 内容标签页 */
.content-section {
  padding: 0;
}

.content-tabs {
  padding: var(--spacing-md, 16px);
}

.content-tabs :deep(.el-tabs__header) {
  margin-bottom: var(--spacing-md, 16px);
}

/* 视频网格 */
.video-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm, 8px);
}

.video-item {
  border-radius: var(--radius-md, 12px);
  overflow: hidden;
  background: var(--color-bg-tertiary, #f1f5f9);
}

.video-thumb {
  height: 100px;
  background: linear-gradient(135deg, var(--color-primary, #10b981) 0%, var(--color-primary-light, #34d399) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-icon {
  width: 32px;
  height: 32px;
  color: white;
  opacity: 0.9;
}

.video-info {
  padding: var(--spacing-sm, 8px);
}

.video-title {
  font-size: var(--font-sm, 13px);
  font-weight: 500;
  color: var(--color-text-primary, #1e293b);
  margin: 0 0 var(--spacing-xs, 4px) 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-category {
  font-size: var(--font-xs, 11px);
  color: var(--color-text-muted, #94a3b8);
  display: block;
  margin-bottom: var(--spacing-xs, 4px);
}

.video-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 4px);
  font-size: var(--font-xs, 11px);
  color: var(--color-text-muted, #94a3b8);
}

.video-meta svg {
  width: 12px;
  height: 12px;
}

/* 测试列表 */
.test-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 8px);
}

.test-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 8px);
  padding: var(--spacing-sm, 8px);
  border-radius: var(--radius-md, 12px);
  background: var(--color-bg-tertiary, #f1f5f9);
}

.test-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md, 12px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.test-icon svg {
  width: 22px;
  height: 22px;
}

.icon-blue { background: rgba(59, 130, 246, 0.15); }
.icon-blue svg { color: #3b82f6; }
.icon-orange { background: rgba(251, 191, 36, 0.15); }
.icon-orange svg { color: #fbbf24; }
.icon-pink { background: rgba(244, 114, 182, 0.15); }
.icon-pink svg { color: #f472b6; }

.test-info {
  flex: 1;
  min-width: 0;
}

.test-title {
  font-size: var(--font-sm, 13px);
  font-weight: 500;
  color: var(--color-text-primary, #1e293b);
  margin: 0 0 var(--spacing-xs, 4px) 0;
}

.test-desc {
  font-size: var(--font-xs, 11px);
  color: var(--color-text-muted, #94a3b8);
  margin: 0 0 var(--spacing-xs, 4px) 0;
}

.test-meta {
  display: flex;
  gap: var(--spacing-xs, 4px);
}

.meta-tag {
  font-size: 10px;
  color: var(--color-text-muted, #94a3b8);
  background: var(--color-bg-card, #ffffff);
  padding: 2px 6px;
  border-radius: var(--radius-full, 9999px);
}

/* 文章列表 */
.article-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 8px);
}

.article-item {
  padding: var(--spacing-sm, 8px);
  border-radius: var(--radius-md, 12px);
  background: var(--color-bg-tertiary, #f1f5f9);
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-xs, 4px);
}

.article-title {
  font-size: var(--font-sm, 13px);
  font-weight: 500;
  color: var(--color-text-primary, #1e293b);
  margin: 0;
  flex: 1;
}

.article-tag {
  font-size: 10px;
  color: var(--color-primary, #10b981);
  background: rgba(16, 185, 129, 0.1);
  padding: 2px 6px;
  border-radius: var(--radius-full, 9999px);
  flex-shrink: 0;
}

.article-preview {
  font-size: var(--font-xs, 11px);
  color: var(--color-text-secondary, #64748b);
  margin: 0 0 var(--spacing-xs, 4px) 0;
  line-height: 1.5;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-time {
  font-size: 10px;
  color: var(--color-text-muted, #94a3b8);
}

.article-views {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 4px);
  font-size: 10px;
  color: var(--color-text-muted, #94a3b8);
}

.article-views svg {
  width: 12px;
  height: 12px;
}

/* 专题列表 */
.topic-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 8px);
}

.topic-item {
  padding: var(--spacing-sm, 8px);
  border-radius: var(--radius-md, 12px);
  background: var(--color-bg-tertiary, #f1f5f9);
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs, 4px);
}

.topic-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 4px);
  font-size: var(--font-sm, 13px);
  font-weight: 500;
  color: var(--color-text-primary, #1e293b);
}

.topic-icon {
  width: 16px;
  height: 16px;
  color: var(--color-secondary, #8b5cf6);
}

.topic-status {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: var(--radius-full, 9999px);
}

.status-active {
  background: rgba(16, 185, 129, 0.15);
  color: var(--color-primary, #10b981);
}

.status-pending {
  background: rgba(251, 191, 36, 0.15);
  color: var(--color-warm, #fbbf24);
}

.status-planned {
  background: rgba(148, 163, 184, 0.15);
  color: var(--color-text-muted, #94a3b8);
}

.topic-desc {
  font-size: var(--font-xs, 11px);
  color: var(--color-text-secondary, #64748b);
  margin: 0 0 var(--spacing-xs, 4px) 0;
}

.topic-footer {
  display: flex;
  justify-content: flex-end;
}

.topic-count {
  font-size: 10px;
  color: var(--color-text-muted, #94a3b8);
}

/* 内容详情对话框 */
.content-dialog :deep(.el-dialog__body) {
  padding: var(--spacing-md, 16px);
}

.content-detail {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 8px);
}

.content-category {
  font-size: var(--font-xs, 11px);
  color: var(--color-primary, #10b981);
  background: rgba(16, 185, 129, 0.1);
  padding: 2px 8px;
  border-radius: var(--radius-full, 9999px);
  align-self: flex-start;
}

.content-body {
  margin: var(--spacing-xs, 4px) 0;
}

.content-text {
  font-size: var(--font-sm, 13px);
  color: var(--color-text-primary, #1e293b);
  line-height: 1.7;
  margin: 0;
}

.content-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs, 4px);
}

.content-tag {
  font-size: var(--font-xs, 11px);
  color: var(--color-text-muted, #94a3b8);
  background: var(--color-bg-tertiary, #f1f5f9);
  padding: 2px 8px;
  border-radius: var(--radius-full, 9999px);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm, 8px);
}

.dialog-footer .el-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 4px);
}

.dialog-footer .el-button svg {
  width: 14px;
  height: 14px;
}

/* 测试对话框 */
.test-dialog :deep(.el-dialog__body) {
  padding: var(--spacing-md, 16px);
}

.test-questions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 16px);
}

.question-item {
  padding: var(--spacing-sm, 8px);
  background: var(--color-bg-tertiary, #f1f5f9);
  border-radius: var(--radius-md, 12px);
}

.question-title {
  font-size: var(--font-sm, 13px);
  font-weight: 500;
  color: var(--color-text-primary, #1e293b);
  margin: 0 0 var(--spacing-sm, 8px) 0;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs, 4px);
}

.question-options :deep(.el-radio) {
  margin-right: 0;
  height: auto;
}

.question-options :deep(.el-radio__label) {
  font-size: var(--font-xs, 11px);
  color: var(--color-text-secondary, #64748b);
}

/* 测试结果 */
.test-result {
  text-align: center;
}

.result-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm, 8px);
  margin-bottom: var(--spacing-md, 16px);
}

.result-icon {
  width: 48px;
  height: 48px;
  color: var(--color-primary, #10b981);
}

.result-header h3 {
  font-size: var(--font-lg, 17px);
  color: var(--color-text-primary, #1e293b);
  margin: 0;
}

.result-detail {
  text-align: left;
  padding: var(--spacing-md, 16px);
  background: var(--color-bg-tertiary, #f1f5f9);
  border-radius: var(--radius-md, 12px);
}

.result-detail h4 {
  font-size: var(--font-sm, 13px);
  font-weight: 500;
  color: var(--color-text-primary, #1e293b);
  margin: 0 0 var(--spacing-xs, 4px) 0;
}

.result-detail p {
  font-size: var(--font-xs, 11px);
  color: var(--color-text-secondary, #64748b);
  margin: 0 0 var(--spacing-sm, 8px) 0;
  line-height: 1.6;
}

.divider {
  height: 1px;
  background: var(--color-border, #e2e8f0);
  margin: var(--spacing-sm, 8px) 0;
}

/* 响应式 */
@media (max-width: 360px) {
  .video-grid {
    grid-template-columns: 1fr;
  }

  .test-item {
    flex-wrap: wrap;
  }

  .test-item .el-button {
    width: 100%;
    margin-top: var(--spacing-xs, 4px);
  }
}

/* 深色模式 - 温暖紫色系 */
.dark .quote-card {
  background: linear-gradient(135deg, rgba(167, 139, 250, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
}

.dark .content-section {
  background: rgba(45, 42, 62, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.dark .video-item {
  background: rgba(31, 28, 42, 0.8);
}

.dark .video-thumb {
  background: linear-gradient(135deg, var(--color-primary, #a78bfa) 0%, var(--color-primary-light, #c4b5fd) 100%);
}

.dark .test-item {
  background: rgba(31, 28, 42, 0.8);
}

.dark .meta-tag {
  background: rgba(45, 42, 62, 0.8);
}

.dark .article-item {
  background: rgba(31, 28, 42, 0.8);
}

.dark .article-tag {
  background: rgba(167, 139, 250, 0.15);
  color: var(--color-primary, #a78bfa);
}

.dark .topic-item {
  background: rgba(31, 28, 42, 0.8);
}

.dark .content-tag {
  background: rgba(31, 28, 42, 0.8);
}

.dark .question-item {
  background: rgba(31, 28, 42, 0.8);
}

.dark .result-detail {
  background: rgba(31, 28, 42, 0.8);
}

.dark .result-icon {
  color: var(--color-primary, #a78bfa);
}
</style>
