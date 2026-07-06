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
    summary: '你的整体心理健康资源很充足，情绪、支持系统和日常功能大多保持在稳定、有弹性的状态。',
    suggestions: ['继续保留让你恢复的习惯', '把有效的支持方式记录下来', '在状态好时也给自己安排放松时间'],
  },
  {
    minScore: 73,
    level: 'healthy',
    title: '心理健康状态良好',
    summary: '整体情绪较稳定，也具备一定的压力应对能力。近期仍可以继续观察容易消耗你的情境。',
    suggestions: ['维持规律作息和运动', '遇到压力时主动寻求支持', '每周回顾一次让你感觉变好的事情'],
  },
  {
    minScore: 49,
    level: 'moderate',
    title: '中等心理健康挑战',
    summary: '你可能正在经历一些持续的情绪或压力挑战，建议把恢复目标拆小，并让可信任的人知道你的近况。',
    suggestions: ['先固定一个睡眠和休息窗口', '每天记录一个压力来源和一个可控行动', '和朋友、家人或老师进行一次支持性谈话'],
  },
  {
    minScore: 25,
    level: 'very_low',
    title: '心理健康状态较差',
    summary: '近期心理负担可能较重，情绪恢复、压力应对或日常功能受到了明显影响。请优先获得现实中的支持。',
    suggestions: ['尽快联系可信任的成年人或专业咨询', '减少高刺激信息输入', '先完成吃饭、睡眠、洗漱等基础照顾'],
  },
  {
    minScore: 0,
    level: 'critical',
    title: '严重心理健康风险',
    summary: '你的作答提示近期心理健康风险较高。这个结果不是诊断，但建议尽快寻求家人、学校老师或专业机构的帮助。',
    suggestions: ['马上告诉一个可信任的人你现在的状态', '避免独自承受高风险时刻', '如有伤害自己或他人的念头，请立即联系当地急救或危机干预热线'],
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
  const correctedBackendScore = Number.isFinite(rawScore) && rawScore !== score
  const interpretation = getInterpretation(score)

  return {
    id: payload.assessment_id ?? payload.id ?? null,
    score,
    maxScore: Number(payload.max_score ?? payload.maxScore ?? ASSESSMENT_MAX_SCORE),
    level: correctedBackendScore ? interpretation.level : (payload.level || interpretation.level),
    title: correctedBackendScore
      ? interpretation.title
      : (payload.tag || payload.wellness_state || payload.title || interpretation.title),
    summary: correctedBackendScore
      ? interpretation.summary
      : (payload.diagnosis || payload.summary || interpretation.summary),
    suggestions: correctedBackendScore
      ? interpretation.suggestions
      : (Array.isArray(payload.suggestions) ? payload.suggestions : interpretation.suggestions),
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
