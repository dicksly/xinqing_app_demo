<template>
  <div class="care-page home-view">
    <header class="care-page-header home-header">
      <div>
        <h1 class="care-page-title">烦恼小芽成长计划</h1>
        <p class="care-page-subtitle">今天也和草团子轻轻见面 · {{ currentDateText }}</p>
      </div>
    </header>

    <section class="care-card pad sprout-hero">
      <div class="sprout-copy">
        <span class="care-kicker">{{ milestone.title }}</span>
        <h2>连续陪伴 {{ streakState.currentStreak || 1 }} 天</h2>
        <p>{{ careState.moodText }}</p>
      </div>

      <div class="sprout-stage" :style="{ '--mascot-accent': mascotLevel.color }">
        <img :src="homeLogo" alt="草团子" class="sprout-image" />
      </div>

      <div class="sprout-stats">
        <div>
          <span>阳光露珠</span>
          <strong>{{ careState.sunDrops }}</strong>
        </div>
        <div>
          <span>当前奖励</span>
          <strong>{{ milestone.reward }}</strong>
        </div>
      </div>
    </section>

    <section class="care-card pad care-actions-card">
      <div class="section-title-row">
        <h2 class="care-card-title">照顾一下草团子</h2>
        <span>每日每项 +15</span>
      </div>
      <div class="care-actions-grid">
        <button
          v-for="action in careActions"
          :key="action.key"
          type="button"
          class="care-action care-touch"
          @click="handleCareAction(action.key)"
        >
          <span>{{ action.icon }}</span>
          <strong>{{ action.label }}</strong>
          <small>{{ action.hint }}</small>
        </button>
      </div>
    </section>

    <section class="care-card soft growth-card">
      <div>
        <span class="care-kicker">小芽成长中</span>
        <h2>下一站：{{ milestone.nextText }}</h2>
      </div>
      <div class="progress-track" aria-hidden="true">
        <div class="progress-fill" :style="{ width: `${growthProgress}%`, background: mascotLevel.color }"></div>
      </div>
    </section>

    <section class="care-card pad daily-task-card">
      <span class="care-chip sage">今日疗愈任务</span>
      <h2>完成一次心情打卡，获得新的阳光露珠</h2>
      <p>不用表现得很好，只要把此刻的感受放下来。</p>
      <button type="button" class="soft-button check-button" @click="router.push('/emotion')">去打卡</button>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import homeLogo from '../../assets/home-logo-clean.png'
import {
  getMascotLevel,
  shouldShowReturnPrompt,
  updateStreakState,
} from '../../utils/engagement'
import {
  applySproutCareAction,
  createDefaultSproutCareState,
  getSproutMilestone,
  normalizeSproutCareState,
} from '../../utils/sprout-care'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const { locale } = useI18n()

const careActions = [
  { key: 'feed', label: '喂食', icon: '☀', hint: '补一点能量' },
  { key: 'wash', label: '洗澡', icon: '♡', hint: '清爽一下' },
  { key: 'outing', label: '出门', icon: '↗', hint: '看看外面' },
  { key: 'comfort', label: '互动', icon: '✦', hint: '贴贴陪伴' },
]

const streakState = ref(readJson('xinqing_engagement_state', {}))
const careState = ref(normalizeSproutCareState(readJson('xinqing_sprout_care_state', createDefaultSproutCareState())))

const mascotLevel = computed(() => getMascotLevel(streakState.value.currentStreak || 1))
const milestone = computed(() => getSproutMilestone(streakState.value.currentStreak || 1))

const currentDateText = computed(() => {
  const formatter = new Intl.DateTimeFormat(locale.value === 'zh-CN' ? 'zh-CN' : 'en-US', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
  return formatter.format(new Date())
})

const growthProgress = computed(() => {
  const current = streakState.value.currentStreak || 1
  const nextAt = milestone.value.nextAt || current
  const startAt = milestone.value.startsAt || 1
  if (nextAt <= startAt) return 100
  return Math.min(100, Math.max(8, ((current - startAt) / (nextAt - startAt)) * 100))
})

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback))
  } catch {
    return fallback
  }
}

function persistCareState() {
  localStorage.setItem('xinqing_sprout_care_state', JSON.stringify(careState.value))
}

function handleCareAction(actionKey) {
  careState.value = applySproutCareAction(careState.value, actionKey)
  persistCareState()
  ElMessage.success('草团子收到了你的照顾')
}

