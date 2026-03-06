<template>
  <div class="knowledge-view">
    <!-- 每日金句卡片 -->
    <el-card class="daily-quote-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><Trophy /></el-icon>
          <span>每日金句</span>
          <el-tag type="success" size="small">{{ currentDate }}</el-tag>
        </div>
      </template>

      <div class="quote-content">
        <p class="quote-text">"{{ dailyQuote.text }}"</p>
        <p class="quote-author">— {{ dailyQuote.author }}</p>
      </div>
    </el-card>

    <!-- 内容分类 -->
    <el-tabs v-model="activeCategory" class="content-tabs">
      <!-- 短视频/条漫 -->
      <el-tab-pane label="短视频/条漫" name="video">
        <div v-loading="loading" class="video-grid">
          <div
            v-for="item in videoContent"
            :key="item.id"
            class="video-item"
            @click="viewContent(item)"
          >
            <div class="video-thumb">
              <span class="video-type-icon">📺</span>
            </div>
            <div class="video-info">
              <h3 class="video-title">{{ item.title }}</h3>
              <p class="video-desc">{{ item.category }}</p>
              <div class="video-meta">
                <el-icon><View /></el-icon>
                <span>{{ item.view_count }} 次浏览</span>
              </div>
            </div>
          </div>
        </div>
        <el-empty v-if="!loading && videoContent.length === 0" description="暂无内容" />
      </el-tab-pane>

      <!-- 心理测试 -->
      <el-tab-pane label="心理测试" name="test">
        <div v-loading="loading" class="test-grid">
          <div
            v-for="test in tests"
            :key="test.id"
            class="test-item"
            @click="startTest(test)"
          >
            <div class="test-icon">{{ test.icon }}</div>
            <div class="test-info">
              <h3 class="test-title">{{ test.title }}</h3>
              <p class="test-desc">{{ test.desc }}</p>
              <div class="test-meta">
                <el-tag size="small">{{ test.duration }}</el-tag>
                <el-tag size="small" type="info">{{ test.questions_count }}题</el-tag>
              </div>
            </div>
            <el-button type="primary" round>开始测试</el-button>
          </div>
        </div>
      </el-tab-pane>

      <!-- 知识文章 -->
      <el-tab-pane label="知识文章" name="article">
        <div v-loading="loading" class="article-list">
          <el-card
            v-for="article in articles"
            :key="article.id"
            class="article-item"
            shadow="hover"
            @click="viewArticle(article)"
          >
            <div class="article-header">
              <h3 class="article-title">{{ article.title }}</h3>
              <el-tag>{{ article.category }}</el-tag>
            </div>
            <div class="article-preview">
              {{ article.content.substring(0, 100) }}...
            </div>
            <div class="article-footer">
              <span class="article-time">{{ formatTime(article.created_at) }}</span>
              <el-icon><View /></el-icon>
              <span>{{ article.view_count }}</span>
            </div>
          </el-card>
        </div>
        <el-empty v-if="!loading && articles.length === 0" description="暂无文章" />
      </el-tab-pane>

      <!-- 专题策划 -->
      <el-tab-pane label="专题策划" name="topic">
        <div class="topic-list">
          <div
            v-for="topic in topics"
            :key="topic.id"
            class="topic-item"
          >
            <div class="topic-header">
              <div class="topic-title">
                <el-icon><FolderOpened /></el-icon>
                <span>{{ topic.title }}</span>
              </div>
              <el-tag type="warning">{{ topic.status }}</el-tag>
            </div>
            <div class="topic-cover">
              {{ topic.cover }}
            </div>
            <div class="topic-desc">{{ topic.desc }}</div>
            <div class="topic-content">
              <span class="topic-count">{{ topic.content_count }}个内容</span>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 内容详情对话框 -->
    <el-dialog
      v-model="showContentDialog"
      :title="currentContent.title"
      width="70%"
      :close-on-click-modal="false"
      class="content-dialog"
    >
      <div class="content-detail">
        <div class="content-category">
          <el-tag>{{ currentContent.category }}</el-tag>
        </div>
        <div class="content-body">
          <p v-html="currentContent.content" class="content-text"></p>
        </div>
        <div class="content-tags" v-if="currentContent.tags">
          <el-tag
            v-for="(tag, index) in JSON.parse(currentContent.tags)"
            :key="index"
            size="small"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showContentDialog = false">关闭</el-button>
          <el-button type="primary" @click="likeContent">👍 收藏</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 测试对话框 -->
    <el-dialog
      v-model="showTestDialog"
      :title="currentTest.title"
      width="60%"
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
          <el-radio-group v-model="question.selectedAnswer">
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
        <el-result
          icon="success"
          title="测试完成"
          sub-title="您的测试结果已生成"
        />
        <div class="result-detail">
          <h4>测试结果分析</h4>
          <p>{{ testResult }}</p>
          <el-divider />
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
import { ref, onMounted, computed } from 'vue'
import { Trophy, View, FolderOpened, Star } from '@element-plus/icons-vue'
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

