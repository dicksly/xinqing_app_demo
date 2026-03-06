<template>
  <div class="mindfulness-view">
    <!-- 冥想引导卡片 -->
    <el-card class="guided-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><Moon /></el-icon>
          <span>场景化冥想</span>
        </div>
      </template>

      <!-- 冥想分类 -->
      <div class="meditation-types">
        <div
          v-for="type in meditationTypes"
          :key="type.value"
          class="type-card"
          :class="{ active: selectedType === type.value }"
          @click="selectedType = type.value"
        >
          <span class="type-icon">{{ type.icon }}</span>
          <span class="type-label">{{ type.label }}</span>
          <span class="type-desc">{{ type.desc }}</span>
        </div>
      </div>

      <!-- 时长选择 -->
      <div v-if="selectedType" class="duration-selector">
        <h4>⏱ 选择时长</h4>
        <el-radio-group v-model="selectedDuration">
          <el-radio-button :label="3">3分钟微冥想</el-radio-button>
          <el-radio-button :label="10">10分钟标准</el-radio-button>
          <el-radio-button :label="20">20分钟深度</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 音量控制 -->
      <div v-if="selectedType" class="volume-control">
        <h4>🔊 音量调节</h4>
        <div class="volume-slider">
          <span>人声</span>
          <el-slider
            v-model="voiceVolume"
            :marks="{ 0: '静音', 50: '适中', 100: '最大' }"
            :show-tooltip="false"
          />
          <span>背景音</span>
          <el-slider
            v-model="bgVolume"
            :marks="{ 0: '静音', 50: '适中', 100: '最大' }"
            :show-tooltip="false"
          />
        </div>
        <div class="bg-music-type">
          <span>背景音类型：</span>
          <el-select v-model="bgMusicType" placeholder="选择背景音">
            <el-option label="白噪音" value="white-noise" />
            <el-option label="自然声（雨声）" value="rain" />
            <el-option label="自然声（森林）" value="forest" />
            <el-option label="阿尔法波音乐" value="alpha-wave" />
          </el-select>
        </div>
      </div>

      <!-- 开始按钮 -->
      <div v-if="selectedType" class="start-btn">
        <el-button
          type="primary"
          size="large"
          @click="startMeditation"
          :loading="isPlaying"
          :icon="isPlaying ? 'VideoPause' : 'VideoPlay'"
        >
          {{ isPlaying ? '暂停冥想' : '开始冥想' }}
        </el-button>
      </div>
    </el-card>

    <!-- 呼吸训练卡片 -->
    <el-card class="breathing-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><DataLine /></el-icon>
          <span>4-7-8 呼吸训练</span>
        </div>
      </template>

      <div class="breathing-animation">
        <div class="breathing-circle" :class="{ inhaling: isInhaling, exhaling: isExhaling }">
          <div class="breathing-text">
            {{ breathingText }}
          </div>
        </div>
      </div>

      <div class="breathing-info">
        <p>4-7-8 呼吸法是一种简单但有效的放松技巧，有助于减少焦虑、改善睡眠质量。</p>
        <p><strong>步骤：</strong></p>
        <ol>
          <li>用鼻子吸气，默数 4 秒</li>
          <li>屏住呼吸，默数 7 秒</li>
          <li>用嘴巴呼气，默数 8 秒</li>
          <li>重复 3-4 次</li>
        </ol>
      </div>

      <el-button
        type="primary"
        @click="toggleBreathing"
        :icon="isBreathingActive ? 'VideoPause' : 'VideoPlay'"
        class="breathing-btn"
      >
        {{ isBreathingActive ? '暂停训练' : '开始训练' }}
      </el-button>
    </el-card>

    <!-- 解压小游戏 -->
    <el-card class="games-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><Grid /></el-icon>
          <span>解压小游戏</span>
        </div>
      </template>

      <div class="games-grid">
        <div
          v-for="game in games"
          :key="game.id"
          class="game-item"
          @click="openGame(game)"
        >
          <span class="game-icon">{{ game.icon }}</span>
          <span class="game-title">{{ game.title }}</span>
          <span class="game-desc">{{ game.desc }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Moon, DataLine, Grid, VideoPlay, VideoPause } from '@element-plus/icons-vue'
import { mindfulnessApi } from '../../api'
import { ElMessage } from 'element-plus'

// 冥想类型
const meditationTypes = [
  { value: 'sleep', label: '睡眠助眠', icon: '😴', desc: '帮助您进入深度睡眠' },
  { value: 'wake', label: '晨间唤醒', icon: '🌅', desc: '开启元气满满的一天' },
  { value: 'stress', label: '考前/面试前抗压', icon: '💪', desc: '提升专注力和信心' },
  { value: 'emergency', label: '情绪急救', icon: '🚑', desc: '快速平复情绪' },
]

const selectedType = ref('')
const selectedDuration = ref(10)
const voiceVolume = ref(80)
const bgVolume = ref(50)
const bgMusicType = ref('white-noise')
const isPlaying = ref(false)

// 呼吸训练
const isInhaling = ref(false)
const isExhaling = ref(false)
const isBreathingActive = ref(false)
const breathingText = ref('准备')
const breathingTimer = ref(null)

// 解压游戏
const games = [
  { id: 'bubble', title: '捏泡泡纸', icon: '🫧', desc: '释放压力，享受触感' },
  { id: 'soap', title: '切肥皂', icon: '🧼', desc: '看着泡沫破裂，烦恼消失' },
  { id: 'organize', title: '整理收纳', icon: '📦', desc: '秩序感带来平静' },
  { id: 'mandala', title: '曼陀罗涂色', icon: '🎨', desc: '专注当下，创造美好' },
]

