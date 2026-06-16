<template>
  <div class="knowledge-view">
    <div class="care-page knowledge-redesign">
      <header class="care-page-header">
        <h1 class="care-page-title">知识充电站</h1>
        <p class="care-page-subtitle">用轻内容慢慢理解自己</p>
      </header>

      <section class="care-card pad quote-redesign">
        <div class="quote-topline">
          <span class="care-kicker">晨曦语录</span>
          <span>{{ currentDate }}</span>
        </div>
        <p>“{{ dailyQuote.text || '把今天过完，也是一种向前。' }}”</p>
        <small>— {{ dailyQuote.author || '心灵疗愈站' }}</small>
      </section>

      <div class="segmented-row knowledge-tabs-redesign" style="--segment-count: 4">
        <button
          v-for="tab in knowledgeTabs"
          :key="tab.name"
          type="button"
          class="segment-button"
          :class="{ active: activeCategory === tab.name }"
          @click="activeCategory = tab.name"
        >
          {{ tab.label }}
        </button>
      </div>

      <section v-if="activeCategory === 'video'" class="care-card pad featured-content featured-content-media">
        <div class="featured-copy-block">
          <span class="care-chip sage">轻量内容</span>
          <h2>先看一点轻内容</h2>
          <p>让理解从更轻的入口开始。</p>
        </div>
        <img
          v-if="videoContent[0]?.thumbnail_url"
          :src="videoContent[0].thumbnail_url"
          :alt="videoContent[0].title"
          class="featured-thumb"
        />
        <button
          type="button"
          class="content-action"
          :disabled="videoContent.length === 0"
          @click="videoContent[0] && viewContent(videoContent[0])"
        >
          <span class="play-dot">▶</span>
          <span>{{ videoContent[0]?.title || '2 分钟短视频 · 情绪科普' }}</span>
        </button>
      </section>

      <section v-else-if="activeCategory === 'test'" class="care-card pad featured-content">
        <span class="care-chip blue">心理测试</span>
        <h2>{{ featuredTest?.title || '测试你的恢复能量' }}</h2>
        <p>用几个问题看看最近的能量、压力和恢复节奏。</p>
        <button
          type="button"
          class="content-action"
          :disabled="!featuredTest"
          @click="featuredTest && startTest(featuredTest)"
        >
          <img :src="quizIcon" alt="" />
          <span>立即开始</span>
        </button>
      </section>

      <section v-else-if="activeCategory === 'article'" class="care-card pad featured-content featured-content-media">
        <div class="featured-copy-block">
          <span class="care-chip blue">文章</span>
          <h2>{{ articles[0]?.title || '压力来临时，身体在说什么？' }}</h2>
          <p>{{ articles[0]?.content?.substring(0, 38) || '读一点短文，把感受和理解慢慢接起来。' }}</p>
        </div>
        <img
          v-if="articles[0]?.cover_image"
          :src="articles[0].cover_image"
          :alt="articles[0].title"
          class="featured-thumb"
        />
        <button
          type="button"
          class="content-action"
          :disabled="articles.length === 0"
          @click="articles[0] && viewArticle(articles[0])"
        >
          <img :src="articleIcon" alt="" />
          <span>继续阅读</span>
        </button>
      </section>

      <section v-else class="care-card pad featured-content">
        <span class="care-chip sage">专题</span>
        <h2>{{ topics[0]?.title || '给自己一点恢复空间' }}</h2>
        <p>{{ topics[0]?.desc || '把零散内容整理成一个更完整的主题入口。' }}</p>
      </section>

      <section class="knowledge-list-redesign">
        <article class="care-card knowledge-row" @click="articles[0] && viewArticle(articles[0])">
          <span class="knowledge-thumb">
            <img
              v-if="articles[0]?.cover_image"
              :src="articles[0].cover_image"
              :alt="articles[0].title"
            />
            <img v-else :src="articleIcon" class="image2-icon" alt="文章" />
          </span>
          <div>
            <h3>{{ articles[0]?.title || '压力来临时，身体在说什么？' }}</h3>
            <p>文章 · 5分钟</p>
          </div>
        </article>
        <article class="care-card knowledge-row" @click="featuredTest && startTest(featuredTest)">
          <span class="image2-badge blue">
            <img :src="quizIcon" class="image2-icon" alt="测试" />
          </span>
          <div>
            <h3>{{ featuredTest?.title || '测试你的恢复能量' }}</h3>
            <p>测试 · 12题</p>
          </div>
        </article>
      </section>
    </div>

    <!-- 每日金句卡片 -->
    <section class="quote-card card">
      <header class="card-header">
        <component :is="Trophy" class="header-icon" />
        <div class="header-copy">
          <h2 class="card-title">{{ t('knowledge.dailyQuote') }}</h2>
          <p class="card-subtitle">{{ quoteSubtitle }}</p>
        </div>
        <span class="date-tag">{{ currentDate }}</span>
      </header>

      <div class="quote-content">
        <p class="quote-text">"{{ dailyQuote.text }}"</p>
        <p class="quote-author">— {{ dailyQuote.author }}</p>
      </div>
    </section>

    <!-- 内容分类标签页 -->
    <section class="content-section card">
      <div class="content-spotlight">
        <div>
          <span class="spotlight-label">{{ contentSpotlightLabel }}</span>
          <h3 class="spotlight-title">{{ contentSpotlightTitle }}</h3>
        </div>
        <span class="spotlight-chip">{{ activeCategory }}</span>
      </div>

      <el-tabs v-model="activeCategory" class="content-tabs">
        <!-- 短视频/条漫 -->
        <el-tab-pane :label="t('knowledge.video')" name="video">
          <div class="video-editorial">
            <span class="editorial-kicker">{{ locale === 'zh-CN' ? '轻量内容' : 'Light content' }}</span>
            <p class="editorial-desc">{{ locale === 'zh-CN' ? '先看一点短内容，让今天的理解从更轻的入口开始。' : 'Start with something short and let today\'s understanding begin from a lighter place.' }}</p>
          </div>
          <div v-loading="loading" class="video-grid">
            <div
              v-for="item in videoContent"
              :key="item.id"
              class="video-item touchable"
              @click="viewContent(item)"
            >
              <div class="video-thumb">
                <img
                  v-if="item.thumbnail_url"
                  :src="item.thumbnail_url"
                  :alt="item.title"
                  class="video-thumb-image"
                />
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
          <div v-loading="loading" class="featured-test-panel">
            <div
              v-if="featuredTest"
              class="featured-test-card touchable"
              @click="startTest(featuredTest)"
            >
              <div class="featured-test-top">
                <span class="featured-badge">{{ locale === 'zh-CN' ? 'POPULAR' : 'POPULAR' }}</span>
                <span class="featured-tag">{{ featuredTest.duration }}</span>
              </div>
              <div class="featured-test-body">
                <div class="featured-copy">
                  <p class="featured-eyebrow">{{ locale === 'zh-CN' ? '今天适合先做这个' : 'A good place to start today' }}</p>
                  <h3 class="featured-title">{{ featuredTest.title }}</h3>
                  <p class="featured-desc">
                    {{ locale === 'zh-CN'
                      ? '用几分钟看看你在关系、压力和决策里的自然倾向。'
                      : 'Take a few minutes to see your natural patterns in relationships, stress, and decisions.'
                    }}
                  </p>
                  <div class="featured-meta">
                    <span class="meta-tag">{{ featuredTest.questions_count }}{{ locale === 'zh-CN' ? '题' : 'Q' }}</span>
                    <span class="meta-tag">{{ locale === 'zh-CN' ? '精选推荐' : 'Featured pick' }}</span>
                  </div>
                  <span class="featured-cta">{{ locale === 'zh-CN' ? '立即开始' : 'Start now' }}</span>
                </div>
                <div class="featured-visual">
                  <div class="featured-ornament">
                    <div class="ornament-frame frame-one"></div>
                    <div class="ornament-frame frame-two"></div>
                    <div class="test-icon featured-icon" :class="featuredTest.iconClass">
                      <component :is="featuredTest.icon" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="secondary-test-list">
              <div
                v-for="test in secondaryTests"
                :key="test.id"
                class="secondary-test-item touchable"
                @click="startTest(test)"
              >
                <div class="test-icon secondary-icon" :class="test.iconClass">
                  <component :is="test.icon" />
                </div>
                <div class="secondary-test-info">
                  <span class="secondary-kicker">{{ test.id === 2 ? (locale === 'zh-CN' ? '延伸探索' : 'Explore next') : (locale === 'zh-CN' ? '关系视角' : 'Relationship lens') }}</span>
                  <h3 class="test-title">{{ getSecondaryTestTitle(test) }}</h3>
                  <p class="test-desc">{{ getSecondaryTestDesc(test) }}</p>
                </div>
                <div class="secondary-test-side">
                  <span class="secondary-meta">{{ test.duration }}</span>
                  <span class="secondary-arrow">›</span>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 知识文章 -->
        <el-tab-pane :label="t('knowledge.article')" name="article">
          <div class="article-editorial">
            <span class="editorial-kicker">{{ locale === 'zh-CN' ? '延伸阅读' : 'Read next' }}</span>
            <p class="editorial-desc">{{ locale === 'zh-CN' ? '做完一个小探索后，再读一点能把感受和理解慢慢接起来。' : 'After a small self-check, read a little more to connect feeling with understanding.' }}</p>
          </div>
          <div v-loading="loading" class="article-list">
            <el-card
              v-for="article in articles"
              :key="article.id"
              class="article-item"
              shadow="hover"
              @click="viewArticle(article)"
            >
              <div v-if="article.cover_image" class="article-cover">
                <img :src="article.cover_image" :alt="article.title" />
              </div>
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
          <div class="topic-editorial">
            <span class="editorial-kicker">{{ locale === 'zh-CN' ? '栏目策划' : 'Editorial picks' }}</span>
            <p class="editorial-desc">{{ locale === 'zh-CN' ? '把零散内容整理成一个更完整的主题入口，适合慢慢看。' : 'Organized themes that gather scattered content into something slower and more complete.' }}</p>
          </div>
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
          <el-button v-if="currentContent.source_url" @click="openContentSource(currentContent)">
            {{ locale === 'zh-CN' ? '打开来源' : 'Open source' }}
          </el-button>
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
import { knowledgeApi } from '../../api/index.js'
import { ElMessage } from 'element-plus'
import { SBTI_TEST, mapKnowledgePageData } from './knowledge-public-data.js'
import articleIcon from '../../assets/icons/image2-content-article.png'
import quizIcon from '../../assets/icons/image2-content-quiz.png'

