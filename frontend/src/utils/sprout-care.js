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
export const GARDEN_SEED_COST = 30

export const SPROUT_ACCESSORY_BOX = [
  { id: 'leaf-bow', label: '叶芽蝴蝶结', source: '第 3 天盲盒' },
  { id: 'sun-pin', label: '晨光胸针', source: '第 3 天盲盒' },
  { id: 'soft-headband', label: '软云发带', source: '第 3 天盲盒' },
]

export const SPROUT_OUTFITS = [
  { id: 'morning-cape', label: '晨光披肩', source: '第 14 天基础皮肤' },
  { id: 'moss-hoodie', label: '苔藓小斗篷', source: '第 14 天基础皮肤' },
]

export const SPROUT_SUPPLIES = [
  { id: 'tiny-bed', label: '小芽软床', type: 'furniture', source: '第 21 天栖息地' },
  { id: 'warm-lamp', label: '暖光台灯', type: 'furniture', source: '第 21 天栖息地' },
  { id: 'soft-blanket', label: '云朵毯', type: 'supply', source: '每日掉落' },
  { id: 'sugar-candy', label: '安慰糖', type: 'gift', source: '每日掉落' },
]

export const GARDEN_SEEDS = {
  'forget-worry-grass': {
    id: 'forget-worry-grass',
    label: '忘忧草',
    cost: GARDEN_SEED_COST,
    growDays: 3,
  },
}

