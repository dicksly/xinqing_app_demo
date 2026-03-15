import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const globalCss = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8')
const appVue = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8')
const mandalaGameVue = readFileSync(new URL('../src/views/mindfulness/games/MandalaGame.vue', import.meta.url), 'utf8')
const organizeGameVue = readFileSync(new URL('../src/views/mindfulness/games/OrganizeGame.vue', import.meta.url), 'utf8')
const soapGameVue = readFileSync(new URL('../src/views/mindfulness/games/SoapGame.vue', import.meta.url), 'utf8')
const treeholeViewVue = readFileSync(new URL('../src/views/treehole/TreeholeView.vue', import.meta.url), 'utf8')
const knowledgeViewVue = readFileSync(new URL('../src/views/knowledge/KnowledgeView.vue', import.meta.url), 'utf8')
const profileViewVue = readFileSync(new URL('../src/views/profile/ProfileView.vue', import.meta.url), 'utf8')

test('dark theme uses stronger secondary text contrast tokens', () => {
  const darkBlockMatch = globalCss.match(/\.dark\s*\{([\s\S]*?)\}/)

  assert.ok(darkBlockMatch, 'expected a .dark token block in global.css')
  assert.match(darkBlockMatch[1], /--color-text-secondary:\s*#d[0-9a-f]{5}/i)
  assert.match(darkBlockMatch[1], /--color-text-muted:\s*#b[0-9a-f]{5}/i)
})

test('app shell dark mode relies on theme tokens instead of dim hardcoded nav text', () => {
  assert.doesNotMatch(appVue, /\.dark \.nav-icon,\s*[\r\n]+\s*\.dark \.nav-label\s*\{\s*color:\s*#9ca3af;/)
  assert.match(appVue, /\.dark \.nav-icon,\s*[\r\n]+\s*\.dark \.nav-label\s*\{\s*color:\s*var\(--color-text-secondary\);/)
})

test('mindfulness games avoid dim hardcoded grayscale text colors', () => {
  for (const source of [mandalaGameVue, organizeGameVue, soapGameVue]) {
    assert.doesNotMatch(source, /color:\s*#(666|888|aaa);/i)
  }
})

test('dark mode avoids fixed light placeholder surfaces in key overlays', () => {
  assert.doesNotMatch(treeholeViewVue, /border-bottom:\s*1px solid #f1f5f9;/i)
  assert.doesNotMatch(treeholeViewVue, /background:\s*#f1f5f9;/i)
  assert.doesNotMatch(mandalaGameVue, /:global\(\.dark\)[\s\S]*background:\s*rgba\(0,\s*0,\s*0,\s*0\.3\);/i)
  assert.doesNotMatch(organizeGameVue, /:global\(\.dark\)[\s\S]*background:\s*rgba\(255,\s*255,\s*255,\s*0\.05\);/i)
  assert.doesNotMatch(soapGameVue, /:global\(\.dark\)[\s\S]*background:\s*rgba\(0,\s*0,\s*0,\s*0\.3\);/i)
})

test('knowledge tabs define dark-mode tab label styling', () => {
  assert.match(knowledgeViewVue, /\.dark \.content-tabs\s*:deep\(\.el-tabs__item\)/)
})

test('profile settings dialog defines dark-mode dialog and form control styling', () => {
  assert.match(profileViewVue, /\.dark \.page-dialog\s*:deep\(\.el-dialog\)/)
  assert.match(profileViewVue, /\.dark \.page-dialog\s*:deep\(\.el-select__wrapper\)/)
  assert.match(profileViewVue, /\.dark \.page-dialog\s*:deep\(\.el-switch__core\)/)
  assert.match(profileViewVue, /<el-select[^>]*teleported=\"false\"[^>]*popper-class=\"settings-language-popper\"/s)
  assert.match(profileViewVue, /\.dark\s*:deep\(\.settings-language-popper\)/)
})
