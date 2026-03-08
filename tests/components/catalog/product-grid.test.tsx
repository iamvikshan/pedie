import { describe, expect, test } from 'bun:test'
import type { ListingWithProduct } from '@app-types/product'
import { ProductGrid } from '@components/catalog/productGrid'
import React from 'react'
import { mockNextLink, mockNextImage, render, screen } from '../../utils'

mockNextLink()
mockNextImage()

const mockListings: ListingWithProduct[] = [
  {
    id: '1',
    sku: 'LST-001',
    product_id: 'PROD-001',
    storage: '128GB',
    color: 'Black',
    condition: 'excellent',
    battery_health: 95,
    price_kes: 50000,
    sale_price_kes: null,
    cost_kes: 40000,
    source: 'eBay',
    source_id: 'EBAY-001',
    source_url: 'https://ebay.com/1',
    images: ['/img1.jpg'],
    is_featured: false,
    listing_type: 'standard' as const,
    ram: null,
    warranty_months: null,
    attributes: null,
    includes: null,
    admin_notes: null,
    quantity: 1,
    status: 'active',
    notes: null,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    product: {
      id: 'PROD-001',
      name: 'iPhone 12',
      slug: 'apple-iphone-12',
      brand_id: 'b1',
      description: 'A great phone',
      specs: null,
      key_features: null,
      images: ['/img1.jpg'],
      is_active: true,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      fts: null,
      brand: {
        id: 'b1',
        name: 'Apple',
        slug: 'apple',
        logo_url: null,
        website_url: null,
        is_active: true,
        sort_order: 1,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
    },
  },
]

describe('ProductGrid', () => {
  test('renders ProductCard for each listing', () => {
    render(<ProductGrid listings={mockListings} />)

    expect(screen.getByText('iPhone 12')).toBeInTheDocument()
    expect(screen.getByText(/50,000/)).toBeInTheDocument()
  })

  test('shows empty state when no listings', () => {
    render(<ProductGrid listings={[]} />)

    expect(screen.getByText('No products found')).toBeInTheDocument()
    expect(
      screen.getByText(/couldn't find any products matching/)
    ).toBeInTheDocument()
  })
})
