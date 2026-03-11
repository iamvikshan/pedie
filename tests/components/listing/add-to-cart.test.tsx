import { describe, expect, test, mock } from 'bun:test'
import React from 'react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { ListingWithProduct } from '@app-types/product'
import { mockNextLink, render, screen } from '../../utils'

mockNextLink()

mock.module('@components/listing/referralCta', () => ({
  ReferralCta: () => <div data-testid='referral-cta'>ReferralCta</div>,
}))

const { AddToCart } = await import('@components/listing/addToCart')

const src = readFileSync(
  resolve('src/components/listing/addToCart.tsx'),
  'utf-8'
)

describe('AddToCart Component', () => {
  test('checks cart membership by internal listing id', () => {
    expect(src).toContain('useCartStore(s => s.hasListing(listing.id))')
  })

  test('standard listing renders Add to Cart text', () => {
    expect(src).toContain(
      "listing.listing_type === 'preorder' ? 'Preorder Now' : 'Add to Cart'"
    )
  })

  test('sold out listing renders Sold Out button', () => {
    expect(src).toContain('Sold Out')
    expect(src).toContain("listing.status === 'sold'")
  })

  test('affiliate listing renders external link', () => {
    expect(src).toContain(
      "listing.listing_type === 'affiliate' && listing.source_url"
    )
    expect(src).toContain("target='_blank'")
    expect(src).toContain("rel='noopener noreferrer'")
  })

  test('preorder listing renders Preorder Now text', () => {
    expect(src).toContain("'Preorder Now'")
  })

  test('affiliate without source_url renders Unavailable button', () => {
    expect(src).toContain("listing.listing_type === 'affiliate'")
    expect(src).toContain('Unavailable')
  })

  test('referral listing renders ReferralCta component', () => {
    expect(src).toContain("listing.listing_type === 'referral'")
    expect(src).toContain('ReferralCta')
  })

  test('imports ReferralCta component', () => {
    expect(src).toContain(
      "import { ReferralCta } from '@components/listing/referralCta'"
    )
  })
})

describe('AddToCart DOM Rendering', () => {
  const baseListing: ListingWithProduct = {
    id: '1',
    sku: 'PD-12345',
    product_id: 'p1',
    storage: '256GB',
    color: 'Space Black',
    condition: 'excellent',
    battery_health: 95,
    price_kes: 120000,
    sale_price_kes: null,
    cost_kes: 110000,
    source: 'eBay',
    source_id: null,
    source_url: null,
    images: ['/listing-image.jpg'],
    is_featured: true,
    listing_type: 'standard',
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
      id: 'p1',
      name: 'iPhone 14 Pro',
      slug: 'apple-iphone-14-pro',
      brand_id: 'b1',
      description: 'Great phone',
      specs: null,
      key_features: null,
      images: ['/product-image.jpg'],
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
        created_at: '',
        updated_at: '',
      },
    },
  }

  test('renders "Add to Cart" for standard listing', () => {
    render(<AddToCart listing={baseListing} />)
    expect(
      screen.getByRole('button', { name: /Add to Cart/i })
    ).toBeInTheDocument()
  })

  test('renders "Sold Out" for sold listing', () => {
    const soldListing: ListingWithProduct = {
      ...baseListing,
      status: 'sold',
    }
    render(<AddToCart listing={soldListing} />)
    expect(
      screen.getByRole('button', { name: /Sold Out/i })
    ).toBeInTheDocument()
  })

  test('renders "Preorder Now" for preorder listing', () => {
    const preorderListing: ListingWithProduct = {
      ...baseListing,
      listing_type: 'preorder',
    }
    render(<AddToCart listing={preorderListing} />)
    expect(
      screen.getByRole('button', { name: /Preorder Now/i })
    ).toBeInTheDocument()
  })

  test('renders affiliate link for affiliate listing with source_url', () => {
    const affiliateListing: ListingWithProduct = {
      ...baseListing,
      listing_type: 'affiliate',
      source_url: 'https://partner.com/product',
    }
    render(<AddToCart listing={affiliateListing} />)
    const link = screen.getByRole('link', { name: /View on Partner Site/i })
    expect(link).toHaveAttribute('href', 'https://partner.com/product')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  test('renders "Unavailable" for affiliate without source_url', () => {
    const affiliateNoUrl: ListingWithProduct = {
      ...baseListing,
      listing_type: 'affiliate',
      source_url: null,
    }
    render(<AddToCart listing={affiliateNoUrl} />)
    expect(
      screen.getByRole('button', { name: /Unavailable/i })
    ).toBeInTheDocument()
  })

  test('renders ReferralCta for referral listing with source_url', () => {
    const referralListing: ListingWithProduct = {
      ...baseListing,
      listing_type: 'referral',
      source_url: 'https://example.com',
    }
    render(<AddToCart listing={referralListing} />)
    expect(screen.getByTestId('referral-cta')).toBeInTheDocument()
  })
})
