import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const readSource = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')
const readOptionalSource = (path) => {
  const fileUrl = new URL(path, import.meta.url)
  return existsSync(fileUrl) ? readFileSync(fileUrl, 'utf8') : ''
}

const appVue = readSource('../src/App.vue')
const globalCss = readSource('../src/styles/global.css')
const routerSource = readSource('../src/router/index.js')
const homeView = readSource('../src/views/home/HomeView.vue')
const sproutPanoramaScene = readSource('../src/components/home/SproutPanoramaScene.vue')
const emotionView = readSource('../src/views/emotion/EmotionView.vue')
const mindfulnessView = readSource('../src/views/mindfulness/MindfulnessView.vue')
const treeholeView = readSource('../src/views/treehole/TreeholeView.vue')
const knowledgeView = readSource('../src/views/knowledge/KnowledgeView.vue')
const knowledgeLocalView = readOptionalSource('../src/views/knowledge/KnowledgeLocalView.vue')
const knowledgeExternalView = readOptionalSource('../src/views/knowledge/KnowledgeExternalView.vue')
const profileView = readSource('../src/views/profile/ProfileView.vue')

test('app shell uses five bottom tabs and moves profile to top controls', () => {
  const navItemsMatch = appVue.match(/const navItems = computed\(\(\) => \[([\s\S]*?)\]\)/)

  assert.ok(navItemsMatch, 'expected a navItems computed array')
  assert.equal((navItemsMatch[1].match(/path:/g) || []).length, 5)
  assert.doesNotMatch(navItemsMatch[1], /\/profile/)
  assert.match(navItemsMatch[1], /label:\s*t\('nav\.knowledge'\)/)
  assert.match(appVue, /class="control-btn profile-entry"/)
  assert.match(appVue, /t\('nav\.profileShort'\)/)
  assert.match(appVue, /t\('theme\.lightShort'\)/)
  assert.match(appVue, /t\('theme\.darkShort'\)/)
  assert.match(appVue, /router\.push\('\/profile'\)/)
})

