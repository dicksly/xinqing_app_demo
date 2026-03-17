import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  mapKnowledgePageData,
  splitKnowledgeContents,
} from '../src/views/knowledge/knowledge-public-data.js'


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
  assert.equal(mapped.videoContent.length, 1)
  assert.equal(mapped.articles.length, 1)
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

test('fallback hardcoded production content is removed', () => {
  const source = readFileSync(
    new URL('../src/views/knowledge/KnowledgeView.vue', import.meta.url),
    'utf8'
  )

  assert.match(source, /knowledgeApi\.getDailyQuote/)
  assert.match(source, /knowledgeApi\.getTopics/)
  assert.doesNotMatch(source, /videoContent\.value = \[\s*\{/)
  assert.doesNotMatch(source, /const topics = computed\(\[/)
})
