<template>
  <div class="home-view">
    <section class="home-hero">
      <div class="fruit-stage">
        <div class="fruit-badge">
          <img :src="homeLogo" alt="Healing Orchard logo" class="fruit-image" />
        </div>
        <div class="float-badge badge-bolt">
          <Lightning />
        </div>
        <div class="float-badge badge-leaf">
          <Opportunity />
        </div>
      </div>

      <h1 class="home-title">{{ t('home.title') }}</h1>
      <p class="home-subtitle">{{ t('home.subtitle') }}</p>
    </section>

    <section class="feature-grid">
      <button
        v-for="item in featureCards"
        :key="item.path"
        type="button"
        class="feature-card"
        :style="{ animationDelay: `${item.delay}ms` }"
        @click="router.push(item.path)"
      >
        <div class="feature-icon" :class="item.colorClass">
          <component :is="item.icon" />
        </div>
        <h2 class="feature-title">{{ item.title }}</h2>
        <p class="feature-desc">{{ item.desc }}</p>
      </button>
    </section>

    <section class="support-list">
      <article class="support-card">
        <div class="support-kicker">{{ t('home.dailyNote') }}</div>
        <p class="support-desc">{{ t('home.dailyNoteDesc') }}</p>
      </article>
      <article class="support-card support-card-accent">
        <div class="support-kicker">{{ t('home.streak') }}</div>
        <p class="support-desc">{{ t('home.streakDesc') }}</p>
      </article>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  Histogram,
  Moon,
  ChatDotRound,
  Reading,
  Lightning,
  Opportunity
} from '@element-plus/icons-vue'
import homeLogo from '../../assets/home-logo-clean.png'

const router = useRouter()
const { t } = useI18n()

const featureCards = computed(() => [
  {
    path: '/emotion',
    icon: Histogram,
    title: t('home.statusRecord'),
    desc: t('home.statusDesc'),
    colorClass: 'icon-mood',
    delay: 40
  },
  {
    path: '/mindfulness',
    icon: Moon,
    title: t('home.mindfulness'),
    desc: t('home.mindfulnessDesc'),
    colorClass: 'icon-mind',
    delay: 90
  },
  {
    path: '/treehole',
    icon: ChatDotRound,
    title: t('home.treehole'),
    desc: t('home.treeholeDesc'),
    colorClass: 'icon-tree',
    delay: 140
  },
  {
    path: '/knowledge',
    icon: Reading,
    title: t('home.knowledge'),
    desc: t('home.knowledgeDesc'),
    colorClass: 'icon-know',
    delay: 190
  }
])
</script>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding-top: 10px;
}

.home-hero {
  text-align: center;
  padding: 18px 14px 6px;
}

.fruit-stage {
  position: relative;
  width: 184px;
  height: 184px;
  margin: 0 auto 18px;
  animation: homeFloatIn 0.5s ease both;
}

.fruit-badge {
  position: absolute;
  inset: 20px;
  border-radius: 50%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(251, 247, 242, 0.96) 72%, rgba(244, 237, 232, 0.98) 100%);
  box-shadow:
    0 20px 40px rgba(202, 178, 168, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fruitPulse 5.6s ease-in-out infinite;
}

.fruit-badge::after {
  content: '';
  position: absolute;
  inset: -7px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 0 0 1px rgba(237, 226, 221, 0.68);
}

.fruit-badge::before {
  content: none;
}

.fruit-image {
  width: 124px;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 10px 14px rgba(77, 121, 63, 0.12));
}

.float-badge {
  position: absolute;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, white 94%, rgba(255, 244, 245, 0.8));
  border: 1px solid rgba(255, 255, 255, 0.74);
  box-shadow:
    0 10px 22px rgba(202, 178, 168, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.84);
  color: var(--color-primary);
  animation: homeFloatIn 0.45s ease both;
}

.float-badge :deep(svg) {
  width: 15px;
  height: 15px;
  stroke-width: 1.7;
}

.badge-bolt {
  top: 10px;
  right: 18px;
}

.badge-leaf {
  top: 48px;
  right: 6px;
  color: var(--color-green);
}

.home-title {
  margin: 0 0 10px;
  font-size: 34px;
  line-height: 1.08;
  color: var(--color-text-primary);
  animation: homeFloatIn 0.42s ease both;
  animation-delay: 50ms;
}

.home-subtitle {
  margin: 0 auto;
  max-width: 286px;
  min-height: 38px;
  padding: 10px 16px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--surface-1) 94%, white);
  border: 1px solid rgba(255, 255, 255, 0.58);
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.45;
  box-shadow: 0 10px 20px rgba(219, 198, 191, 0.14);
  animation: homeFloatIn 0.42s ease both;
  animation-delay: 90ms;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.feature-card {
  border: none;
  min-height: 190px;
  padding: 22px 16px 18px;
  border-radius: 28px;
  background: color-mix(in srgb, var(--surface-2) 92%, transparent);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
  text-align: center;
  display: grid;
  grid-template-rows: 58px 42px 36px;
  align-content: center;
  justify-items: center;
  row-gap: 10px;
  transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);
  animation: cardRiseIn 0.45s ease both;
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.feature-card:active {
  transform: translateY(0) scale(0.985);
  box-shadow: var(--shadow-sm);
}

.feature-icon {
  width: 54px;
  height: 54px;
  margin: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.08);
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.feature-icon svg {
  width: 24px;
  height: 24px;
}

.feature-card:hover .feature-icon {
  transform: translateY(-1px);
  box-shadow: 0 14px 24px rgba(0, 0, 0, 0.1);
}

.icon-mood {
  background: linear-gradient(180deg, color-mix(in srgb, var(--color-primary-light) 88%, white) 0%, var(--color-primary) 100%);
}

.icon-mind {
  background: linear-gradient(180deg, color-mix(in srgb, var(--color-secondary-light) 88%, white) 0%, var(--color-secondary) 100%);
}

.icon-tree {
  background: linear-gradient(180deg, var(--color-green-light) 0%, var(--color-green) 100%);
}

.icon-know {
  background: linear-gradient(180deg, color-mix(in srgb, var(--color-primary) 64%, var(--color-green-light)) 0%, color-mix(in srgb, var(--color-primary-dark) 58%, var(--color-green)) 100%);
}

.feature-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0.01em;
  color: var(--color-text-primary);
  min-height: 40px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  text-align: center;
}

.feature-desc {
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  color: var(--color-text-muted);
  white-space: pre-line;
  min-height: 34px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  text-align: center;
}

.support-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.support-card {
  padding: 16px 18px;
  border-radius: 22px;
  background: color-mix(in srgb, var(--surface-2) 88%, transparent);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
  animation: cardRiseIn 0.45s ease both;
  animation-delay: 230ms;
}

.support-card-accent {
  background: linear-gradient(135deg, rgba(255, 235, 240, 0.96) 0%, rgba(255, 245, 232, 0.96) 100%);
}

.support-kicker {
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-primary);
}

.support-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
  color: var(--color-text-secondary);
}

@keyframes homeFloatIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes cardRiseIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fruitPulse {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-2px);
  }
}

@media (max-width: 360px) {
  .fruit-stage {
    transform: scale(0.92);
    margin-bottom: 6px;
  }

  .feature-grid {
    gap: 12px;
  }
}
</style>
