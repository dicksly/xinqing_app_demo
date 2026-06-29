<template>
  <div class="care-page home-view">
    <header class="care-page-header home-header">
      <div>
        <h1 class="care-page-title">{{ isZh ? '烦恼小芽成长计划' : 'Sprout Care Plan' }}</h1>
        <p class="care-page-subtitle">{{ isZh ? '今天也和草团子轻轻见面' : 'Meet your little sprout gently today' }} · {{ currentDateText }}</p>
      </div>
    </header>

    <section class="care-card pad sprout-hero">
      <div class="sprout-copy">
        <span class="care-kicker">{{ milestone.title }}</span>
        <h2>{{ isZh ? `连续陪伴 ${streakState.currentStreak || 1} 天` : `${streakState.currentStreak || 1} Day Companion Streak` }}</h2>
        <p>{{ careState.moodText }}</p>
      </div>

      <div class="sprout-stage" :style="{ '--mascot-accent': mascotLevel.color }">
        <span v-if="equippedAccessory" class="sprout-accessory-tag">{{ equippedAccessory.label }}</span>
        <img :src="homeLogo" alt="草团子" class="sprout-image" />
      </div>

      <div class="sprout-stats">
        <div>
          <span>{{ isZh ? '阳光露珠' : 'Sun Drops' }}</span>
          <strong>{{ careState.sunDrops }}</strong>
        </div>
        <div>
          <span>{{ isZh ? '当前奖励' : 'Current Reward' }}</span>
          <strong>{{ milestone.reward }}</strong>
        </div>
      </div>
    </section>

    <section class="care-card pad daily-task-card">
      <span class="care-chip sage">{{ isZh ? '今日疗愈任务' : 'Today Care Task' }}</span>
      <h2>{{ isZh ? '完成一次心情打卡，获得新的阳光露珠' : 'Check in once to collect new Sun Drops' }}</h2>
      <p>{{ isZh ? '不用表现得很好，只要把此刻的感受放下来。' : 'No need to perform well. Just set down what you feel right now.' }}</p>
      <button type="button" class="soft-button check-button" @click="router.push('/emotion')">{{ isZh ? '去打卡' : 'Check In' }}</button>
    </section>

    <section class="care-card pad quest-progress-card">
      <div class="section-title-row">
        <div>
          <span class="care-chip blue">{{ isZh ? '今日照护闯关' : 'Daily Care Quest' }}</span>
          <h2 class="care-card-title">{{ isZh ? '给草团子补一点能量' : 'Charge your sprout with gentle energy' }}</h2>
        </div>
        <strong>{{ questProgress.completed }}/{{ questProgress.total }}</strong>
      </div>
      <div class="quest-energy-row">
        <span>{{ isZh ? '能量' : 'Energy' }} +{{ questProgress.energy }}</span>
        <span>{{ isZh ? (questProgress.isComplete ? '今日已完成' : questProgress.nextHint) : (questProgress.isComplete ? 'Quest complete' : questProgress.nextHintEn) }}</span>
      </div>
      <div class="progress-track quest-track" aria-hidden="true">
        <div class="progress-fill" :style="{ width: `${questProgress.percent}%` }"></div>
      </div>
    </section>

    <section class="care-card pad care-actions-card">
      <div class="section-title-row">
        <h2 class="care-card-title">{{ isZh ? '照顾一下草团子' : 'Care For Your Sprout' }}</h2>
        <span>{{ isZh ? '每日每项 +15' : '+15 each daily' }}</span>
      </div>
      <div class="care-actions-grid">
        <button
          v-for="action in careActions"
          :key="action.key"
          type="button"
          class="care-action care-touch"
          @click="handleCareAction(action.key)"
        >
          <span>{{ action.icon }}</span>
          <strong>{{ isZh ? action.label : action.enLabel }}</strong>
          <small>{{ isZh ? action.hint : action.enHint }}</small>
        </button>
      </div>
    </section>

    <section class="care-card soft growth-card">
      <div>
        <span class="care-kicker">{{ isZh ? '小芽成长中' : 'Sprout Growing' }}</span>
        <h2>{{ isZh ? `下一站：${milestone.nextText}` : `Next: ${milestone.nextTextEn || milestone.nextText}` }}</h2>
      </div>
      <div class="progress-track" aria-hidden="true">
        <div class="progress-fill" :style="{ width: `${growthProgress}%`, background: mascotLevel.color }"></div>
      </div>
    </section>

    <section class="care-card pad companion-card">
      <div class="section-title-row">
        <h2 class="care-card-title">草团子的衣柜</h2>
        <button type="button" class="text-action" @click="handleClaimReward">领取解锁</button>
      </div>
      <div v-if="careState.inventory.accessories.length > 0" class="inventory-row">
        <button
          v-for="accessory in careState.inventory.accessories"
          :key="accessory.id"
          type="button"
          class="inventory-chip"
          :class="{ active: careState.equipped.accessory === accessory.id }"
          @click="handleEquipAccessory(accessory.id)"
        >
          {{ accessory.label }}
        </button>
      </div>
      <p v-else class="empty-copy">第 3 天会遇见第一只盲盒配饰。</p>
    </section>

    <section class="care-card pad habitat-card">
      <div class="section-title-row">
        <h2 class="care-card-title">疗愈栖息地</h2>
        <span>{{ unlockedFeatures.habitat ? '已开启' : '第 21 天' }}</span>
      </div>
      <div class="habitat-scene" :class="{ locked: !careState.habitat.unlocked }">
        <div class="room-floor"></div>
        <span
          v-for="item in habitatFurniture"
          :key="item.id"
          class="furniture-pill"
        >
          {{ item.label }}
        </span>
        <strong v-if="!careState.habitat.unlocked">小窝还在慢慢搭建</strong>
      </div>
    </section>

    <section class="care-card pad garden-card">
      <div class="section-title-row">
        <h2 class="care-card-title">忘忧小庭院</h2>
        <button type="button" class="text-action" :disabled="careState.sunDrops < 30" @click="handlePlantGarden">
          种下
        </button>
      </div>
      <div class="garden-plots">
        <div v-for="plot in careState.garden.plots" :key="plot.id" class="garden-plot">
          <span></span>
          <strong>{{ plot.label }}</strong>
          <small>{{ plot.status === 'growing' ? '生长中' : '已收获' }}</small>
        </div>
        <p v-if="careState.garden.plots.length === 0" class="empty-copy">
          30 颗阳光露珠可以种下一株忘忧草。
        </p>
      </div>
    </section>

    <section class="care-card pad advanced-care-card">
      <div class="section-title-row">
        <div>
          <span class="care-chip coral">{{ isZh ? '高阶陪伴' : 'Advanced Bond' }}</span>
          <h2 class="care-card-title">{{ isZh ? '把小窝养成真正的陪伴空间' : 'Grow the nest into a companion space' }}</h2>
        </div>
        <span>{{ isZh ? `已解锁 ${advancedUnlockedCount}/10` : `${advancedUnlockedCount}/10` }}</span>
      </div>

      <div class="advanced-actions-grid">
        <button type="button" class="advanced-action" :disabled="!unlockedFeatures.crafting" @click="handleSupplyDrop">
          <strong>{{ isZh ? '每日补给' : 'Daily Drop' }}</strong>
          <small>{{ unlockedFeatures.crafting ? (isZh ? '随机物资' : 'Random supply') : 'Day 45' }}</small>
        </button>
        <button type="button" class="advanced-action" :disabled="!unlockedFeatures.crafting" @click="handleCraftSupply">
          <strong>{{ isZh ? '合成抱枕' : 'Craft Cushion' }}</strong>
          <small>{{ isZh ? '40 露珠' : '40 drops' }}</small>
        </button>
        <button type="button" class="advanced-action" :disabled="!unlockedFeatures.friendVisits" @click="handleFriendVisit">
          <strong>{{ isZh ? '好友串门' : 'Friend Visit' }}</strong>
          <small>{{ unlockedFeatures.friendVisits ? (latestVisit?.friendName || '小青芽') : 'Day 60' }}</small>
        </button>
        <button type="button" class="advanced-action" :disabled="!unlockedFeatures.freeLayout" @click="handleAutoLayout">
          <strong>{{ isZh ? '整理小窝' : 'Arrange' }}</strong>
          <small>{{ careState.habitat.layout.length }} {{ isZh ? '件' : 'items' }}</small>
        </button>
        <button type="button" class="advanced-action" :disabled="!unlockedFeatures.habitatBgm" @click="handleSetBgm">
          <strong>{{ isZh ? '播放 BGM' : 'Nest BGM' }}</strong>
          <small>{{ careState.habitat.bgm || 'Day 100' }}</small>
        </button>
        <button type="button" class="advanced-action" :disabled="!unlockedFeatures.habitatSquare" @click="handlePublishHabitat">
          <strong>{{ isZh ? '发布小窝' : 'Publish Nest' }}</strong>
          <small>{{ careState.habitat.publishedSnapshots.length }} {{ isZh ? '张' : 'shots' }}</small>
        </button>
        <button type="button" class="advanced-action" :disabled="!unlockedFeatures.harvestExchange" @click="handleHarvestGarden">
          <strong>{{ isZh ? '收获庭院' : 'Harvest' }}</strong>
          <small>{{ readyGardenPlots.length }} {{ isZh ? '株可收' : 'ready' }}</small>
        </button>
        <button type="button" class="advanced-action" :disabled="!unlockedFeatures.harvestExchange || careState.harvests.length === 0" @click="handleExchangeHarvest">
          <strong>{{ isZh ? '兑换家具' : 'Exchange' }}</strong>
          <small>{{ careState.harvests.length }} {{ isZh ? '份收获' : 'harvests' }}</small>
        </button>
        <button type="button" class="advanced-action" :disabled="!unlockedFeatures.weatherSystem" @click="handleUpdateWeather">
          <strong>{{ isZh ? '同步天气' : 'Weather' }}</strong>
          <small>{{ weatherLabel }}</small>
        </button>
        <button type="button" class="advanced-action" :disabled="!unlockedFeatures.panorama" @click="handleUnlockPanorama">
          <strong>{{ isZh ? '全景小窝' : 'Panorama' }}</strong>
          <small>{{ careState.habitat.panoramaUnlocked ? (isZh ? '已开启' : 'Open') : 'Day 300' }}</small>
        </button>
        <button type="button" class="advanced-action" :disabled="!unlockedFeatures.diaryWall" @click="handleGeneratePoster">
          <strong>{{ isZh ? '生成海报' : 'Poster' }}</strong>
          <small>{{ careState.posters.length }} {{ isZh ? '张' : 'posters' }}</small>
        </button>
        <button type="button" class="advanced-action" :disabled="!unlockedFeatures.annualReport" @click="handleAnnualReport">
          <strong>{{ isZh ? '年度报告' : 'Annual Report' }}</strong>
          <small>{{ latestAnnualReport ? latestAnnualReport.year : 'Day 365' }}</small>
        </button>
      </div>

      <div class="advanced-status-row">
        <span>{{ isZh ? '最近快照' : 'Latest shot' }}：{{ latestSnapshot?.caption || (isZh ? '还没有发布' : 'None yet') }}</span>
        <span>{{ isZh ? '收获' : 'Harvests' }}：{{ careState.harvests.length }}</span>
        <span>{{ isZh ? '串门' : 'Visits' }}：{{ careState.visits.length }}</span>
      </div>
    </section>

    <section class="sprout-panorama-section" aria-label="草团子全景小窝">
      <SproutPanoramaScene
        :unlocked="careState.habitat.panoramaUnlocked"
        :weather="careState.habitat.weather"
        :bgm="careState.habitat.bgm"
      />
    </section>

    <section class="care-card pad diary-card">
      <div class="section-title-row">
        <h2 class="care-card-title">{{ isZh ? '记忆墙' : 'Memory Wall' }}</h2>
        <button type="button" class="text-action" @click="handleWriteDiary">{{ isZh ? '写一条' : 'Write' }}</button>
      </div>
      <div v-if="memoryWall.length > 0" class="memory-wall-grid">
        <article
          v-for="memory in memoryWall"
          :key="memory.id"
          class="diary-entry memory-card"
          :class="`memory-${memory.type}`"
        >
          <img v-if="memory.image" :src="memory.image" :alt="memory.title" />
          <span>{{ memory.date }}</span>
          <strong>{{ memory.title }}</strong>
          <p>{{ memory.text }}</p>
        </article>
      </div>
      <p v-else class="empty-copy">{{ isZh ? '把一次照顾、一点心情，留给以后的自己。' : 'Leave one care moment and one feeling for your future self.' }}</p>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import homeLogo from '../../assets/home-logo-clean.png'
