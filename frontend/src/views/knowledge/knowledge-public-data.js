export const KNOWLEDGE_VIDEO_LINKS = [
  'https://www.youtube.com/watch?v=30VMIEmA114',
  'https://www.youtube.com/watch?v=eBz7iUJu9UM',
  'https://www.youtube.com/watch?v=mGugp5qs6Vg',
  'https://b23.tv/l7RxwCf',
  'https://youtu.be/IOrmS8vJDQw?si=dXyw-OMPpSZxqatP',
  'https://youtu.be/7vqnazqmceQ?si=UvWjZYravcFTgJf4',
  'https://www.youtube.com/watch?v=CqgmozFr_GM',
  'https://www.youtube.com/watch?v=IRDhHb987Wc',
  'https://www.youtube.com/watch?v=ohs33Ybf9BY',
  'https://www.youtube.com/watch?v=puoddnGTAJk&t=31s',
  'https://www.youtube.com/watch?v=EirlZ7fy3bE',
  'https://www.youtube.com/watch?v=a3wX8nmvlZ0',
]

export const KNOWLEDGE_ARTICLE_LINKS = [
  'https://www.coreenergetics.org/grounding-techniques-in-body-psychotherapy-finding-stability-in-a-chaotic-world/?gad_source=1&gad_campaignid=22300250112&gbraid=0AAAAApJEfmbRutk_aShitAiikt90dveVl&gclid=CjwKCAjwuO_QBhAWEiwAIkVhU42KnmQ5UKI-9sx4_ji0aZYJ6lIjlcyv1Q2_1hcBn6LH-CHJXAXoIhoCFTIQAvD_BwE',
  'https://effectivestudents.com/articles/learning-from-failure-teaching-students-how-to-overcome-setbacks/',
  'https://antiloneliness.com/post/how-to-build-meaningful-connections-with-others',
  'https://jamesclear.com/focus',
  'https://tomcronin.com/6-tips-to-get-you-through-a-challenging-experience/',
  'https://thinklessandgrowrich.medium.com/being-true-to-yourself-7-tips-to-live-a-more-authentic-life-6ae51f76b1e7',
  'https://www.in-mind.org/article/breathe-through-the-stress-simple-breathing-techniques-for-staying-calm-under-pressure?gad_source=1&gad_campaignid=343237259&gbraid=0AAAAADg-6I0qQcBN3BCCm0XwVhZ2ZmxZz&gclid=Cj0KCQjwio_RBhDMARIsAJPveNPe6eU6wW2d6GwXM2NbYX4M7ViQhyED6aWvLAjGv0jJ23RiaOmNVJsaAjd4EALw_wcB',
  'https://www.myrkothum.com/self-reflection-how-to-do-it-right/',
  'https://commonpurpose.org/resources/blog/tips-to-build-confidence?gad_source=1&gad_campaignid=22661182461&gbraid=0AAAAADmzJ0OYFFASi2-w5-bcuIpXAUy7F&gclid=Cj0KCQjwio_RBhDMARIsAJPveNMUbTIzOCdyKvF61wAAG62nMCYz7eJGNlJCkjc8RFj00TGOtGbJd0MaAiBBEALw_wcB',
  'https://eugenetherapy.com/article/4-tips-for-building-tolerance-for-others/',
  'https://abbymedcalf.com/how-to-practice-self-acceptance-my-top-5-tips/',
  'https://www.6seconds.org/2025/07/01/the-power-of-gratitude-change-your-brain-and-life/',
]

export const SBTI_TEST = {
  id: 'sbti',
  title: 'SBTI 心理能量测试',
  desc: '跳转到完整 SBTI 测试，了解你的心理能量和恢复倾向。',
  duration: '5分钟',
  questions_count: 0,
  externalUrl: 'https://www.fengyunzhice.com/sbti?ver=8bdpc-6234&bd_vid=12439061078742734187',
}

const REFERENCE_ASSET_SOURCE = 'docs/references.md'

function getReferenceAssetPath(contentType, index) {
  const paddedIndex = String(index + 1).padStart(2, '0')
  const assetGroup = contentType === 'video' ? 'videos' : 'articles'

  return `/reference-assets/knowledge/${assetGroup}/${paddedIndex}.jpg`
}

function getReferenceAssetFields(contentType, index) {
  if (index < 0 || index >= 12) return null

  const assetPath = getReferenceAssetPath(contentType, index)

  return {
    asset_source: REFERENCE_ASSET_SOURCE,
    ...(contentType === 'video'
      ? { thumbnail_url: assetPath }
      : { cover_image: assetPath }),
  }
}

const KNOWLEDGE_REFERENCE_ASSETS_BY_SOURCE = new Map([
  ...KNOWLEDGE_VIDEO_LINKS.map((sourceUrl, index) => [
    sourceUrl,
    getReferenceAssetFields('video', index),
  ]),
  ...KNOWLEDGE_ARTICLE_LINKS.map((sourceUrl, index) => [
    sourceUrl,
    getReferenceAssetFields('article', index),
  ]),
])

