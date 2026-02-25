import { describe, test, expect, mock } from 'bun:test'
import React from 'react'
import { renderToString } from 'react-dom/server'

// ── Mocks ──────────────────────────────────────────────────────────────────

mock.module('@lib/data/admin', () => ({
  getSyncHistory: mock(() =>
    Promise.resolve([
      {
        id: 'log-1',
        triggered_by: 'admin-user-1234-abcd',
        status: 'success',
        rows_synced: 10,
        errors: null,
        started_at: '2025-06-01T10:00:00Z',
        completed_at: '2025-06-01T10:00:30Z',
      },
      {
        id: 'log-2',
        triggered_by: 'admin-user-5678-efgh',
        status: 'error',
        rows_synced: 0,
        errors: ['Failed to connect'],
        started_at: '2025-06-02T10:00:00Z',
        completed_at: '2025-06-02T10:00:05Z',
      },
    ])
  ),
}))

mock.module('next/navigation', () => ({
  useRouter: () => ({ push: mock(), refresh: mock() }),
}))

// Import AFTER mocking
const { SyncStatus } = await import('@components/admin/sync-status')
const { SyncLog } = await import('@components/admin/sync-log')

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Admin Sync', () => {
  describe('SyncStatus', () => {
    test('renders sync button and info', () => {
      const html = renderToString(React.createElement(SyncStatus))

      expect(html).toContain('Google Sheets Sync')
      expect(html).toContain('Sync Now')
    })
  })

  describe('SyncLog', () => {
    test('renders log table with entries', () => {
      const logs = [
        {
          id: 'log-1',
          triggered_by: 'admin-user-1234-abcd',
          status: 'success',
          rows_synced: 10,
          errors: null,
          started_at: '2025-06-01T10:00:00Z',
          completed_at: '2025-06-01T10:00:30Z',
        },
      ]

      const html = renderToString(
        React.createElement(SyncLog, { logs })
      )

      expect(html).toContain('Triggered By')
      expect(html).toContain('Status')
      expect(html).toContain('Rows Synced')
      expect(html).toContain('Errors')
      expect(html).toContain('Duration')
      expect(html).toContain('success')
      expect(html).toContain('10')
    })

    test('renders empty state when no logs', () => {
      const html = renderToString(
        React.createElement(SyncLog, { logs: [] })
      )

      expect(html).toContain('No sync history yet')
    })

    test('renders error status with correct badge', () => {
      const logs = [
        {
          id: 'log-2',
          triggered_by: 'admin-5678',
          status: 'error',
          rows_synced: 0,
          errors: ['Connection failed'],
          started_at: '2025-06-02T10:00:00Z',
          completed_at: '2025-06-02T10:00:05Z',
        },
      ]

      const html = renderToString(
        React.createElement(SyncLog, { logs })
      )

      expect(html).toContain('error')
      // 1 error in the errors array renders as cell content
      expect(html).toContain('>1<')
    })
  })
})
