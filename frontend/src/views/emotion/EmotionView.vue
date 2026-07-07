<template>
  <div class="care-page emotion-view">
    <header class="care-page-header">
      <h1 class="care-page-title">{{ t('emotion.title') }}</h1>
      <p class="care-page-subtitle">{{ locale === 'zh-CN' ? '慢慢来，选一个最接近的状态' : 'Take it slowly and choose the state that feels closest.' }}</p>
    </header>

    <section class="care-card pad checkin-panel">
      <h2 class="care-card-title">{{ t('emotion.basicStatus') }}</h2>
      <div class="mood-grid">
        <button
          v-for="mood in moods"
          :key="mood.value"
          type="button"
          class="mood-item care-touch"
          :class="[mood.tone, { active: currentRecord.mood === mood.value }]"
          @click="currentRecord.mood = mood.value"
        >
          <span class="mood-icon">
            <img :src="mood.iconSrc" class="image2-icon" :alt="mood.label" />
          </span>
          <span>{{ mood.label }}</span>
        </button>
      </div>

      <div v-if="showAttribution" class="attribution-panel">
        <h3>{{ locale === 'zh-CN' ? '是什么压住了你？' : 'What feels heavy today?' }}</h3>
        <div class="stress-tags">
          <el-check-tag
            v-for="tag in stressSources"
            :key="tag.value"
            :checked="currentRecord.stressSources.includes(tag.value)"
            @change="toggleStressSource(tag.value)"
          >
            {{ tag.label }}
          </el-check-tag>
        </div>
        <div class="segmented-row social-row" style="--segment-count: 2">
          <button
            type="button"
            class="segment-button"
            :class="{ active: currentRecord.socialPreference === 'alone' }"
            @click="currentRecord.socialPreference = 'alone'"
          >
            {{ t('emotion.social.alone') }}
          </button>
          <button
            type="button"
            class="segment-button"
            :class="{ active: currentRecord.socialPreference === 'social' }"
            @click="currentRecord.socialPreference = 'social'"
          >
            {{ t('emotion.social.social') }}
          </button>
        </div>
      </div>
    </section>

    <section class="care-card pad slider-panel">
      <div class="slider-header">
        <h2 class="care-card-title">{{ t('emotion.energyLevel') }}</h2>
        <strong>{{ currentRecord.energyLevel }}%</strong>
      </div>
      <el-slider
        v-model="currentRecord.energyLevel"
        :marks="energyMarks"
        :show-tooltip="false"
        active-color="#6E9DD8"
      />
      <div class="sleep-row">
        <h2 class="care-card-title">{{ t('emotion.sleepQuality') }}</h2>
        <el-rate
          v-model="currentRecord.sleepQuality"
          :max="5"
          show-score
          :score-template="locale === 'zh-CN' ? '{value}星' : '{value} stars'"
          :colors="['#F2C75C', '#F2C75C', '#F2C75C']"
        />
      </div>
    </section>

    <section class="care-card pad journal-panel">
      <h2 class="care-card-title">{{ t('emotion.happyMoment') }}</h2>
      <el-input
        v-model="currentRecord.happyMoment"
        class="quiet-field"
        type="textarea"
        :rows="3"
        :placeholder="locale === 'zh-CN' ? '今天有一点点值得记下的事吗？' : 'Was there one tiny thing worth keeping today?'"
        maxlength="50"
        show-word-limit
        resize="none"
      />
      <button v-if="!currentRecord.happyMoment" type="button" class="inspiration-link" @click="getInspiration">
        {{ t('emotion.getInspiration') }}
      </button>
    </section>

    <el-button
      type="primary"
      size="large"
      :loading="submitting"
      @click="handleSubmit"
      class="submit-btn soft-submit"
      round
    >
      {{ locale === 'zh-CN' ? '保存今日状态' : 'Save Today' }}
    </el-button>

    <section class="care-card pad analysis-entry-card">
      <div>
        <h2 class="care-card-title">{{ locale === 'zh-CN' ? '详细心理分析' : 'Detailed Psychological Analysis' }}</h2>
        <p class="care-card-copy">{{ locale === 'zh-CN' ? '填写问卷前需要阅读知情同意书并签名。' : 'Read and sign the consent form before taking the questionnaire.' }}</p>
      </div>
      <el-button type="primary" round @click="openAssessment">{{ locale === 'zh-CN' ? '进入问卷' : 'Start' }}</el-button>
    </section>

    <section class="care-card pad report-card">
      <h2 class="care-card-title">{{ locale === 'zh-CN' ? '本周情绪小结' : 'Weekly Mood Summary' }}</h2>
      <p class="care-card-copy">{{ locale === 'zh-CN' ? '记录 3 天后会生成更清晰的趋势' : 'After 3 check-ins, your trend will become clearer.' }}</p>
      <div v-if="weeklyReport" class="report-stats">
        <div class="stat-item">
          <strong>{{ weeklyReport.total_records }}</strong>
          <span>{{ t('emotion.report.checkinDays') }}</span>
        </div>
        <div class="stat-item">
          <strong>{{ weeklyReport.average_energy?.toFixed(1) }}</strong>
          <span>{{ t('emotion.report.avgEnergy') }}</span>
        </div>
        <div class="stat-item">
          <strong>{{ weeklyReport.average_sleep?.toFixed(1) }}</strong>
          <span>{{ t('emotion.report.avgSleep') }}</span>
        </div>
      </div>
    </section>

    <el-dialog
      v-model="insightVisible"
      :title="locale === 'zh-CN' ? '今日情绪标签' : 'Today Mood Tag'"
      width="90%"
      class="insight-dialog"
    >
      <div class="insight-result">
        <div class="insight-tag">{{ latestInsight.tag }}</div>
        <p>{{ latestInsight.comfort }}</p>
      </div>
      <template #footer>
        <el-button type="primary" round @click="insightVisible = false">{{ locale === 'zh-CN' ? '收下' : 'Got it' }}</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="quoteCardVisible"
      title="日签语录"
      width="92%"
      class="quote-card-dialog"
    >
      <div class="quote-card-preview" :class="latestQuoteCard.tone">
        <div class="quote-illustration" aria-hidden="true">
          <span>{{ latestQuoteCard.symbol }}</span>
        </div>
        <span class="care-kicker">{{ latestQuoteCard.title }}</span>
        <h2>{{ latestQuoteCard.quote }}</h2>
        <p>{{ latestQuoteCard.caption }}</p>
        <small>心情疗愈 · {{ new Date().toLocaleDateString('zh-CN') }}</small>
      </div>
      <template #footer>
        <el-button round @click="saveQuoteCard">保存日签</el-button>
        <el-button type="primary" round @click="shareQuoteCard">分享</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="assessmentVisible"
      :title="locale === 'zh-CN' ? '详细心理分析' : 'Detailed Psychological Analysis'"
      width="92%"
      class="assessment-dialog"
    >
      <div class="assessment-important-notes">
        <h3>{{ locale === 'zh-CN' ? '重要说明' : 'Important Notes' }}</h3>
        <ul>
          <li>
            {{ locale === 'zh-CN'
              ? '本问卷仅供教育、自我反思与研究参考使用。'
              : 'This questionnaire is for education, self-reflection, and research reference only.' }}
          </li>
          <li>
            {{ locale === 'zh-CN'
              ? '问卷结果应谨慎解读。'
              : 'Questionnaire results should be interpreted with care.' }}
          </li>
          <li>
            {{ locale === 'zh-CN'
              ? '如果青少年长期感到情绪困扰、行为明显改变，或难以正常进行日常生活，建议及时寻求可信赖成年人或专业人士的帮助。'
              : 'If a teenager has prolonged emotional distress, clear behavioral changes, or difficulty with daily life, support from a trusted adult or professional is recommended.' }}
          </li>
          <li>
            {{ locale === 'zh-CN'
              ? '心理健康状态会随着时间变化，一次测验结果并不能定义一个人。'
              : 'Mental wellness can change over time, and one assessment result does not define a person.' }}
          </li>
        </ul>
      </div>
      <div v-if="!assessmentConsentSaved" class="consent-form">
        <p class="consent-copy">
          {{ locale === 'zh-CN'
            ? '本问卷用于生成更详细的情绪分析。你的作答会在匿名化后用于研究、产品分析和商业合作，不会展示你的姓名、账号或联系方式。'
            : 'This questionnaire provides a detailed mood analysis. Your answers may be anonymized for research, product analytics, and business collaboration without showing your name, account, or contact information.' }}
        </p>
        <el-checkbox v-model="assessmentConsent.accepted">
          {{ locale === 'zh-CN' ? '我已阅读并同意以上内容' : 'I have read and agree' }}
        </el-checkbox>
        <el-input v-model="assessmentConsent.userSignature" :placeholder="locale === 'zh-CN' ? '本人签名' : 'Your signature'" />
        <el-checkbox v-model="assessmentConsent.isMinor">
          {{ locale === 'zh-CN' ? '我是未成年人' : 'I am under 18' }}
        </el-checkbox>
        <el-input
          v-if="assessmentConsent.isMinor"
          v-model="assessmentConsent.guardianSignature"
          :placeholder="locale === 'zh-CN' ? '家长/监护人签名' : 'Guardian signature'"
        />
      </div>
      <div v-else class="questionnaire-form">
        <p class="assessment-intro">
          {{ locale === 'zh-CN'
            ? '请根据过去两周的真实感受作答。这个结果用于自我觉察，不作为诊断。'
            : 'Answer based on the past two weeks. This is for self-reflection and is not a diagnosis.' }}
        </p>
        <div
          v-for="category in assessmentCategories"
          :key="category.key"
          class="assessment-section"
        >
          <div class="assessment-section-heading">
            <span>{{ category.label }}</span>
            <small>{{ locale === 'zh-CN' ? `${category.questions.length} 题` : `${category.questions.length} items` }}</small>
          </div>
          <div v-for="question in category.questions" :key="question.key" class="question-item">
            <span>{{ question.number }}. {{ question.label }}</span>
            <div class="assessment-options" role="group" :aria-label="question.label">
              <button
                v-for="option in assessmentResponseOptions"
                :key="option.value"
                type="button"
                class="assessment-option"
                :class="{ active: assessmentAnswers[question.key] === option.value }"
                @click="assessmentAnswers[question.key] = option.value"
              >
                <strong>{{ option.value }}</strong>
                <span>{{ option.label }}</span>
              </button>
            </div>
          </div>
        </div>
        <div v-if="assessmentResult" class="assessment-result" :class="assessmentResult.level">
          <div class="assessment-score-row">
            <strong>{{ assessmentResult.title }}</strong>
            <span>{{ assessmentResult.score }}/{{ assessmentResult.maxScore }}</span>
          </div>
          <p>{{ assessmentResult.summary }}</p>
          <div class="subscale-list">
            <div v-for="category in assessmentCategories" :key="`${category.key}-score`">
              <span>{{ category.label }}</span>
              <strong>{{ assessmentResult.subscaleScores?.[category.key] ?? 0 }}/24</strong>
            </div>
          </div>
          <ul v-if="assessmentResult.suggestions?.length" class="assessment-suggestions">
            <li v-for="suggestion in assessmentResult.suggestions" :key="suggestion">{{ suggestion }}</li>
          </ul>
        </div>
      </div>

      <template #footer>
        <el-button @click="assessmentVisible = false" round>{{ locale === 'zh-CN' ? '关闭' : 'Close' }}</el-button>
        <el-button v-if="!assessmentConsentSaved" type="primary" round @click="saveAssessmentConsent">
          {{ locale === 'zh-CN' ? '签名并进入' : 'Sign and Continue' }}
        </el-button>
        <el-button v-else type="primary" round @click="submitAssessment">
          {{ locale === 'zh-CN' ? '生成分析' : 'Generate Analysis' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEmotionStore } from '../../stores/emotion'
import { ElMessage } from 'element-plus'
import anxiousIcon from '../../assets/icons/image2-mood-anxious.png'
import sadIcon from '../../assets/icons/image2-mood-sad.png'
import calmIcon from '../../assets/icons/image2-mood-calm.png'
import happyIcon from '../../assets/icons/image2-mood-happy.png'
import energeticIcon from '../../assets/icons/image2-mood-energetic.png'
import { getMoodInsight } from '../../utils/emotion-insights'
import { buildMoodQuoteShareText, getMoodQuoteCard } from '../../utils/mood-quote-card'
import {
  buildAssessmentPayload,
  normalizeAssessmentResult,
  scoreAssessment,
  validateAssessmentAnswers,
  validateAssessmentConsent,
} from '../../utils/assessment'
import {
  createAssessmentAnswers,
  getAssessmentCategories,
  getAssessmentQuestions,
  getAssessmentResponseOptions,
} from '../../utils/assessment-questions'
import { getXinqingClientId } from '../../utils/client-id'
import { emotionApi } from '../../api'

const { t, locale } = useI18n()
const emotionStore = useEmotionStore()
const currentRecord = ref(emotionStore.currentRecord)
const submitting = ref(false)
const weeklyReport = ref(emotionStore.weeklyReport)
const insightVisible = ref(false)
const latestInsight = ref(getMoodInsight(''))
const quoteCardVisible = ref(false)
const latestQuoteCard = ref(getMoodQuoteCard(''))
const assessmentVisible = ref(false)
const assessmentConsentSaved = ref(Boolean(localStorage.getItem('xinqing_assessment_consent')))
const assessmentConsent = ref({
  accepted: false,
  userSignature: '',
  isMinor: false,
  guardianSignature: '',
})
const assessmentAnswers = ref(createAssessmentAnswers())
const assessmentResult = ref(null)

const moods = computed(() => [
  { value: 'anxious', label: t('emotion.mood.anxious'), iconSrc: anxiousIcon, tone: 'tone-rose' },
  { value: 'sad', label: t('emotion.mood.sad'), iconSrc: sadIcon, tone: 'tone-blue' },
  { value: 'calm', label: t('emotion.mood.calm'), iconSrc: calmIcon, tone: 'tone-sage' },
  { value: 'happy', label: t('emotion.mood.happy'), iconSrc: happyIcon, tone: 'tone-yellow' },
  { value: 'energetic', label: t('emotion.mood.energetic'), iconSrc: energeticIcon, tone: 'tone-coral' },
])

const stressSources = computed(() => [
  { value: 'work', label: t('emotion.stress.work') },
  { value: 'interpersonal', label: t('emotion.stress.interpersonal') },
  { value: 'family', label: t('emotion.stress.family') },
  { value: 'money', label: t('emotion.stress.money') },
  { value: 'health', label: t('emotion.stress.health') },
  { value: 'none', label: t('emotion.stress.none') },
])

const energyMarks = computed(() => ({
  0: locale.value === 'zh-CN' ? '低' : 'Low',
  50: locale.value === 'zh-CN' ? '中' : 'Med',
  100: locale.value === 'zh-CN' ? '高' : 'High',
}))

const inspirations = computed(() => locale.value === 'zh-CN' ? [
  '好喝的咖啡',
  '好看的晚霞',
  '准时下班',
  '朋友的消息',
  '好吃的晚餐',
  '完成一件小事',
] : [
  'A good cup of coffee',
  'Beautiful sunset',
  'Leaving work on time',
  'Message from a friend',
  'Delicious dinner',
  'Completed a small task',
])

const showAttribution = computed(() => ['anxious', 'sad'].includes(currentRecord.value.mood))

const assessmentQuestions = computed(() => getAssessmentQuestions(locale.value))
const assessmentCategories = computed(() => getAssessmentCategories(locale.value))
const assessmentResponseOptions = computed(() => getAssessmentResponseOptions(locale.value))

function toggleStressSource(value) {
  const index = currentRecord.value.stressSources.indexOf(value)
  if (index > -1) {
    currentRecord.value.stressSources.splice(index, 1)
  } else {
    currentRecord.value.stressSources.push(value)
  }
}

function getInspiration() {
  const randomIndex = Math.floor(Math.random() * inspirations.value.length)
  currentRecord.value.happyMoment = inspirations.value[randomIndex]
}

async function handleSubmit() {
  if (!currentRecord.value.mood) {
    ElMessage.warning(locale.value === 'zh-CN' ? '请选择今日心情' : 'Please select your mood')
    return
  }

  submitting.value = true
  try {
    const savedMood = currentRecord.value.mood
    const localRecord = {
      client_id: getXinqingClientId(),
      mood: savedMood,
      energy_level: currentRecord.value.energyLevel,
      sleep_quality: currentRecord.value.sleepQuality,
      happy_moment: currentRecord.value.happyMoment,
      created_at: new Date().toISOString(),
    }
    await emotionStore.createRecord({
      ...currentRecord.value,
      clientId: getXinqingClientId(),
      stressSources: JSON.stringify(currentRecord.value.stressSources),
    })

    localStorage.setItem('xinqing_today_mood', savedMood)
    latestInsight.value = getMoodInsight(savedMood)
    latestQuoteCard.value = getMoodQuoteCard(savedMood)
    persistLocalMoodRecord(localRecord)
    persistLocalQuoteCard(latestQuoteCard.value)
    quoteCardVisible.value = true
    ElMessage.success(locale.value === 'zh-CN' ? '打卡成功！' : 'Check-in successful!')
    emotionStore.resetCurrentRecord()
    emotionStore.fetchWeeklyReport({ clientId: getXinqingClientId() })
  } catch (error) {
    ElMessage.error(locale.value === 'zh-CN' ? '打卡失败，请重试' : 'Check-in failed, please try again')
  } finally {
    submitting.value = false
  }
}

function readLocalList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function persistLocalMoodRecord(record) {
  const records = readLocalList('xinqing_emotion_records')
  localStorage.setItem('xinqing_emotion_records', JSON.stringify([
    { id: `local-mood-${Date.now()}`, ...record },
    ...records,
  ].slice(0, 30)))
}

function persistLocalQuoteCard(card) {
  const cards = readLocalList('xinqing_mood_quote_cards')
  localStorage.setItem('xinqing_mood_quote_cards', JSON.stringify([
    { id: `local-quote-${Date.now()}`, ...card, createdAt: new Date().toISOString() },
    ...cards,
  ].slice(0, 30)))
}

function escapeSvgText(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function saveQuoteCard() {
  const card = latestQuoteCard.value
  const [start, end] = card.gradient || ['#F7D8E1', '#FFF7F2']
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="${start}"/>
        <stop offset="100%" stop-color="${end}"/>
      </linearGradient>
    </defs>
    <rect width="900" height="1200" rx="58" fill="url(#bg)"/>
    <circle cx="690" cy="260" r="120" fill="rgba(255,255,255,0.58)"/>
    <text x="690" y="300" text-anchor="middle" font-size="150" fill="#D95E76" font-family="Arial">${escapeSvgText(card.symbol)}</text>
    <text x="90" y="190" font-size="42" font-weight="700" fill="#765F59" font-family="Arial">${escapeSvgText(card.title)}</text>
    <text x="90" y="445" font-size="58" font-weight="800" fill="#342A2A" font-family="Arial">${escapeSvgText(card.quote.slice(0, 15))}</text>
    <text x="90" y="525" font-size="58" font-weight="800" fill="#342A2A" font-family="Arial">${escapeSvgText(card.quote.slice(15, 30))}</text>
    <text x="90" y="650" font-size="34" fill="#765F59" font-family="Arial">${escapeSvgText(card.caption)}</text>
    <text x="90" y="1040" font-size="28" fill="#9C817A" font-family="Arial">心情疗愈 · ${new Date().toLocaleDateString('zh-CN')}</text>
  </svg>`
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `xinqing-quote-${Date.now()}.svg`
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success('日签已保存')
}

async function shareQuoteCard() {
  const text = buildMoodQuoteShareText(latestQuoteCard.value)
  if (navigator.share) {
    await navigator.share({ text }).catch(() => {})
    return
  }
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    ElMessage.success('分享文案已复制')
  } else {
    ElMessage.info(text)
  }
}

function openAssessment() {
  assessmentVisible.value = true
}

function saveAssessmentConsent() {
  const result = validateAssessmentConsent(assessmentConsent.value)
  if (!result.valid) {
    ElMessage.warning(result.errors[0])
    return
  }

  localStorage.setItem('xinqing_assessment_consent', JSON.stringify({
    signedAt: new Date().toISOString(),
    userSignature: assessmentConsent.value.userSignature.trim(),
    isMinor: assessmentConsent.value.isMinor,
    guardianSignature: assessmentConsent.value.guardianSignature.trim(),
    version: '2026-05-anonymized-research-product-business',
  }))
  assessmentConsentSaved.value = true
}

async function submitAssessment() {
  const answerValidation = validateAssessmentAnswers(assessmentAnswers.value)
  if (!answerValidation.valid) {
    ElMessage.warning(answerValidation.errors[0])
    return
  }

  const savedConsent = readSavedAssessmentConsent()
  const payload = buildAssessmentPayload(
    {
      accepted: true,
      userSignature: savedConsent.userSignature || assessmentConsent.value.userSignature,
      isMinor: Boolean(savedConsent.isMinor || assessmentConsent.value.isMinor),
      guardianSignature: savedConsent.guardianSignature || assessmentConsent.value.guardianSignature,
    },
    assessmentAnswers.value,
    getXinqingClientId()
  )

  try {
    const response = await emotionApi.submitAssessment(payload)
    assessmentResult.value = normalizeAssessmentResult(response.data)
    localStorage.setItem('xinqing_last_assessment_result', JSON.stringify(assessmentResult.value))
    ElMessage.success('详细心理分析已生成')
  } catch (error) {
    const localResult = scoreAssessment(assessmentAnswers.value)
    assessmentResult.value = {
      ...localResult,
      id: null,
      title: localResult.title,
      summary: localResult.summary,
    }
    ElMessage.warning('后端暂不可用，已先生成本地分析')
  }
}

function readSavedAssessmentConsent() {
  try {
    return JSON.parse(localStorage.getItem('xinqing_assessment_consent') || '{}')
  } catch {
    return {}
  }
}

async function loadWeeklyReport() {
  try {
    weeklyReport.value = await emotionStore.fetchWeeklyReport({ clientId: getXinqingClientId() })
  } catch (error) {
    console.error('加载周报失败:', error)
  }
}

onMounted(() => {
  loadWeeklyReport()
})
</script>

<style scoped>
.checkin-panel,
.slider-panel,
.journal-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mood-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.mood-item {
  min-width: 0;
  min-height: 104px;
  border: 1px solid transparent;
  border-radius: 18px;
  color: var(--color-text-primary);
  font-weight: 900;
  background: #F7D8E1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
}

.mood-item.active {
  border-color: var(--h5-primary);
  box-shadow: inset 0 0 0 2px rgba(217, 94, 118, 0.16);
}

.mood-icon {
  width: 42px;
  height: 42px;
}

.tone-blue { background: #E2ECF8; }
.tone-sage { background: #DDEFE5; }
.tone-yellow { background: #FFF0C8; }
.tone-coral { background: #F8DFD2; }

.attribution-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 4px;
}

.attribution-panel h3 {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 15px;
}

.stress-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.slider-header,
.sleep-row,
.analysis-entry-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.slider-header strong {
  color: var(--h5-primary);
  font-size: 20px;
}

.sleep-row {
  padding-top: 16px;
  border-top: 1px solid var(--h5-border);
}

.inspiration-link {
  align-self: flex-start;
  border: 0;
  background: transparent;
  color: var(--h5-primary);
  font-weight: 900;
  cursor: pointer;
}

.soft-submit {
  width: 100%;
  min-height: 58px;
  font-size: 18px;
  font-weight: 900;
}

.report-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.stat-item {
  padding: 12px;
  border-radius: 16px;
  background: #FBF7F3;
  text-align: center;
}

.stat-item strong,
.stat-item span {
  display: block;
}

.stat-item strong {
  color: var(--h5-primary);
  font-size: 20px;
}

.stat-item span {
  margin-top: 4px;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 800;
}

.consent-form,
.questionnaire-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.consent-copy,
.insight-result p,
.assessment-result p {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.insight-tag {
  color: var(--h5-primary);
  font-size: 20px;
  font-weight: 900;
}

.quote-card-preview {
  min-height: 380px;
  border-radius: 28px;
  padding: 26px 22px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(145deg, #F7D8E1, #FFF7F2);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.82);
}

.quote-card-preview.blue {
  background: linear-gradient(145deg, #E2ECF8, #F8F4FF);
}

.quote-card-preview.sage {
  background: linear-gradient(145deg, #DDEFE5, #FFF9ED);
}

.quote-card-preview.gold {
  background: linear-gradient(145deg, #FFF0C8, #FFF7E8);
}

.quote-card-preview.coral {
  background: linear-gradient(145deg, #F8DFD2, #FFF4ED);
}

.quote-illustration {
  width: 128px;
  height: 128px;
  border-radius: 42px;
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.58);
  color: var(--h5-primary);
  font-size: 72px;
  font-weight: 900;
}

.quote-card-preview h2 {
  margin: 18px 0 14px;
  color: var(--color-text-primary);
  font-size: 27px;
  line-height: 1.28;
  font-weight: 900;
}

.quote-card-preview p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 15px;
  line-height: 1.55;
  font-weight: 800;
}

.quote-card-preview small {
  position: absolute;
  left: 22px;
  bottom: 22px;
  color: var(--color-text-muted);
  font-weight: 800;
}

.question-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(226, 212, 207, 0.72);
}

.question-item > span {
  color: var(--color-text-primary);
  font-size: 15px;
  line-height: 1.45;
  font-weight: 900;
}

.assessment-intro {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.6;
  font-weight: 800;
}

.assessment-important-notes {
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 249, 237, 0.96);
  border: 1px solid rgba(241, 212, 107, 0.46);
}

.assessment-important-notes h3 {
  margin: 0 0 8px;
  color: var(--color-text-primary);
  font-size: 15px;
  line-height: 1.35;
  font-weight: 900;
}

.assessment-important-notes ul {
  margin: 0;
  padding-left: 18px;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.58;
  font-weight: 800;
}

.assessment-important-notes li + li {
  margin-top: 5px;
}

.assessment-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border-radius: 22px;
  background: #FBF7F3;
  border: 1px solid var(--h5-border);
}

.assessment-section-heading,
.assessment-score-row,
.subscale-list div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.assessment-section-heading span {
  color: var(--color-text-primary);
  font-size: 17px;
  font-weight: 900;
}

.assessment-section-heading small {
  flex: 0 0 auto;
  color: var(--h5-primary);
  font-size: 12px;
  font-weight: 900;
}

.assessment-options {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
}

.assessment-option {
  min-width: 0;
  min-height: 60px;
  border: 1px solid rgba(217, 94, 118, 0.18);
  border-radius: 14px;
  color: var(--color-text-secondary);
  background: rgba(255, 255, 255, 0.88);
  font: inherit;
  font-weight: 900;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
}

.assessment-option strong,
.assessment-option span {
  display: block;
  line-height: 1.1;
}

.assessment-option strong {
  color: var(--h5-primary);
  font-size: 15px;
}

.assessment-option span {
  font-size: 11px;
  word-break: keep-all;
}

.assessment-option.active {
  color: #FFFFFF;
  background: var(--h5-primary);
  border-color: var(--h5-primary);
  box-shadow: 0 8px 18px rgba(217, 94, 118, 0.2);
}

.assessment-option.active strong {
  color: #FFFFFF;
}

.assessment-result {
  padding: 16px;
  border-radius: 20px;
  background: #FFF9ED;
  border: 1px solid rgba(241, 212, 107, 0.42);
}

.assessment-score-row strong {
  color: var(--color-text-primary);
  font-size: 18px;
  line-height: 1.3;
}

.assessment-score-row span {
  flex: 0 0 auto;
  color: var(--h5-primary);
  font-size: 18px;
  font-weight: 900;
}

.subscale-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
}

.subscale-list div {
  padding: 9px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 900;
}

.subscale-list strong {
  color: var(--color-text-primary);
}

.assessment-suggestions {
  margin: 14px 0 0;
  padding-left: 18px;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.55;
  font-weight: 800;
}

@media (max-width: 374px) {
  .mood-grid {
    gap: 6px;
  }

  .mood-item {
    min-height: 92px;
    font-size: 13px;
  }

  .assessment-options {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
