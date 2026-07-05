import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

import {
  KNOWLEDGE_ARTICLE_LINKS,
  KNOWLEDGE_VIDEO_LINKS,
  SBTI_TEST,
  getPreparedMaterialSummary,
  mapKnowledgePageData,
  splitKnowledgeContents,
} from '../src/views/knowledge/knowledge-public-data.js'
import { getKnowledgeEmbedUrl } from '../src/views/knowledge/knowledge-external-url.js'


test('quote content and topics come from api responses', () => {
  const mapped = mapKnowledgePageData({
    quote: { text: '今天也可以慢慢来。', author: '心晴' },
    contents: [
      { id: 1, title: '视频 A', content_type: 'video' },
      { id: 2, title: '文章 B', content_type: 'article' },
    ],
    topics: [{ id: 1, title: '专题 A', status: 'published' }],
  })

  assert.equal(mapped.dailyQuote.text, '今天也可以慢慢来。')
  assert.ok(mapped.videoContent.some((item) => item.title === '视频 A'))
  assert.ok(mapped.articles.some((item) => item.title === '文章 B'))
  assert.ok(mapped.videoContent.length >= 12)
  assert.ok(mapped.articles.length >= 12)
  assert.equal(mapped.topics.length, 1)

  assert.deepEqual(
    splitKnowledgeContents([
      { id: 1, content_type: 'video' },
      { id: 2, content_type: 'article' },
    ]),
    {
      videoContent: [{ id: 1, content_type: 'video' }],
      articles: [{ id: 2, content_type: 'article' }],
    }
  )
})

test('api knowledge content is merged with missing document supplied materials', () => {
  const mapped = mapKnowledgePageData({
    contents: [
      { id: 'custom-video', title: '自定义视频', content_type: 'video', source_url: 'https://example.com/custom-video' },
      { id: 'custom-article', title: '自定义文章', content_type: 'article', source_url: 'https://example.com/custom-article' },
    ],
  })

  assert.ok(mapped.videoContent.some((item) => item.title === '自定义视频'))
  assert.ok(mapped.articles.some((item) => item.title === '自定义文章'))
  assert.ok(mapped.videoContent.some((item) => item.source_url === KNOWLEDGE_VIDEO_LINKS[0]))
  assert.ok(mapped.articles.some((item) => item.source_url === KNOWLEDGE_ARTICLE_LINKS[0]))
  assert.equal(mapped.videoContent.length, 13)
  assert.equal(mapped.articles.length, 13)
})

test('legacy empty anxiety video is hidden from knowledge video materials', () => {
  const mapped = mapKnowledgePageData({
    contents: [
      {
        id: 'legacy-empty-video',
        title: '什么是焦虑症',
        content_type: 'video',
        source_url: '',
        external_url: '',
      },
      {
        id: 'valid-api-video',
        title: '后端可播放视频',
        content_type: 'video',
        source_url: 'https://example.com/video',
      },
    ],
  })

  assert.equal(
    mapped.videoContent.some((item) => item.title === '什么是焦虑症'),
    false
  )
  assert.equal(
    mapped.videoContent.some((item) => item.title === '后端可播放视频'),
    true
  )
})

test('api knowledge content without media receives reference visuals by type order', () => {
  const mapped = mapKnowledgePageData({
    contents: [
      { id: 1, title: '视频 A', content_type: 'video' },
      { id: 2, title: '视频 B', content_type: 'video' },
      { id: 3, title: '文章 A', content_type: 'article' },
    ],
  })

  assert.equal(mapped.videoContent[0].thumbnail_url, '/reference-assets/knowledge/videos/01.jpg')
  assert.equal(mapped.videoContent[1].thumbnail_url, '/reference-assets/knowledge/videos/02.jpg')
  assert.equal(mapped.articles[0].cover_image, '/reference-assets/knowledge/articles/01.jpg')
})

