<template>
  <div class="emotion-view">
    <!-- 今日心情打卡卡片 -->
    <section class="checkin-card card">
      <header class="card-header">
        <component :is="Histogram" class="header-icon" />
        <div class="header-copy">
          <h2 class="card-title">{{ t('emotion.title') }}</h2>
          <p class="card-subtitle">{{ locale === 'zh-CN' ? '用一个更轻的方式，记录今天的状态。' : 'Capture today with a softer, simpler check-in.' }}</p>
        </div>
        <span class="panel-chip">{{ locale === 'zh-CN' ? 'Today' : 'Today' }}</span>
      </header>

      <div class="emotion-spotlight">
        <div class="spotlight-copy">
          <span class="spotlight-label">{{ locale === 'zh-CN' ? '轻量记录' : 'Quick note' }}</span>
          <p>{{ locale === 'zh-CN' ? '先选一个状态，再补充能量、睡眠和一点微光时刻。' : 'Pick a mood first, then add energy, sleep, and one small bright moment.' }}</p>
        </div>
        <div class="spotlight-badge">
          <span>{{ currentRecord.mood ? moods.find(item => item.value === currentRecord.mood)?.label : (locale === 'zh-CN' ? '未选择' : 'Pending') }}</span>
        </div>
      </div>

      <!-- 心情选择 -->
      <div class="section">
        <h3 class="section-title">{{ t('emotion.basicStatus') }}</h3>
        <div class="mood-grid">
          <div
            v-for="mood in moods"
            :key="mood.value"
            class="mood-item touchable"
            :class="{ active: currentRecord.mood === mood.value }"
            @click="currentRecord.mood = mood.value"
          >
            <div class="mood-icon" :class="mood.iconClass">
              <component :is="mood.icon" />
            </div>
            <span class="mood-label">{{ mood.label }}</span>
          </div>
        </div>
      </div>

      <!-- 能量水平 -->
      <div class="section">
        <div class="slider-header">
          <span class="slider-label">{{ t('emotion.energyLevel') }}</span>
          <span class="slider-value">{{ currentRecord.energyLevel }}%</span>
        </div>
        <el-slider
          v-model="currentRecord.energyLevel"
          :marks="energyMarks"
          :show-tooltip="false"
          active-color="#10b981"
        />
      </div>

      <!-- 睡眠质量 -->
      <div class="section sleep-section">
        <span class="section-label">{{ t('emotion.sleepQuality') }}</span>
        <el-rate
          v-model="currentRecord.sleepQuality"
          :max="5"
          show-score
          :score-template="locale === 'zh-CN' ? '{value}星' : '{value} stars'"
          :colors="['#fbbf24', '#fbbf24', '#fbbf24']"
        />
      </div>

      <!-- 压力来源（负面心情时显示） -->
      <div v-if="showAttribution" class="section">
        <h3 class="section-title">{{ t('emotion.stressSources') }}</h3>
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

        <h3 class="section-title">{{ t('emotion.socialPreference') }}</h3>
        <el-radio-group v-model="currentRecord.socialPreference" class="social-radio">
          <el-radio-button label="alone">{{ t('emotion.social.alone') }}</el-radio-button>
          <el-radio-button label="social">{{ t('emotion.social.social') }}</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 微光时刻 -->
      <div class="section">
        <h3 class="section-title">{{ t('emotion.happyMoment') }}</h3>
        <el-input
          v-model="currentRecord.happyMoment"
          type="textarea"
          :rows="2"
          :placeholder="t('emotion.happyMomentPlaceholder')"
          maxlength="50"
          show-word-limit
          resize="none"
        />
        <el-button
          v-if="!currentRecord.happyMoment"
          class="inspiration-btn"
          @click="getInspiration"
          text
          type="primary"
        >
          <component :is="MagicStick" />
          <span>{{ t('emotion.getInspiration') }}</span>
        </el-button>
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
        {{ t('emotion.submitCheckin') }}
      </el-button>
    </section>

    <section class="analysis-entry-card card">
      <div>
        <h2 class="card-title">{{ locale === 'zh-CN' ? '详细心理分析' : 'Detailed Psychological Analysis' }}</h2>
        <p class="card-subtitle">{{ locale === 'zh-CN' ? '填写问卷前需要阅读知情同意书并签名。' : 'Read and sign consent before taking the questionnaire.' }}</p>
      </div>
      <el-button type="primary" round @click="openAssessment">
        {{ locale === 'zh-CN' ? '进入问卷' : 'Start' }}
      </el-button>
    </section>

    <!-- 本周报告卡片 -->
    <section class="report-card card">
      <header class="card-header">
        <component :is="DataLine" class="header-icon" />
        <div class="header-copy">
          <h2 class="card-title">{{ t('emotion.weeklyReport') }}</h2>
          <p class="card-subtitle">{{ locale === 'zh-CN' ? '把这一周的情绪节奏看得更清楚一点。' : 'See the rhythm of your week more clearly.' }}</p>
        </div>
      </header>

      <div v-if="weeklyReport" class="report-content">
        <div class="report-stats">
          <div class="stat-item">
            <span class="stat-value">{{ weeklyReport.total_records }}</span>
            <span class="stat-label">{{ t('emotion.report.checkinDays') }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ weeklyReport.average_energy?.toFixed(1) }}</span>
            <span class="stat-label">{{ t('emotion.report.avgEnergy') }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ weeklyReport.average_sleep?.toFixed(1) }}</span>
            <span class="stat-label">{{ t('emotion.report.avgSleep') }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ weeklyReport.happy_moments_count }}</span>
            <span class="stat-label">{{ t('emotion.report.happyMoments') }}</span>
          </div>
        </div>

        <div v-if="weeklyReport.top_stress_sources?.length > 0" class="stress-chart">
          <h4 class="chart-title">{{ t('emotion.report.topStressSources') }}</h4>
          <div class="stress-tags-list">
            <span
              v-for="(source, index) in weeklyReport.top_stress_sources"
              :key="source"
              class="stress-rank-tag"
            >
              #{{ index + 1 }} {{ source }}
            </span>
          </div>
        </div>
      </div>

      <el-empty v-else :description="t('emotion.report.noData')" :image-size="60" />
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
      v-model="assessmentVisible"
      :title="locale === 'zh-CN' ? '详细心理分析' : 'Detailed Psychological Analysis'"
      width="92%"
      class="assessment-dialog"
    >
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
        <div v-for="question in assessmentQuestions" :key="question.key" class="question-item">
          <span>{{ question.label }}</span>
          <el-slider v-model="assessmentAnswers[question.key]" :min="0" :max="4" :show-tooltip="false" />
        </div>
        <div v-if="assessmentResult" class="assessment-result" :class="assessmentResult.level">
          <strong>{{ assessmentResult.title }}</strong>
          <p>{{ assessmentResult.summary }}</p>
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
import { Histogram, MagicStick, DataLine, Warning, CircleClose, Remove, StarFilled, Sunny } from '@element-plus/icons-vue'
import { getMoodInsight } from '../../utils/emotion-insights'
import { scoreAssessment, validateAssessmentConsent } from '../../utils/assessment'

