import { describe, expect, mock, test } from 'bun:test'
import React from 'react'
import { renderToString } from 'react-dom/server'

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockListings = {
  data: [
    {
      id: 'listing-1',
      sku: 'PD-ABC12',
      product_id: 'prod-1',
      product: { name: 'iPhone 15', brand: { name: 'Apple', slug: 'apple' } },
      condition: 'excellent',
      price_kes: 85000,
      status: 'active',
      created_at: '2025-06-01T10:00:00Z',
    },
    {
      id: 'listing-2',
      sku: 'PD-DEF34',
      product_id: 'prod-2',
      product: {
        name: 'Galaxy S24',
        brand: { name: 'Samsung', slug: 'samsung' },
      },
      condition: 'good',
      price_kes: 65000,
      status: 'sold',
      created_at: '2025-06-02T10:00:00Z',
    },
  ],
  total: 2,
  page: 1,
  totalPages: 1,
}

mock.module('@data/admin', () => ({
  getAdminListings: mock(() => Promise.resolve(mockListings)),
  getAdminProducts: mock(() =>
    Promise.resolve({
      data: [
        { id: 'prod-1', name: 'iPhone 15', brand_id: 'brand-1' },
        { id: 'prod-2', name: 'Galaxy S24', brand_id: 'brand-2' },
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
  useRouter: () => ({
    push: mock(),
    refresh: mock(),
  }),
  useSearchParams: () => new URLSearchParams(),
}))

// Import AFTER mocking
const { ListingForm } = await import('@components/admin/listingForm')
const { listingColumns } = await import('@/app/(admin)/admin/listings/columns')

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Admin Listings', () => {
  describe('ListingForm', () => {
    const mockProducts = [
      { id: 'prod-1', name: 'iPhone 15', brand_id: 'brand-1' },
      { id: 'prod-2', name: 'Galaxy S24', brand_id: 'brand-2' },
    ]

    test('renders all required form fields', () => {
      const html = renderToString(
        React.createElement(ListingForm, {
          products: mockProducts as any,
          onSubmit: mock(() => Promise.resolve()),
        })
      )

      expect(html).toContain('Product')
      expect(html).toContain('Condition')
      expect(html).toContain('Price')
    })

    test('renders optional fields', () => {
      const html = renderToString(
        React.createElement(ListingForm, {
          products: mockProducts as any,
          onSubmit: mock(() => Promise.resolve()),
        })
      )

      expect(html).toContain('Storage')
      expect(html).toContain('Color')
      expect(html).toContain('Battery Health')
      expect(html).toContain('Notes')
    })

    test('pre-fills data when editing', () => {
      const initialData = {
        id: 'listing-1',
        product_id: 'prod-1',
        storage: '256GB',
        color: 'Black',
        condition: 'excellent' as const,
        price_kes: 85000,
        status: 'active' as const,
        battery_health: 92,
        notes: 'Great condition',
      }

      const html = renderToString(
        React.createElement(ListingForm, {
          products: mockProducts as any,
          initialData: initialData as any,
          onSubmit: mock(() => Promise.resolve()),
        })
      )

      expect(html).toContain('256GB')
      expect(html).toContain('Black')
      expect(html).toContain('Great condition')
    })

    test('renders submit button', () => {
      const html = renderToString(
        React.createElement(ListingForm, {
          products: mockProducts as any,
          onSubmit: mock(() => Promise.resolve()),
        })
      )

      expect(html).toContain('button')
    })

    test('renders product select options', () => {
      const html = renderToString(
        React.createElement(ListingForm, {
          products: mockProducts as any,
          onSubmit: mock(() => Promise.resolve()),
        })
      )

      expect(html).toContain('iPhone 15')
      expect(html).toContain('Galaxy S24')
    })
  })

  describe('Listing Columns', () => {
    test('defines expected columns', () => {
      const columnIds = listingColumns.map(
        (col: any) => col.accessorKey || col.id
      )
      expect(columnIds).toContain('select')
      expect(columnIds).toContain('sku')
      expect(columnIds).toContain('product')
      expect(columnIds).toContain('condition')
      expect(columnIds).toContain('price_kes')
      expect(columnIds).toContain('status')
      expect(columnIds).toContain('created_at')
      expect(columnIds).toContain('actions')
    })

    test('has correct number of columns', () => {
      expect(listingColumns.length).toBe(8)
    })
  })
})
