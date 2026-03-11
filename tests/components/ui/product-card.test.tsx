import { describe, expect, test } from 'bun:test'
import type { ListingWithProduct } from '@app-types/product'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { calculateDiscount, formatKes } from '@helpers'
import { mockNextImage, mockNextLink, render, screen } from '../../utils'

mockNextLink()
mockNextImage()

const src = readFileSync(resolve('src/components/ui/productCard.tsx'), 'utf-8')

describe('ProductCard Component', () => {
  const mockListing: ListingWithProduct = {
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
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
    },
  }

  // Pure logic tests
  test('calculates discount correctly', () => {
    const discount = calculateDiscount(150000, 100000)
    expect(discount).toBe(33)
  })

  test('formats price in KES', () => {
    expect(formatKes(mockListing.price_kes)).toContain('120')
  })

  // Source analysis tests
  test('wraps entire card in Link or a (not stretched overlay)', () => {
    expect(src).not.toContain('absolute inset-0 z-0')
    expect(src).not.toContain('sr-only')
  })

  test('does not contain Add-to-Cart button', () => {
    expect(src).not.toContain('Add to Cart')
    expect(src).not.toContain('TbShoppingCartPlus')
    expect(src).not.toContain('useCartStore')
    expect(src).not.toContain('In Cart')
  })

  test('does not display listing ID on card', () => {
    expect(src).not.toContain('>{listing.listing_id}<')
  })

  test('is not a client component', () => {
    expect(src).not.toContain("'use client'")
    expect(src).not.toContain('"use client"')
  })

  test('sale tier shows discount pill and crossed-out price', () => {
    expect(src).toContain("tier === 'sale'")
    expect(src).toContain('line-through')
    expect(src).toContain('text-pedie-discount')
  })

  test('exports PRODUCT_CARD_ICONS constant', async () => {
    const mod = await import('@components/ui/productCard')
    expect(mod.PRODUCT_CARD_ICONS).toBeDefined()
    expect(Array.isArray(mod.PRODUCT_CARD_ICONS)).toBe(true)
    expect(mod.PRODUCT_CARD_ICONS.length).toBe(4)
  })

  test('PRODUCT_CARD_ICONS contains expected icon names', async () => {
    const { PRODUCT_CARD_ICONS } = await import('@components/ui/productCard')
    expect(PRODUCT_CARD_ICONS).toContain('TbExternalLink')
    expect(PRODUCT_CARD_ICONS).toContain('TbPhoto')
    expect(PRODUCT_CARD_ICONS).toContain('TbFlame')
    expect(PRODUCT_CARD_ICONS).not.toContain('TbBolt')
  })

  // NEW TESTS
  test('name-only, no brand', () => {
    expect(src).toContain('const productName = product.name')
    expect(src).not.toContain('${product.brand} ${product.name}')
    expect(src).toContain('line-clamp-2')
  })

  test('does not render specs/storage/RAM section', () => {
    expect(src).not.toContain(
      'listing.storage && <span>{listing.storage}</span>'
    )
    expect(src).not.toContain('listing.ram && <span>{listing.ram}</span>')
    expect(src).not.toContain('listing.color')
  })

  test('images use object-contain', () => {
    expect(src).toContain('object-contain')
    expect(src).not.toContain('object-cover')
  })

  test('price section has fixed minimum height for card alignment', () => {
    expect(src).toContain('min-h-[60px]')
  })

  test('sale tier has stacked pricing (price on top, strikethrough below)', () => {
    // Check that there is stacked pricing visually / structurally
    expect(src).toContain('flex flex-col')
    expect(src).toContain('line-through')
  })

  test('affiliate listing links to source_url with target=_blank', () => {
    expect(src).toContain("target: '_blank'")
    expect(src).toContain("rel: 'noopener noreferrer'")
    expect(src).toContain('listing.source_url')
    // Affiliate requires both listing_type === 'affiliate' AND source_url
    expect(src).toContain(
      "listing.listing_type === 'affiliate' && listing.source_url"
    )
  })

  test('affiliate listing has "Partner" badge', () => {
    expect(src).toContain('Partner')
    expect(src).toContain('TbExternalLink')
  })

  test('affiliate Partner badge has tooltip', () => {
    expect(src).toContain("title='Sold by an external partner'")
  })

  test('affiliate shows pricing like any other tier (no special text)', () => {
    expect(src).not.toContain('View on Partner Site')
  })

  test('affiliate does not show condition badge', () => {
    expect(src).toContain('!isAffiliate')
  })

  test('referral listing has "Referral" badge with WhatsApp icon', () => {
    expect(src).toContain('Referral')
    expect(src).toContain('TbBrandWhatsapp')
    expect(src).toContain('isReferral')
  })

  test('referral badge has tooltip', () => {
    expect(src).toContain("title='Ask about this product on WhatsApp'")
  })

  test('referral does not show condition badge', () => {
    expect(src).toContain('!isReferral')
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
})

describe('ProductCard DOM Rendering', () => {
  const mockListing: ListingWithProduct = {
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
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
    },
  }

  test('renders product model name', async () => {
    const { ProductCard } = await import('@components/ui/productCard')
    render(<ProductCard listing={mockListing} />)
    expect(screen.getByText('iPhone 14 Pro')).toBeInTheDocument()
  })

  test('renders formatted price', async () => {
    const { ProductCard } = await import('@components/ui/productCard')
    render(<ProductCard listing={mockListing} />)
    const formatted = formatKes(mockListing.price_kes)
    expect(screen.getByText(formatted)).toBeInTheDocument()
  })

  test('renders as link with correct href', async () => {
    const { ProductCard } = await import('@components/ui/productCard')
    render(<ProductCard listing={mockListing} />)
    const link = screen.getByRole('link', { name: /View iPhone 14 Pro/i })
    expect(link).toHaveAttribute('href', '/listings/1')
  })

  test('returns null when product is missing', async () => {
    const { ProductCard } = await import('@components/ui/productCard')
    const listingNoProduct = {
      ...mockListing,
      product: undefined,
    } as unknown as ListingWithProduct
    const { container } = render(<ProductCard listing={listingNoProduct} />)
    expect(container.innerHTML).toBe('')
  })
})
