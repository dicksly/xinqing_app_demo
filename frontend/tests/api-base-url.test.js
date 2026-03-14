import test from 'node:test'
import assert from 'node:assert/strict'

import { resolveApiBaseUrl } from '../src/api/base-url.js'

test('keeps local relative api prefix unchanged', () => {
  assert.equal(resolveApiBaseUrl(undefined), '/api/v1')
  assert.equal(resolveApiBaseUrl('/api/v1'), '/api/v1')
})

test('appends api prefix for remote backend root urls', () => {
  assert.equal(
    resolveApiBaseUrl('https://api.example.com'),
    'https://api.example.com/api/v1'
  )
})

test('does not duplicate api prefix when already present', () => {
  assert.equal(
    resolveApiBaseUrl('https://api.example.com/api/v1'),
    'https://api.example.com/api/v1'
  )
})