test('fallback hardcoded production content is removed', () => {
  const source = readFileSync(
    new URL('../src/views/knowledge/KnowledgeView.vue', import.meta.url),
    'utf8'
  )

  assert.match(source, /knowledgeApi\.getDailyQuote/)
  assert.doesNotMatch(source, /knowledgeApi\.getTopics/)
  assert.doesNotMatch(source, /videoContent\.value = \[\s*\{/)
  assert.doesNotMatch(source, /const topics = computed\(\[/)
})

test('knowledge page falls back to document materials when api loading fails', () => {
  const source = readFileSync(
    new URL('../src/views/knowledge/KnowledgeView.vue', import.meta.url),
    'utf8'
  )

  assert.match(source, /const fallback = mapKnowledgePageData\(\{\s*contents:\s*\[\],\s*\}\)/)
  assert.match(source, /videoContent\.value = fallback\.videoContent/)
  assert.match(source, /articles\.value = fallback\.articles/)
})

test('knowledge page does not render empty topic tabs', () => {
  const source = readFileSync(
    new URL('../src/views/knowledge/KnowledgeView.vue', import.meta.url),
    'utf8'
  )

  assert.match(source, /--segment-count:\s*3/)
  assert.doesNotMatch(source, /name:\s*'topic'/)
  assert.doesNotMatch(source, /knowledge\.topic/)
  assert.doesNotMatch(source, /<el-tab-pane[^>]+name="topic"/)
  assert.doesNotMatch(source, /专题策划/)
})

test('document supplied knowledge materials are used when api content is empty', () => {
  const mapped = mapKnowledgePageData({
    contents: [],
  })

  assert.equal(KNOWLEDGE_VIDEO_LINKS.length, 12)
  assert.equal(KNOWLEDGE_ARTICLE_LINKS.length, 12)
  assert.equal(mapped.videoContent.length, 12)
  assert.equal(mapped.articles.length, 12)
  assert.equal(mapped.videoContent[0].source_url, 'https://www.youtube.com/watch?v=30VMIEmA114')
  assert.equal(mapped.articles[11].source_url, 'https://www.6seconds.org/2025/07/01/the-power-of-gratitude-change-your-brain-and-life/')
})

test('prepared material summary reports the complete document supplied library', () => {
  const summary = getPreparedMaterialSummary()

  assert.equal(summary.videoCount, 12)
  assert.equal(summary.articleCount, 12)
  assert.equal(summary.totalCount, 24)
  assert.match(summary.label, /12.*12/)
})

test('document supplied knowledge materials include downloaded visual assets', () => {
  const mapped = mapKnowledgePageData({
    contents: [],
  })

  mapped.videoContent.forEach((item, index) => {
    const paddedIndex = String(index + 1).padStart(2, '0')
    assert.equal(item.thumbnail_url, `/reference-assets/knowledge/videos/${paddedIndex}.jpg`)
    assert.equal(item.asset_source, 'docs/references.md')
    assert.ok(
      existsSync(new URL(`../public/reference-assets/knowledge/videos/${paddedIndex}.jpg`, import.meta.url)),
      `missing downloaded video thumbnail ${paddedIndex}`
    )
  })

  mapped.articles.forEach((item, index) => {
    const paddedIndex = String(index + 1).padStart(2, '0')
    assert.equal(item.cover_image, `/reference-assets/knowledge/articles/${paddedIndex}.jpg`)
    assert.equal(item.asset_source, 'docs/references.md')
    assert.ok(
      existsSync(new URL(`../public/reference-assets/knowledge/articles/${paddedIndex}.jpg`, import.meta.url)),
      `missing downloaded article cover ${paddedIndex}`
    )
  })
})

test('SBTI replaces the simplified MBTI feature entry', () => {
  const source = readFileSync(
    new URL('../src/views/knowledge/KnowledgeView.vue', import.meta.url),
    'utf8'
  )

  assert.equal(SBTI_TEST.title, 'SBTI 心理能量测试')
  assert.equal(SBTI_TEST.externalUrl, 'https://www.fengyunzhice.com/sbti?ver=8bdpc-6234&bd_vid=12439061078742734187')
  assert.match(source, /SBTI_TEST/)
  assert.match(source, /sourceUrl:\s*test\.externalUrl/)
  assert.match(source, /name:\s*'KnowledgeExternal'/)
  assert.doesNotMatch(source, /MBTI 简化版/)
})

test('knowledge embedded reader converts youtube links to iframe-safe urls', () => {
  assert.equal(
    getKnowledgeEmbedUrl('https://www.youtube.com/watch?v=30VMIEmA114'),
    'https://www.youtube.com/embed/30VMIEmA114'
  )
  assert.equal(
    getKnowledgeEmbedUrl('https://youtu.be/IOrmS8vJDQw?si=dXyw-OMPpSZxqatP'),
    'https://www.youtube.com/embed/IOrmS8vJDQw'
  )
  assert.equal(
    getKnowledgeEmbedUrl(SBTI_TEST.externalUrl),
    SBTI_TEST.externalUrl
  )
})
