import {
  ASSESSMENT_CATEGORIES,
  ASSESSMENT_QUESTIONS,
  REVERSE_SCORED_ITEM_NUMBERS,
  mapAssessmentAnswersToBackendScale,
} from './assessment-questions.js'

export const ASSESSMENT_SCALE_VERSION = 'teen-mental-wellness-30-v1'
export const ASSESSMENT_MAX_SCORE = 120

const INTERPRETATIONS = [
  {
    minScore: 97,
    level: 'strong',
    title: '心理健康状态非常良好',
    summary: '表现出较强的情绪韧性、社会支持与日常适应能力。建议继续维持良好的生活方式与人际关系。',
    suggestions: [],
  },
  {
    minScore: 73,
    level: 'healthy',
    title: '心理健康状态良好',
    summary: '整体情绪较稳定，能够较好地应对生活中的挑战。继续保持健康习惯和支持关系很重要。',
    suggestions: [],
  },
  {
    minScore: 49,
    level: 'moderate',
    title: '中等心理健康挑战',
    summary: '可能正面对一定程度的压力或情绪问题，但仍具备部分应对能力。适当支持与健康调节方式可能会有帮助。',
    suggestions: [],
  },
  {
    minScore: 25,
    level: 'very_low',
    title: '心理健康状态较差',
    summary: '可能存在明显的情绪与生活困难，建议寻求辅导员、家长或专业人士的支持。',
    suggestions: [],
  },
  {
    minScore: 0,
    level: 'critical',
    title: '严重心理健康风险',
    summary: '可能正经历严重情绪困扰，需要尽快寻求专业心理帮助或可信赖成年人的支持。',
    suggestions: [],
  },
]

function getInterpretation(score) {
  return INTERPRETATIONS.find((item) => score >= item.minScore) || INTERPRETATIONS.at(-1)
}

function normalizeNumericMap(value = {}) {
  if (!value || typeof value !== 'object') return {}
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, itemValue]) => [key, Number(itemValue)])
      .filter(([, itemValue]) => Number.isFinite(itemValue))
  )
}

function sumCompleteScoredAnswers(scoredAnswers = {}) {
  const values = ASSESSMENT_QUESTIONS.map((question) => scoredAnswers[question.key])
  if (values.some((value) => !Number.isFinite(value))) return null
  return values.reduce((sum, value) => sum + value, 0)
}

function sumCompleteSubscaleScores(subscaleScores = {}) {
  const values = ASSESSMENT_CATEGORIES.map((category) => subscaleScores[category.key])
  if (values.some((value) => !Number.isFinite(value))) return null
  return values.reduce((sum, value) => sum + value, 0)
}

export function validateAssessmentConsent(form = {}) {
  const errors = []
  if (!form.accepted) {
    errors.push('请先同意知情同意书')
  }
  if (!String(form.userSignature || '').trim()) {
    errors.push('请填写本人签名')
  }
  if (form.isMinor && !String(form.guardianSignature || '').trim()) {
    errors.push('未成年人需要填写家长/监护人签名')
  }
  return {
    valid: errors.length === 0,
    errors,
  }
}

export function validateAssessmentAnswers(answers = {}) {
  const errors = []

  ASSESSMENT_QUESTIONS.forEach((question) => {
    const value = answers[question.key]
    const numeric = Number(value)
    if (!Number.isFinite(numeric) || numeric < 0 || numeric > 4) {
      errors.push(`请完成第 ${question.number} 题`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function buildAssessmentPayload(consent = {}, answers = {}, clientId = 'anonymous') {
  return {
    clientId: String(clientId || 'anonymous'),
    consentAccepted: Boolean(consent.accepted),
    userSignature: String(consent.userSignature || '').trim(),
    isMinor: Boolean(consent.isMinor),
    guardianSignature: String(consent.guardianSignature || '').trim(),
    answers: mapAssessmentAnswersToBackendScale(answers),
  }
}

export function normalizeAssessmentResult(response = {}) {
  const payload = response?.data && typeof response.data === 'object' ? response.data : response
  const rawScore = Number(payload.score ?? 0)
  const subscaleScores = normalizeNumericMap(payload.subscale_scores || payload.subscaleScores || {})
  const rawAnswers = normalizeNumericMap(payload.raw_answers || payload.rawAnswers || {})
  const scoredAnswers = normalizeNumericMap(payload.scored_answers || payload.scoredAnswers || {})
  const scoreFromScoredAnswers = sumCompleteScoredAnswers(scoredAnswers)
  const scoreFromSubscales = sumCompleteSubscaleScores(subscaleScores)
  const score = scoreFromScoredAnswers ?? scoreFromSubscales ?? rawScore
  const interpretation = getInterpretation(score)

  return {
    id: payload.assessment_id ?? payload.id ?? null,
    score,
    maxScore: Number(payload.max_score ?? payload.maxScore ?? ASSESSMENT_MAX_SCORE),
    level: interpretation.level,
    title: interpretation.title,
    summary: interpretation.summary,
    suggestions: interpretation.suggestions,
    consentUsage: payload.consent_usage || payload.consentUsage || '',
    rawAnswers,
    scoredAnswers,
    subscaleScores,
    scaleVersion: payload.scale_version || payload.scaleVersion || ASSESSMENT_SCALE_VERSION,
    createdAt: payload.created_at || payload.createdAt || new Date().toISOString(),
  }
}

export function scoreAssessment(answers = {}) {
  const rawAnswers = mapAssessmentAnswersToBackendScale(answers)
  const scoredAnswers = Object.fromEntries(
    ASSESSMENT_QUESTIONS.map((question) => {
      const rawValue = Number(rawAnswers[question.key] ?? 0)
      const scoredValue = REVERSE_SCORED_ITEM_NUMBERS.includes(question.number)
        ? 4 - rawValue
        : rawValue
      return [question.key, scoredValue]
    })
  )
  const subscaleScores = Object.fromEntries(
    ASSESSMENT_CATEGORIES.map((category) => [
      category.key,
      category.questionNumbers.reduce((sum, questionNumber) => (
        sum + Number(scoredAnswers[`q${questionNumber}`] || 0)
      ), 0),
    ])
  )
  const score = Object.values(scoredAnswers).reduce((sum, value) => sum + Number(value || 0), 0)
  const interpretation = getInterpretation(score)

  return {
    score,
    maxScore: ASSESSMENT_MAX_SCORE,
    level: interpretation.level,
    title: interpretation.title,
    summary: interpretation.summary,
    suggestions: interpretation.suggestions,
    rawAnswers,
    scoredAnswers,
    subscaleScores,
    scaleVersion: ASSESSMENT_SCALE_VERSION,
  }
}