import SproutPanoramaScene from '../../components/home/SproutPanoramaScene.vue'
import {
  getMascotLevel,
  shouldShowReturnPrompt,
  updateStreakState,
} from '../../utils/engagement'
import {
  addSproutDiaryEntry,
  applySproutCareAction,
  buildSproutMemoryWall,
  claimDailySproutSupplyDrop,
  claimSproutMilestoneReward,
  createDefaultSproutCareState,
  craftSproutSupply,
  equipSproutAccessory,
  exchangeSproutHarvest,
  generateSproutAnnualReport,
  generateSproutDiaryPoster,
  getSproutMilestone,
  getSproutQuestProgress,
  getUnlockedSproutFeatures,
  harvestSproutGardenPlot,
  normalizeSproutCareState,
  plantSproutGardenItem,
  publishSproutHabitatSnapshot,
  recordSproutFriendVisit,
  setSproutHabitatBgm,
  unlockSproutPanorama,
  updateSproutHabitatLayout,
  updateSproutWeather,
} from '../../utils/sprout-care'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const { locale } = useI18n()
const isZh = computed(() => locale.value === 'zh-CN')

const careActions = [
  { key: 'feed', label: '喂食', enLabel: 'Feed', icon: '☀', hint: '补一点能量', enHint: 'A little energy' },
  { key: 'wash', label: '洗澡', enLabel: 'Wash', icon: '♡', hint: '清爽一下', enHint: 'Freshen up' },
  { key: 'outing', label: '出门', enLabel: 'Outing', icon: '↗', hint: '看看外面', enHint: 'Look outside' },
  { key: 'comfort', label: '互动', enLabel: 'Comfort', icon: '✦', hint: '贴贴陪伴', enHint: 'Gentle company' },
]

