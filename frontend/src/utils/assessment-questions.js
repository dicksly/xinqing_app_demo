export const ASSESSMENT_QUESTIONS = [
  {
    key: 'sleep',
    zhLabel: '最近睡眠受影响的程度',
    enLabel: 'Sleep disruption recently',
  },
  {
    key: 'anxiety',
    zhLabel: '焦虑或紧绷的程度',
    enLabel: 'Anxiety or tension level',
  },
  {
    key: 'sadness',
    zhLabel: '低落或无力的程度',
    enLabel: 'Sadness or exhaustion level',
  },
  {
    key: 'energy',
    zhLabel: '日常能量被消耗的程度',
    enLabel: 'Daily energy drain',
  },
  {
    key: 'focus',
    zhLabel: '注意力受影响的程度',
    enLabel: 'Focus disruption',
  },
]

export function getAssessmentQuestions(locale = 'zh-CN') {
  const isZh = locale === 'zh-CN'

  return ASSESSMENT_QUESTIONS.map((question) => ({
    key: question.key,
    label: isZh ? question.zhLabel : question.enLabel,
  }))
}

export function createAssessmentAnswers(initialAnswers = {}) {
  return Object.fromEntries(
    ASSESSMENT_QUESTIONS.map((question) => [
      question.key,
      Number.isFinite(Number(initialAnswers[question.key]))
        ? Number(initialAnswers[question.key])
        : 0,
    ])
  )
}

function clampAnswerToBackendScale(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return 1
  return Math.min(5, Math.max(1, Math.round(numeric) + 1))
}

export function mapAssessmentAnswersToBackendScale(answers = {}) {
  return Object.fromEntries(
    ASSESSMENT_QUESTIONS.map((question) => [
      question.key,
      clampAnswerToBackendScale(answers[question.key]),
    ])
  )
}
