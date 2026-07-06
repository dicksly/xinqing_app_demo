export const REVERSE_SCORED_ITEM_NUMBERS = [3, 5, 8, 10, 12, 14, 17, 20, 22, 27]

export const ASSESSMENT_RESPONSE_OPTIONS = [
  { value: 0, zhLabel: '从不', enLabel: 'Never' },
  { value: 1, zhLabel: '很少', enLabel: 'Rarely' },
  { value: 2, zhLabel: '有时', enLabel: 'Sometimes' },
  { value: 3, zhLabel: '经常', enLabel: 'Often' },
  { value: 4, zhLabel: '几乎总是', enLabel: 'Almost always' },
]

export const ASSESSMENT_CATEGORIES = [
  {
    key: 'emotional_wellbeing',
    zhLabel: '情绪健康',
    enLabel: 'Emotional Wellbeing',
    questionNumbers: [1, 2, 3, 4, 5, 6],
  },
  {
    key: 'stress_coping',
    zhLabel: '压力与应对能力',
    enLabel: 'Stress and Coping',
    questionNumbers: [7, 8, 9, 10, 11, 12],
  },
  {
    key: 'social_connections',
    zhLabel: '社交关系',
    enLabel: 'Social Connections',
    questionNumbers: [13, 14, 15, 16, 17, 18],
  },
  {
    key: 'motivation_daily_functioning',
    zhLabel: '动力与日常功能',
    enLabel: 'Motivation and Daily Functioning',
    questionNumbers: [19, 20, 21, 22, 23, 24],
  },
  {
    key: 'self_care_habits',
    zhLabel: '自我照顾与健康习惯',
    enLabel: 'Self-care and Healthy Habits',
    questionNumbers: [25, 26, 27, 28, 29, 30],
  },
]

const QUESTION_DEFINITIONS = [
  ['我对自己的未来抱有希望。', 'I feel hopeful about my future.'],
  ['当我情绪低落时，我通常能够让自己平静下来。', 'When I feel upset, I can usually calm myself down.'],
  ['我经常感到自己的情绪难以承受。', 'I often feel that my emotions are too much to handle.'],
  ['我对自己感到满意。', 'I feel satisfied with myself.'],
  ['我经常感到悲伤或空虚。', 'I often feel sad or empty.'],
  ['在困难情况下，我通常能看到积极的一面。', 'In difficult situations, I can usually see a positive side.'],
  ['我觉得自己能够应对学校或学业压力。', 'I feel able to cope with school or academic pressure.'],
  ['我很难处理日常生活中的压力。', 'I find it hard to manage stress in daily life.'],
  ['当我需要帮助时，我愿意向别人求助。', 'When I need help, I am willing to ask others for support.'],
  ['即使休息后，我仍然感到疲惫。', 'Even after resting, I still feel tired.'],
  ['经历困难的一天后，我通常能够恢复状态。', 'After a difficult day, I can usually recover.'],
  ['大多数时候，我会对很多事情感到焦虑。', 'Most of the time, I feel anxious about many things.'],
  ['我能从朋友、家人或值得信赖的成年人那里获得支持。', 'I can get support from friends, family, or trusted adults.'],
  ['即使身边有人，我仍然感到孤独。', 'I feel lonely even when people are around me.'],
  ['我愿意向信任的人表达自己的感受。', 'I am willing to share my feelings with someone I trust.'],
  ['我觉得周围的人接纳我。', 'I feel accepted by the people around me.'],
  ['因为感到压力，我会避免社交活动。', 'I avoid social activities because I feel stressed.'],
  ['在困难时期，我至少有一个可以依靠的人。', 'During difficult times, I have at least one person I can rely on.'],
  ['我有动力完成日常活动。', 'I feel motivated to complete daily activities.'],
  ['我很难专注于任务。', 'I find it hard to focus on tasks.'],
  ['我通常有足够的精力度过一天。', 'I usually have enough energy to get through the day.'],
  ['我很难从曾经喜欢的活动中获得快乐。', 'I find it hard to enjoy activities I used to like.'],
  ['我能够较好地完成自己的责任。', 'I am able to carry out my responsibilities well.'],
  ['我相信自己有能力解决问题。', 'I believe I can solve problems.'],
  ['我有足够的睡眠并感到休息充分。', 'I get enough sleep and feel well rested.'],
  ['我会通过健康习惯照顾自己的身体。', 'I take care of my body through healthy habits.'],
  ['我花太多时间担心自己的错误或失败。', 'I spend too much time worrying about my mistakes or failures.'],
  ['我会留时间让自己放松或做喜欢的事情。', 'I make time to relax or do things I enjoy.'],
  ['我在日常生活中感到安全和情绪稳定。', 'I feel safe and emotionally stable in daily life.'],
  ['我能够较好地平衡学业、兴趣、朋友关系和个人时间。', 'I can balance school, interests, friendships, and personal time well.'],
]

function getCategoryKeyByQuestionNumber(questionNumber) {
  return ASSESSMENT_CATEGORIES.find((category) =>
    category.questionNumbers.includes(questionNumber)
  )?.key
}

function getLocalizedText(item, locale = 'zh-CN') {
  return locale === 'zh-CN' ? item.zhLabel : item.enLabel
}

function normalizeRawAnswer(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return null
  return Math.min(4, Math.max(0, Math.round(numeric)))
}

export const ASSESSMENT_QUESTIONS = QUESTION_DEFINITIONS.map(([zhLabel, enLabel], index) => {
  const number = index + 1
  return {
    number,
    key: `q${number}`,
    categoryKey: getCategoryKeyByQuestionNumber(number),
    reverse: REVERSE_SCORED_ITEM_NUMBERS.includes(number),
    zhLabel,
    enLabel,
  }
})

export function getAssessmentQuestions(locale = 'zh-CN') {
  return ASSESSMENT_QUESTIONS.map((question) => ({
    ...question,
    label: getLocalizedText(question, locale),
  }))
}

export function getAssessmentCategories(locale = 'zh-CN') {
  const questions = getAssessmentQuestions(locale)
  return ASSESSMENT_CATEGORIES.map((category) => ({
    ...category,
    label: getLocalizedText(category, locale),
    questions: questions.filter((question) => question.categoryKey === category.key),
  }))
}

export function getAssessmentResponseOptions(locale = 'zh-CN') {
  return ASSESSMENT_RESPONSE_OPTIONS.map((option) => ({
    ...option,
    label: getLocalizedText(option, locale),
  }))
}

export function createAssessmentAnswers(initialAnswers = {}) {
  return Object.fromEntries(
    ASSESSMENT_QUESTIONS.map((question) => [
      question.key,
      normalizeRawAnswer(initialAnswers[question.key]),
    ])
  )
}

export function mapAssessmentAnswersToBackendScale(answers = {}) {
  return Object.fromEntries(
    ASSESSMENT_QUESTIONS.map((question) => [
      question.key,
      normalizeRawAnswer(answers[question.key]),
    ])
  )
}
