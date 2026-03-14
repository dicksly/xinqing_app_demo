import test from 'node:test'
import assert from 'node:assert/strict'

import { normalizeImageDataUrl } from '../src/utils/image-upload.js'

test('returns original data url when already small enough', () => {
  const dataUrl = 'data:image/png;base64,abcd'

  const result = normalizeImageDataUrl(dataUrl)

  assert.equal(result, dataUrl)
})
