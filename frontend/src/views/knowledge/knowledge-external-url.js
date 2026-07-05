export function getKnowledgeEmbedUrl(sourceUrl = '') {
  const normalizedUrl = normalizeExternalUrl(sourceUrl)
  if (!normalizedUrl) return ''

  const youtubeEmbedUrl = getYoutubeEmbedUrl(normalizedUrl)
  return youtubeEmbedUrl || normalizedUrl
}

export function normalizeExternalUrl(sourceUrl = '') {
  if (!sourceUrl) return ''

  try {
    const parsedUrl = new URL(sourceUrl)
    return ['http:', 'https:'].includes(parsedUrl.protocol) ? parsedUrl.toString() : ''
  } catch {
    return ''
  }
}

function getYoutubeEmbedUrl(sourceUrl) {
  try {
    const url = new URL(sourceUrl)
    let videoId = ''

    if (url.hostname.includes('youtu.be')) {
      videoId = url.pathname.split('/').filter(Boolean)[0] || ''
    } else if (url.hostname.includes('youtube.com')) {
      videoId = url.searchParams.get('v') || ''
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : ''
  } catch {
    return ''
  }
}