const streakState = ref(readJson('xinqing_engagement_state', {}))
const careState = ref(normalizeSproutCareState(readJson('xinqing_sprout_care_state', createDefaultSproutCareState())))

const mascotLevel = computed(() => getMascotLevel(streakState.value.currentStreak || 1))
const milestone = computed(() => getSproutMilestone(streakState.value.currentStreak || 1))
const unlockedFeatures = computed(() => getUnlockedSproutFeatures(streakState.value.currentStreak || 1))
const equippedAccessory = computed(() => (
  careState.value.inventory.accessories.find((item) => item.id === careState.value.equipped.accessory) || null
))
const habitatFurniture = computed(() => (
  careState.value.habitat.furniture.length > 0
    ? careState.value.habitat.furniture
    : careState.value.inventory.supplies.filter((item) => item.type === 'furniture')
))
const questProgress = computed(() => getSproutQuestProgress(careState.value))
const memoryWall = computed(() => buildSproutMemoryWall({
  careState: careState.value,
  emotionRecords: readJson('xinqing_emotion_records', []),
  treeholeEntries: readJson('xinqing_treehole_records', []),
  quoteCards: readJson('xinqing_mood_quote_cards', []),
  limit: 4,
}))
const advancedUnlockedCount = computed(() => [
  unlockedFeatures.value.crafting,
  unlockedFeatures.value.friendVisits,
  unlockedFeatures.value.freeLayout,
  unlockedFeatures.value.habitatBgm,
  unlockedFeatures.value.habitatSquare,
  unlockedFeatures.value.harvestExchange,
  unlockedFeatures.value.weatherSystem,
  unlockedFeatures.value.panorama,
  unlockedFeatures.value.diaryWall,
  unlockedFeatures.value.annualReport,
].filter(Boolean).length)
const latestVisit = computed(() => careState.value.visits[0] || null)
const latestSnapshot = computed(() => careState.value.habitat.publishedSnapshots[0] || null)
const latestAnnualReport = computed(() => careState.value.annualReports[0] || null)
const readyGardenPlots = computed(() => careState.value.garden.plots.filter((plot) => (
  plot.status !== 'harvested' && new Date(plot.readyAt).getTime() <= Date.now()
)))
const weatherLabel = computed(() => {
  const weather = careState.value.habitat.weather
  const labelMap = {
    rain: isZh.value ? '雨天' : 'Rain',
    sunny: isZh.value ? '晴天' : 'Sunny',
    cloudy: isZh.value ? '多云' : 'Cloudy',
    snow: isZh.value ? '雪天' : 'Snow',
  }
  return labelMap[weather.condition] || weather.condition
})

