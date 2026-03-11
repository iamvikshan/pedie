import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { calculateDiscount, formatKes } from '@helpers'
import type { Listing, ProductFamily } from '@app-types/product'
import { mockNextImage, mockNextLink, render, screen } from '../../utils'

mockNextLink()
mockNextImage()

const src = readFileSync(
  resolve('src/components/ui/productFamilyCard.tsx'),
  'utf-8'
)

describe('ProductFamilyCard Component', () => {
  test('module exports the component', async () => {
    const mod = await import('@components/ui/productFamilyCard')
    expect(mod.ProductFamilyCard).toBeDefined()
    expect(typeof mod.ProductFamilyCard).toBe('function')
  })

  test('exports PRODUCT_FAMILY_CARD_ICONS constant', async () => {
    const mod = await import('@components/ui/productFamilyCard')
    expect(mod.PRODUCT_FAMILY_CARD_ICONS).toBeDefined()
    expect(Array.isArray(mod.PRODUCT_FAMILY_CARD_ICONS)).toBe(true)
    expect(mod.PRODUCT_FAMILY_CARD_ICONS.length).toBe(2)
  })

  test('PRODUCT_FAMILY_CARD_ICONS contains expected icon names', async () => {
    const { PRODUCT_FAMILY_CARD_ICONS } =
      await import('@components/ui/productFamilyCard')
    expect(PRODUCT_FAMILY_CARD_ICONS).toContain('TbPhoto')
    expect(PRODUCT_FAMILY_CARD_ICONS).toContain('TbFlame')
  })

  // Pure logic tests
  test('calculates discount correctly', () => {
    const discount = calculateDiscount(150000, 100000)
    expect(discount).toBe(33)
  })

  test('formats price in KES', () => {
    expect(formatKes(120000)).toContain('120')
  })

  // Source analysis tests
  test('sale tier shows Flash Sale text and discount classes', () => {
    expect(src).toContain('Flash Sale')
    expect(src).toContain('text-pedie-discount')
    expect(src).toContain('TbFlame')
  })

  test('uses sale price only when it is a true discount', () => {
    expect(src).toContain('const effectivePrice = isSale')
    expect(src).toContain('? representative.sale_price_kes!')
    expect(src).toContain(': representative.price_kes')
  })

  test('sale tier does not show discounted tier', () => {
    expect(src).not.toContain("tier === 'discounted'")
  })

  test('normal tier shows single price', () => {
    expect(src).toContain('text-pedie-accent')
  })

  test('does not show "From" prefix', () => {
    expect(src).not.toContain('pricePrefix')
    expect(src).not.toContain("'From '")
    expect(src).not.toContain('hasPriceVariance')
  })

  test('links to /products/ path', () => {
    expect(src).toContain('/products/${product.slug}')
  })

  test('does not show options badge', () => {
    expect(src).not.toContain('TbStack2')
    expect(src).not.toContain('options')
  })

  test('uses ConditionBadge component', () => {
    expect(src).toContain('ConditionBadge')
    expect(src).toContain('representative.condition')
  })

  test('name-only, no brand in h3', () => {
    expect(src).toContain('const productName = product.name')
  })

  test('has aria-label for accessibility', () => {
    expect(src).toContain('aria-label')
  })

  test('uses glass rounded-lg card styling', () => {
    expect(src).toContain(
      'glass rounded-lg shadow-sm overflow-hidden transition-colors duration-300 border border-pedie-border hover:border-pedie-green/30'
    )
  })

  test('is not a client component', () => {
    expect(src).not.toContain("'use client'")
    expect(src).not.toContain('"use client"')
  })

  test('does not render specs section', () => {
    expect(src).not.toContain('representative.storage')
    expect(src).not.toContain('representative.ram')
  })

  test('images use object-contain', () => {
    expect(src).toContain('object-contain')
    expect(src).not.toContain('object-cover')
  })

  test('price section has fixed minimum height for card alignment', () => {
    expect(src).toContain('min-h-[60px]')
  })

  // Phase 6a: Card sizing tests
  test('uses rounded-lg not rounded-2xl', () => {
    expect(src).toContain('rounded-lg')
    expect(src).not.toContain('rounded-2xl')
  })

  test('uses shadow-sm not shadow-lg', () => {
    expect(src).toContain('shadow-sm')
    expect(src).not.toContain('shadow-lg')
  })

  test('image uses aspect-[3/4]', () => {
    expect(src).toContain('aspect-[3/4]')
    expect(src).not.toContain('aspect-square')
  })

  test('title uses text-sm font-semibold', () => {
    expect(src).toContain('text-sm font-semibold')
    expect(src).not.toContain('text-lg font-semibold')
  })

  test('price uses text-base font-bold', () => {
    expect(src).toContain('text-base font-bold')
    expect(src).not.toContain('text-xl font-bold')
  })

  test('title uses line-clamp-2 instead of truncate', () => {
    expect(src).toContain('line-clamp-2')
    expect(src).not.toContain('truncate')
  })
})

describe('ProductFamilyCard DOM Rendering', () => {
  const mockListing: Listing = {
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
    source_id: 'ebay123',
    source_url: 'https://ebay.com',
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
  }

  const mockFamily: ProductFamily = {
    product: {
      id: 'p1',
      name: 'iPhone 14 Pro',
      slug: 'apple-iphone-14-pro',
      brand_id: 'b1',
      description: 'Great',
      specs: null,
      key_features: null,
      images: ['/product-image.jpg'],
      is_active: true,
      created_at: '',
      updated_at: '',
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
    listings: [mockListing],
    representative: mockListing,
    variantCount: 1,
  }

  test('renders product model name', async () => {
    const { ProductFamilyCard } =
      await import('@components/ui/productFamilyCard')
    render(<ProductFamilyCard family={mockFamily} />)
    expect(screen.getByText('iPhone 14 Pro')).toBeInTheDocument()
  })

  test('renders link to /products/${slug}', async () => {
    const { ProductFamilyCard } =
      await import('@components/ui/productFamilyCard')
    render(<ProductFamilyCard family={mockFamily} />)
    const link = screen.getByRole('link', {
      name: /View iPhone 14 Pro/i,
    })
    expect(link).toHaveAttribute('href', '/products/apple-iphone-14-pro')
  })

  test('renders formatted price', async () => {
    const { ProductFamilyCard } =
      await import('@components/ui/productFamilyCard')
    render(<ProductFamilyCard family={mockFamily} />)
    const formatted = formatKes(mockListing.price_kes)
    expect(screen.getByText(formatted)).toBeInTheDocument()
  })

  test('ignores sale_price_kes when it is not lower than price_kes', async () => {
    const { ProductFamilyCard } =
      await import('@components/ui/productFamilyCard')
    render(
      <ProductFamilyCard
        family={{
          ...mockFamily,
          representative: {
            ...mockListing,
            sale_price_kes: 130000,
          },
        }}
      />
    )

    expect(
      screen.getByText(formatKes(mockListing.price_kes))
    ).toBeInTheDocument()
    expect(screen.queryByText(formatKes(130000))).not.toBeInTheDocument()
    expect(screen.queryByText('Flash Sale')).not.toBeInTheDocument()
  })
})
