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

export function scoreAssessment(answers = {}) {
  const values = Object.values(answers).map(Number).filter((value) => Number.isFinite(value))
  const total = values.reduce((sum, value) => sum + value, 0)

  if (total >= 18) {
    return {
      level: 'high',
      title: '需要认真照顾',
      summary: '你的压力和情绪负荷偏高，建议尽快和可信任的人或专业人士聊聊。',
    }
  }

  if (total >= 10) {
    return {
      level: 'medium',
      title: '有些累了',
      summary: '你近期可能承受了不少压力，可以先从睡眠、呼吸和减少任务量开始。',
    }
  }

  return {
    level: 'low',
    title: '整体稳定',
    summary: '你现在的状态相对平稳，继续保留那些让你恢复的小习惯。',
  }
}
