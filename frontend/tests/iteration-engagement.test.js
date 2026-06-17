import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'

import {
  getMascotLevel,
  getMascotMood,
  normalizeEngagementState,
  shouldShowReturnPrompt,
  updateStreakState,
} from '../src/utils/engagement.js'
import {
  applySproutCareAction,
  addSproutDiaryEntry,
  claimSproutMilestoneReward,
  createDefaultSproutCareState,
  equipSproutAccessory,
  getSproutMilestone,
  getUnlockedSproutFeatures,
  plantSproutGardenItem,
} from '../src/utils/sprout-care.js'
import { getMoodQuoteCard } from '../src/utils/mood-quote-card.js'
import { getMoodInsight } from '../src/utils/emotion-insights.js'
import {
  buildAssessmentPayload,
  normalizeAssessmentResult,
  scoreAssessment,
  validateAssessmentConsent,
} from '../src/utils/assessment.js'
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

test('normalizes polluted engagement streaks before incrementing', () => {
  const polluted = {
    currentStreak: 20,
    bestStreak: 1,
    lastSeenDate: '2026-05-01',
  }

  const normalized = normalizeEngagementState(polluted)
  const next = updateStreakState(polluted, new Date('2026-05-02T12:00:00.000Z'))

  assert.equal(normalized.currentStreak, 1)
  assert.equal(next.currentStreak, 2)
  assert.equal(next.bestStreak, 2)
})

test('tracks sprout care actions and grants daily sun drops once per action', () => {
  const initial = createDefaultSproutCareState()
  const fed = applySproutCareAction(initial, 'feed', new Date('2026-05-01T08:00:00.000Z'))
  const fedAgain = applySproutCareAction(fed, 'feed', new Date('2026-05-01T09:00:00.000Z'))
  const washed = applySproutCareAction(fedAgain, 'wash', new Date('2026-05-01T10:00:00.000Z'))

  assert.equal(fed.sunDrops, 15)
  assert.equal(fedAgain.sunDrops, 15)
  assert.equal(washed.sunDrops, 30)
  assert.equal(washed.actions.feed.count, 2)
  assert.equal(washed.actions.wash.count, 1)
  assert.match(washed.moodText, /清爽|照顾/)
})

test('maps sprout milestones from the companion growth document', () => {
  assert.equal(getSproutMilestone(1).title, '初生与羁绊')
  assert.equal(getSproutMilestone(21).reward, '疗愈栖息地')
  assert.equal(getSproutMilestone(90).title, '深度定制')
})

test('unlocks sprout companion features from milestone days', () => {
  assert.deepEqual(getUnlockedSproutFeatures(1), {
    accessoryBlindBox: false,
    expressions: false,
    outfitSystem: false,
    habitat: false,
    garden: false,
    crafting: false,
    friendVisits: false,
    freeLayout: false,
    habitatBgm: false,
    diaryWall: false,
  })

  const day21 = getUnlockedSproutFeatures(21)
  assert.equal(day21.accessoryBlindBox, true)
  assert.equal(day21.outfitSystem, true)
  assert.equal(day21.habitat, true)

  const day180 = getUnlockedSproutFeatures(180)
  assert.equal(day180.garden, true)
  assert.equal(day180.diaryWall, true)
})

test('claims sprout milestone rewards and equips accessories', () => {
  const initial = createDefaultSproutCareState()
  const rewarded = claimSproutMilestoneReward(
    initial,
    3,
    new Date('2026-06-01T08:00:00.000Z'),
    () => 0
  )

  assert.ok(rewarded.claimedRewards.includes('day-3-accessory-box'))
  assert.equal(rewarded.inventory.accessories[0].id, 'leaf-bow')
  assert.equal(rewarded.inventory.accessories[0].source, '第 3 天盲盒')

  const equipped = equipSproutAccessory(rewarded, 'leaf-bow')
  assert.equal(equipped.equipped.accessory, 'leaf-bow')

  const duplicateClaim = claimSproutMilestoneReward(equipped, 3, new Date('2026-06-02T08:00:00.000Z'), () => 0)
  assert.equal(duplicateClaim.inventory.accessories.length, 1)
})