test('bottom nav emotion icon uses corrected artwork crop', () => {
  assert.match(appVue, /class="image2-icon nav-image-icon"/)
  assert.match(appVue, /iconClass:\s*'emotion-nav-icon'/)
  assert.match(appVue, /emotionIconStyle/)
  assert.match(appVue, /'--nav-icon-x':\s*'-2px'/)
  assert.match(appVue, /'--nav-icon-y':\s*'0px'/)
  assert.match(appVue, /'--nav-icon-scale':\s*'1\.08'/)
  assert.match(appVue, /\.nav-item \.emotion-nav-icon \{[\s\S]*clip-path:\s*inset\(0 0 0 10%\)/)
})

test('bottom nav treehole icon uses corrected artwork crop', () => {
  const treeholeItemStart = appVue.indexOf("path: '/treehole'")
  const treeholeItemEnd = appVue.indexOf("path: '/knowledge'", treeholeItemStart)
  const treeholeItem = appVue.slice(treeholeItemStart, treeholeItemEnd)

  assert.notEqual(treeholeItemStart, -1, 'expected a treehole nav item')
  assert.match(treeholeItem, /iconClass:\s*'treehole-nav-icon'/)
  assert.match(treeholeItem, /'--nav-icon-x':\s*'3px'/)
  assert.match(treeholeItem, /'--nav-icon-y':\s*'0px'/)
  assert.match(treeholeItem, /'--nav-icon-scale':\s*'1\.08'/)
})

test('frontend references bundled image-2 icon assets', () => {
  assert.match(appVue + homeView + emotionView + mindfulnessView + treeholeView + knowledgeView, /assets\/icons\/image2-/)
  assert.match(globalCss, /--h5-primary:\s*#D95E76/i)
  assert.match(globalCss, /\.image2-icon/)
})

test('home page matches the approved daily-care dashboard', () => {
  assert.match(homeView, /烦恼小芽成长计划/)
  assert.match(homeView, /阳光露珠/)
  assert.match(homeView, /喂食/)
  assert.match(homeView, /洗澡/)
  assert.match(homeView, /出门/)
  assert.match(homeView, /互动/)
  assert.match(homeView, /连续陪伴/)
  assert.doesNotMatch(homeView, /home-shortcuts/)
  assert.doesNotMatch(homeView, /title:\s*'情绪记录'/)
  assert.doesNotMatch(homeView, /title:\s*'开始正念'/)
  assert.doesNotMatch(homeView, /title:\s*'写给树洞'/)
})

test('home companion care actions are local-first and route to daily task', () => {
  assert.match(homeView, /applySproutCareAction/)
  assert.match(homeView, /getSproutQuestProgress/)
  assert.match(homeView, /xinqing_sprout_care_state/)
  assert.match(homeView, /router\.push\('\/emotion'\)/)
})

test('home page moves daily healing task above care quest and adds memory wall aggregation', () => {
  const heroIndex = homeView.indexOf('sprout-hero')
  const taskIndex = homeView.indexOf('daily-task-card')
  const careIndex = homeView.indexOf('care-actions-card')

  assert.ok(heroIndex > -1, 'expected hero section')
  assert.ok(taskIndex > heroIndex, 'daily task should be after hero')
  assert.ok(careIndex > taskIndex, 'care actions should come after daily task')
  assert.match(homeView, /quest-progress-card/)
  assert.match(homeView, /questProgress\.percent/)
  assert.match(homeView, /memory-wall-grid/)
  assert.match(homeView, /buildSproutMemoryWall/)
  assert.match(homeView, /xinqing_treehole_records/)
  assert.match(homeView, /xinqing_mood_quote_cards/)
})

test('home companion uses a single mascot artwork without an emoji face overlay', () => {
  assert.match(homeView, /<img :src="homeLogo" alt="草团子" class="sprout-image" \/>/)
  assert.doesNotMatch(homeView, /class="sprout-face"/)
  assert.doesNotMatch(homeView, /\.sprout-face/)
  assert.doesNotMatch(homeView, /mascotMood\.emoji/)
})

test('home page includes a Three.js sprout panorama scene', () => {
  assert.match(homeView, /SproutPanoramaScene/)
  assert.match(homeView, /sprout-panorama-section/)
  assert.match(sproutPanoramaScene, /import\('three'\)/)
  assert.match(sproutPanoramaScene, /<canvas/)
  assert.match(sproutPanoramaScene, /WebGLRenderer/)
})

test('emotion page keeps check-in behavior in the redesigned ritual layout', () => {
  assert.match(emotionView, /t\('emotion\.title'\)/)
  assert.match(emotionView, /t\('emotion\.basicStatus'\)/)
  assert.match(emotionView, /t\('emotion\.happyMoment'\)/)
  assert.match(emotionView, /Save Today/)
  assert.match(emotionView, /日签语录/)
  assert.match(emotionView, /保存日签/)
  assert.match(emotionView, /分享/)
  assert.match(emotionView, /quoteCardVisible/)
  assert.match(emotionView, /handleSubmit/)
})

test('emotion and mindfulness records include stable beta client id for backend isolation', () => {
  assert.match(emotionView, /getXinqingClientId/)
  assert.match(emotionView, /clientId:\s*getXinqingClientId\(\)/)
  assert.match(emotionView, /fetchWeeklyReport\(\{\s*clientId:\s*getXinqingClientId\(\)\s*\}\)/)
  assert.match(mindfulnessView, /getXinqingClientId/)
  assert.match(mindfulnessView, /clientId:\s*getXinqingClientId\(\)/)
})

test('emotion detailed assessment uses the configurable question source', () => {
  assert.match(emotionView, /getAssessmentQuestions/)
  assert.match(emotionView, /getAssessmentCategories/)
  assert.match(emotionView, /getAssessmentResponseOptions/)
  assert.match(emotionView, /createAssessmentAnswers/)
  assert.match(emotionView, /assessmentCategories/)
  assert.match(emotionView, /assessmentResponseOptions/)
  assert.match(emotionView, /category\.questions/)
  assert.doesNotMatch(emotionView, /const assessmentQuestions = computed\(\(\) => \[\s*\{/)
})

test('mindfulness page exposes practice player, breathing entry, and games', () => {
  assert.match(mindfulnessView, /min quiet practice/)
  assert.match(mindfulnessView, /\[5,\s*10,\s*20\]/)
  assert.match(mindfulnessView, /currentMonthlyTheme\.cover_image/)
  assert.match(mindfulnessView, /openThemeSource/)
  assert.match(mindfulnessView, /4-7-8 Breathing/)
  assert.match(mindfulnessView, /消消乐/)
  assert.match(mindfulnessView, /切水果/)
  assert.doesNotMatch(mindfulnessView, /泡泡/)
  assert.match(mindfulnessView, /startMeditation/)
  assert.match(mindfulnessView, /toggleBreathing/)
})

test('mindfulness page hides unresolved external game placeholders from public beta UI', () => {
  assert.match(mindfulnessView, /audioFallbackTheme/)
  assert.match(mindfulnessView, /source-player-panel/)
  assert.match(mindfulnessView, /openThemeSourcePlayer/)
  assert.match(mindfulnessView, /EXTERNAL_MINI_GAMES/)
  assert.match(mindfulnessView, /availableExternalGameLinks/)
  assert.match(mindfulnessView, /externalGameLinks\.value\.filter\(\(game\) => !game\.needsProvidedLink\)/)
  assert.match(mindfulnessView, /v-if="availableExternalGameLinks\.length"/)
})

test('mindfulness playback does not fail on missing voice or session tracking errors', () => {
  assert.doesNotMatch(mindfulnessView, /\/audio\/meditation\/voice\/stress\.mp3/)
  assert.match(mindfulnessView, /function recordMindfulnessSession\(\)/)
  assert.match(mindfulnessView, /console\.warn\('记录冥想会话失败/)
  assert.match(mindfulnessView, /void recordMindfulnessSession\(\)/)
})

test('mindfulness page removes the unused voice volume control', () => {
  assert.doesNotMatch(mindfulnessView, /t\('mindfulness\.voice'\)/)
  assert.doesNotMatch(mindfulnessView, /v-model="voiceVolume"/)
  assert.doesNotMatch(mindfulnessView, /const voiceVolume = ref/)
  assert.doesNotMatch(mindfulnessView, /watch\(voiceVolume/)
})

test('treehole page exposes safe composer, privacy controls, and square feed', () => {
  assert.match(treeholeView, /t\('treehole\.title'\)/)
  assert.match(treeholeView, /t\('treehole\.placeholder'\)/)
  assert.match(treeholeView, /t\('treehole\.sendToTreehole'\)/)
  assert.match(treeholeView, /t\('treehole\.squareTitle'\)/)
  assert.match(treeholeView, /点赞/)
  assert.match(treeholeView, /评论/)
  assert.match(treeholeView, /回复/)
  assert.match(treeholeView, /detectTreeholeSensitivity/)
  assert.match(treeholeView, /xinqing_treehole_interactions/)
  assert.match(treeholeView, /hasLocalEntry/)
  const localFallbackStart = treeholeView.indexOf('Saved locally!')
  const localFallbackEnd = treeholeView.indexOf('} finally', localFallbackStart)
  const localFallbackBlock = treeholeView.slice(localFallbackStart, localFallbackEnd)
  assert.match(localFallbackBlock, /loadEntries\(\)/)
  assert.match(localFallbackBlock, /entryForm\.value = \{[\s\S]*content:\s*''/)
  assert.match(treeholeView, /handleSubmit/)
})

test('treehole creates and deletes entries with owner client id', () => {
  assert.match(treeholeView, /clientId:\s*getTreeholeClientId\(\)/)
  assert.match(treeholeView, /treeholeApi\.delete\(entryId,\s*\{\s*clientId:\s*getTreeholeClientId\(\)\s*\}\)/)
})

test('treehole voice recordings are submitted as persistent audio data', () => {
  assert.match(treeholeView, /voiceData/)
  assert.match(treeholeView, /voiceData:\s*hasVoice\s*\?\s*recordedVoiceData/)
  assert.doesNotMatch(treeholeView, /voice_url:\s*hasVoice\s*\?\s*voiceBlobUrl\.value/)
})

test('knowledge page exposes editorial hub while preserving content actions', () => {
  assert.match(knowledgeView, /知识充电站/)
  assert.match(knowledgeView, /晨曦语录/)
  assert.match(knowledgeView, /先看一点轻内容/)
  assert.match(knowledgeView, /测试你的恢复能量/)
  assert.match(knowledgeView, /SBTI_TEST/)
  assert.match(knowledgeView, /openContentSource/)
  assert.match(knowledgeView, /source_url/)
  assert.match(knowledgeView, /item\.thumbnail_url/)
  assert.match(knowledgeView, /article\.cover_image/)
  assert.match(knowledgeView, /viewContent/)
  assert.match(knowledgeView, /startTest/)
})

test('knowledge page surfaces all prepared videos and articles in the redesigned view', () => {
  assert.match(knowledgeView, /prepared-materials-section/)
  assert.match(knowledgeView, /full-video-list/)
  assert.match(knowledgeView, /full-article-list/)
  assert.match(knowledgeView, /preparedMaterialSummary/)
  assert.match(knowledgeView, /videoContent\.length/)
  assert.match(knowledgeView, /articles\.length/)
})

test('knowledge source links open inside an in-app embedded reader', () => {
  assert.match(routerSource, /path:\s*'\/knowledge\/external'/)
  assert.match(routerSource, /KnowledgeExternalView\.vue/)
  assert.match(knowledgeView, /useRouter/)
  assert.match(knowledgeView, /router\.push\(\{[\s\S]*name:\s*'KnowledgeExternal'/)
  assert.doesNotMatch(knowledgeView, /window\.open/)
  assert.match(knowledgeExternalView, /<iframe/)
  assert.match(knowledgeExternalView, /external-frame/)
  assert.match(knowledgeExternalView, /openOriginal/)
  assert.match(knowledgeExternalView, /route\.query\.url/)
})

test('knowledge articles expose backend TTS read-aloud controls', () => {
  assert.match(knowledgeView, /knowledgeApi\.synthesizeSpeech/)
  assert.match(knowledgeView, /buildDialogKnowledgeSpeechText/)
  assert.match(knowledgeView, /contentTtsAudioRef/)
  assert.match(knowledgeView, /朗读内容/)
  assert.match(knowledgeLocalView, /knowledgeApi\.synthesizeSpeech/)
  assert.match(knowledgeLocalView, /buildLocalKnowledgeSpeechText/)
  assert.match(knowledgeLocalView, /ttsAudioRef/)
  assert.match(knowledgeLocalView, /朗读文章/)
})

test('profile settings hides admin entry and exposes font sizing controls', () => {
  assert.doesNotMatch(profileView, /class="menu-item touchable" @click="openPage\('admin'\)"/)
  assert.match(profileView, /settings-admin-entry/)
  assert.match(profileView, /openAdminConsole/)
  assert.match(profileView, /字号/)
  assert.match(profileView, /fontSizeScale/)
  assert.match(profileView, /applyFontScale/)
  assert.match(appVue, /xinqing_settings/)
  assert.match(appVue, /fontScale/)
  assert.match(globalCss, /data-font-scale/)
})
