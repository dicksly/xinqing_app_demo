const MILD_TERMS = ['崩溃', '撑不住', '伤害自己', '活着好累', '不想面对']
const SEVERE_TERMS = ['不想活', '自杀', '死了算了', '结束生命', '轻生']

function normalizeComment(comment = {}) {
  return {
    id: String(comment.id ?? `${comment.createdAt ?? Date.now()}`),
    content: String(comment.content ?? '').trim(),
    createdAt: comment.createdAt ?? new Date().toISOString(),
    replies: Array.isArray(comment.replies)
      ? comment.replies.map((reply) => ({
          id: String(reply.id ?? `${reply.createdAt ?? Date.now()}`),
          content: String(reply.content ?? '').trim(),
          createdAt: reply.createdAt ?? new Date().toISOString(),
        })).filter((reply) => reply.content.length > 0)
      : [],
  }
}

export function createDefaultTreeholeInteraction() {
  return {
    liked: false,
    likeCount: 0,
    comments: [],
  }
}

export function normalizeTreeholeInteractions(map = {}) {
  return Object.entries(map ?? {}).reduce((normalized, [entryId, interaction]) => {
    const comments = Array.isArray(interaction?.comments)
      ? interaction.comments.map(normalizeComment).filter((comment) => comment.content.length > 0)
      : []

    normalized[String(entryId)] = {
      liked: Boolean(interaction?.liked),
      likeCount: Math.max(0, Number(interaction?.likeCount) || 0),
      comments,
    }

    return normalized
  }, {})
}

export function getTreeholeInteraction(map = {}, entryId) {
  const normalized = normalizeTreeholeInteractions(map)
  return normalized[String(entryId)] ?? createDefaultTreeholeInteraction()
}

export function normalizeRemoteTreeholeInteraction(payload = {}) {
  return {
    liked: Boolean(payload.liked),
    likeCount: Math.max(0, Number(payload.like_count ?? payload.likeCount) || 0),
    comments: Array.isArray(payload.comments)
      ? payload.comments.map((comment) => normalizeComment({
          id: comment.id,
          content: comment.content,
          createdAt: comment.created_at || comment.createdAt,
          replies: comment.replies,
        })).filter((comment) => comment.content.length > 0)
      : [],
  }
}

export function toggleTreeholeLike(map = {}, entryId) {
  const id = String(entryId)
  const normalized = normalizeTreeholeInteractions(map)
  const current = normalized[id] ?? createDefaultTreeholeInteraction()
  const liked = !current.liked

  return {
    ...normalized,
    [id]: {
      ...current,
      liked,
      likeCount: Math.max(0, current.likeCount + (liked ? 1 : -1)),
    },
  }
}

export function addTreeholeComment(map = {}, entryId, content, now = new Date().toISOString()) {
  const trimmed = String(content ?? '').trim()
  if (!trimmed) return normalizeTreeholeInteractions(map)

  const id = String(entryId)
  const normalized = normalizeTreeholeInteractions(map)
  const current = normalized[id] ?? createDefaultTreeholeInteraction()
  const comment = {
    id: `${id}-comment-${new Date(now).getTime()}-${current.comments.length + 1}`,
    content: trimmed,
    createdAt: now,
    replies: [],
  }

  return {
    ...normalized,
    [id]: {
      ...current,
      comments: [...current.comments, comment],
    },
  }
}

export function addTreeholeReply(map = {}, entryId, commentId, content, now = new Date().toISOString()) {
  const trimmed = String(content ?? '').trim()
  if (!trimmed) return normalizeTreeholeInteractions(map)

  const id = String(entryId)
  const normalized = normalizeTreeholeInteractions(map)
  const current = normalized[id] ?? createDefaultTreeholeInteraction()

  return {
    ...normalized,
    [id]: {
      ...current,
      comments: current.comments.map((comment) => {
        if (String(comment.id) !== String(commentId)) {
          return comment
        }

        return {
          ...comment,
          replies: [
            ...comment.replies,
            {
              id: `${comment.id}-reply-${new Date(now).getTime()}-${comment.replies.length + 1}`,
              content: trimmed,
              createdAt: now,
            },
          ],
        }
      }),
    },
  }
}

export function detectTreeholeSensitivity(content = '') {
  const text = String(content)
  const severeMatches = SEVERE_TERMS.filter((term) => text.includes(term))
  if (severeMatches.length > 0) {
    return {
      level: 'severe',
      matchedTerms: severeMatches,
    }
  }

  const mildMatches = MILD_TERMS.filter((term) => text.includes(term))
  if (mildMatches.length > 0) {
    return {
      level: 'mild',
      matchedTerms: mildMatches,
    }
  }

  return {
    level: 'safe',
    matchedTerms: [],
  }
}