test('plants sprout garden items with sun drops and records diary entries', () => {
  const state = {
    ...createDefaultSproutCareState(),
    sunDrops: 45,
  }

  const planted = plantSproutGardenItem(state, 'forget-worry-grass', new Date('2026-06-02T08:00:00.000Z'))
  assert.equal(planted.sunDrops, 15)
  assert.equal(planted.garden.plots.length, 1)
  assert.equal(planted.garden.plots[0].seedId, 'forget-worry-grass')
  assert.equal(planted.garden.plots[0].status, 'growing')

  const diaryState = addSproutDiaryEntry(planted, {
    title: '今天的小窝',
    mood: 'calm',
    content: '草团子在新床边睡了一会儿。',
  }, new Date('2026-06-03T21:00:00.000Z'))

  assert.equal(diaryState.diary.length, 1)
  assert.equal(diaryState.diary[0].date, '2026-06-03')
  assert.match(diaryState.diary[0].content, /草团子/)
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

test('returns illustrated daily quote card content by mood', () => {
  const card = getMoodQuoteCard('anxious')

  assert.equal(card.mood, 'anxious')
  assert.match(card.title, /日签|安稳/)
  assert.match(card.quote, /呼吸|慢/)
  assert.match(card.tone, /rose|sage|blue|gold|coral/)
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

test('builds backend payload for detailed psychological assessment', () => {
  const payload = buildAssessmentPayload(
    {
      accepted: true,
      userSignature: '测试用户',
      isMinor: true,
      guardianSignature: '监护人',
    },
    {
      sleep: 0,
      anxiety: 4,
      sadness: 3,
      energy: 1,
      focus: 2,
    },
    'demo-client'
  )

  assert.equal(payload.clientId, 'demo-client')
  assert.equal(payload.consentAccepted, true)
  assert.equal(payload.userSignature, '测试用户')
  assert.equal(payload.isMinor, true)
  assert.equal(payload.guardianSignature, '监护人')
  assert.deepEqual(payload.answers, {
    sleep: 1,
    anxiety: 5,
    sadness: 4,
    energy: 2,
    focus: 3,
  })
})

test('normalizes backend psychological assessment result for display', () => {
  const result = normalizeAssessmentResult({
    assessment_id: 12,
    score: 15,
    level: 'high',
    tag: '高压预警',
    diagnosis: '近期压力偏高',
    suggestions: ['联系可信任的人', '减少刺激信息'],
    consent_usage: '匿名化后用于研究/产品分析/商业合作',
  })

  assert.equal(result.id, 12)
  assert.equal(result.level, 'high')
  assert.equal(result.title, '高压预警')
  assert.match(result.summary, /压力/)
  assert.equal(result.suggestions.length, 2)
})

test('defines twelve monthly meditation background themes', () => {
  assert.equal(MONTHLY_BACKGROUND_THEMES.length, 12)
  assert.equal(getMonthlyTheme(8).key, 'aug-ocean')
  assert.equal(getMonthlyTheme(1).sourceUrl, 'https://www.youtube.com/watch?v=MbW8YIv28wg')
  assert.equal(getMonthlyTheme(12).sourceUrl, 'https://www.youtube.com/watch?v=eNPG8jGfJRk')
})

test('monthly meditation themes expose downloaded cover artwork', () => {
  MONTHLY_BACKGROUND_THEMES.forEach((theme) => {
    const paddedMonth = String(theme.month).padStart(2, '0')

    assert.equal(
      theme.cover_image,
      `/reference-assets/meditation/months/${paddedMonth}.jpg`
    )
    assert.equal(theme.asset_source, 'docs/references.md')
    assert.ok(
      existsSync(new URL(`../public/reference-assets/meditation/months/${paddedMonth}.jpg`, import.meta.url)),
      `missing downloaded meditation cover for month ${paddedMonth}`
    )
  })
})

test('soap game chooses a new skin and cuts at pointer ratio', () => {
  assert.equal(getRandomSoapSkin(['default', 'mint'], 'default', () => 0), 'mint')
  assert.equal(getCutRatio(140, 100, 200), 0.2)
  assert.equal(getCutRatio(10, 100, 200), 0.18)
  assert.equal(getCutRatio(400, 100, 200), 0.82)
})
