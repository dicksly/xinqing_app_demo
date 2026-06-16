import { toDateKey } from './engagement.js'

export const SPROUT_ACTIONS = {
  feed: {
    label: '喂食',
    moodText: '草团子吃饱了，悄悄攒下一点勇气。',
  },
  wash: {
    label: '洗澡',
    moodText: '草团子变得清爽，照顾自己也可以很轻。',
  },
  outing: {
    label: '出门',
    moodText: '草团子去外面看了看，把风带回小窝。',
  },
  comfort: {
    label: '互动',
    moodText: '草团子贴近你，今天也有人在认真陪你。',
  },
}

export const SUN_DROPS_PER_DAILY_ACTION = 15

export function createDefaultSproutCareState() {
  return {
    sunDrops: 0,
    supplies: [],
    moodText: '草团子在小窝里等你，先做一个小小照护吧。',
    actions: Object.fromEntries(Object.keys(SPROUT_ACTIONS).map((key) => [
      key,
      {
        count: 0,
        lastRewardDate: null,
      },
    ])),
  }
}

export function normalizeSproutCareState(state = {}) {
  const defaults = createDefaultSproutCareState()
  const actions = { ...defaults.actions }

  for (const key of Object.keys(actions)) {
    actions[key] = {
      ...actions[key],
      ...(state.actions?.[key] || {}),
      count: Math.max(0, Number(state.actions?.[key]?.count || 0)),
    }
  }

  return {
    ...defaults,
    ...state,
    sunDrops: Math.max(0, Number(state.sunDrops || 0)),
    supplies: Array.isArray(state.supplies) ? state.supplies : [],
    actions,
  }
}

export function applySproutCareAction(state = {}, action, now = new Date()) {
  const normalized = normalizeSproutCareState(state)
  const actionConfig = SPROUT_ACTIONS[action]
  if (!actionConfig) return normalized

  const today = toDateKey(now)
  const actionState = normalized.actions[action]
  const shouldReward = actionState.lastRewardDate !== today

  return {
    ...normalized,
    sunDrops: normalized.sunDrops + (shouldReward ? SUN_DROPS_PER_DAILY_ACTION : 0),
    moodText: actionConfig.moodText,
    actions: {
      ...normalized.actions,
      [action]: {
        ...actionState,
        count: actionState.count + 1,
        lastRewardDate: shouldReward ? today : actionState.lastRewardDate,
      },
    },
  }
}

export function getSproutMilestone(streakDays = 1) {
  const days = Math.max(1, Number(streakDays || 1))
  const milestones = [
    {
      startsAt: 1,
      title: '初生与羁绊',
      reward: '新手晨光礼包',
      nextAt: 3,
      nextText: '第 3 天解锁盲盒配饰',
    },
    {
      startsAt: 21,
      title: '初生与羁绊',
      reward: '疗愈栖息地',
      nextAt: 30,
      nextText: '第 30 天解锁小庭院',
    },
    {
      startsAt: 30,
      title: '成长与探索',
      reward: '疗愈户外空间',
      nextAt: 45,
      nextText: '第 45 天解锁物资合成',
    },
    {
      startsAt: 60,
      title: '社交破冰',
      reward: '好友串门',
      nextAt: 90,
      nextText: '第 90 天解锁自由布局',
    },
    {
      startsAt: 90,
      title: '深度定制',
      reward: '栖息地自由布局',
      nextAt: 120,
      nextText: '第 120 天解锁疗愈主理人称号',
    },
    {
      startsAt: 120,
      title: '情感沉淀',
      reward: '疗愈主理人',
      nextAt: 180,
      nextText: '第 180 天解锁草团子的日记本',
    },
    {
      startsAt: 180,
      title: '灵魂陪伴',
      reward: '草团子的日记本',
      nextAt: 365,
      nextText: '第 365 天解锁年度报告',
    },
  ]

  return milestones.reduce((matched, milestone) => (
    days >= milestone.startsAt ? milestone : matched
  ), milestones[0])
}
