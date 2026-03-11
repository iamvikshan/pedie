import { describe, expect, mock, test } from 'bun:test'

mock.module('@lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      insert: () => Promise.resolve({ error: null }),
    }),
  }),
}))

import { logAdminEvent } from '@lib/data/audit'

describe('logAdminEvent', () => {
  test('should insert admin log entry with all fields', () => {
    expect(() =>
      logAdminEvent('user-1', 'create', 'product', 'prod-1', { name: 'Test' })
    ).not.toThrow()
  })

  test('should not throw on insertion failure (fire-and-forget)', () => {
    expect(() => logAdminEvent('user-1', 'create', 'product')).not.toThrow()
  })

  test('should work with sync-type entries (backward compat)', () => {
    expect(() =>
      logAdminEvent('system', 'sync', 'sheets', undefined, { rows: 100 })
    ).not.toThrow()
  })
})
