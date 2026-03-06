<template>
  <div class="emotion-view">
    <!-- 情绪打卡卡片 -->
    <el-card class="checkin-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><Histogram /></el-icon>
          <span>今日心情打卡</span>
        </div>
      </template>

      <!-- 基础状态 -->
      <div class="section">
        <h3>🌟 基础状态</h3>
        
        <!-- 心情选择 -->
        <div class="mood-selector">
          <div
            v-for="mood in moods"
            :key="mood.value"
            class="mood-item"
            :class="{ active: currentRecord.mood === mood.value }"
            @click="currentRecord.mood = mood.value"
          >
            <span class="mood-emoji">{{ mood.emoji }}</span>
            <span class="mood-label">{{ mood.label }}</span>
          </div>
        </div>

        <!-- 能量水平 -->
        <div class="energy-slider">
          <div class="slider-label">
            <span>⚡ 能量水平</span>
            <span class="energy-value">{{ currentRecord.energyLevel }}%</span>
          </div>
          <el-slider
            v-model="currentRecord.energyLevel"
            :marks="energyMarks"
            :show-tooltip="false"
          />
        </div>

        <!-- 睡眠质量 -->
        <div class="sleep-quality">
          <span>😴 睡眠质量</span>
          <el-rate
            v-model="currentRecord.sleepQuality"
            :max="5"
            show-score
            score-template="{value}星"
          />
        </div>
      </div>

      <!-- 智能归因（当选择负面心情时显示） -->
      <div v-if="showAttribution" class="section">
        <h3>🏷️ 压力来源</h3>
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

        <h3>💬 社交意愿</h3>
        <el-radio-group v-model="currentRecord.socialPreference">
          <el-radio-button label="alone">🔴 想独处充电</el-radio-button>
          <el-radio-button label="social">🟢 想找人贴贴</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 微光时刻 -->
      <div class="section">
        <h3>✨ 微光时刻</h3>
        <el-input
          v-model="currentRecord.happyMoment"
          type="textarea"
          :rows="3"
          placeholder="记录今日一件小确幸...（最多50字）"
          maxlength="50"
          show-word-limit
        />
        <el-button
          v-if="!currentRecord.happyMoment"
          class="inspiration-btn"
          @click="getInspiration"
          text
        >
          <el-icon><MagicStick /></el-icon>
          换一个灵感
        </el-button>
      </div>

      <!-- 提交按钮 -->
      <el-button
        type="primary"
        size="large"
        :loading="submitting"
        @click="handleSubmit"
        class="submit-btn"
      >
        完成打卡
      </el-button>
    </el-card>

    <!-- 周报卡片 -->
    <el-card class="report-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><DataLine /></el-icon>
          <span>本周报告</span>
        </div>
      </template>

      <div v-if="weeklyReport" class="report-content">
        <div class="report-stats">
          <el-statistic title="打卡天数" :value="weeklyReport.total_records" />
          <el-statistic title="平均能量" :value="weeklyReport.average_energy" suffix="%" :precision="1" />
          <el-statistic title="平均睡眠" :value="weeklyReport.average_sleep" suffix="星" :precision="1" />
          <el-statistic title="微光时刻" :value="weeklyReport.happy_moments_count" />
        </div>

        <div v-if="weeklyReport.top_stress_sources.length > 0" class="stress-chart">
          <h4>🎯 主要压力源</h4>
          <el-tag
            v-for="(source, index) in weeklyReport.top_stress_sources"
            :key="source"
            class="stress-tag"
          >
            #{{ index + 1 }} {{ source }}
          </el-tag>
        </div>
      </div>

      <el-empty v-else description="暂无本周数据" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useEmotionStore } from '../../stores/emotion'
import { ElMessage } from 'element-plus'
import { Histogram, MagicStick, DataLine } from '@element-plus/icons-vue'

const emotionStore = useEmotionStore()
const currentRecord = ref(emotionStore.currentRecord)
const submitting = ref(false)
const weeklyReport = ref(emotionStore.weeklyReport)

// 心情选项
const moods = [
  { value: 'anxious', label: '焦虑', emoji: '😰' },
  { value: 'sad', label: '丧', emoji: '😢' },
  { value: 'calm', label: '平静', emoji: '😌' },
  { value: 'happy', label: '开心', emoji: '😊' },
  { value: 'energetic', label: '元气', emoji: '😄' },
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

// 计算属性：是否显示归因部分
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

.section {
  margin-bottom: 24px;
}

.section h3 {
  font-size: 16px;
  color: #6b5e54;
  margin-bottom: 12px;
}

.mood-selector {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.mood-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border: 2px solid #e8dcd4;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background: #ffffff;
  min-width: 80px;
}

.mood-item:hover {
  border-color: #d4a373;
  background: #f8f4f0;
}

.mood-item.active {
  border-color: #d4a373;
  background: #fef9f3;
  box-shadow: 0 4px 12px rgba(212, 163, 115, 0.2);
}

.mood-emoji {
  font-size: 32px;
  margin-bottom: 8px;
}

.mood-label {
  font-size: 12px;
  color: #8b7e74;
}

.energy-slider {
  margin: 20px 0;
}

.slider-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 500;
  color: #6b5e54;
}

.energy-value {
  color: #d4a373;
  font-weight: bold;
}

.sleep-quality {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stress-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.inspiration-btn {
  margin-top: 8px;
  color: #d4a373;
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

.report-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stress-chart {
  padding: 16px;
  background: #faf8f6;
  border-radius: 8px;
}

.stress-chart h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #6b5e54;
}

.stress-tag {
  margin: 4px;
}
</style>
