import { describe, test, expect, mock } from 'bun:test'
import React from 'react'
import { renderToString } from 'react-dom/server'

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Mocks ──────────────────────────────────────────────────────────────────

mock.module('@lib/data/admin', () => ({
  getAdminCategories: mock(() =>
    Promise.resolve([
      {
        id: 'cat-1',
        name: 'Phones',
        slug: 'phones',
        sort_order: 1,
        parent_id: null,
      },
      {
        id: 'cat-2',
        name: 'Tablets',
        slug: 'tablets',
        sort_order: 2,
        parent_id: null,
      },
    ])
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
  useRouter: () => ({
    push: mock(),
    refresh: mock(),
  }),
  useSearchParams: () => new URLSearchParams(),
}))

// Import AFTER mocking
const { CategoryForm } = await import('@components/admin/categoryForm')
const { categoryColumns } = await import('@/app/(admin)/admin/categories/columns')

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Admin Categories', () => {
  describe('CategoryForm', () => {
    const mockCategories = [
      { id: 'cat-1', name: 'Phones', slug: 'phones' },
      { id: 'cat-2', name: 'Tablets', slug: 'tablets' },
    ]

    test('renders all required form fields', () => {
      const html = renderToString(
        React.createElement(CategoryForm, {
          categories: mockCategories as any,
          onSubmit: mock(() => Promise.resolve()),
        })
      )

      expect(html).toContain('Name')
      expect(html).toContain('Slug')
    })

    test('renders optional fields', () => {
      const html = renderToString(
        React.createElement(CategoryForm, {
          categories: mockCategories as any,
          onSubmit: mock(() => Promise.resolve()),
        })
      )

      expect(html).toContain('Parent Category')
      expect(html).toContain('Sort Order')
    })

    test('pre-fills data when editing', () => {
      const initialData = {
        id: 'cat-1',
        name: 'Phones',
        slug: 'phones',
        sort_order: 1,
        parent_id: null,
        image_url: null,
      }

      const html = renderToString(
        React.createElement(CategoryForm, {
          categories: mockCategories as any,
          initialData: initialData as any,
          onSubmit: mock(() => Promise.resolve()),
        })
      )

      expect(html).toContain('Phones')
      expect(html).toContain('phones')
    })

    test('renders submit button', () => {
      const html = renderToString(
        React.createElement(CategoryForm, {
          categories: mockCategories as any,
          onSubmit: mock(() => Promise.resolve()),
        })
      )

      expect(html).toContain('button')
    })

    test('renders parent category select options', () => {
      const html = renderToString(
        React.createElement(CategoryForm, {
          categories: mockCategories as any,
          onSubmit: mock(() => Promise.resolve()),
        })
      )

      // Should include options for parent categories
      expect(html).toContain('Phones')
      expect(html).toContain('Tablets')
    })
  })

  describe('Category Columns', () => {
    test('defines expected columns', () => {
      const columnIds = categoryColumns.map(
        (col: any) => col.accessorKey || col.id
      )
      expect(columnIds).toContain('name')
      expect(columnIds).toContain('slug')
      expect(columnIds).toContain('sort_order')
      expect(columnIds).toContain('actions')
    })

    test('has correct number of columns', () => {
      expect(categoryColumns.length).toBe(4)
    })
  })
})