const currentDateText = computed(() => {
  const formatter = new Intl.DateTimeFormat(locale.value === 'zh-CN' ? 'zh-CN' : 'en-US', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
  return formatter.format(new Date())
})

const growthProgress = computed(() => {
  const current = streakState.value.currentStreak || 1
  const nextAt = milestone.value.nextAt || current
  const startAt = milestone.value.startsAt || 1
  if (nextAt <= startAt) return 100
  return Math.min(100, Math.max(8, ((current - startAt) / (nextAt - startAt)) * 100))
})

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback))
  } catch {
    return fallback
  }
}

function persistCareState() {
  localStorage.setItem('xinqing_sprout_care_state', JSON.stringify(careState.value))
}

function commitCareState(nextState, fallbackMessage = '草团子的小窝更新好了') {
  careState.value = nextState
  persistCareState()
  ElMessage.success(careState.value.moodText || fallbackMessage)
}

function handleCareAction(actionKey) {
  careState.value = applySproutCareAction(careState.value, actionKey)
  persistCareState()
  ElMessage.success('草团子收到了你的照顾')
}

function handleClaimReward() {
  const before = careState.value.claimedRewards.length
  careState.value = claimSproutMilestoneReward(careState.value, streakState.value.currentStreak || 1)
  persistCareState()
  if (careState.value.claimedRewards.length > before) {
    ElMessage.success('新的成长奖励已经放进小窝')
  } else {
    ElMessage.info('今天可领取的成长奖励已经收好')
  }
}