function persistEngagementState() {
  const nextState = updateStreakState(streakState.value)
  streakState.value = nextState
  localStorage.setItem('xinqing_engagement_state', JSON.stringify(nextState))

  if (shouldShowReturnPrompt(nextState)) {
    const message = locale.value === 'zh-CN'
      ? `草团子已经 ${nextState.missedDays} 天没见到你啦，今天先回来坐一小会儿。`
      : `Your mascot has missed you for ${nextState.missedDays} days. Want to start with a tiny check-in?`
    ElMessageBox.alert(message, locale.value === 'zh-CN' ? '欢迎回来' : 'Welcome back', {
      confirmButtonText: locale.value === 'zh-CN' ? '去打卡' : 'Check in',
      callback: () => router.push('/emotion'),
    })
  }

  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {})
  }
}

onMounted(() => {
  persistEngagementState()
  persistCareState()
})
</script>

<style scoped>
.home-view {
  gap: 18px;
}

.home-header {
  min-height: 80px;
  display: flex;
  align-items: flex-end;
}

.sprout-hero {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 124px;
  gap: 14px;
  min-height: 238px;
  background:
    radial-gradient(circle at 80% 18%, rgba(119, 190, 138, 0.32), transparent 36%),
    linear-gradient(145deg, #fffaf4 0%, #f5efe6 100%);
}

.sprout-hero::after {
  content: '';
  position: absolute;
  left: 22px;
  right: 22px;
  bottom: 86px;
  height: 1px;
  background: rgba(118, 95, 89, 0.12);
}

.sprout-copy {
  position: relative;
  z-index: 1;
}

.sprout-copy h2 {
  margin: 16px 0 10px;
  color: var(--color-text-primary);
  font-size: 28px;
  line-height: 1.12;
  font-weight: 900;
}

.sprout-copy p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 15px;
  line-height: 1.55;
  font-weight: 800;
}

.sprout-stage {
  width: 118px;
  height: 118px;
  align-self: center;
  justify-self: end;
  border-radius: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: color-mix(in srgb, var(--mascot-accent, var(--h5-sage)) 22%, white);
  box-shadow: inset 0 -14px 22px rgba(97, 136, 77, 0.1), 0 18px 30px rgba(75, 92, 72, 0.12);
}

.sprout-image {
  width: 84px;
  filter: drop-shadow(0 12px 14px rgba(64, 99, 70, 0.18));
}

.sprout-stats {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  position: relative;
  z-index: 1;
}

.sprout-stats div {
  min-height: 68px;
  border-radius: 20px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid rgba(255, 255, 255, 0.85);
}

.sprout-stats span,
.section-title-row span {
  display: block;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 800;
}

.sprout-stats strong {
  display: block;
  margin-top: 7px;
  color: var(--color-text-primary);
  font-size: 18px;
  line-height: 1.2;
  font-weight: 900;
}

.care-actions-card {
  background: var(--h5-surface);
}

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.care-actions-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.care-action {
  min-width: 0;
  min-height: 94px;
  border: 1px solid var(--h5-border);
  border-radius: 22px;
  background: color-mix(in srgb, var(--h5-blush) 34%, white);
  color: var(--color-text-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.care-action span {
  width: 36px;
  height: 36px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--h5-primary);
  color: #fff;
  font-size: 18px;
  font-weight: 900;
}

.care-action strong {
  font-size: 14px;
  line-height: 1;
  font-weight: 900;
}

.care-action small {
  color: var(--color-text-muted);
  font-size: 11px;
  line-height: 1.2;
  font-weight: 800;
}

.growth-card {
  padding: 18px 16px;
  background: linear-gradient(135deg, rgba(221, 239, 229, 0.78), rgba(255, 250, 244, 0.92));
}

.growth-card h2 {
  margin: 8px 0 0;
  color: var(--color-text-primary);
  font-size: 20px;
  line-height: 1.28;
  font-weight: 900;
}

.progress-track {
  height: 8px;
  margin-top: 15px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(118, 95, 89, 0.12);
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
}

.daily-task-card h2 {
  margin: 13px 0 8px;
  color: var(--color-text-primary);
  font-size: 22px;
  line-height: 1.22;
  font-weight: 900;
}

.daily-task-card p {
  margin: 0 0 14px;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.55;
  font-weight: 800;
}

.check-button {
  width: 100%;
}

@media (max-width: 360px) {
  .sprout-hero {
    grid-template-columns: minmax(0, 1fr) 104px;
  }

  .sprout-stage {
    width: 100px;
    height: 100px;
    border-radius: 32px;
  }

  .sprout-image {
    width: 74px;
  }

  .care-actions-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
