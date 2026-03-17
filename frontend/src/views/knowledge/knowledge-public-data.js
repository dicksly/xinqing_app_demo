export function splitKnowledgeContents(contents = []) {
  return {
    videoContent: contents.filter((item) => item.content_type === 'video'),
    articles: contents.filter((item) => item.content_type === 'article'),
  }
}

function mapTopic(topic) {
  const statusClassMap = {
    published: 'status-active',
    draft: 'status-pending',
  }

  return {
    ...topic,
    desc: topic.description || '',
    statusClass: statusClassMap[topic.status] || 'status-planned',
  }
}

export function mapKnowledgePageData({ quote = null, contents = [], topics = [] }) {
  const { videoContent, articles } = splitKnowledgeContents(contents)

  return {
    dailyQuote: {
      text: quote?.text || '',
      author: quote?.author || '',
    },
    videoContent,
    articles,
    topics: topics.map(mapTopic),
  }
}