function handleEquipAccessory(accessoryId) {
  careState.value = equipSproutAccessory(careState.value, accessoryId)
  persistCareState()
  ElMessage.success('草团子换好了新配饰')
}

function handlePlantGarden() {
  const beforeDrops = careState.value.sunDrops
  careState.value = plantSproutGardenItem(careState.value, 'forget-worry-grass')
  persistCareState()
  if (careState.value.sunDrops < beforeDrops) {
    ElMessage.success('忘忧草已经种下')
  } else {
    ElMessage.info(careState.value.moodText)
  }
}

function handleSupplyDrop() {
  commitCareState(claimDailySproutSupplyDrop(careState.value))
}

function handleCraftSupply() {
  commitCareState(craftSproutSupply(careState.value, 'cloud-cushion'))
}

function handleFriendVisit() {
  commitCareState(recordSproutFriendVisit(careState.value, '小青芽'))
}

function handleAutoLayout() {
  const furniture = [
    ...careState.value.habitat.furniture,
    ...careState.value.inventory.supplies.filter((item) => item.type?.includes('furniture')),
  ]
  if (furniture.length === 0) {
    ElMessage.info('小窝里还没有可摆放的家具')
    return
  }

  const placements = furniture.slice(0, 4).map((item, index) => ({
    itemId: item.id,
    x: 18 + index * 22,
    y: index % 2 === 0 ? 72 : 58,
  }))
  commitCareState(updateSproutHabitatLayout(careState.value, placements))
}

