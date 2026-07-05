const CLIENT_ID_KEY = 'xinqing_client_id'

export function getXinqingClientId() {
  const saved = localStorage.getItem(CLIENT_ID_KEY)
  if (saved) return saved

  const next = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `client-${Date.now()}-${Math.random().toString(16).slice(2)}`
  localStorage.setItem(CLIENT_ID_KEY, next)
  return next
}
