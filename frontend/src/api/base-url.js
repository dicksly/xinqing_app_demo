const API_PREFIX = '/api/v1'

export function resolveApiBaseUrl(rawBaseUrl) {
  const baseUrl = (rawBaseUrl || '').trim()

  if (!baseUrl) {
    return API_PREFIX
  }

  if (baseUrl.startsWith('/')) {
    return baseUrl.endsWith(API_PREFIX) || baseUrl === API_PREFIX
      ? baseUrl
      : `${baseUrl.replace(/\/$/, '')}${API_PREFIX}`
  }

  const normalized = baseUrl.replace(/\/$/, '')
  return normalized.endsWith(API_PREFIX) ? normalized : `${normalized}${API_PREFIX}`
}

