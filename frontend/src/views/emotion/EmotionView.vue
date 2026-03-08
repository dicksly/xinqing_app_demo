<template>
  <div class="emotion-view">
    <!-- 今日心情打卡卡片 -->
    <section class="checkin-card card">
      <header class="card-header">
        <component :is="Histogram" class="header-icon" />
        <h2 class="card-title">今日心情打卡</h2>
      </header>

      <!-- 心情选择 -->
      <div class="section">
        <h3 class="section-title">基础状态</h3>
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
          <span class="slider-label">能量水平</span>
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
        <span class="section-label">睡眠质量</span>
        <el-rate
          v-model="currentRecord.sleepQuality"
          :max="5"
          show-score
          score-template="{value}星"
          :colors="['#fbbf24', '#fbbf24', '#fbbf24']"
        />
      </div>

      <!-- 压力来源（负面心情时显示） -->
      <div v-if="showAttribution" class="section">
        <h3 class="section-title">压力来源</h3>
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

        <h3 class="section-title">社交意愿</h3>
        <el-radio-group v-model="currentRecord.socialPreference" class="social-radio">
          <el-radio-button label="alone">想独处充电</el-radio-button>
          <el-radio-button label="social">想找人贴贴</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 微光时刻 -->
      <div class="section">
        <h3 class="section-title">微光时刻</h3>
        <el-input
          v-model="currentRecord.happyMoment"
          type="textarea"
          :rows="2"
          placeholder="记录今日一件小确幸..."
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
          <span>换一个灵感</span>
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
        完成打卡
      </el-button>
    </section>

    <!-- 本周报告卡片 -->
    <section class="report-card card">
      <header class="card-header">
        <component :is="DataLine" class="header-icon" />
        <h2 class="card-title">本周报告</h2>
      </header>

      <div v-if="weeklyReport" class="report-content">
        <div class="report-stats">
          <div class="stat-item">
            <span class="stat-value">{{ weeklyReport.total_records }}</span>
            <span class="stat-label">打卡天数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ weeklyReport.average_energy?.toFixed(1) }}</span>
            <span class="stat-label">平均能量</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ weeklyReport.average_sleep?.toFixed(1) }}</span>
            <span class="stat-label">平均睡眠</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ weeklyReport.happy_moments_count }}</span>
            <span class="stat-label">微光时刻</span>
          </div>
        </div>

        <div v-if="weeklyReport.top_stress_sources?.length > 0" class="stress-chart">
          <h4 class="chart-title">主要压力源</h4>
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

      <el-empty v-else description="暂无本周数据" :image-size="60" />
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEmotionStore } from '../../stores/emotion'
import { ElMessage } from 'element-plus'
import { Histogram, MagicStick, DataLine, Warning, CircleClose, Remove, StarFilled, Sunny } from '@element-plus/icons-vue'

const emotionStore = useEmotionStore()
const currentRecord = ref(emotionStore.currentRecord)
const submitting = ref(false)
const weeklyReport = ref(emotionStore.weeklyReport)

// 心情选项 - 使用 SVG 图标
const moods = [
  { value: 'anxious', label: '焦虑', icon: Warning, iconClass: 'icon-anxious' },
  { value: 'sad', label: '丧', icon: CircleClose, iconClass: 'icon-sad' },
  { value: 'calm', label: '平静', icon: Remove, iconClass: 'icon-calm' },
  { value: 'happy', label: '开心', icon: StarFilled, iconClass: 'icon-happy' },
  { value: 'energetic', label: '元气', icon: Sunny, iconClass: 'icon-energetic' },
]

// 压力源选项
const stressSources = [
  { value: 'work', label: '#工作' },
  { value: 'interpersonal', label: '#人际' },
  { value: 'family', label: '#家庭' },
  { value: 'money', label: '#金钱' },
  { value: 'health', label: '#健康' },
  { value: 'none', label: '#无原因' },
]

// 能量滑块标记
const energyMarks = {
  0: '低',
  50: '中',
  100: '高',
}

// 灵感提示词
const inspirations = [
  '好喝的咖啡',
  '好看的晚霞',
  '准时下班',
  '朋友的消息',
  '好吃的晚餐',
  '完成一件小事',
]

// 是否显示归因部分
const showAttribution = computed(() => {
  return ['anxious', 'sad'].includes(currentRecord.value.mood)
})

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
  const randomIndex = Math.floor(Math.random() * inspirations.length)
  currentRecord.value.happyMoment = inspirations[randomIndex]
}

// 提交打卡
async function handleSubmit() {
  if (!currentRecord.value.mood) {
    ElMessage.warning('请选择今日心情')
    return
  }

  submitting.value = true
  try {
    await emotionStore.createRecord({
      ...currentRecord.value,
      stressSources: JSON.stringify(currentRecord.value.stressSources),
    })

    ElMessage.success('打卡成功！')
    emotionStore.resetCurrentRecord()
    emotionStore.fetchWeeklyReport()
  } catch (error) {
    ElMessage.error('打卡失败，请重试')
  } finally {
    submitting.value = false
  }
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
</style>
