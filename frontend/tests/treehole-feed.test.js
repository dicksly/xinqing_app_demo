import test from 'node:test'
import assert from 'node:assert/strict'

import {
  deleteLocalEntry,
  getPageItems,
  hasLocalEntry,
  mergePublishedEntries,
  upsertSavedEntry,
} from '../src/utils/treehole-feed.js'
import {
  addTreeholeComment,
  addTreeholeReply,
  detectTreeholeSensitivity,
  getTreeholeInteraction,
  toggleTreeholeLike,
} from '../src/utils/treehole-interactions.js'

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

test('detects local entries by string or numeric id before backend delete fallback', () => {
  const items = [
    { id: 1, content: 'first' },
    { id: 'temp-entry', content: 'second' },
  ]

  assert.equal(hasLocalEntry(items, '1'), true)
  assert.equal(hasLocalEntry(items, 'temp-entry'), true)
  assert.equal(hasLocalEntry(items, 'missing'), false)
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

test('toggles one public like per local user without dropping comment state', () => {
  const initial = {
    post_1: {
      liked: false,
      likeCount: 2,
      comments: [{ id: 'c1', content: '抱抱你', replies: [] }],
    },
  }

  const liked = toggleTreeholeLike(initial, 'post_1')
  const unliked = toggleTreeholeLike(liked, 'post_1')

  assert.equal(getTreeholeInteraction(liked, 'post_1').liked, true)
  assert.equal(getTreeholeInteraction(liked, 'post_1').likeCount, 3)
  assert.equal(getTreeholeInteraction(unliked, 'post_1').liked, false)
  assert.equal(getTreeholeInteraction(unliked, 'post_1').likeCount, 2)
  assert.equal(getTreeholeInteraction(unliked, 'post_1').comments.length, 1)
})

test('adds comments and replies with trimmed content', () => {
  const withComment = addTreeholeComment({}, 'post_2', '  我也经历过类似的时刻  ', '2026-06-15T08:00:00.000Z')
  const commentId = getTreeholeInteraction(withComment, 'post_2').comments[0].id
  const withReply = addTreeholeReply(withComment, 'post_2', commentId, '  谢谢你愿意说出来  ', '2026-06-15T08:01:00.000Z')

  const interaction = getTreeholeInteraction(withReply, 'post_2')

  assert.equal(interaction.comments[0].content, '我也经历过类似的时刻')
  assert.equal(interaction.comments[0].replies[0].content, '谢谢你愿意说出来')
})

test('flags self-harm language before public publishing', () => {
  const severe = detectTreeholeSensitivity('我真的不想活了')
  const mild = detectTreeholeSensitivity('最近有点崩溃，撑不住')
  const safe = detectTreeholeSensitivity('今天想慢慢写一点心事')

  assert.equal(severe.level, 'severe')
  assert.ok(severe.matchedTerms.includes('不想活'))
  assert.equal(mild.level, 'mild')
  assert.equal(safe.level, 'safe')
})
