import { describe, test, expect, mock } from 'bun:test'
import React from 'react'
import { renderToString } from 'react-dom/server'

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Mocks ──────────────────────────────────────────────────────────────────

mock.module('@lib/data/admin', () => ({
  getNewsletterSubscribers: mock(() =>
    Promise.resolve({
      data: [
        {
          id: 'sub-1',
          email: 'alice@example.com',
          subscribed_at: '2025-06-01T10:00:00Z',
        },
        {
          id: 'sub-2',
          email: 'bob@example.com',
          subscribed_at: '2025-06-02T10:00:00Z',
        },
      ],
      total: 2,
      page: 1,
      totalPages: 1,
    })
  ),
  exportNewsletterCSV: mock(() =>
    Promise.resolve(
      'email,subscribed_at\nalice@example.com,2025-06-01T10:00:00Z'
    )
  ),
}))

mock.module('next/link', () => ({
  default: mock(({ children, href, ...props }: Record<string, unknown>) =>
    React.createElement(
      'a',
      { href: href as string, ...props },
      children as React.ReactNode
    )
  ),
}))

mock.module('next/navigation', () => ({
  useRouter: () => ({ push: mock(), refresh: mock() }),
  useSearchParams: () => new URLSearchParams(),
}))

// Import AFTER mocking
const { newsletterColumns } = await import(
  '@/app/(admin)/admin/newsletter/columns'
)
const { NewsletterExportButton } = await import(
  '@components/admin/newsletterExportButton'
)

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Admin Newsletter', () => {
  describe('Newsletter Columns', () => {
    test('defines expected columns', () => {
      const columnIds = newsletterColumns.map(
        (col: any) => col.accessorKey || col.id
      )
      expect(columnIds).toContain('email')
      expect(columnIds).toContain('subscribed_at')
    })

    test('has correct number of columns', () => {
      expect(newsletterColumns.length).toBe(2)
    })
  })

  describe('NewsletterExportButton', () => {
    test('renders export CSV button', () => {
      const html = renderToString(
        React.createElement(NewsletterExportButton)
      )

      expect(html).toContain('Export CSV')
      expect(html).toContain('button')
    })
  })
})
