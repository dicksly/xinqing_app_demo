function normalizeEntry(entry) {
  return {
    ...entry,
    id: entry.id,
    content_type: entry.content_type ?? entry.contentType ?? 'text',
    content: entry.content ?? '',
    image_data: entry.image_data ?? entry.imageData ?? null,
    duration: entry.duration ?? 0,
    is_published: entry.is_published ?? entry.isPublished ?? false,
    is_anonymous: entry.is_anonymous ?? entry.isAnonymous ?? true,
    has_voice_change: entry.has_voice_change ?? entry.hasVoiceChange ?? false,
    created_at: entry.created_at ?? new Date().toISOString(),
  }
}

function buildEntryKey(entry) {
  if (entry.id !== undefined && entry.id !== null) {
    return `id:${entry.id}`
  }

  return [
    entry.content_type,
    entry.created_at,
    entry.content ?? '',
  ].join('|')
}

export function mergePublishedEntries(backendEntries = [], localEntries = []) {
  const merged = new Map()

  for (const entry of localEntries) {
    const normalized = normalizeEntry(entry)
    if (!normalized.is_published) {
      continue
    }

    merged.set(buildEntryKey(normalized), normalized)
  }

  for (const entry of backendEntries) {
    const normalized = normalizeEntry(entry)
    if (!normalized.is_published) {
      continue
    }

    merged.set(buildEntryKey(normalized), normalized)
  }

  return [...merged.values()].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export function sortEntriesByNewest(entries = []) {
  return [...entries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export function getPageItems(items = [], currentPage = 1, pageSize = 5) {
  const start = (currentPage - 1) * pageSize
  return items.slice(start, start + pageSize)
}

export function deleteLocalEntry(entries = [], entryId) {
  return entries.filter((entry) => entry.id !== entryId)
}

export function upsertSavedEntry(entries = [], entry, temporaryId = null) {
  const normalized = normalizeEntry(entry)
  const nextEntries = entries.filter((savedEntry) => {
    if (temporaryId !== null && savedEntry.id === temporaryId) {
      return false
    }

    return buildEntryKey(normalizeEntry(savedEntry)) !== buildEntryKey(normalized)
  })

  return [normalized, ...nextEntries]
}
