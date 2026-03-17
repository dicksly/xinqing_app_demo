import test from 'node:test'
import assert from 'node:assert/strict'

import { getAdminEntryTarget } from '../src/utils/admin-entry.js'

test('routes anonymous users to admin login', () => {
  assert.equal(getAdminEntryTarget(false), '/admin/login')
})

test('routes authenticated admins to admin content page', () => {
  assert.equal(getAdminEntryTarget(true), '/admin/content')
})
