<template>
  <div class="knowledge-local-view">
    <header class="local-header">
      <button type="button" class="local-back" :aria-label="backLabel" @click="goBack">
        <component :is="ArrowLeft" />
      </button>
      <div v-if="article" class="local-title-block">
        <span class="care-chip" :class="article.accent">{{ article.category }} · {{ article.readTime }}</span>
        <h1>{{ article.title }}</h1>
        <p>{{ article.subtitle }}</p>
      </div>
      <div v-else class="local-title-block">
        <span class="care-chip sage">知识</span>
        <h1>内容暂时不可用</h1>
        <p>这篇内容还没有准备好，可以先返回知识页看看其他内容。</p>
      </div>
    </header>

    <template v-if="article">
      <section class="care-card pad local-hero">
        <span class="local-kicker">本地精选整理</span>
        <p>{{ article.summary }}</p>
      </section>

      <section class="local-section-list">
        <article
          v-for="section in article.sections"
          :key="section.heading"
          class="care-card pad local-section"
        >
          <h2>{{ section.heading }}</h2>
          <p>{{ section.body }}</p>
        </article>
      </section>

      <section class="care-card pad local-practice">
        <div class="local-section-heading">
          <span class="care-chip rose">今天可以试试</span>
          <h2>小练习</h2>
        </div>
        <ol>
          <li v-for="practice in article.practices" :key="practice">{{ practice }}</li>
        </ol>
      </section>

      <section class="care-card pad local-prompts">
        <div class="local-section-heading">
          <span class="care-chip blue">留给自己</span>
          <h2>反思问题</h2>
        </div>
        <ul>
          <li v-for="prompt in article.reflectionPrompts" :key="prompt">{{ prompt }}</li>
        </ul>
      </section>

      <section class="care-card pad local-source">
        <div>
          <span>内容已按 App 体验重新整理</span>
          <p>参考来源：{{ article.sourceTitle }}</p>
        </div>
        <a class="source-link" :href="article.sourceUrl" target="_blank" rel="noopener noreferrer">
          <component :is="Link" />
          <span>打开原文</span>
        </a>
      </section>
    </template>

    <section v-else class="care-card pad local-empty">
      <component :is="WarningFilled" />
      <button type="button" class="empty-action" @click="goKnowledge">返回知识页</button>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Link, WarningFilled } from '@element-plus/icons-vue'
import { getLocalKnowledgeArticleById } from './knowledge-local-content.js'

const route = useRoute()
const router = useRouter()

const article = computed(() => getLocalKnowledgeArticleById(getRouteId(route.params.id)))
const backLabel = '返回知识页'

function getRouteId(value) {
  if (Array.isArray(value)) return value[0] || ''
  return typeof value === 'string' ? value : ''
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  goKnowledge()
}

function goKnowledge() {
  router.push('/knowledge')
}
</script>

<style scoped>
.knowledge-local-view {
  min-height: calc(100vh - 178px);
  min-height: calc(100dvh - 178px);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.local-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
}

.local-back {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid var(--h5-border);
  background: var(--h5-surface);
  color: var(--color-text-primary);
  box-shadow: var(--h5-shadow-soft);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  cursor: pointer;
}

.local-back svg {
  width: 20px;
  height: 20px;
}

.local-title-block {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.local-title-block h1 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 25px;
  font-weight: 900;
  line-height: 1.18;
  overflow-wrap: anywhere;
}

.local-title-block p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.55;
}

.local-hero {
  background:
    linear-gradient(135deg, rgba(205, 232, 214, 0.82), rgba(255, 255, 255, 0.94) 58%),
    var(--h5-surface);
}

.local-kicker {
  display: inline-flex;
  margin-bottom: 10px;
  color: var(--h5-primary);
  font-size: 13px;
  font-weight: 900;
}

.local-hero p,
.local-section p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 15px;
  line-height: 1.72;
}

.local-section-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.local-section h2,
.local-section-heading h2 {
  margin: 0 0 10px;
  color: var(--color-text-primary);
  font-size: 19px;
  font-weight: 900;
  line-height: 1.25;
}

.local-section-heading {
  margin-bottom: 10px;
}

.local-section-heading .care-chip {
  margin-bottom: 8px;
}

.local-practice ol,
.local-prompts ul {
  margin: 0;
  padding-left: 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.local-practice li,
.local-prompts li {
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.55;
}

.local-source {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.local-source span {
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 900;
}

.local-source p {
  margin: 4px 0 0;
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.45;
}

.source-link,
.empty-action {
  min-width: 108px;
  min-height: 42px;
  border: 0;
  border-radius: 999px;
  padding: 0 16px;
  background: var(--h5-primary);
  color: #fff;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 900;
  box-shadow: 0 12px 28px rgba(217, 94, 118, 0.22);
  flex: 0 0 auto;
  cursor: pointer;
}

.source-link svg {
  width: 16px;
  height: 16px;
}

.local-empty {
  text-align: center;
  color: var(--color-text-secondary);
}

.local-empty svg {
  width: 32px;
  height: 32px;
  margin-bottom: 12px;
  color: var(--h5-primary);
}

@media (max-width: 420px) {
  .local-title-block h1 {
    font-size: 22px;
  }

  .local-source {
    align-items: stretch;
    flex-direction: column;
  }

  .source-link,
  .empty-action {
    width: 100%;
  }
}
</style>