// 开始冥想
async function startMeditation() {
  if (!selectedType.value) {
    ElMessage.warning('请选择冥想类型')
    return
  }

  isPlaying.value = !isPlaying.value

  if (isPlaying.value) {
    try {
      // 这里可以调用后端 API 记录冥想会话
      await mindfulnessApi.create({
        session_type: selectedType.value,
        duration_minutes: selectedDuration.value,
        completed: false,
      })
      
      ElMessage.success('开始冥想！')
    } catch (error) {
      console.error('记录冥想失败:', error)
    }
  } else {
    ElMessage.info('冥想已暂停')
  }
}

// 切换呼吸训练
function toggleBreathing() {
  isBreathingActive.value = !isBreathingActive.value

  if (isBreathingActive.value) {
    startBreathingCycle()
  } else {
    stopBreathingCycle()
  }
}

function startBreathingCycle() {
  let cycleCount = 0
  
  const cycle = () => {
    if (!isBreathingActive.value) return
    
    // 吸气 4 秒
    isInhaling.value = true
    isExhaling.value = false
    breathingText.value = '吸气...'
    navigator.vibrate?.(200) // 震动提示
    
    setTimeout(() => {
      if (!isBreathingActive.value) return
      
      // 屏息 7 秒
      isInhaling.value = false
      isExhaling.value = false
      breathingText.value = '屏息...'
      
      setTimeout(() => {
        if (!isBreathingActive.value) return
        
        // 呼气 8 秒
        isInhaling.value = false
        isExhaling.value = true
        breathingText.value = '呼气...'
        navigator.vibrate?.([100, 50, 100]) // 震动提示
        
        setTimeout(() => {
          if (!isBreathingActive.value) return
          
          // 完成一次循环
          breathingText.value = '准备'
          cycleCount++
          
          if (cycleCount < 4) {
            breathingTimer.value = setTimeout(cycle, 100)
          } else {
            // 完成一组训练
            isBreathingActive.value = false
            ElMessage.success('训练完成！')
          }
        }, 8000)
      }, 7000)
    }, 4000)
  }

  cycle()
}

function stopBreathingCycle() {
  isInhaling.value = false
  isExhaling.value = false
  breathingText.value = '准备'
  
  if (breathingTimer.value) {
    clearTimeout(breathingTimer.value)
    breathingTimer.value = null
  }
}

// 打开游戏
function openGame(game) {
  ElMessage.info(`正在打开：${game.title}`)
  // 这里可以实现游戏逻辑或跳转到游戏页面
}
</script>

<style scoped>
.mindfulness-view {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 768px) {
  .mindfulness-view {
    grid-template-columns: 1fr;
  }
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

.meditation-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.type-card {
  padding: 20px;
  border: 2px solid #e8dcd4;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  background: #ffffff;
}

.type-card:hover {
  border-color: #d4a373;
  background: #f8f4f0;
}

.type-card.active {
  border-color: #d4a373;
  background: #fef9f3;
  box-shadow: 0 4px 12px rgba(212, 163, 115, 0.2);
}

.type-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 8px;
}

.type-label {
  font-size: 16px;
  font-weight: bold;
  color: #6b5e54;
  display: block;
  margin-bottom: 4px;
}

.type-desc {
  font-size: 12px;
  color: #8b7e74;
}

.duration-selector {
  margin: 20px 0;
}

.duration-selector h4 {
  margin: 0 0 12px 0;
  color: #6b5e54;
}

.volume-control {
  margin: 20px 0;
}

.volume-control h4 {
  margin: 0 0 12px 0;
  color: #6b5e54;
}

.volume-slider {
  margin: 16px 0;
}

.volume-slider span {
  font-size: 12px;
  color: #8b7e74;
  width: 60px;
  display: inline-block;
}

.bg-music-type {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.start-btn {
  margin-top: 24px;
}

.start-btn .el-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  background: linear-gradient(135deg, #d4a373 0%, #e6ccb2 100%);
  border: none;
}

.breathing-animation {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
}

.breathing-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e8dcd4 0%, #d4a373 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 2s ease-in-out;
  position: relative;
}

.breathing-circle::before {
  content: '';
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  border: 3px solid #d4a373;
  opacity: 0;
  transition: all 2s ease-in-out;
}

.breathing-circle.inhaling {
  transform: scale(1.5);
  box-shadow: 0 0 40px rgba(212, 163, 115, 0.4);
}

.breathing-circle.inhaling::before {
  opacity: 1;
  transform: scale(1.2);
}

.breathing-circle.exhaling {
  transform: scale(0.8);
  box-shadow: 0 0 20px rgba(139, 126, 116, 0.3);
}

.breathing-text {
  font-size: 18px;
  font-weight: bold;
  color: #ffffff;
  text-align: center;
}

.breathing-info {
  padding: 20px 0;
  color: #6b5e54;
}

.breathing-info p {
  margin: 8px 0;
  line-height: 1.6;
}

.breathing-info ol {
  padding-left: 20px;
  line-height: 1.8;
}

.breathing-btn {
  width: 100%;
  margin-top: 16px;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.game-item {
  padding: 24px 16px;
  border: 2px solid #e8dcd4;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #ffffff;
}

.game-item:hover {
  border-color: #d4a373;
  background: #f8f4f0;
  transform: translateY(-4px);
}

.game-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 8px;
}

.game-title {
  font-size: 14px;
  font-weight: bold;
  color: #6b5e54;
  display: block;
  margin-bottom: 4px;
}

.game-desc {
  font-size: 12px;
  color: #8b7e74;
}
</style>