function handleSetBgm() {
  const nextBgm = careState.value.habitat.bgm === 'soft-morning' ? 'rain-window' : 'soft-morning'
  commitCareState(setSproutHabitatBgm(careState.value, nextBgm))
}

function handlePublishHabitat() {
  commitCareState(publishSproutHabitatSnapshot(careState.value, '今天的小窝很柔软'))
}

function handleHarvestGarden() {
  const plot = readyGardenPlots.value[0]
  if (!plot) {
    ElMessage.info('庭院里的小芽还在慢慢长大')
    return
  }
  commitCareState(harvestSproutGardenPlot(careState.value, plot.id))
}

function handleExchangeHarvest() {
  const harvest = careState.value.harvests[0]
  if (!harvest) {
    ElMessage.info('先收获一株忘忧草吧')
    return
  }
  commitCareState(exchangeSproutHarvest(careState.value, harvest.id, 'rare-moon-chair'))
}

function handleUpdateWeather() {
  const sequence = ['sunny', 'cloudy', 'rain', 'snow']
  const currentIndex = sequence.indexOf(careState.value.habitat.weather.condition)
  const condition = sequence[(currentIndex + 1) % sequence.length]
  commitCareState(updateSproutWeather(careState.value, {
    condition,
    temperature: condition === 'snow' ? 1 : condition === 'rain' ? 21 : 25,
  }))
}

function handleUnlockPanorama() {
  commitCareState(unlockSproutPanorama(careState.value))
}

function handleGeneratePoster() {
  commitCareState(generateSproutDiaryPoster(careState.value))
}

function handleAnnualReport() {
  commitCareState(generateSproutAnnualReport(
    careState.value,
    streakState.value.currentStreak || 1,
    new Date().getFullYear()
  ))
}

async function handleWriteDiary() {
  try {
    const result = await ElMessageBox.prompt('写给草团子的一小段记忆', '记忆墙', {
      confirmButtonText: '保存',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '今天的小窝发生了什么？',
    })
    careState.value = addSproutDiaryEntry(careState.value, {
      title: '今天的小窝',
      mood: localStorage.getItem('xinqing_today_mood') || 'calm',
      content: result.value,
    })
    persistCareState()
    ElMessage.success('草团子把这段记忆收好了')
  } catch {
    // 用户取消时不提示。
  }
}

function persistEngagementState() {
  const nextState = updateStreakState(streakState.value)
  streakState.value = nextState
  localStorage.setItem('xinqing_engagement_state', JSON.stringify(nextState))

  if (shouldShowReturnPrompt(nextState)) {
    const message = locale.value === 'zh-CN'
      ? `草团子已经 ${nextState.missedDays} 天没见到你啦，今天先回来坐一小会儿。`
      : `Your mascot has missed you for ${nextState.missedDays} days. Want to start with a tiny check-in?`
    ElMessageBox.alert(message, locale.value === 'zh-CN' ? '欢迎回来' : 'Welcome back', {
      confirmButtonText: locale.value === 'zh-CN' ? '去打卡' : 'Check in',
      callback: () => router.push('/emotion'),
    })
  }

  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {})
  }
}

onMounted(() => {
  persistEngagementState()
  careState.value = claimSproutMilestoneReward(careState.value, streakState.value.currentStreak || 1)
  persistCareState()
})
</script>

<style scoped>
.home-view {
  gap: 18px;
}

.home-header {
  min-height: 80px;
  display: flex;
  align-items: flex-end;
}

