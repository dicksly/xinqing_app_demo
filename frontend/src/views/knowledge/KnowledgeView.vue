<template>
  <div class="knowledge-view">
    <!-- 每日金句卡片 -->
    <section class="quote-card card">
      <header class="card-header">
        <component :is="Trophy" class="header-icon" />
        <h2 class="card-title">{{ t('knowledge.dailyQuote') }}</h2>
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
        <el-tab-pane :label="t('knowledge.video')" name="video">
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
          <el-empty v-if="!loading && videoContent.length === 0" :description="locale === 'zh-CN' ? '暂无内容' : 'No content'" :image-size="60" />
        </el-tab-pane>

        <!-- 心理测试 -->
        <el-tab-pane :label="t('knowledge.test')" name="test">
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
                  <span class="meta-tag">{{ test.questions_count }}{{ locale === 'zh-CN' ? '题' : 'Q' }}</span>
                </div>
              </div>
              <el-button type="primary" size="small" round>{{ locale === 'zh-CN' ? '开始测试' : 'Start' }}</el-button>
            </div>
          </div>
        </el-tab-pane>

        <!-- 知识文章 -->
        <el-tab-pane :label="t('knowledge.article')" name="article">
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
                <span class="article-tag">{{ article.category }}</span>
              </div>
              <div class="article-preview">
                {{ article.content?.substring(0, 80) }}...
              </div>
              <div class="article-footer">
                <span class="article-time">{{ formatTime(article.created_at) }}</span>
                <div class="article-views">
                  <component :is="View" />
                  <span>{{ article.view_count }}</span>
                </div>
              </div>
            </el-card>
          </div>
          <el-empty v-if="!loading && articles.length === 0" :description="locale === 'zh-CN' ? '暂无文章' : 'No articles'" :image-size="60" />
        </el-tab-pane>

        <!-- 专题策划 -->
        <el-tab-pane :label="t('knowledge.topic')" name="topic">
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
                <span class="topic-count">{{ topic.content_count }}{{ t('knowledge.contentCount') }}</span>
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
          <el-button @click="showContentDialog = false">{{ t('common.close') }}</el-button>
          <el-button type="primary" @click="likeContent">
            <component :is="StarFilled" />
            <span>{{ t('knowledge.favorite') }}</span>
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
          <h4 class="question-title">{{ t('knowledge.testQuestions') }} {{ index + 1 }}: {{ question.text }}</h4>
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
        <el-empty v-if="!testResult && !testSuggestion" :description="locale === 'zh-CN' ? '正在计算结果...' : 'Calculating results...'" :image-size="60" />
        <div class="result-header">
          <component :is="CircleCheckFilled" class="result-icon" />
          <h3>{{ t('knowledge.testComplete') }}</h3>
        </div>
        <div class="result-detail">
          <h4>{{ t('knowledge.testResult') }}</h4>
          <p>{{ testResult }}</p>
          <div class="divider"></div>
          <h4>{{ t('knowledge.testSuggestion') }}</h4>
          <p>{{ testSuggestion }}</p>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showTestDialog = false">{{ t('common.cancel') }}</el-button>
          <el-button v-if="!testCompleted" type="primary" @click="submitTest">{{ t('knowledge.submitTest') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
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

const { t, locale } = useI18n()

// 每日金句
const dailyQuote = ref({
  text: locale.value === 'zh-CN'
    ? "生命中最重要的不是你遭遇了什么，而是你记住了什么。"
    : "The most important thing is not what happens to you, but what you remember.",
  author: locale.value === 'zh-CN' ? "未知" : "Unknown",
})

const currentDate = ref('')

// 压力自测题目
function getStressTestQuestions() {
  const isZh = locale.value === 'zh-CN'
  return [
    {
      text: isZh ? '最近你是否经常感到疲倦或精力不足？' : 'Do you often feel tired or low on energy recently?',
      options: isZh ? [
        { value: 0, text: '从不' },
        { value: 1, text: '偶尔' },
        { value: 2, text: '经常' },
        { value: 3, text: '总是' },
      ] : [
        { value: 0, text: 'Never' },
        { value: 1, text: 'Sometimes' },
        { value: 2, text: 'Often' },
        { value: 3, text: 'Always' },
      ],
      selectedAnswer: '',
    },
    {
      text: isZh ? '你是否难以入睡或睡眠质量不好？' : 'Do you have trouble falling asleep or poor sleep quality?',
      options: isZh ? [
        { value: 0, text: '从不' },
        { value: 1, text: '偶尔' },
        { value: 2, text: '经常' },
        { value: 3, text: '总是' },
      ] : [
        { value: 0, text: 'Never' },
        { value: 1, text: 'Sometimes' },
        { value: 2, text: 'Often' },
        { value: 3, text: 'Always' },
      ],
      selectedAnswer: '',
    },
    {
      text: isZh ? '你是否容易感到焦虑或紧张？' : 'Do you easily feel anxious or nervous?',
      options: isZh ? [
        { value: 0, text: '从不' },
        { value: 1, text: '偶尔' },
        { value: 2, text: '经常' },
        { value: 3, text: '总是' },
      ] : [
        { value: 0, text: 'Never' },
        { value: 1, text: 'Sometimes' },
        { value: 2, text: 'Often' },
        { value: 3, text: 'Always' },
      ],
      selectedAnswer: '',
    },
    {
      text: isZh ? '你是否对未来感到担忧或悲观？' : 'Do you feel worried or pessimistic about the future?',
      options: isZh ? [
        { value: 0, text: '从不' },
        { value: 1, text: '偶尔' },
        { value: 2, text: '经常' },
        { value: 3, text: '总是' },
      ] : [
        { value: 0, text: 'Never' },
        { value: 1, text: 'Sometimes' },
        { value: 2, text: 'Often' },
        { value: 3, text: 'Always' },
      ],
      selectedAnswer: '',
    },
    {
      text: isZh ? '你是否难以集中注意力？' : 'Do you have difficulty concentrating?',
      options: isZh ? [
        { value: 0, text: '从不' },
        { value: 1, text: '偶尔' },
        { value: 2, text: '经常' },
        { value: 3, text: '总是' },
      ] : [
        { value: 0, text: 'Never' },
        { value: 1, text: 'Sometimes' },
        { value: 2, text: 'Often' },
        { value: 3, text: 'Always' },
      ],
      selectedAnswer: '',
    },
    {
      text: isZh ? '你是否感到工作/学习压力很大？' : 'Do you feel a lot of pressure from work/study?',
      options: isZh ? [
        { value: 0, text: '从不' },
        { value: 1, text: '偶尔' },
        { value: 2, text: '经常' },
        { value: 3, text: '总是' },
      ] : [
        { value: 0, text: 'Never' },
        { value: 1, text: 'Sometimes' },
        { value: 2, text: 'Often' },
        { value: 3, text: 'Always' },
      ],
      selectedAnswer: '',
    },
    {
      text: isZh ? '你是否容易对他人发脾气？' : 'Do you easily get angry at others?',
      options: isZh ? [
        { value: 0, text: '从不' },
        { value: 1, text: '偶尔' },
        { value: 2, text: '经常' },
        { value: 3, text: '总是' },
      ] : [
        { value: 0, text: 'Never' },
        { value: 1, text: 'Sometimes' },
        { value: 2, text: 'Often' },
        { value: 3, text: 'Always' },
      ],
      selectedAnswer: '',
    },
    {
      text: isZh ? '你是否感到孤独或缺乏支持？' : 'Do you feel lonely or lack support?',
      options: isZh ? [
        { value: 0, text: '从不' },
        { value: 1, text: '偶尔' },
        { value: 2, text: '经常' },
        { value: 3, text: '总是' },
      ] : [
        { value: 0, text: 'Never' },
        { value: 1, text: 'Sometimes' },
        { value: 2, text: 'Often' },
        { value: 3, text: 'Always' },
      ],
      selectedAnswer: '',
    },
    {
      text: isZh ? '你是否对以前喜欢的事情失去兴趣？' : 'Have you lost interest in things you used to enjoy?',
      options: isZh ? [
        { value: 0, text: '从不' },
        { value: 1, text: '偶尔' },
        { value: 2, text: '经常' },
        { value: 3, text: '总是' },
      ] : [
        { value: 0, text: 'Never' },
        { value: 1, text: 'Sometimes' },
        { value: 2, text: 'Often' },
        { value: 3, text: 'Always' },
      ],
      selectedAnswer: '',
    },
    {
      text: isZh ? '你是否经常头痛或身体不适？' : 'Do you often have headaches or physical discomfort?',
      options: isZh ? [
        { value: 0, text: '从不' },
        { value: 1, text: '偶尔' },
        { value: 2, text: '经常' },
        { value: 3, text: '总是' },
      ] : [
        { value: 0, text: 'Never' },
        { value: 1, text: 'Sometimes' },
        { value: 2, text: 'Often' },
        { value: 3, text: 'Always' },
      ],
      selectedAnswer: '',
    },
  ]
}

// 依恋类型测试题目
function getAttachmentTestQuestions() {
  const isZh = locale.value === 'zh-CN'
  return [
    {
      text: isZh ? '在亲密关系中，我通常感到安全' : 'In close relationships, I generally feel secure',
      options: isZh ? [
        { value: 'A', text: '非常同意' },
        { value: 'B', text: '比较同意' },
        { value: 'C', text: '不太同意' },
        { value: 'D', text: '非常不同意' },
      ] : [
        { value: 'A', text: 'Strongly agree' },
        { value: 'B', text: 'Somewhat agree' },
        { value: 'C', text: 'Somewhat disagree' },
        { value: 'D', text: 'Strongly disagree' },
      ],
      selectedAnswer: '',
    },
    {
      text: isZh ? '我担心伴侣会离开我' : 'I worry that my partner will leave me',
      options: isZh ? [
        { value: 'A', text: '从不' },
        { value: 'B', text: '偶尔' },
        { value: 'C', text: '经常' },
        { value: 'D', text: '总是' },
      ] : [
        { value: 'A', text: 'Never' },
        { value: 'B', text: 'Sometimes' },
        { value: 'C', text: 'Often' },
        { value: 'D', text: 'Always' },
      ],
      selectedAnswer: '',
    },
    {
      text: isZh ? '当别人太亲近时，我会感到不舒服' : 'I feel uncomfortable when others get too close',
      options: isZh ? [
        { value: 'A', text: '非常同意' },
        { value: 'B', text: '比较同意' },
        { value: 'C', text: '不太同意' },
        { value: 'D', text: '非常不同意' },
      ] : [
        { value: 'A', text: 'Strongly agree' },
        { value: 'B', text: 'Somewhat agree' },
        { value: 'C', text: 'Somewhat disagree' },
        { value: 'D', text: 'Strongly disagree' },
      ],
      selectedAnswer: '',
    },
    {
      text: isZh ? '我需要很多确认和安慰' : 'I need a lot of reassurance',
      options: isZh ? [
        { value: 'A', text: '从不' },
        { value: 'B', text: '偶尔' },
        { value: 'C', text: '经常' },
        { value: 'D', text: '总是' },
      ] : [
        { value: 'A', text: 'Never' },
        { value: 'B', text: 'Sometimes' },
        { value: 'C', text: 'Often' },
        { value: 'D', text: 'Always' },
      ],
      selectedAnswer: '',
    },
    {
      text: isZh ? '我倾向于独立处理问题' : 'I tend to handle problems independently',
      options: isZh ? [
        { value: 'A', text: '非常同意' },
        { value: 'B', text: '比较同意' },
        { value: 'C', text: '不太同意' },
        { value: 'D', text: '非常不同意' },
      ] : [
        { value: 'A', text: 'Strongly agree' },
        { value: 'B', text: 'Somewhat agree' },
        { value: 'C', text: 'Somewhat disagree' },
        { value: 'D', text: 'Strongly disagree' },
      ],
      selectedAnswer: '',
    },
    {
      text: isZh ? '当关系变得亲密时，我会想要逃离' : 'When relationships get close, I want to run away',
      options: isZh ? [
        { value: 'A', text: '非常同意' },
        { value: 'B', text: '比较同意' },
        { value: 'C', text: '不太同意' },
        { value: 'D', text: '非常不同意' },
      ] : [
        { value: 'A', text: 'Strongly agree' },
        { value: 'B', text: 'Somewhat agree' },
        { value: 'C', text: 'Somewhat disagree' },
        { value: 'D', text: 'Strongly disagree' },
      ],
      selectedAnswer: '',
    },
    {
      text: isZh ? '我经常担心自己不值得被爱' : 'I often worry I am not worthy of being loved',
      options: isZh ? [
        { value: 'A', text: '从不' },
        { value: 'B', text: '偶尔' },
        { value: 'C', text: '经常' },
        { value: 'D', text: '总是' },
      ] : [
        { value: 'A', text: 'Never' },
        { value: 'B', text: 'Sometimes' },
        { value: 'C', text: 'Often' },
        { value: 'D', text: 'Always' },
      ],
      selectedAnswer: '',
    },
    {
      text: isZh ? '我对伴侣的情感需求很敏感' : 'I am sensitive to my partner\'s emotional needs',
      options: isZh ? [
        { value: 'A', text: '非常同意' },
        { value: 'B', text: '比较同意' },
        { value: 'C', text: '不太同意' },
        { value: 'D', text: '非常不同意' },
      ] : [
        { value: 'A', text: 'Strongly agree' },
        { value: 'B', text: 'Somewhat agree' },
        { value: 'C', text: 'Somewhat disagree' },
        { value: 'D', text: 'Strongly disagree' },
      ],
      selectedAnswer: '',
    },
  ]
}

// 内容数据
const activeCategory = ref('video')
const loading = ref(false)
const videoContent = ref([])
const articles = ref([])

// 测试数据
const tests = computed(() => [
  {
    id: 1,
    title: t('knowledge.tests.mbti'),
    icon: Cpu,
    iconClass: 'icon-blue',
    desc: t('knowledge.tests.mbtiDesc'),
    duration: locale.value === 'zh-CN' ? '5分钟' : '5 min',
    questions_count: 12,
    questions: [
      {
        text: locale.value === 'zh-CN' ? '在社交场合中，你通常会？' : 'In social situations, you usually?',
        options: locale.value === 'zh-CN' ? [
          { value: 'A', text: '主动与人交谈' },
          { value: 'B', text: '偶尔参与对话' },
          { value: 'C', text: '更多时间倾听' },
          { value: 'D', text: '希望早点离开' },
        ] : [
          { value: 'A', text: 'Actively engage' },
          { value: 'B', text: 'Occasionally participate' },
          { value: 'C', text: 'Listen more' },
          { value: 'D', text: 'Want to leave early' },
        ],
        selectedAnswer: '',
      },
      {
        text: locale.value === 'zh-CN' ? '做决定时，你更倾向于？' : 'When making decisions, you tend to?',
        options: locale.value === 'zh-CN' ? [
          { value: 'A', text: '凭感觉和直觉' },
          { value: 'B', text: '分析利弊后决定' },
          { value: 'C', text: '参考他人意见' },
          { value: 'D', text: '纠结很久才决定' },
        ] : [
          { value: 'A', text: 'Follow intuition' },
          { value: 'B', text: 'Analyze pros and cons' },
          { value: 'C', text: 'Seek others\' opinions' },
          { value: 'D', text: 'Hesitate for a long time' },
        ],
        selectedAnswer: '',
      },
      {
        text: locale.value === 'zh-CN' ? '面对压力时，你会？' : 'When facing stress, you would?',
        options: locale.value === 'zh-CN' ? [
          { value: 'A', text: '积极寻找解决方案' },
          { value: 'B', text: '先放松一下再处理' },
          { value: 'C', text: '寻求他人帮助' },
          { value: 'D', text: '感到焦虑和无助' },
        ] : [
          { value: 'A', text: 'Actively find solutions' },
          { value: 'B', text: 'Relax first, then handle' },
          { value: 'C', text: 'Seek help from others' },
          { value: 'D', text: 'Feel anxious and helpless' },
        ],
        selectedAnswer: '',
      },
    ],
  },
  {
    id: 2,
    title: t('knowledge.tests.stress'),
    icon: Timer,
    iconClass: 'icon-orange',
    desc: t('knowledge.tests.stressDesc'),
    duration: locale.value === 'zh-CN' ? '3分钟' : '3 min',
    questions_count: 10,
    questions: getStressTestQuestions(),
  },
  {
    id: 3,
    title: t('knowledge.tests.attachment'),
    icon: Connection,
    iconClass: 'icon-pink',
    desc: t('knowledge.tests.attachmentDesc'),
    duration: locale.value === 'zh-CN' ? '8分钟' : '8 min',
    questions_count: 15,
    questions: getAttachmentTestQuestions(),
  },
])

// 专题数据
const topics = computed(() => [
  {
    id: 1,
    title: locale.value === 'zh-CN' ? '考试季抗压指南' : 'Exam Season Stress Relief',
    status: t('knowledge.topicStatus.active'),
    statusClass: 'status-active',
    desc: locale.value === 'zh-CN' ? '帮助考生调整心态，发挥最佳水平' : 'Help students adjust their mindset for peak performance',
    content_count: 12,
  },
  {
    id: 2,
    title: locale.value === 'zh-CN' ? '毕业季迷茫破解' : 'Graduation Confusion Guide',
    status: t('knowledge.topicStatus.pending'),
    statusClass: 'status-pending',
    desc: locale.value === 'zh-CN' ? '从校园到职场的心理过渡指南' : 'Psychological transition from campus to workplace',
    content_count: 8,
  },
  {
    id: 3,
    title: locale.value === 'zh-CN' ? '求职季心理建设' : 'Job Hunting Mental Preparation',
    status: t('knowledge.topicStatus.planned'),
    statusClass: 'status-planned',
    desc: locale.value === 'zh-CN' ? '在求职过程中保持良好心态' : 'Maintain a positive mindset during job hunting',
    content_count: 10,
  },
])

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

// 格式化日期
function formatDate() {
  const options = locale.value === 'zh-CN'
    ? { month: 'short', day: 'numeric', weekday: 'short' }
    : { month: 'short', day: 'numeric', weekday: 'short' }
  return new Date().toLocaleDateString(locale.value === 'zh-CN' ? 'zh-CN' : 'en-US', options)
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
  const unanswered = currentTest.value.questions.filter(q => !q.selectedAnswer && q.selectedAnswer !== 0)
  if (unanswered.length > 0) {
    ElMessage.warning(locale.value === 'zh-CN' ? '请完成所有问题再提交' : 'Please answer all questions')
    return
  }

  const isZh = locale.value === 'zh-CN'

  // 根据测试类型计算结果
  if (currentTest.value.id === 1) {
    // MBTI 简化版
    const results = ['INTJ', 'INFJ', 'ISTJ', 'ISFJ', 'ENTP', 'ENFP', 'ESTP', 'ESFP']
    const randomResult = results[Math.floor(Math.random() * results.length)]
    testResult.value = isZh ? `您的性格类型倾向：${randomResult}` : `Your personality type tendency: ${randomResult}`
    testSuggestion.value = isZh
      ? `${randomResult}型的人通常善于深度思考。建议你在面对压力时，给自己更多时间进行内省和规划。`
      : `${randomResult} types are usually good at deep thinking. When facing stress, give yourself more time for introspection and planning.`
  } else if (currentTest.value.id === 2) {
    // 压力自测
    const totalScore = currentTest.value.questions.reduce((sum, q) => sum + (Number(q.selectedAnswer) || 0), 0)
    const maxScore = currentTest.value.questions.length * 3
    const percentage = Math.round((totalScore / maxScore) * 100)

    if (percentage <= 25) {
      testResult.value = isZh ? `压力指数：${percentage}% - 压力水平较低` : `Stress Index: ${percentage}% - Low stress level`
      testSuggestion.value = isZh
        ? '你目前的心理状态良好。继续保持健康的生活方式，定期进行放松活动。'
        : 'Your current mental state is good. Continue to maintain a healthy lifestyle and regular relaxation activities.'
    } else if (percentage <= 50) {
      testResult.value = isZh ? `压力指数：${percentage}% - 压力水平中等` : `Stress Index: ${percentage}% - Moderate stress level`
      testSuggestion.value = isZh
        ? '你目前有一定压力。建议增加运动、冥想等放松活动，注意劳逸结合。'
        : 'You have some stress. It is recommended to increase exercise, meditation and other relaxation activities.'
    } else if (percentage <= 75) {
      testResult.value = isZh ? `压力指数：${percentage}% - 压力水平较高` : `Stress Index: ${percentage}% - High stress level`
      testSuggestion.value = isZh
        ? '你目前承受着较大压力。建议寻求专业帮助，学习压力管理技巧，并确保充足睡眠。'
        : 'You are under significant stress. Consider seeking professional help, learning stress management techniques, and ensuring adequate sleep.'
    } else {
      testResult.value = isZh ? `压力指数：${percentage}% - 压力水平很高` : `Stress Index: ${percentage}% - Very high stress level`
      testSuggestion.value = isZh
        ? '你的压力水平已达到警戒线。强烈建议寻求心理咨询师的帮助，同时注意自我关怀。'
        : 'Your stress level has reached a warning level. It is strongly recommended to seek help from a psychological counselor.'
    }
  } else if (currentTest.value.id === 3) {
    // 依恋类型测试
    testResult.value = isZh ? '依恋类型：安全型依恋' : 'Attachment Type: Secure Attachment'
    testSuggestion.value = isZh
      ? '你在亲密关系中相对安全，能够平衡亲密与独立。继续保持开放和真诚的沟通方式，有助于维持健康的关系。'
      : 'You are relatively secure in close relationships, able to balance intimacy and independence. Continue to maintain open and sincere communication.'
  }

  testCompleted.value = true
  ElMessage.success(t('knowledge.testComplete'))
}

// 收藏内容
function likeContent() {
  ElMessage.success(locale.value === 'zh-CN' ? '已收藏到我的收藏夹' : 'Added to favorites')
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
  } catch (error) {
    console.error('加载内容失败:', error)
    // 使用模拟数据
    videoContent.value = [
      {
        id: 1,
        title: locale.value === 'zh-CN' ? '什么是焦虑症' : 'What is Anxiety Disorder',
        content_type: 'video',
        category: locale.value === 'zh-CN' ? '心理健康' : 'Mental Health',
        content: locale.value === 'zh-CN' ? '焦虑症是一种常见的心理健康问题...' : 'Anxiety disorder is a common mental health issue...',
        view_count: 1234,
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        title: locale.value === 'zh-CN' ? '如何拒绝精神内耗' : 'How to Stop Overthinking',
        content_type: 'video',
        category: locale.value === 'zh-CN' ? '情绪管理' : 'Emotional Management',
        content: locale.value === 'zh-CN' ? '精神内耗是现代人常见的心理困扰...' : 'Overthinking is a common psychological issue...',
        view_count: 987,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ]
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
  border-radius: var(--radius-md, 12px);
  border: 1px solid var(--color-border-light, #f1f5f9);
  cursor: pointer;
  transition: all var(--transition-base, 0.2s ease);
}

.article-item:hover {
  border-color: var(--color-primary, #10b981);
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--spacing-sm, 8px);
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
  padding: 0 var(--spacing-sm, 8px);
  color: var(--color-text-secondary, #64748b);
  font-size: var(--font-xs, 11px);
  line-height: 1.5;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
  border-top: 1px solid var(--color-border-light, #f1f5f9);
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
  line-height: 1.7;
  color: var(--color-text-primary, #1e293b);
  font-size: var(--font-sm, 13px);
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

/* 深色模式 */
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
  border-color: rgba(255, 255, 255, 0.06);
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
