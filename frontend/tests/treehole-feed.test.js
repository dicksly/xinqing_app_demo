import test from 'node:test'
import assert from 'node:assert/strict'

import {
  deleteLocalEntry,
  getPageItems,
  mergePublishedEntries,
  upsertSavedEntry,
} from '../src/utils/treehole-feed.js'

test('merges backend and local published entries while preserving media fields', () => {
  const backendEntries = [
    {
      id: 1,
      content_type: 'voice',
      content: null,
      duration: 12,
      image_data: null,
      is_published: true,
      created_at: '2026-03-14T10:00:00.000Z',
    },
  ]

  const localEntries = [
    {
      id: 2,
      contentType: 'image',
      content: '[图片：cat.png]',
      image_data: 'data:image/png;base64,abc',
      isPublished: true,
      created_at: '2026-03-14T11:00:00.000Z',
    },
    {
      id: 3,
      contentType: 'text',
      content: 'not public',
      isPublished: false,
      created_at: '2026-03-14T12:00:00.000Z',
    },
  ]

  const merged = mergePublishedEntries(backendEntries, localEntries)

  assert.equal(merged.length, 2)
  assert.equal(merged[0].content_type, 'image')
  assert.equal(merged[0].image_data, 'data:image/png;base64,abc')
  assert.equal(merged[1].content_type, 'voice')
  assert.equal(merged[1].duration, 12)
})

test('prefers backend entry when local and backend represent the same published item', () => {
  const backendEntries = [
    {
      id: 10,
      content_type: 'text',
      content: 'same item',
      ai_response: 'backend reply',
      created_at: '2026-03-14T10:00:00.000Z',
      is_published: true,
    },
  ]

  const localEntries = [
    {
      id: 10,
      contentType: 'text',
      content: 'same item',
      ai_response: 'local reply',
      isPublished: true,
      created_at: '2026-03-14T10:00:00.000Z',
    },
  ]

  const merged = mergePublishedEntries(backendEntries, localEntries)

  assert.equal(merged.length, 1)
  assert.equal(merged[0].ai_response, 'backend reply')
})

test('returns the correct slice for paginated lists', () => {
  const items = Array.from({ length: 12 }, (_, index) => ({ id: index + 1 }))

  assert.deepEqual(
    getPageItems(items, 2, 5).map((item) => item.id),
    [6, 7, 8, 9, 10]
  )
})

test('deletes a local entry by id', () => {
  const items = [
    { id: 1, content: 'first' },
    { id: 2, content: 'second' },
  ]

  const nextItems = deleteLocalEntry(items, 1)

  assert.deepEqual(nextItems, [{ id: 2, content: 'second' }])
})

test('keeps combined text voice and image fields on normalized published entries', () => {
  const merged = mergePublishedEntries([], [
    {
      id: 100,
      content: '文字内容',
      imageData: 'data:image/png;base64,xyz',
      duration: 9,
      isPublished: true,
      created_at: '2026-03-14T10:00:00.000Z',
    },
  ])

  assert.equal(merged.length, 1)
  assert.equal(merged[0].content, '文字内容')
  assert.equal(merged[0].image_data, 'data:image/png;base64,xyz')
  assert.equal(merged[0].duration, 9)
})

test('upserts backend-created entry over temporary local entry to avoid duplicates', () => {
  const savedEntries = [
    {
      id: 123,
      content: 'same item',
      isPublished: true,
      created_at: '2026-03-14T10:00:00.000Z',
    },
  ]

  const nextEntries = upsertSavedEntry(savedEntries, {
    id: 10,
    content: 'same item',
    is_published: true,
    created_at: '2026-03-14T10:00:00.000Z',
  }, 123)

  assert.equal(nextEntries.length, 1)
  assert.equal(nextEntries[0].id, 10)
  assert.equal(nextEntries[0].is_published, true)
})
