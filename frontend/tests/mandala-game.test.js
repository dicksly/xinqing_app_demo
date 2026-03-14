import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(
  new URL('../src/views/mindfulness/games/MandalaGame.vue', import.meta.url),
  'utf-8'
)

test('mandala game svg uses a valid viewBox attribute', () => {
  assert.match(source, /viewBox="0 0 300 300"/)
})

test('mandala game binds circle geometry for regions', () => {
  assert.match(source, /:cx="region\.cx"/)
  assert.match(source, /:cy="region\.cy"/)
  assert.match(source, /:r="region\.r"/)
})

test('mandala game exposes palette colors to the template', () => {
  assert.match(source, /const colors = COLORS/)
})

test('mandala game provides category-based template selection', () => {
  assert.match(source, /v-model="currentCategory"/)
  assert.match(source, /const availableCategories = computed/)
  assert.match(source, /const filteredTemplates = computed/)
})

test('mandala game defines multiple coloring templates', () => {
  const templateMatches = source.match(/category:\s*'/g) || []
  assert.ok(templateMatches.length >= 8)
})
