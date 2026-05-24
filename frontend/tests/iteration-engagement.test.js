import test from 'node:test'
import assert from 'node:assert/strict'

import {
  getMascotLevel,
  getMascotMood,
  shouldShowReturnPrompt,
  updateStreakState,
} from '../src/utils/engagement.js'
import { getMoodInsight } from '../src/utils/emotion-insights.js'
import { scoreAssessment, validateAssessmentConsent } from '../src/utils/assessment.js'
import { getMonthlyTheme, MONTHLY_BACKGROUND_THEMES } from '../src/utils/meditation-themes.js'
import { getCutRatio, getRandomSoapSkin } from '../src/utils/soap-game.js'

test('updates continuous app streak and detects return prompt gap', () => {
  const first = updateStreakState({}, new Date('2026-05-01T12:00:00.000Z'))
  const second = updateStreakState(first, new Date('2026-05-02T12:00:00.000Z'))
  const returned = updateStreakState(second, new Date('2026-05-06T12:00:00.000Z'))

  assert.equal(second.currentStreak, 2)
  assert.equal(returned.currentStreak, 1)
  assert.equal(returned.missedDays, 3)
  assert.equal(shouldShowReturnPrompt(returned), true)
})

test('maps streak levels and mood expression for grass mascot', () => {
  assert.equal(getMascotLevel(20).name, 'sprout')
  assert.equal(getMascotLevel(99).name, 'clover')
  assert.equal(getMascotMood('sad').face, 'sad')
})

test('returns mood tag and comfort sentence after check-in', () => {
  const insight = getMoodInsight('anxious')

  assert.equal(insight.tag, '警报器有点敏感')
  assert.match(insight.comfort, /肩膀/)
})

test('requires guardian signature for minor assessment consent', () => {
  const missingGuardian = validateAssessmentConsent({
    accepted: true,
    userSignature: '学生',
    isMinor: true,
  })

  assert.equal(missingGuardian.valid, false)
  assert.match(missingGuardian.errors.join(','), /监护人/)

  const signed = validateAssessmentConsent({
    accepted: true,
    userSignature: '学生',
    isMinor: true,
    guardianSignature: '家长',
  })
  assert.equal(signed.valid, true)
})

test('scores detailed psychological analysis answers', () => {
  assert.equal(scoreAssessment({ a: 4, b: 4, c: 4, d: 4, e: 4 }).level, 'high')
  assert.equal(scoreAssessment({ a: 1, b: 1, c: 1 }).level, 'low')
})

test('defines twelve monthly meditation background themes', () => {
  assert.equal(MONTHLY_BACKGROUND_THEMES.length, 12)
  assert.equal(getMonthlyTheme(8).key, 'aug-ocean')
})

test('soap game chooses a new skin and cuts at pointer ratio', () => {
  assert.equal(getRandomSoapSkin(['default', 'mint'], 'default', () => 0), 'mint')
  assert.equal(getCutRatio(140, 100, 200), 0.2)
  assert.equal(getCutRatio(10, 100, 200), 0.18)
  assert.equal(getCutRatio(400, 100, 200), 0.82)
})
