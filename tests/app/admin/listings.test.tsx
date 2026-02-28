import { describe, test, expect, mock } from 'bun:test'
import React from 'react'
import { renderToString } from 'react-dom/server'

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockListings = {
  data: [
    {
      id: 'listing-1',
      listing_id: 'PD-ABC12',
      product_id: 'prod-1',
      product: { brand: 'Apple', model: 'iPhone 15' },
      condition: 'excellent',
      price_kes: 85000,
      status: 'available',
      created_at: '2025-06-01T10:00:00Z',
    },
    {
      id: 'listing-2',
      listing_id: 'PD-DEF34',
      product_id: 'prod-2',
      product: { brand: 'Samsung', model: 'Galaxy S24' },
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

mock.module('@lib/data/admin', () => ({
  getAdminListings: mock(() => Promise.resolve(mockListings)),
  getAdminProducts: mock(() =>
    Promise.resolve({
      data: [
        { id: 'prod-1', brand: 'Apple', model: 'iPhone 15' },
        { id: 'prod-2', brand: 'Samsung', model: 'Galaxy S24' },
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
      { id: 'prod-1', brand: 'Apple', model: 'iPhone 15' },
      { id: 'prod-2', brand: 'Samsung', model: 'Galaxy S24' },
    ]

    test('renders all required form fields', () => {
      const html = renderToString(
        React.createElement(ListingForm, {
          products: mockProducts as any,
          onSubmit: mock(() => Promise.resolve()),
        })
      )

      expect(html).toContain('Product')
      expect(html).toContain('Listing ID')
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
        listing_id: 'PD-ABC12',
        product_id: 'prod-1',
        storage: '256GB',
        color: 'Black',
        condition: 'excellent' as const,
        price_kes: 85000,
        status: 'available' as const,
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

      expect(html).toContain('PD-ABC12')
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

      expect(html).toContain('Apple')
      expect(html).toContain('iPhone 15')
      expect(html).toContain('Samsung')
      expect(html).toContain('Galaxy S24')
    })
  })

  describe('Listing Columns', () => {
    test('defines expected columns', () => {
      const columnIds = listingColumns.map(
        (col: any) => col.accessorKey || col.id
      )
      expect(columnIds).toContain('select')
      expect(columnIds).toContain('listing_id')
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
