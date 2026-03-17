export function filterKnowledgeContentsByType(contents = [], type = 'all') {
  if (!type || type === 'all') {
    return contents
  }

  return contents.filter((item) => item.content_type === type)
}

export function buildKnowledgeContentPayload(form) {
  return {
    title: form.title.trim(),
    summary: form.summary?.trim() || '',
    content: form.content?.trim() || '',
    content_type: form.contentType,
    category: form.category?.trim() || '',
    cover_url: form.coverUrl?.trim() || '',
    external_url: form.externalUrl?.trim() || '',
    status: form.status,
    sort_order: Number(form.sortOrder || 0),
    locale: form.locale || 'zh-CN',
    published_at: form.publishedAt || null,
  }
}

export function createKnowledgeContentForm(content = null) {
  return {
    title: content?.title || '',
    summary: content?.summary || '',
    content: content?.content || '',
    contentType: content?.content_type || 'video',
    category: content?.category || '',
    coverUrl: content?.cover_url || '',
    externalUrl: content?.external_url || '',
    status: content?.status || 'draft',
    sortOrder: content?.sort_order ?? 0,
    locale: content?.locale || 'zh-CN',
    publishedAt: content?.published_at || '',
  }
}