function withReferenceAsset(content, contentType = content.content_type, index = -1) {
  const referenceAsset = KNOWLEDGE_REFERENCE_ASSETS_BY_SOURCE.get(content.source_url)
    || getReferenceAssetFields(contentType, index)

  if (!referenceAsset) return content

  const nextContent = {
    ...content,
    asset_source: content.asset_source || referenceAsset.asset_source,
  }

  if (contentType === 'video') {
    nextContent.thumbnail_url = content.thumbnail_url || referenceAsset.thumbnail_url
  }

  if (contentType === 'article') {
    nextContent.cover_image = content.cover_image || referenceAsset.cover_image
  }

  return nextContent
}

const VIDEO_TITLES = [
  '情绪基础：先认识自己的感受',
  '压力与身体：紧绷时发生了什么',
  '焦虑时刻：把注意力带回来',
  '关系支持：如何向外求助',
  '低落日常：一点点恢复能量',
  '自我接纳：和内在批评保持距离',
  '呼吸练习：压力下的稳定入口',
  '反思练习：把混乱写清楚',
  '建立信心：从一个小行动开始',
  '包容练习：和差异相处',
  '自我照顾：给自己一点空间',
  '感恩练习：训练大脑看见资源',
]

const ARTICLE_TITLES = [
  '身体扎根练习：在混乱中找回稳定',
  '从失败中学习：如何走过挫折',
  '建立有意义的连接',
  '重新找回专注力',
  '穿越挑战时刻的六个提醒',
  '更真实地做自己',
  '压力下的呼吸稳定技巧',
  '如何做有效的自我反思',
  '建立自信的实用方法',
  '提升对他人的接纳度',
  '练习自我接纳',
  '感恩如何改变大脑与生活',
]

function buildFallbackContent(links, titles, contentType) {
  return links.map((sourceUrl, index) => ({
    id: `${contentType}-${index + 1}`,
    title: titles[index],
    content_type: contentType,
    category: contentType === 'video' ? '心理科普' : '延伸阅读',
    content: contentType === 'video'
      ? '一段适合碎片时间观看的心理科普内容，帮助你更轻地理解当下状态。'
      : '一篇适合慢慢读的延伸文章，把感受、行动和恢复方法连接起来。',
    source_url: sourceUrl,
    view_count: 1200 + index * 137,
    created_at: new Date(Date.UTC(2026, 0, index + 1)).toISOString(),
    tags: JSON.stringify([contentType === 'video' ? '视频' : '文章', '心理成长']),
    ...getReferenceAssetFields(contentType, index),
  }))
}

export const FALLBACK_KNOWLEDGE_CONTENTS = [
  ...buildFallbackContent(KNOWLEDGE_VIDEO_LINKS, VIDEO_TITLES, 'video'),
  ...buildFallbackContent(KNOWLEDGE_ARTICLE_LINKS, ARTICLE_TITLES, 'article'),
]

export function getPreparedMaterialSummary() {
  const videoCount = KNOWLEDGE_VIDEO_LINKS.length
  const articleCount = KNOWLEDGE_ARTICLE_LINKS.length

  return {
    videoCount,
    articleCount,
    totalCount: videoCount + articleCount,
    label: `${videoCount} 个视频 · ${articleCount} 篇文章`,
  }
}

export function splitKnowledgeContents(contents = []) {
  return {
    videoContent: contents.filter((item) => item.content_type === 'video'),
    articles: contents.filter((item) => item.content_type === 'article'),
  }
}

function mergeWithFallbackContents(contents = []) {
  if (contents.length === 0) return FALLBACK_KNOWLEDGE_CONTENTS

  const seenSourceUrls = new Set(
    contents
      .map((item) => item.source_url)
      .filter(Boolean)
  )
  const missingFallbacks = FALLBACK_KNOWLEDGE_CONTENTS.filter((item) => (
    !seenSourceUrls.has(item.source_url)
  ))

  return [...contents, ...missingFallbacks]
}

function mapTopic(topic) {
  const statusClassMap = {
    published: 'status-active',
    draft: 'status-pending',
  }

  return {
    ...topic,
    desc: topic.description || '',
    statusClass: statusClassMap[topic.status] || 'status-planned',
  }
}

export function mapKnowledgePageData({ quote = null, contents = [], topics = [] }) {
  const effectiveContents = mergeWithFallbackContents(contents)
  const splitContents = splitKnowledgeContents(effectiveContents)
  const videoContent = splitContents.videoContent.map((item, index) => withReferenceAsset(item, 'video', index))
  const articles = splitContents.articles.map((item, index) => withReferenceAsset(item, 'article', index))

  return {
    dailyQuote: {
      text: quote?.text || '',
      author: quote?.author || '',
    },
    videoContent,
    articles,
    topics: topics.map(mapTopic),
  }
}
