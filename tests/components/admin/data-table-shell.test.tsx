import { describe, test, expect, mock } from 'bun:test'
import React from 'react'
import { renderToString } from 'react-dom/server'
import type { ColumnDef } from '@tanstack/react-table'

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockPush = mock(() => {})
const mockReplace = mock(() => {})

mock.module('next/navigation', () => ({
  useRouter: mock(() => ({
    push: mockPush,
    replace: mockReplace,
  })),
  usePathname: mock(() => '/admin/orders'),
  useSearchParams: mock(() => new URLSearchParams('page=1&limit=10')),
}))

// Import AFTER mocking
const { DataTableShell } = await import(
  '@components/admin/data-table-shell'
)

// ── Test Data ──────────────────────────────────────────────────────────────

interface TestRow {
  id: string
  name: string
}

/* eslint-disable @typescript-eslint/no-explicit-any */

const testColumns: ColumnDef<TestRow, unknown>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
]

const testData: TestRow[] = [
  { id: '1', name: 'Item A' },
  { id: '2', name: 'Item B' },
]

// ── Tests ──────────────────────────────────────────────────────────────────

describe('DataTableShell', () => {
  test('renders search input and table', () => {
    const html = renderToString(
      React.createElement(DataTableShell as any, {
        columns: testColumns,
        data: testData,
        totalPages: 1,
        currentPage: 1,
        searchPlaceholder: 'Search orders...',
        searchValue: '',
      })
    )

    expect(html).toContain('Search orders...')
    expect(html).toContain('Item A')
    expect(html).toContain('Item B')
  })

  test('renders pagination controls', () => {
    const html = renderToString(
      React.createElement(DataTableShell as any, {
        columns: testColumns,
        data: testData,
        totalPages: 3,
        currentPage: 2,
        perPage: 10,
      })
    )

    expect(html).toContain('Page')
    expect(html).toContain('2')
    expect(html).toContain(' of ')
    expect(html).toContain('3')
    expect(html).toContain('Previous')
    expect(html).toContain('Next')
  })

  test('renders with search value', () => {
    const html = renderToString(
      React.createElement(DataTableShell as any, {
        columns: testColumns,
        data: testData,
        totalPages: 1,
        currentPage: 1,
        searchValue: 'test query',
      })
    )

    expect(html).toContain('test query')
  })
})
