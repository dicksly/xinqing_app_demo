export function normalizeDailyQuoteList(quotes = []) {
  return quotes.map((quote) => ({
    ...quote,
    author: quote.author || '',
  }))
}

export function buildDailyQuotePayload(form) {
  return {
    text: form.text.trim(),
    author: form.author?.trim() || '',
    status: form.status,
    sort_order: Number(form.sortOrder || 0),
    locale: form.locale || 'zh-CN',
    effective_date: form.effectiveDate || null,
  }
}

export function createDailyQuoteForm(quote = null) {
  return {
    text: quote?.text || '',
    author: quote?.author || '',
    status: quote?.status || 'draft',
    sortOrder: quote?.sort_order ?? 0,
    locale: quote?.locale || 'zh-CN',
    effectiveDate: quote?.effective_date || '',
  }
}