const { t, locale } = useI18n()
const emotionStore = useEmotionStore()
const currentRecord = ref(emotionStore.currentRecord)
const submitting = ref(false)
const weeklyReport = ref(emotionStore.weeklyReport)
const insightVisible = ref(false)
const latestInsight = ref(getMoodInsight(''))
const assessmentVisible = ref(false)
const assessmentConsentSaved = ref(Boolean(localStorage.getItem('xinqing_assessment_consent')))
const assessmentConsent = ref({
  accepted: false,
  userSignature: '',
  isMinor: false,
  guardianSignature: '',
})
const assessmentAnswers = ref({
  sleep: 0,
  anxiety: 0,
  sadness: 0,
  energy: 0,
  focus: 0,
})
const assessmentResult = ref(null)

// 心情选项 - 使用 SVG 图标
const moods = computed(() => [
  { value: 'anxious', label: t('emotion.mood.anxious'), icon: Warning, iconClass: 'icon-anxious' },
  { value: 'sad', label: t('emotion.mood.sad'), icon: CircleClose, iconClass: 'icon-sad' },
  { value: 'calm', label: t('emotion.mood.calm'), icon: Remove, iconClass: 'icon-calm' },
  { value: 'happy', label: t('emotion.mood.happy'), icon: StarFilled, iconClass: 'icon-happy' },
  { value: 'energetic', label: t('emotion.mood.energetic'), icon: Sunny, iconClass: 'icon-energetic' },
])

// 压力源选项
const stressSources = computed(() => [
  { value: 'work', label: t('emotion.stress.work') },
  { value: 'interpersonal', label: t('emotion.stress.interpersonal') },
  { value: 'family', label: t('emotion.stress.family') },
  { value: 'money', label: t('emotion.stress.money') },
  { value: 'health', label: t('emotion.stress.health') },
  { value: 'none', label: t('emotion.stress.none') },
])

