import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  buildKnowledgeContentPayload,
  filterKnowledgeContentsByType,
} from '../src/components/admin/knowledge-content-manager.js'


test('content list supports type filter', () => {
  const filtered = filterKnowledgeContentsByType(
    [
      { id: 1, content_type: 'video', title: '视频 A' },
      { id: 2, content_type: 'article', title: '文章 B' },
    ],
    'video'
  )

  assert.equal(filtered.length, 1)
  assert.equal(filtered[0].title, '视频 A')

  const adminViewSource = readFileSync(
    new URL('../src/views/admin/AdminContentView.vue', import.meta.url),
    'utf8'
  )
  assert.match(adminViewSource, /KnowledgeContentManager/)
})

test('content form submits video and article payload correctly', () => {
  assert.deepEqual(
    buildKnowledgeContentPayload({
      title: '把身体带回此刻',
      summary: '适合午休后快速恢复专注。',
      content: '文章正文',
      contentType: 'article',
      category: 'mindfulness',
      coverUrl: 'https://example.com/cover.jpg',
      externalUrl: '',
      status: 'published',
      sortOrder: '3',
      locale: 'zh-CN',
      publishedAt: '2026-03-17T08:00:00',
    }),
    {
      title: '把身体带回此刻',
      summary: '适合午休后快速恢复专注。',
      content: '文章正文',
      content_type: 'article',
      category: 'mindfulness',
      cover_url: 'https://example.com/cover.jpg',
      external_url: '',
      status: 'published',
      sort_order: 3,
      locale: 'zh-CN',
      published_at: '2026-03-17T08:00:00',
    }
  )
})
