import { describe, test, expect, mock } from 'bun:test'
import React from 'react'
import { renderToString } from 'react-dom/server'
import type { ColumnDef } from '@tanstack/react-table'

// ── Mocks ──────────────────────────────────────────────────────────────────

mock.module('next/navigation', () => ({
  useRouter: mock(() => ({
    push: mock(() => {}),
    replace: mock(() => {}),
  })),
  usePathname: mock(() => '/admin'),
  useSearchParams: mock(() => new URLSearchParams()),
}))

// Import AFTER mocking
const { DataTable } = await import('@components/admin/dataTable')
const { DataTablePagination } = await import(
  '@components/admin/dataTablePagination'
)
const { DataTableToolbar } = await import(
  '@components/admin/dataTableToolbar'
)
const { DataTableColumnHeader } = await import(
  '@components/admin/dataTableColumnHeader'
)

// ── Test Data ──────────────────────────────────────────────────────────────

interface TestRow {
  id: string
  name: string
  price: number
}

/* eslint-disable @typescript-eslint/no-explicit-any */

const testColumns: ColumnDef<TestRow, unknown>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'price',
    header: 'Price',
  },
]

const testData: TestRow[] = [
  { id: '1', name: 'Item A', price: 1000 },
  { id: '2', name: 'Item B', price: 2000 },
  { id: '3', name: 'Item C', price: 3000 },
]

// ── Tests ──────────────────────────────────────────────────────────────────

describe('DataTable', () => {
  test('renders columns and data', () => {
    const html = renderToString(
      React.createElement(DataTable as any, {
        columns: testColumns,
        data: testData,
        totalPages: 1,
        currentPage: 1,
      })
    )

    expect(html).toContain('ID')
    expect(html).toContain('Name')
    expect(html).toContain('Price')
    expect(html).toContain('Item A')
    expect(html).toContain('Item B')
    expect(html).toContain('Item C')
  })

  test('shows empty state when no data', () => {
    const html = renderToString(
      React.createElement(DataTable as any, {
        columns: testColumns,
        data: [],
        totalPages: 0,
        currentPage: 1,
      })
    )

    expect(html).toContain('No results found')
  })

  test('renders pagination controls', () => {
    const html = renderToString(
      React.createElement(DataTable as any, {
        columns: testColumns,
        data: testData,
        totalPages: 3,
        currentPage: 2,
      })
    )

    expect(html).toContain('Previous')
    expect(html).toContain('Next')
    expect(html).toContain('Page')
    expect(html).toContain('2')
    expect(html).toContain('of')
    expect(html).toContain('3')
  })

  test('column headers render', () => {
    const html = renderToString(
      React.createElement(DataTable as any, {
        columns: testColumns,
        data: testData,
      })
    )

    expect(html).toContain('ID')
    expect(html).toContain('Name')
    expect(html).toContain('Price')
  })
})

describe('DataTablePagination', () => {
  test('renders page info', () => {
    const html = renderToString(
      React.createElement(DataTablePagination, {
        currentPage: 2,
        totalPages: 5,
        perPage: 10,
        onPageChange: () => {},
        onPerPageChange: () => {},
      })
    )

    expect(html).toContain('Page')
    expect(html).toContain('2')
    expect(html).toContain('of')
    expect(html).toContain('5')
    expect(html).toContain('Previous')
    expect(html).toContain('Next')
  })

  test('renders rows per page selector', () => {
    const html = renderToString(
      React.createElement(DataTablePagination, {
        currentPage: 1,
        totalPages: 1,
        perPage: 10,
        onPageChange: () => {},
        onPerPageChange: () => {},
      })
    )

    expect(html).toContain('Rows per page')
    expect(html).toContain('10')
    expect(html).toContain('20')
    expect(html).toContain('50')
  })
})

describe('DataTableToolbar', () => {
  test('renders search input', () => {
    const html = renderToString(
      React.createElement(DataTableToolbar, {
        searchValue: '',
        searchPlaceholder: 'Search products...',
        onSearchChange: () => {},
      })
    )

    expect(html).toContain('Search products...')
  })

  test('renders filter dropdowns', () => {
    const html = renderToString(
      React.createElement(DataTableToolbar, {
        searchValue: '',
        onSearchChange: () => {},
        filters: [
          {
            key: 'status',
            label: 'Status',
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Sold', value: 'sold' },
            ],
          },
        ],
        filterValues: {},
        onFilterChange: () => {},
      })
    )

    expect(html).toContain('Status')
    expect(html).toContain('Active')
    expect(html).toContain('Sold')
  })

  test('renders bulk actions when items selected', () => {
    const html = renderToString(
      React.createElement(DataTableToolbar, {
        searchValue: '',
        onSearchChange: () => {},
        selectedCount: 3,
        bulkActions: [{ label: 'Delete', onClick: () => {} }],
      })
    )

    expect(html).toContain('3')
    expect(html).toContain('selected')
    expect(html).toContain('Delete')
  })
})

describe('DataTableColumnHeader', () => {
  test('renders title', () => {
    const html = renderToString(
      React.createElement(DataTableColumnHeader, {
        title: 'Product Name',
      })
    )

    expect(html).toContain('Product Name')
  })

  test('renders sort indicator when sortable', () => {
    const html = renderToString(
      React.createElement(DataTableColumnHeader, {
        title: 'Price',
        sortKey: 'price',
      })
    )

    expect(html).toContain('Price')
    expect(html).toContain('↕')
  })

  test('renders ascending arrow when sorted asc', () => {
    const html = renderToString(
      React.createElement(DataTableColumnHeader, {
        title: 'Price',
        sortKey: 'price',
        currentSort: 'price',
        currentDirection: 'asc',
      })
    )

    expect(html).toContain('↑')
  })

  test('renders descending arrow when sorted desc', () => {
    const html = renderToString(
      React.createElement(DataTableColumnHeader, {
        title: 'Price',
        sortKey: 'price',
        currentSort: 'price',
        currentDirection: 'desc',
      })
    )

    expect(html).toContain('↓')
  })
})