// 能量滑块标记
const energyMarks = computed(() => ({
  0: locale.value === 'zh-CN' ? '低' : 'Low',
  50: locale.value === 'zh-CN' ? '中' : 'Med',
  100: locale.value === 'zh-CN' ? '高' : 'High',
}))

// 灵感提示词
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

// 是否显示归因部分
const showAttribution = computed(() => {
  return ['anxious', 'sad'].includes(currentRecord.value.mood)
})

const assessmentQuestions = computed(() => [
  { key: 'sleep', label: locale.value === 'zh-CN' ? '最近睡眠受影响的程度' : 'Sleep disruption recently' },
  { key: 'anxiety', label: locale.value === 'zh-CN' ? '焦虑或紧绷的程度' : 'Anxiety or tension level' },
  { key: 'sadness', label: locale.value === 'zh-CN' ? '低落或无力的程度' : 'Sadness or exhaustion level' },
  { key: 'energy', label: locale.value === 'zh-CN' ? '日常能量被消耗的程度' : 'Daily energy drain' },
  { key: 'focus', label: locale.value === 'zh-CN' ? '注意力受影响的程度' : 'Focus disruption' },
])

// 切换压力源
function toggleStressSource(value) {
  const index = currentRecord.value.stressSources.indexOf(value)
  if (index > -1) {
    currentRecord.value.stressSources.splice(index, 1)
  } else {
    currentRecord.value.stressSources.push(value)
  }
}

// 获取灵感
function getInspiration() {
  const randomIndex = Math.floor(Math.random() * inspirations.value.length)
  currentRecord.value.happyMoment = inspirations.value[randomIndex]
}

// 提交打卡
async function handleSubmit() {
  if (!currentRecord.value.mood) {
    ElMessage.warning(locale.value === 'zh-CN' ? '请选择今日心情' : 'Please select your mood')
    return
  }

  submitting.value = true
  try {
    await emotionStore.createRecord({
      ...currentRecord.value,
      stressSources: JSON.stringify(currentRecord.value.stressSources),
    })

    localStorage.setItem('xinqing_today_mood', currentRecord.value.mood)
    latestInsight.value = getMoodInsight(currentRecord.value.mood)
    insightVisible.value = true
    ElMessage.success(locale.value === 'zh-CN' ? '打卡成功！' : 'Check-in successful!')
    emotionStore.resetCurrentRecord()
    emotionStore.fetchWeeklyReport()
  } catch (error) {
    ElMessage.error(locale.value === 'zh-CN' ? '打卡失败，请重试' : 'Check-in failed, please try again')
  } finally {
    submitting.value = false
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

function submitAssessment() {
  assessmentResult.value = scoreAssessment(assessmentAnswers.value)
}

// 加载周报
async function loadWeeklyReport() {
  try {
    weeklyReport.value = await emotionStore.fetchWeeklyReport()
  } catch (error) {
    console.error('加载周报失败:', error)
  }
}

onMounted(() => {
  loadWeeklyReport()
})
</script>

<style scoped>
.emotion-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 16px);
}

.analysis-entry-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.analysis-entry-card .card-subtitle {
  margin: 6px 0 0;
}

.insight-result {
  text-align: center;
}

.insight-tag {
  display: inline-flex;
  margin-bottom: 12px;
  padding: 8px 14px;
  border-radius: 999px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-weight: 800;
}

.insight-result p,
.consent-copy,
.assessment-result p {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.consent-form,
.questionnaire-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.question-item {
  display: grid;
  gap: 8px;
  color: var(--color-text-secondary);
  font-size: 13px;
}

.assessment-result {
  padding: 14px;
  border-radius: 14px;
  background: var(--surface-2);
}

.assessment-result.high {
  background: rgba(239, 68, 68, 0.08);
}

.assessment-result.medium {
  background: rgba(245, 158, 11, 0.1);
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
}

/* 分区 */
.section {
  margin-bottom: var(--spacing-md, 16px);
}

.section-title {
  font-size: var(--font-sm, 13px);
  font-weight: 500;
  color: var(--color-text-secondary, #64748b);
  margin: 0 0 var(--spacing-sm, 8px) 0;
}

.section-label {
  font-size: var(--font-sm, 13px);
  color: var(--color-text-secondary, #64748b);
}

/* 心情网格 */
.mood-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--spacing-sm, 8px);
}

.mood-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs, 4px);
  padding: var(--spacing-sm, 8px);
  border-radius: var(--radius-md, 12px);
  background: var(--color-bg-tertiary, #f1f5f9);
  transition: all var(--transition-base, 0.2s ease);
  min-height: 44px;
}