// 模拟数据
const mockTests = [
  {
    id: 1,
    title: 'MBTI 人格类型简化版',
    icon: '🧠',
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
    icon: '🌡️',
    desc: '评估你当前的压力水平',
    duration: '3分钟',
    questions_count: 10,
    questions: [],
  },
  {
    id: 3,
    title: '依恋类型测试',
    icon: '❤️',
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
    cover: '📚',
    desc: '帮助考生调整心态，发挥最佳水平',
    content_count: 12,
  },
  {
    id: 2,
    title: '毕业季迷茫破解',
    status: '即将开始',
    cover: '🎓',
    desc: '从校园到职场的心理过渡指南',
    content_count: 8,
  },
  {
    id: 3,
    title: '求职季心理建设',
    status: '规划中',
    cover: '💼',
    desc: '在求职过程中保持良好心态',
    content_count: 10,
  },
]

// 格式化日期
function formatDate() {
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
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

.daily-quote-card {
  background: linear-gradient(135deg, #fef9f3 0%, #f8f4f0 100%);
}

.quote-content {
  text-align: center;
  padding: 20px;
}

.quote-text {
  font-size: 18px;
  color: #6b5e54;
  line-height: 1.8;
  font-style: italic;
  margin: 16px 0;
}

.quote-author {
  font-size: 14px;
  color: #8b7e74;
}

.content-tabs {
  margin-top: 24px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.video-item {
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  background: #ffffff;
  border: 2px solid #e8dcd4;
}

.video-item:hover {
  border-color: #d4a373;
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(212, 163, 115, 0.15);
}

.video-thumb {
  height: 160px;
  background: linear-gradient(135deg, #d4a373 0%, #e6ccb2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.video-type-icon {
  font-size: 48px;
  opacity: 0.8;
}

.video-info {
  padding: 16px;
}

.video-title {
  font-size: 16px;
  font-weight: bold;
  color: #6b5e54;
  margin: 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-desc {
  font-size: 13px;
  color: #8b7e74;
  margin-bottom: 8px;
}

.video-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #8b7e74;
}

.test-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.test-item {
  padding: 24px;
  border-radius: 12px;
  border: 2px solid #e8dcd4;
  background: #ffffff;
  text-align: center;
  transition: all 0.3s;
}

.test-item:hover {
  border-color: #d4a373;
  box-shadow: 0 4px 12px rgba(212, 163, 115, 0.15);
}

.test-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.test-title {
  font-size: 18px;
  font-weight: bold;
  color: #6b5e54;
  margin: 8px 0;
}

.test-desc {
  font-size: 14px;
  color: #8b7e74;
  margin-bottom: 16px;
  line-height: 1.6;
}

.test-meta {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-item {
  border-radius: 12px;
  border: 1px solid #e8dcd4;
  cursor: pointer;
  transition: all 0.3s;
}

.article-item:hover {
  border-color: #d4a373;
  box-shadow: 0 4px 12px rgba(212, 163, 115, 0.1);
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.article-title {
  font-size: 18px;
  font-weight: bold;
  color: #6b5e54;
  margin: 0;
}

.article-preview {
  padding: 0 16px 16px;
  color: #6b5e54;
  line-height: 1.6;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid #f5f5f5;
}

.article-time {
  font-size: 12px;
  color: #8b7e74;
}

.topic-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.topic-item {
  border-radius: 12px;
  border: 2px solid #e8dcd4;
  background: #ffffff;
  padding: 20px;
  transition: all 0.3s;
}

.topic-item:hover {
  border-color: #d4a373;
  box-shadow: 0 4px 12px rgba(212, 163, 115, 0.1);
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.topic-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
  color: #6b5e54;
}

.topic-cover {
  font-size: 32px;
  margin: 16px 0;
  text-align: center;
}

.topic-desc {
  color: #8b7e74;
  line-height: 1.6;
  margin-bottom: 12px;
}

.topic-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
}

.topic-count {
  font-size: 14px;
  color: #6b5e54;
}

.content-detail {
  padding: 20px;
}

.content-category {
  margin-bottom: 16px;
}

.content-body {
  margin-bottom: 20px;
}

.content-text {
  line-height: 1.8;
  color: #6b5e54;
}

.content-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.test-questions {
  margin: 20px 0;
}

.question-item {
  margin-bottom: 24px;
  padding: 16px;
  background: #faf8f6;
  border-radius: 8px;
}

.question-title {
  margin: 0 0 12px 0;
  color: #6b5e54;
}

.test-result {
  text-align: center;
}

.result-detail {
  text-align: left;
  padding: 20px 40px;
}

.result-detail h4 {
  color: #6b5e54;
  margin: 16px 0 8px 0;
}

.result-detail p {
  color: #8b7e74;
  line-height: 1.6;
}

.loading {
  padding: 40px 0;
}

.empty {
  padding: 40px 0;
}
</style>
