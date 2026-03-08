import { describe, expect, mock, test } from 'bun:test'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Mock ProductCard and its dependencies
mock.module('next/link', () => ({
  default: mock(
    ({
      children,
      href,
      ...props
    }: {
      children: React.ReactNode
      href: string
      [key: string]: unknown
    }) => React.createElement('a', { href, ...props }, children)
  ),
}))
mock.module('next/image', () => ({
  default: mock((props: { src: string; alt: string; [key: string]: unknown }) =>
    React.createElement('img', { src: props.src, alt: props.alt })
  ),
}))

import { SimilarListings } from '@components/listing/similarListings'

const SOURCE = readFileSync(
  resolve('src/components/listing/similarListings.tsx'),
  'utf-8'
)

const mockListing = {
  id: 'uuid-1',
  sku: 'PD-SIM01',
  product_id: 'prod-1',
  condition: 'good' as const,
  price_kes: 40000,
  sale_price_kes: null,
  storage: '64GB',
  color: 'White',
  battery_health: 88,
  is_featured: false,
  listing_type: 'standard' as const,
  ram: null,
  warranty_months: null,
  attributes: null,
  includes: null,
  admin_notes: null,
  quantity: 1,
  status: 'active' as const,
  images: [],
  cost_kes: 35000,
  source: null,
  source_id: null,
  source_url: null,
  notes: null,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  product: {
    id: 'prod-1',
    name: 'iPhone 12',
    slug: 'apple-iphone-12',
    brand_id: 'b1',
    description: null,
    specs: null,
    key_features: null,
    images: null,
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    fts: null,
    brand: {
      id: 'b1',
      name: 'Apple',
      slug: 'apple',
      logo_url: null,
      website_url: null,
      is_active: true,
      sort_order: 1,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
  },
}

describe('SimilarListings', () => {
  test('renders similar listings section with heading and product cards', () => {
    const html = renderToString(
      <SimilarListings
        listings={[
          mockListing,
          {
            ...mockListing,
            id: 'uuid-2',
            sku: 'PD-SIM02',
            product: {
              ...mockListing.product,
              id: 'prod-2',
              slug: 'apple-iphone-13',
            },
          },
        ]}
      />
    )

    expect(html).toContain('Similar Products')
    expect(html).toContain('iPhone 12')
  })

  test('returns null when listings array is empty', () => {
    const html = renderToString(<SimilarListings listings={[]} />)

    expect(html).toBe('')
  })

  test('uses ProductCard instead of ProductFamilyCard', () => {
    expect(SOURCE).toContain('ProductCard')
    expect(SOURCE).not.toContain('ProductFamilyCard')
  })

  test('accepts listings prop', () => {
    expect(SOURCE).toContain('listings: ListingWithProduct[]')
  })
})
