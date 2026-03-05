import { describe, expect, mock, test } from 'bun:test'
import React from 'react'

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Mocks ──────────────────────────────────────────────────────────────────

mock.module('@data/admin', () => ({
  getAdminReviews: mock(() =>
    Promise.resolve({
      data: [
        {
          id: 'r1',
          rating: 5,
          title: 'Excellent phone!',
          product: { brand: 'Apple', model: 'iPhone 15' },
          profile: { full_name: 'Alice' },
          created_at: '2025-06-01T10:00:00Z',
        },
        {
          id: 'r2',
          rating: 3,
          title: 'Decent',
          product: { brand: 'Samsung', model: 'Galaxy S24' },
          profile: { full_name: 'Bob' },
          created_at: '2025-06-02T10:00:00Z',
        },
      ],
      total: 2,
      page: 1,
      totalPages: 1,
    })
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
const { reviewColumns } = await import('@/app/(admin)/admin/reviews/columns')

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Admin Reviews', () => {
  describe('Review Columns', () => {
    test('defines expected columns', () => {
      const columnIds = reviewColumns.map(
        (col: any) => col.accessorKey || col.id
      )
      expect(columnIds).toContain('product')
      expect(columnIds).toContain('user')
      expect(columnIds).toContain('rating')
      expect(columnIds).toContain('title')
      expect(columnIds).toContain('created_at')
      expect(columnIds).toContain('actions')
    })

    test('has correct number of columns', () => {
      expect(reviewColumns.length).toBe(6)
    })

    test('has delete action column', () => {
      const actionsCol = reviewColumns.find((col: any) => col.id === 'actions')
      expect(actionsCol).toBeDefined()
    })
  })
})
