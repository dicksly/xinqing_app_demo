import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  buildDailyQuotePayload,
  normalizeDailyQuoteList,
} from '../src/components/admin/daily-quote-manager.js'


test('quote list renders from API data', () => {
  const rows = normalizeDailyQuoteList([
    {
      id: 1,
      text: '今天也可以慢慢来。',
      author: '心晴',
      status: 'published',
    },
  ])

  assert.equal(rows.length, 1)
  assert.equal(rows[0].text, '今天也可以慢慢来。')
  assert.equal(rows[0].author, '心晴')

  const adminViewSource = readFileSync(
    new URL('../src/views/admin/AdminContentView.vue', import.meta.url),
    'utf8'
  )
  assert.match(adminViewSource, /DailyQuoteManager/)
})

test('create and edit modal submit expected payload', () => {
  assert.deepEqual(
    buildDailyQuotePayload({
      text: '抬头的时候，也别忘了呼吸。',
      author: '心晴',
      status: 'published',
      sortOrder: '2',
      locale: 'zh-CN',
      effectiveDate: '2026-03-16',
    }),
    {
      text: '抬头的时候，也别忘了呼吸。',
      author: '心晴',
      status: 'published',
      sort_order: 2,
      locale: 'zh-CN',
      effective_date: '2026-03-16',
    }
  )
})