const { t, locale } = useI18n()

// 每日金句
const dailyQuote = ref({
  text: '',
  author: '',
})

const currentDate = ref('')

const knowledgeTabs = computed(() => [
  { name: 'video', label: t('knowledge.video') },
  { name: 'test', label: t('knowledge.test') },
  { name: 'article', label: t('knowledge.article') },
  { name: 'topic', label: t('knowledge.topic') },
])

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
const topics = ref([])

// 测试数据
const tests = computed(() => [
  {
    ...SBTI_TEST,
    icon: Cpu,
    iconClass: 'icon-blue',
    duration: locale.value === 'zh-CN' ? SBTI_TEST.duration : '5 min',
    desc: locale.value === 'zh-CN' ? SBTI_TEST.desc : 'Open the full SBTI test to understand your psychological energy pattern.',
    questions_count: 12,
    questions: [],
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

const featuredTest = computed(() => tests.value[0] || null)
const secondaryTests = computed(() => tests.value.slice(1))

const quoteSubtitle = computed(() => {
  return locale.value === 'zh-CN'
    ? '先读一句，让今天的内容从更轻一点的地方开始。'
    : 'Start with one gentle line before moving into the rest of today\'s content.'
})

const contentSpotlightLabel = computed(() => {
  if (locale.value === 'zh-CN') {
    if (activeCategory.value === 'test') return '自我探索'
    if (activeCategory.value === 'article') return '延伸阅读'
    if (activeCategory.value === 'video') return '轻量内容'
    return '精选内容'
  }

  if (activeCategory.value === 'test') return 'Self discovery'
  if (activeCategory.value === 'article') return 'Read next'
  if (activeCategory.value === 'video') return 'Light content'
  return 'Featured'
})

const contentSpotlightTitle = computed(() => {
  if (locale.value === 'zh-CN') {
    if (activeCategory.value === 'test') return '再做个小探索，看看自己现在的状态。'
    if (activeCategory.value === 'article') return '再延伸读一点，把感受慢慢讲清楚。'
    if (activeCategory.value === 'video') return '先看一点轻内容，让理解更容易开始。'
    return '今天想从哪一块开始？'
  }

  if (activeCategory.value === 'test') return 'Take one small step to understand where you are today.'
  if (activeCategory.value === 'article') return 'Read a little more and give your feelings clearer language.'
  if (activeCategory.value === 'video') return 'Start with something lighter and ease into the topic.'
  return 'Where do you want to start today?'
})

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
  if (test.externalUrl) {
    window.open(test.externalUrl, '_blank', 'noopener,noreferrer')
    return
  }

  currentTest.value = test
  testCompleted.value = false
  showTestDialog.value = true
}

function getSecondaryTestTitle(test) {
  if (locale.value === 'zh-CN') {
    if (test.id === 2) return '压力状态自测'
    if (test.id === 3) return '依恋模式探索'
  } else {
    if (test.id === 2) return 'Stress Snapshot'
    if (test.id === 3) return 'Attachment Patterns'
  }

  return test.title
}

function getSecondaryTestDesc(test) {
  if (locale.value === 'zh-CN') {
    if (test.id === 2) return '快速看看你最近的紧绷程度。'
    if (test.id === 3) return '了解你在亲密关系里的靠近方式。'
  } else {
    if (test.id === 2) return 'Quickly see how tense life has felt lately.'
    if (test.id === 3) return 'Understand how you move closer in relationships.'
  }

  return test.desc
}

// 查看文章
function viewArticle(article) {
  currentContent.value = {
    ...article,
    type: 'article',
  }
  showContentDialog.value = true
}

function openContentSource(item) {
  if (!item?.source_url) return
  window.open(item.source_url, '_blank', 'noopener,noreferrer')
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
    // 性格倾向本地兜底
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
    const [quoteResponse, contentsResponse, topicsResponse] = await Promise.all([
      knowledgeApi.getDailyQuote(),
      knowledgeApi.getList(),
      knowledgeApi.getTopics(),
    ])

    const mapped = mapKnowledgePageData({
      quote: quoteResponse.data,
      contents: contentsResponse.data,
      topics: topicsResponse.data,
    })

    dailyQuote.value = mapped.dailyQuote
    videoContent.value = mapped.videoContent
    articles.value = mapped.articles
    topics.value = mapped.topics
  } catch (error) {
    console.error('加载内容失败:', error)
    const fallback = mapKnowledgePageData({
      contents: [],
    })

    dailyQuote.value = fallback.dailyQuote
    videoContent.value = fallback.videoContent
    articles.value = fallback.articles
    topics.value = fallback.topics
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

.content-tabs :deep(.el-tabs__nav-wrap::after) {
  background: var(--color-border-light, #f1f5f9);
}

.content-tabs :deep(.el-tabs__item) {
  color: var(--color-text-secondary, #64748b);
  transition: color var(--transition-base, 0.2s ease);
}

.content-tabs :deep(.el-tabs__item.is-active),
.content-tabs :deep(.el-tabs__item:hover) {
  color: var(--color-primary, #10b981);
}

.content-tabs :deep(.el-tabs__active-bar) {
  background: var(--color-primary, #10b981);
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

.dark .content-tabs :deep(.el-tabs__nav-wrap::after) {
  background: var(--color-border);
}

.dark .content-tabs :deep(.el-tabs__item) {
  color: var(--color-text-secondary);
}

.dark .content-tabs :deep(.el-tabs__item.is-active),
.dark .content-tabs :deep(.el-tabs__item:hover) {
  color: var(--color-text-primary);
}

.dark .content-tabs :deep(.el-tabs__active-bar) {
  background: var(--color-primary-light, #c4b5fd);
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

.quote-card {
  overflow: hidden;
  background:
    linear-gradient(160deg, color-mix(in srgb, var(--surface-2) 88%, transparent) 0%, color-mix(in srgb, var(--surface-1) 92%, transparent) 100%),
    var(--accent-gradient-soft);
}

.quote-content {
  padding: 8px 4px 2px;
}

.quote-text {
  font-size: 17px;
  line-height: 1.8;
  font-weight: 600;
}

.content-section {
  background: color-mix(in srgb, var(--surface-2) 92%, transparent);
}

.content-tabs :deep(.el-tabs__item) {
  height: 36px;
  padding: 0 14px;
  border-radius: 999px;
}

.content-tabs :deep(.el-tabs__item.is-active) {
  background: var(--nav-active-bg);
}

.video-grid {
  gap: 12px;
}

.video-item,
.test-item,
.topic-item {
  border: 1px solid var(--color-border-light);
  background: color-mix(in srgb, var(--surface-3) 84%, transparent);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.video-thumb {
  height: 112px;
  background: var(--accent-gradient);
}

.video-title,
.test-title,
.article-title {
  line-height: 1.4;
}

.test-item {
  padding: 12px;
  align-items: flex-start;
}

.meta-tag,
.article-tag,
.content-category,
.content-tag {
  border: 1px solid var(--color-border-light);
}

.article-item {
  overflow: hidden;
  background: color-mix(in srgb, var(--surface-2) 88%, transparent);
}

.article-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.question-item,
.result-detail {
  background: color-mix(in srgb, var(--surface-3) 88%, transparent);
  border: 1px solid var(--color-border-light);
}

[data-ui-theme='glow-night'] .quote-card {
  background:
    linear-gradient(180deg, rgba(17, 24, 43, 0.92) 0%, rgba(12, 18, 32, 0.96) 100%),
    var(--accent-gradient-soft);
}

[data-ui-theme='playful-bloom'] .quote-text {
  font-size: 18px;
}

.header-copy {
  flex: 1;
  min-width: 0;
}

.quote-card .card-header {
  align-items: flex-start;
}

.quote-card .header-icon {
  margin-top: 2px;
}

.card-subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.45;
  color: var(--color-text-muted);
}

.content-spotlight {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  padding: 2px 2px 14px;
}

.spotlight-label {
  display: inline-flex;
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: 0.03em;
}

.spotlight-title {
  margin: 0;
  font-size: 20px;
  line-height: 1.15;
  color: var(--color-text-primary);
}

.spotlight-chip {
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
  text-transform: capitalize;
}

.article-editorial {
  padding: 2px 2px 14px;
}

.video-editorial,
.topic-editorial {
  padding: 2px 2px 14px;
}

.editorial-kicker {
  display: inline-flex;
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: 0.03em;
}

.editorial-desc {
  margin: 0;
  max-width: 300px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.quote-card {
  padding-bottom: 18px;
}

.quote-content {
  padding: 10px 8px 4px;
}

.quote-text {
  font-size: 18px;
  line-height: 1.75;
}

.quote-author {
  font-size: 12px;
  margin-top: 10px;
}

.content-section {
  padding-top: 12px;
}

.content-tabs :deep(.el-tabs__header) {
  margin-bottom: 18px;
}

.content-tabs :deep(.el-tabs__nav-wrap) {
  padding: 4px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.48);
}

.content-tabs :deep(.el-tabs__nav) {
  gap: 6px;
}

.content-tabs :deep(.el-tabs__item) {
  height: 34px;
  font-size: 12px;
  font-weight: 700;
}

.content-tabs :deep(.el-tabs__active-bar) {
  display: none;
}

.video-item {
  padding: 10px;
  border-radius: 20px;
  box-shadow: var(--shadow-sm);
}

.video-thumb {
  height: 118px;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}

.video-thumb-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.video-thumb::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(34, 15, 24, 0.14) 100%);
}

.video-thumb .play-icon {
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 4px 12px rgba(35, 27, 31, 0.24));
}

.video-info {
  padding: 12px 4px 4px;
}

.video-category,
.video-meta {
  font-size: 10px;
}

.video-title {
  margin-bottom: 6px;
  font-size: 14px;
}

.video-category {
  display: inline-flex;
  min-height: 22px;
  padding: 0 8px;
  align-items: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.56);
  border: 1px solid var(--color-border-light);
  margin-bottom: 8px;
}

.video-meta {
  gap: 5px;
  color: var(--color-text-muted);
}

.test-item {
  padding: 14px;
  border-radius: 20px;
  box-shadow: var(--shadow-sm);
}

.test-desc {
  line-height: 1.55;
}

.article-item {
  border-radius: 20px;
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.article-cover {
  height: 124px;
  margin: 0 0 10px;
  border-radius: 16px;
  overflow: hidden;
  background: var(--accent-gradient-soft);
}

.article-cover img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.article-header {
  gap: 10px;
  padding: 14px 14px 10px;
}

.article-preview {
  padding: 0 14px;
  line-height: 1.6;
}

.article-footer {
  padding: 10px 14px 12px;
}

.topic-item {
  padding: 14px;
  border-radius: 20px;
  box-shadow: var(--shadow-sm);
}

.content-category,
.content-tag,
.meta-tag,
.article-tag {
  background: rgba(255, 255, 255, 0.62);
}

.question-item {
  border-radius: 18px;
}

.result-detail {
  border-radius: 20px;
}

.featured-test-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.featured-test-card {
  padding: 16px;
  border-radius: 24px;
  background: linear-gradient(135deg, #f05f98 0%, #ea4f8a 48%, #d93e7b 100%);
  color: white;
  box-shadow: 0 20px 34px rgba(234, 79, 138, 0.24);
  overflow: hidden;
  position: relative;
}

.featured-test-card::after {
  content: '';
  position: absolute;
  right: -18px;
  bottom: -18px;
  width: 96px;
  height: 96px;
  border-radius: 24px;
  border: 4px solid rgba(255, 255, 255, 0.16);
}

.featured-test-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.featured-badge,
.featured-tag {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.featured-badge {
  background: rgba(255, 255, 255, 0.2);
}

.featured-tag {
  background: rgba(255, 255, 255, 0.14);
}

.featured-test-body {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: stretch;
}

.featured-copy {
  position: relative;
  z-index: 1;
  min-width: 0;
}

.featured-eyebrow {
  margin: 0 0 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.03em;
  color: rgba(255, 255, 255, 0.86);
}

.featured-title {
  margin: 0 0 8px;
  font-size: 22px;
  line-height: 1.08;
}

.featured-desc {
  margin: 0 0 12px;
  max-width: 208px;
  font-size: 13px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.88);
}

.featured-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.featured-test-card .meta-tag {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.14);
  color: white;
}

.featured-cta {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  font-size: 12px;
  font-weight: 700;
}

.featured-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  flex-shrink: 0;
}

.featured-ornament {
  position: relative;
  width: 92px;
  height: 92px;
}

.ornament-frame {
  position: absolute;
  border-radius: 22px;
  border: 3px solid rgba(255, 255, 255, 0.16);
}

.frame-one {
  inset: 18px 0 0 18px;
}

.frame-two {
  inset: 32px 12px -2px 30px;
  border-radius: 18px;
  border-width: 2px;
  opacity: 0.7;
}

.featured-icon {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 64px;
  height: 64px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.featured-icon svg {
  width: 32px;
  height: 32px;
  color: white;
}

.secondary-test-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.secondary-test-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 18px;
  background: color-mix(in srgb, var(--surface-2) 90%, transparent);
  border: 1px solid var(--color-border-light);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.24);
}

.secondary-icon {
  width: 44px;
  height: 44px;
  border-radius: 16px;
}

.secondary-test-info {
  flex: 1;
  min-width: 0;
}

.secondary-kicker {
  display: inline-flex;
  margin-bottom: 5px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: var(--color-primary);
}

.secondary-test-info .test-title {
  margin: 0 0 4px;
  font-size: 14px;
}

.secondary-test-info .test-desc {
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
}

.secondary-test-side {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.secondary-meta {
  font-size: 11px;
  color: var(--color-text-muted);
}

.secondary-arrow {
  font-size: 22px;
  line-height: 1;
  color: var(--color-text-muted);
}

.test-dialog :deep(.el-dialog__body) {
  padding-top: 12px;
}

.test-questions {
  gap: 14px;
}

.question-item {
  padding: 14px;
}

.question-title {
  line-height: 1.5;
}

.result-detail {
  box-shadow: var(--shadow-sm);
}

.topic-header {
  margin-bottom: 8px;
}

.topic-title {
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
}

.topic-icon {
  width: 18px;
  height: 18px;
}

.topic-status {
  min-height: 22px;
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  font-size: 10px;
  font-weight: 700;
}

.topic-desc {
  line-height: 1.6;
  margin-bottom: 8px;
}

.topic-footer {
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid var(--color-border-light);
}

.topic-count {
  font-size: 11px;
}

.knowledge-view > .quote-card,
.knowledge-view > .content-section {
  display: none;
}

.knowledge-redesign {
  gap: 16px;
}

.quote-redesign {
  min-height: 132px;
}

.quote-topline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 800;
}

.quote-redesign p {
  margin: 24px 0 10px;
  font-size: 23px;
  line-height: 1.35;
  font-weight: 900;
}

.quote-redesign small {
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 800;
}

.featured-content {
  min-height: 210px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.featured-content-media {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 112px;
  align-items: start;
  gap: 14px;
}

.featured-copy-block {
  min-width: 0;
}

.featured-thumb {
  width: 112px;
  aspect-ratio: 1;
  border-radius: 24px;
  object-fit: cover;
  display: block;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.62);
}

.featured-content h2 {
  margin: 24px 0 9px;
  font-size: 25px;
  line-height: 1.2;
  font-weight: 900;
}

.featured-content p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 15px;
  line-height: 1.55;
  font-weight: 800;
}

.content-action {
  margin-top: auto;
  grid-column: 1 / -1;
  min-height: 48px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--color-text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 900;
  cursor: pointer;
}

.content-action:disabled {
  opacity: 0.55;
  cursor: default;
}

.content-action img {
  width: 34px;
  height: 34px;
  object-fit: contain;
}

.play-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: #fff;
  background: var(--h5-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
}

.knowledge-list-redesign {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.knowledge-row {
  min-height: 106px;
  padding: 16px;
  display: grid;
  grid-template-columns: 70px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.knowledge-thumb {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-gradient-soft);
}

.knowledge-thumb img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.knowledge-thumb .image2-icon {
  width: 34px;
  height: 34px;
  object-fit: contain;
}

.knowledge-row h3 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 18px;
  line-height: 1.35;
  font-weight: 900;
}

.knowledge-row p {
  margin: 7px 0 0;
  color: var(--color-text-muted);
  font-weight: 800;
}

@media (max-width: 360px) {
  .featured-content-media {
    grid-template-columns: minmax(0, 1fr);
  }

  .featured-thumb {
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 20px;
  }
}
</style>
