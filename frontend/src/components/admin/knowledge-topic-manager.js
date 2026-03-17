export function normalizeKnowledgeTopicList(topics = []) {
  return topics.map((topic) => ({
    ...topic,
    description: topic.description || '',
  }))
}

export function buildKnowledgeTopicPayload(form) {
  return {
    title: form.title.trim(),
    description: form.description?.trim() || '',
    status: form.status,
    content_count: Number(form.contentCount || 0),
    locale: form.locale || 'zh-CN',
    sort_order: Number(form.sortOrder || 0),
  }
}

export function createKnowledgeTopicForm(topic = null) {
  return {
    title: topic?.title || '',
    description: topic?.description || '',
    status: topic?.status || 'draft',
    contentCount: topic?.content_count ?? 0,
    locale: topic?.locale || 'zh-CN',
    sortOrder: topic?.sort_order ?? 0,
  }
}
