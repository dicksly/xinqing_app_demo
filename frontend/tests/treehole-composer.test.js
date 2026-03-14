import test from 'node:test'
import assert from 'node:assert/strict'

import { togglePanel } from '../src/utils/treehole-composer.js'

test('toggles a compact panel open and closed', () => {
  assert.equal(togglePanel(null, 'voice'), 'voice')
  assert.equal(togglePanel('voice', 'voice'), null)
  assert.equal(togglePanel('voice', 'image'), 'image')
})