.mood-item.active {
  background: rgba(16, 185, 129, 0.1);
  box-shadow: 0 0 0 2px var(--color-primary, #10b981);
}

.mood-icon {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm, 8px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mood-icon svg {
  width: 18px;
  height: 18px;
}

.mood-label {
  font-size: var(--font-xs, 11px);
  color: var(--color-text-secondary, #64748b);
}

.mood-item.active .mood-label {
  color: var(--color-primary, #10b981);
  font-weight: 500;
}

/* 能量滑块 */
.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm, 8px);
}

.slider-label {
  font-size: var(--font-sm, 13px);
  color: var(--color-text-secondary, #64748b);
}

.slider-value {
  font-size: var(--font-base, 15px);
  font-weight: 600;
  color: var(--color-primary, #10b981);
}

/* 睡眠质量 */
.sleep-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 压力标签 */
.stress-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs, 4px);
  margin-bottom: var(--spacing-md, 16px);
}

.social-radio {
  width: 100%;
}

.social-radio :deep(.el-radio-button__inner) {
  width: 100%;
}

/* 灵感按钮 */
.inspiration-btn {
  margin-top: var(--spacing-sm, 8px);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 4px);
}

.inspiration-btn svg {
  width: 14px;
  height: 14px;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  margin-top: var(--spacing-sm, 8px);
  background: linear-gradient(135deg, var(--color-primary, #10b981) 0%, var(--color-primary-light, #34d399) 100%);
  border: none;
  font-weight: 500;
}

/* 报告统计 */
.report-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-sm, 8px);
  margin-bottom: var(--spacing-md, 16px);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-sm, 8px);
  background: var(--color-bg-tertiary, #f1f5f9);
  border-radius: var(--radius-md, 12px);
}

.stat-value {
  font-size: var(--font-xl, 20px);
  font-weight: 600;
  color: var(--color-text-primary, #1e293b);
}

.stat-label {
  font-size: var(--font-xs, 11px);
  color: var(--color-text-muted, #94a3b8);
  margin-top: var(--spacing-xs, 4px);
}

/* 压力图表 */
.stress-chart {
  padding: var(--spacing-md, 16px);
  background: var(--color-bg-tertiary, #f1f5f9);
  border-radius: var(--radius-md, 12px);
}

.chart-title {
  font-size: var(--font-sm, 13px);
  font-weight: 500;
  color: var(--color-text-secondary, #64748b);
  margin: 0 0 var(--spacing-sm, 8px) 0;
}

.stress-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs, 4px);
}

.stress-rank-tag {
  display: inline-flex;
  padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
  background: var(--color-bg-card, #ffffff);
  border-radius: var(--radius-full, 9999px);
  font-size: var(--font-xs, 11px);
  color: var(--color-text-secondary, #64748b);
}

/* 响应式 */
@media (max-width: 360px) {
  .mood-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: var(--spacing-xs, 4px);
  }

  .report-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 深色模式 - 温暖紫色系 */
.dark .checkin-card,
.dark .report-card {
  background: rgba(45, 42, 62, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.dark .mood-item {
  background: rgba(31, 28, 42, 0.8);
}

.dark .mood-item.active {
  background: rgba(167, 139, 250, 0.15);
  box-shadow: 0 0 0 2px var(--color-primary, #a78bfa);
}

.dark .mood-item.active .mood-label {
  color: var(--color-primary, #a78bfa);
}

.dark .slider-value {
  color: var(--color-primary, #a78bfa);
}

.dark .stat-item {
  background: rgba(31, 28, 42, 0.8);
}

.dark .stress-chart {
  background: rgba(31, 28, 42, 0.8);
}

.dark .stress-rank-tag {
  background: rgba(45, 42, 62, 0.8);
}

.checkin-card {
  background:
    linear-gradient(160deg, color-mix(in srgb, var(--surface-2) 82%, transparent) 0%, color-mix(in srgb, var(--surface-1) 92%, transparent) 100%),
    var(--accent-gradient-soft);
}

.report-card {
  background: color-mix(in srgb, var(--surface-2) 92%, transparent);
}

.emotion-view .section {
  padding: 14px;
  border-radius: 18px;
  background: color-mix(in srgb, var(--surface-3) 76%, transparent);
  border: 1px solid var(--color-border-light);
}

.emotion-view .section-title,
.emotion-view .slider-label,
.emotion-view .section-label {
  font-weight: 700;
  letter-spacing: 0.01em;
}

.mood-grid {
  gap: 10px;
}

.mood-item {
  min-height: 88px;
  padding: 12px 8px;
  border: 1px solid transparent;
  background: color-mix(in srgb, var(--surface-2) 86%, transparent);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.mood-item.active {
  background: color-mix(in srgb, var(--color-primary) 14%, var(--surface-2));
  border-color: color-mix(in srgb, var(--color-primary) 26%, transparent);
  box-shadow: 0 12px 26px color-mix(in srgb, var(--color-primary) 14%, transparent);
}

.mood-icon {
  width: 40px;
  height: 40px;
  border-radius: 14px;
}

.mood-label {
  font-size: 12px;
  font-weight: 600;
}

.sleep-section {
  gap: 10px;
  flex-wrap: wrap;
}

.social-radio :deep(.el-radio-group) {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.social-radio :deep(.el-radio-button) {
  width: 100%;
}

.submit-btn {
  min-height: 50px;
  box-shadow: 0 14px 28px color-mix(in srgb, var(--color-primary) 24%, transparent);
}

.report-stats {
  gap: 10px;
}

.stat-item {
  padding: 12px 8px;
  background: color-mix(in srgb, var(--surface-3) 82%, transparent);
  border: 1px solid var(--color-border-light);
}

.stat-value {
  font-size: 24px;
}

.stress-chart {
  background: color-mix(in srgb, var(--surface-3) 86%, transparent);
  border: 1px solid var(--color-border-light);
}

[data-ui-theme='glow-night'] .checkin-card {
  background:
    linear-gradient(180deg, rgba(17, 28, 56, 0.88) 0%, rgba(10, 16, 31, 0.92) 100%),
    var(--accent-gradient-secondary);
}

[data-ui-theme='playful-bloom'] .checkin-card {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 245, 233, 0.96) 100%),
    var(--accent-gradient-soft);
}

.header-copy {
  flex: 1;
  min-width: 0;
}

.checkin-card .card-header,
.report-card .card-header {
  align-items: flex-start;
}

.checkin-card .header-icon,
.report-card .header-icon {
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

.emotion-spotlight {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  margin-bottom: 14px;
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.68) 0%, rgba(255, 243, 240, 0.9) 100%);
  border: 1px solid rgba(255, 255, 255, 0.58);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.spotlight-copy {
  min-width: 0;
}

.spotlight-label {
  display: inline-flex;
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: 0.03em;
}

.spotlight-copy p {
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: var(--color-text-secondary);
}

.spotlight-badge {
  flex-shrink: 0;
  min-width: 82px;
  min-height: 42px;
  padding: 0 12px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid var(--color-border-light);
  color: var(--color-text-primary);
  font-size: 12px;
  font-weight: 700;
}

.emotion-view .section {
  padding: 16px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.62) 0%, color-mix(in srgb, var(--surface-3) 92%, transparent) 100%);
}

.slider-header,
.sleep-section {
  margin-bottom: 2px;
}

.stress-tags :deep(.el-check-tag) {
  border-radius: 999px;
  border: 1px solid var(--color-border-light);
  background: rgba(255, 255, 255, 0.56);
  color: var(--color-text-secondary);
  padding: 7px 11px;
}

.stress-tags :deep(.el-check-tag.is-checked) {
  background: color-mix(in srgb, var(--color-primary) 12%, white);
  color: var(--color-primary-dark);
  border-color: color-mix(in srgb, var(--color-primary) 26%, transparent);
}

.social-radio :deep(.el-radio-button__inner) {
  min-height: 42px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.54);
}

.social-radio :deep(.el-radio-button.is-active .el-radio-button__inner) {
  background: color-mix(in srgb, var(--color-primary) 10%, white);
}

.submit-btn {
  margin-top: 4px;
  border-radius: 18px;
}

.report-card {
  position: relative;
}

.report-card::after {
  content: '';
  position: absolute;
  right: 18px;
  top: 18px;
  width: 72px;
  height: 72px;
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(240, 111, 137, 0.06) 0%, rgba(255, 204, 134, 0.12) 100%);
  pointer-events: none;
}

.report-stats {
  position: relative;
  z-index: 1;
  gap: 12px;
}

.stat-item {
  align-items: flex-start;
  padding: 14px 12px;
  border-radius: 18px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

.stat-label {
  margin-top: 6px;
  line-height: 1.35;
}

.stress-chart {
  border-radius: 20px;
}
</style>
