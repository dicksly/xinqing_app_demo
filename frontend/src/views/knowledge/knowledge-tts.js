const DEFAULT_TTS_MAX_LENGTH = 2200

const HTML_ENTITY_MAP = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
}

export function sanitizeSpeechText(value = '') {
  return String(value || '')
    .replace(/&(nbsp|amp|lt|gt|quot);|&#39;/g, (entity) => HTML_ENTITY_MAP[entity] || ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function joinSpeechParts(parts = []) {
  return parts
    .map((part) => sanitizeSpeechText(part))
    .filter(Boolean)
    .join('。')
    .replace(/。+/g, '。')
}

export function buildLocalKnowledgeSpeechText(article = {}) {
  const sections = Array.isArray(article.sections)
    ? article.sections.flatMap((section) => [section.heading, section.body])
    : []
  const practices = Array.isArray(article.practices)
    ? ['小练习', ...article.practices]
    : []
  const prompts = Array.isArray(article.reflectionPrompts)
    ? ['反思问题', ...article.reflectionPrompts]
    : []

  return joinSpeechParts([
    article.title,
    article.subtitle,
    article.summary,
    ...sections,
    ...practices,
    ...prompts,
  ])
}

export function buildDialogKnowledgeSpeechText(content = {}) {
  return joinSpeechParts([
    content.title,
    content.summary,
    content.content,
  ])
}

export function createKnowledgeTtsPayload({
  title = '',
  text = '',
  locale = 'zh-CN',
  maxLength = DEFAULT_TTS_MAX_LENGTH,
} = {}) {
  return {
    title: sanitizeSpeechText(title).slice(0, 120),
    text: sanitizeSpeechText(text).slice(0, maxLength),
    locale,
  }
}
