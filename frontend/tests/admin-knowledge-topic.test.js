import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  buildKnowledgeTopicPayload,
  normalizeKnowledgeTopicList,
} from '../src/components/admin/knowledge-topic-manager.js'


test('topic list renders and saves status and sort changes', () => {
  const rows = normalizeKnowledgeTopicList([
    {
      id: 1,
      title: '考试季抗压指南',
      status: 'published',
      sort_order: 2,
    },
  ])

  assert.equal(rows.length, 1)
  assert.equal(rows[0].title, '考试季抗压指南')

  assert.deepEqual(
    buildKnowledgeTopicPayload({
      title: '考试季稳心指南',
      description: '帮助考生稳住节奏',
      status: 'published',
      contentCount: '8',
      locale: 'zh-CN',
      sortOrder: '1',
    }),
    {
      title: '考试季稳心指南',
      description: '帮助考生稳住节奏',
      status: 'published',
      content_count: 8,
      locale: 'zh-CN',
      sort_order: 1,
    }
  )

  const adminViewSource = readFileSync(
    new URL('../src/views/admin/AdminContentView.vue', import.meta.url),
    'utf8'
  )
  assert.match(adminViewSource, /KnowledgeTopicManager/)
})