export function createDefaultSproutCareState() {
  return {
    sunDrops: 0,
    supplies: [],
    inventory: {
      accessories: [],
      outfits: [],
      supplies: [],
    },
    equipped: {
      accessory: null,
      outfit: null,
    },
    habitat: {
      unlocked: false,
      furniture: [],
      bgm: null,
    },
    garden: {
      unlocked: false,
      plots: [],
    },
    diary: [],
    claimedRewards: [],
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
    inventory: {
      accessories: Array.isArray(state.inventory?.accessories) ? state.inventory.accessories : [],
      outfits: Array.isArray(state.inventory?.outfits) ? state.inventory.outfits : [],
      supplies: Array.isArray(state.inventory?.supplies) ? state.inventory.supplies : [],
    },
    equipped: {
      ...defaults.equipped,
      ...(state.equipped || {}),
    },
    habitat: {
      ...defaults.habitat,
      ...(state.habitat || {}),
      furniture: Array.isArray(state.habitat?.furniture) ? state.habitat.furniture : [],
    },
    garden: {
      ...defaults.garden,
      ...(state.garden || {}),
      plots: Array.isArray(state.garden?.plots) ? state.garden.plots : [],
    },
    diary: Array.isArray(state.diary) ? state.diary : [],
    claimedRewards: Array.isArray(state.claimedRewards) ? state.claimedRewards : [],
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

export function getUnlockedSproutFeatures(streakDays = 1) {
  const days = Math.max(1, Number(streakDays || 1))
  return {
    accessoryBlindBox: days >= 3,
    expressions: days >= 7,
    outfitSystem: days >= 14,
    habitat: days >= 21,
    garden: days >= 30,
    crafting: days >= 45,
    friendVisits: days >= 60,
    freeLayout: days >= 90,
    habitatBgm: days >= 100,
    diaryWall: days >= 180,
  }
}

function addUniqueItem(items, nextItem) {
  if (!nextItem || items.some((item) => item.id === nextItem.id)) {
    return items
  }
  return [...items, nextItem]
}

function dateAfterDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next.toISOString()
}

export function claimSproutMilestoneReward(state = {}, streakDays = 1, now = new Date(), random = Math.random) {
  const normalized = normalizeSproutCareState(state)
  const features = getUnlockedSproutFeatures(streakDays)
  const claimedRewards = [...normalized.claimedRewards]
  let inventory = {
    accessories: [...normalized.inventory.accessories],
    outfits: [...normalized.inventory.outfits],
    supplies: [...normalized.inventory.supplies],
  }
  let habitat = { ...normalized.habitat, furniture: [...normalized.habitat.furniture] }
  let garden = { ...normalized.garden, plots: [...normalized.garden.plots] }
  let moodText = normalized.moodText

  if (features.accessoryBlindBox && !claimedRewards.includes('day-3-accessory-box')) {
    const accessory = SPROUT_ACCESSORY_BOX[Math.floor(random() * SPROUT_ACCESSORY_BOX.length)] || SPROUT_ACCESSORY_BOX[0]
    inventory.accessories = addUniqueItem(inventory.accessories, accessory)
    claimedRewards.push('day-3-accessory-box')
    moodText = `草团子拆开了盲盒，得到「${accessory.label}」。`
  }

  if (features.outfitSystem && !claimedRewards.includes('day-14-basic-outfit')) {
    inventory.outfits = SPROUT_OUTFITS.reduce(addUniqueItem, inventory.outfits)
    claimedRewards.push('day-14-basic-outfit')
  }

  if (features.habitat && !claimedRewards.includes('day-21-habitat')) {
    const furniture = SPROUT_SUPPLIES.filter((item) => item.source === '第 21 天栖息地')
    inventory.supplies = furniture.reduce(addUniqueItem, inventory.supplies)
    habitat = {
      ...habitat,
      unlocked: true,
      furniture: furniture.reduce(addUniqueItem, habitat.furniture),
    }
    claimedRewards.push('day-21-habitat')
  }

  if (features.garden && !claimedRewards.includes('day-30-garden')) {
    garden = { ...garden, unlocked: true }
    claimedRewards.push('day-30-garden')
  }

  if (features.habitatBgm && !claimedRewards.includes('day-100-bgm')) {
    habitat = { ...habitat, bgm: 'soft-morning' }
    claimedRewards.push('day-100-bgm')
  }

  if (features.diaryWall && !claimedRewards.includes('day-180-diary-wall')) {
    claimedRewards.push('day-180-diary-wall')
  }

  return {
    ...normalized,
    inventory,
    habitat,
    garden,
    claimedRewards,
    moodText,
    updatedAt: now.toISOString(),
  }
}

export function equipSproutAccessory(state = {}, accessoryId) {
  const normalized = normalizeSproutCareState(state)
  const ownsAccessory = normalized.inventory.accessories.some((item) => item.id === accessoryId)
  if (!ownsAccessory) return normalized

  return {
    ...normalized,
    equipped: {
      ...normalized.equipped,
      accessory: accessoryId,
    },
    moodText: '草团子换好了新配饰，轻轻晃了晃小芽。',
  }
}

export function plantSproutGardenItem(state = {}, seedId, now = new Date()) {
  const normalized = normalizeSproutCareState(state)
  const seed = GARDEN_SEEDS[seedId]
  if (!seed) return normalized

  if (normalized.sunDrops < seed.cost) {
    return {
      ...normalized,
      moodText: `还差 ${seed.cost - normalized.sunDrops} 颗阳光露珠才能种下${seed.label}。`,
    }
  }

  const plantedAt = now.toISOString()
  const plot = {
    id: `${seed.id}-${new Date(now).getTime()}-${normalized.garden.plots.length + 1}`,
    seedId: seed.id,
    label: seed.label,
    plantedAt,
    readyAt: dateAfterDays(now, seed.growDays),
    status: 'growing',
  }

  return {
    ...normalized,
    sunDrops: normalized.sunDrops - seed.cost,
    garden: {
      ...normalized.garden,
      unlocked: true,
      plots: [...normalized.garden.plots, plot],
    },
    moodText: `忘忧草已经种下，草团子会每天去看一眼。`,
  }
}

export function addSproutDiaryEntry(state = {}, entry = {}, now = new Date()) {
  const normalized = normalizeSproutCareState(state)
  const content = String(entry.content || '').trim()
  if (!content) return normalized

  const date = toDateKey(now)
  const diaryEntry = {
    id: `diary-${new Date(now).getTime()}-${normalized.diary.length + 1}`,
    date,
    title: String(entry.title || '草团子的今日记忆').trim(),
    mood: String(entry.mood || 'calm'),
    content,
  }

  return {
    ...normalized,
    diary: [diaryEntry, ...normalized.diary].slice(0, 30),
    moodText: '草团子把今天写进了记忆墙。',
  }
}
