import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildDialogKnowledgeSpeechText,
  buildLocalKnowledgeSpeechText,
  createKnowledgeTtsPayload,
  sanitizeSpeechText,
} from '../src/views/knowledge/knowledge-tts.js'

test('sanitizeSpeechText removes html and collapses whitespace for TTS', () => {
  assert.equal(
    sanitizeSpeechText('  <h2>标题</h2><p>第一段&nbsp;内容。</p>\n\n第二段  '),
    '标题 第一段 内容。 第二段'
  )
})

test('buildLocalKnowledgeSpeechText includes all local article sections', () => {
  const text = buildLocalKnowledgeSpeechText({
    title: '身体扎根练习',
    subtitle: '先让身体知道此刻安全。',
    summary: '扎根练习帮助注意力回到身体。',
    sections: [
      { heading: '为什么身体可以帮助情绪稳定', body: '身体信号会慢慢带回稳定。' },
    ],
    practices: ['把双脚平放在地上。'],
    reflectionPrompts: ['我现在身体最紧的地方在哪里？'],
  })

  assert.match(text, /身体扎根练习/)
  assert.match(text, /为什么身体可以帮助情绪稳定/)
  assert.match(text, /把双脚平放在地上/)
  assert.match(text, /我现在身体最紧的地方在哪里/)
})

test('buildDialogKnowledgeSpeechText uses title and html content', () => {
  const text = buildDialogKnowledgeSpeechText({
    title: '建立有意义的连接',
    summary: '真正的连接是彼此被看见。',
    content: '<p>连接不是认识很多人。</p>',
  })

  assert.equal(text, '建立有意义的连接。真正的连接是彼此被看见。连接不是认识很多人。')
})

test('createKnowledgeTtsPayload clips long article text before calling backend', () => {
  const payload = createKnowledgeTtsPayload({
    title: '很长的文章',
    text: '一'.repeat(3000),
    locale: 'zh-CN',
  })

  assert.equal(payload.title, '很长的文章')
  assert.equal(payload.locale, 'zh-CN')
  assert.equal(payload.text.length, 2200)
})
