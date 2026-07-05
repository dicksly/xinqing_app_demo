<template>
  <div class="knowledge-external-view">
    <header class="reader-header">
      <button type="button" class="reader-back" :aria-label="backLabel" @click="goBack">
        <component :is="ArrowLeft" />
      </button>
      <div class="reader-title-block">
        <span class="care-chip sage">{{ typeLabel }}</span>
        <h1>{{ displayTitle }}</h1>
      </div>
    </header>

    <section v-if="safeUrl" class="reader-shell">
      <div v-if="!frameLoaded" class="reader-loading">
        <component :is="Loading" class="loading-icon" />
        <span>{{ locale === 'zh-CN' ? '正在加载内容' : 'Loading content' }}</span>
      </div>

      <iframe
        class="external-frame"
        :src="embedUrl"
        :title="displayTitle"
        loading="eager"
        referrerpolicy="no-referrer-when-downgrade"
        @load="frameLoaded = true"
      ></iframe>
    </section>

    <section v-else class="reader-empty care-card pad">
      <component :is="WarningFilled" class="empty-icon" />
      <h2>{{ locale === 'zh-CN' ? '链接暂时不可用' : 'Link unavailable' }}</h2>
      <p>{{ locale === 'zh-CN' ? '返回知识页，再试试其他内容。' : 'Return to the knowledge page and try another item.' }}</p>
    </section>

    <section v-if="safeUrl" class="reader-fallback care-card pad">
      <div>
        <h2>{{ locale === 'zh-CN' ? '页面没有显示？' : 'Page not showing?' }}</h2>
        <p>{{ locale === 'zh-CN' ? '少数来源会限制嵌入，原文入口会保留在这里。' : 'Some sources limit embedding, so the original stays available here.' }}</p>
      </div>
      <a class="original-link" :href="safeUrl" target="_blank" rel="noopener noreferrer" @click="openOriginal">
        <component :is="Link" />
        <span>{{ locale === 'zh-CN' ? '打开原文' : 'Open original' }}</span>
      </a>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowLeft, Link, Loading, WarningFilled } from '@element-plus/icons-vue'
import { getKnowledgeEmbedUrl, normalizeExternalUrl } from './knowledge-external-url.js'

const route = useRoute()
const router = useRouter()
const { locale } = useI18n()

const frameLoaded = ref(false)

const rawUrl = computed(() => getQueryValue(route.query.url))
const rawTitle = computed(() => getQueryValue(route.query.title))
const rawType = computed(() => getQueryValue(route.query.type))

const safeUrl = computed(() => normalizeExternalUrl(rawUrl.value))
const embedUrl = computed(() => getKnowledgeEmbedUrl(safeUrl.value))
const displayTitle = computed(() => rawTitle.value || (locale.value === 'zh-CN' ? '知识内容' : 'Knowledge Content'))
const backLabel = computed(() => locale.value === 'zh-CN' ? '返回知识页' : 'Back to knowledge')
const typeLabel = computed(() => {
  const type = rawType.value
  if (locale.value === 'zh-CN') {
    if (type === 'video') return '视频'
    if (type === 'test') return '测试'
    if (type === 'article') return '文章'
    return '知识'
  }

  if (type === 'video') return 'Video'
  if (type === 'test') return 'Test'
  if (type === 'article') return 'Article'
  return 'Knowledge'
})

watch(rawUrl, () => {
  frameLoaded.value = false
})

function getQueryValue(value) {
  if (Array.isArray(value)) return value[0] || ''
  return typeof value === 'string' ? value : ''
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/knowledge')
}

function openOriginal() {
  frameLoaded.value = true
}
</script>

<style scoped>
.knowledge-external-view {
  min-height: calc(100vh - 178px);
  min-height: calc(100dvh - 178px);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.reader-header {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.reader-back {
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

.reader-back svg {
  width: 20px;
  height: 20px;
}

.reader-title-block {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.reader-title-block h1 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 21px;
  font-weight: 900;
  line-height: 1.18;
  overflow-wrap: anywhere;
}

.reader-shell {
  position: relative;
  flex: 1 1 auto;
  min-height: 560px;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid var(--h5-border);
  background: var(--h5-surface);
  box-shadow: var(--h5-shadow-soft);
}

.reader-loading {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--color-text-muted);
  font-size: 14px;
  font-weight: 800;
  background: var(--h5-surface);
}

.loading-icon {
  width: 18px;
  height: 18px;
  animation: reader-spin 1s linear infinite;
}

.external-frame {
  position: relative;
  z-index: 2;
  display: block;
  width: 100%;
  height: 100%;
  min-height: 560px;
  border: 0;
  background: #fff;
}

.reader-empty {
  text-align: center;
  color: var(--color-text-secondary);
}

.reader-empty h2,
.reader-fallback h2 {
  margin: 0 0 6px;
  color: var(--color-text-primary);
  font-size: 18px;
  font-weight: 900;
}

.reader-empty p,
.reader-fallback p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.5;
}

.empty-icon {
  width: 32px;
  height: 32px;
  margin-bottom: 10px;
  color: var(--h5-primary);
}

.reader-fallback {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.original-link {
  min-width: 108px;
  min-height: 42px;
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
}

.original-link svg {
  width: 16px;
  height: 16px;
}

@keyframes reader-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 420px) {
  .reader-shell,
  .external-frame {
    min-height: 520px;
  }

  .reader-fallback {
    align-items: stretch;
    flex-direction: column;
  }

  .original-link {
    width: 100%;
  }
}
</style>