.sprout-hero {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 124px;
  gap: 14px;
  min-height: 238px;
  background:
    radial-gradient(circle at 80% 18%, rgba(119, 190, 138, 0.32), transparent 36%),
    linear-gradient(145deg, #fffaf4 0%, #f5efe6 100%);
}

.sprout-hero::after {
  content: '';
  position: absolute;
  left: 22px;
  right: 22px;
  bottom: 86px;
  height: 1px;
  background: rgba(118, 95, 89, 0.12);
}

.sprout-copy {
  position: relative;
  z-index: 1;
}

.sprout-copy h2 {
  margin: 16px 0 10px;
  color: var(--color-text-primary);
  font-size: 28px;
  line-height: 1.12;
  font-weight: 900;
}

.sprout-copy p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 15px;
  line-height: 1.55;
  font-weight: 800;
}

.sprout-stage {
  width: 118px;
  height: 118px;
  align-self: center;
  justify-self: end;
  border-radius: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: color-mix(in srgb, var(--mascot-accent, var(--h5-sage)) 22%, white);
  box-shadow: inset 0 -14px 22px rgba(97, 136, 77, 0.1), 0 18px 30px rgba(75, 92, 72, 0.12);
}

.sprout-accessory-tag {
  position: absolute;
  top: 8px;
  left: 50%;
  z-index: 1;
  transform: translateX(-50%);
  max-width: 96px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  color: var(--h5-primary);
  font-size: 10px;
  line-height: 1.1;
  font-weight: 900;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sprout-image {
  width: 84px;
  filter: drop-shadow(0 12px 14px rgba(64, 99, 70, 0.18));
}

.sprout-stats {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  position: relative;
  z-index: 1;
}

.sprout-stats div {
  min-height: 68px;
  border-radius: 20px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid rgba(255, 255, 255, 0.85);
}

.sprout-stats span,
.section-title-row span {
  display: block;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 800;
}

.sprout-stats strong {
  display: block;
  margin-top: 7px;
  color: var(--color-text-primary);
  font-size: 18px;
  line-height: 1.2;
  font-weight: 900;
}

.care-actions-card {
  background: var(--h5-surface);
}

.quest-progress-card {
  background:
    radial-gradient(circle at 92% 18%, rgba(242, 199, 92, 0.2), transparent 34%),
    linear-gradient(145deg, #FFF8EF 0%, #F7FBF6 100%);
}

.quest-progress-card .section-title-row {
  align-items: flex-start;
}

.quest-progress-card .care-card-title {
  margin-top: 9px;
}

.quest-progress-card .section-title-row strong {
  color: var(--h5-primary);
  font-size: 22px;
  line-height: 1;
}

.quest-energy-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.35;
  font-weight: 900;
}

.quest-track {
  margin-top: 12px;
}

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.care-actions-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.care-action {
  min-width: 0;
  min-height: 94px;
  border: 1px solid var(--h5-border);
  border-radius: 22px;
  background: color-mix(in srgb, var(--h5-blush) 34%, white);
  color: var(--color-text-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.care-action span {
  width: 36px;
  height: 36px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--h5-primary);
  color: #fff;
  font-size: 18px;
  font-weight: 900;
}

.care-action strong {
  font-size: 14px;
  line-height: 1;
  font-weight: 900;
}

.care-action small {
  color: var(--color-text-muted);
  font-size: 11px;
  line-height: 1.2;
  font-weight: 800;
}

.growth-card {
  padding: 18px 16px;
  background: linear-gradient(135deg, rgba(221, 239, 229, 0.78), rgba(255, 250, 244, 0.92));
}

.growth-card h2 {
  margin: 8px 0 0;
  color: var(--color-text-primary);
  font-size: 20px;
  line-height: 1.28;
  font-weight: 900;
}

.progress-track {
  height: 8px;
  margin-top: 15px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(118, 95, 89, 0.12);
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
}

.companion-card,
.habitat-card,
.garden-card,
.advanced-care-card,
.diary-card {
  background: var(--h5-surface);
}

.text-action {
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--h5-primary);
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
}

.text-action:disabled {
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.inventory-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.inventory-chip {
  border: 1px solid var(--h5-border);
  border-radius: 999px;
  padding: 9px 12px;
  background: #FBF7F3;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 900;
}

.inventory-chip.active {
  border-color: rgba(217, 94, 118, 0.38);
  background: color-mix(in srgb, var(--h5-blush) 46%, white);
  color: var(--h5-primary);
}

.empty-copy {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.5;
  font-weight: 800;
}

.habitat-scene {
  min-height: 126px;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--h5-border);
  border-radius: 22px;
  padding: 16px;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  background: linear-gradient(145deg, #FFF8EF 0%, #E7F2EA 100%);
}

.habitat-scene.locked {
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
}

.habitat-scene.locked strong {
  position: relative;
  z-index: 1;
  font-size: 14px;
}

.room-floor {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 42px;
  background: rgba(201, 177, 151, 0.24);
}

.furniture-pill {
  position: relative;
  z-index: 1;
  border-radius: 16px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.72);
  color: var(--color-text-primary);
  font-size: 12px;
  font-weight: 900;
  box-shadow: 0 8px 18px rgba(89, 75, 66, 0.08);
}

.garden-plots {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.advanced-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}

.advanced-action {
  min-width: 0;
  min-height: 72px;
  border: 1px solid var(--h5-border);
  border-radius: 18px;
  padding: 10px;
  background: #FBF7F3;
  color: var(--color-text-primary);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 5px;
  text-align: left;
  cursor: pointer;
}

.advanced-action strong {
  max-width: 100%;
  color: inherit;
  font-size: 14px;
  line-height: 1.18;
  font-weight: 900;
  overflow-wrap: anywhere;
}

.advanced-action small {
  max-width: 100%;
  color: var(--color-text-muted);
  font-size: 11px;
  line-height: 1.2;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.advanced-action:disabled {
  opacity: 0.52;
  cursor: not-allowed;
}

.advanced-status-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.advanced-status-row span {
  max-width: 100%;
  border-radius: 999px;
  padding: 7px 10px;
  background: color-mix(in srgb, var(--h5-sage) 18%, white);
  color: var(--color-text-secondary);
  font-size: 11px;
  line-height: 1.2;
  font-weight: 900;
  overflow-wrap: anywhere;
}

.sprout-panorama-section {
  min-width: 0;
}

.garden-plot {
  width: calc(50% - 5px);
  min-height: 96px;
  border-radius: 20px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  background: linear-gradient(145deg, #E5F2D8, #FFF8EC);
  border: 1px solid rgba(124, 166, 99, 0.2);
}

.garden-plot span {
  width: 28px;
  height: 28px;
  border-radius: 16px 16px 18px 18px;
  background: #85BF72;
  box-shadow: 14px -5px 0 -8px #6AAE64, -12px -4px 0 -8px #9CCB7F;
}

.garden-plot strong,
.diary-entry strong {
  color: var(--color-text-primary);
  font-size: 14px;
  line-height: 1.2;
  font-weight: 900;
}

.garden-plot small,
.diary-entry span {
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 800;
}

.memory-wall-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.diary-entry {
  border-radius: 20px;
  padding: 14px;
  background: #FBF7F3;
}

.memory-card {
  min-width: 0;
  min-height: 132px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden;
}

.memory-card img {
  width: 100%;
  height: 76px;
  object-fit: cover;
  border-radius: 14px;
}

.memory-mood {
  background: #F7D8E1;
}

.memory-treehole {
  background: #F8DFD2;
}

.memory-quote {
  background: #DDEFE5;
}

.diary-entry p {
  margin: 8px 0 0;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.55;
  font-weight: 800;
}

.daily-task-card h2 {
  margin: 13px 0 8px;
  color: var(--color-text-primary);
  font-size: 22px;
  line-height: 1.22;
  font-weight: 900;
}

.daily-task-card p {
  margin: 0 0 14px;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.55;
  font-weight: 800;
}

.check-button {
  width: 100%;
}

@media (max-width: 360px) {
  .sprout-hero {
    grid-template-columns: minmax(0, 1fr) 104px;
  }

  .sprout-stage {
    width: 100px;
    height: 100px;
    border-radius: 32px;
  }

  .sprout-image {
    width: 74px;
  }

  .care-actions-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
