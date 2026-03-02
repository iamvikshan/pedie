import { describe, expect, test } from 'bun:test'
import type { ListingWithProduct } from '@app-types/product'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { calculateDiscount, formatKes, getPricingTier } from '@helpers'

const src = readFileSync(
  resolve('src/components/ui/productCard.tsx'),
  'utf-8'
)

describe('ProductCard Component', () => {
  /** Tier 3 — normal pricing (final_price_kes >= price_kes) */
  const mockListing: ListingWithProduct = {
    id: '1',
    listing_id: 'PD-12345',
    product_id: 'p1',
    storage: '256GB',
    color: 'Space Black',
    carrier: 'Unlocked',
    condition: 'excellent',
    battery_health: 95,
    price_kes: 120000,
    final_price_kes: 120000,
    original_price_usd: 1000,
    landed_cost_kes: 110000,
    source: 'eBay',
    source_listing_id: 'ebay123',
    source_url: 'https://ebay.com',
    images: ['/listing-image.jpg'],
    is_preorder: false,
    is_sold: false,
    is_featured: true,
    is_on_sale: false,
    status: 'available',
    sheets_row_id: 'row1',
    notes: null,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    product: {
      id: 'p1',
      brand: 'Apple',
      model: 'iPhone 14 Pro',
      slug: 'apple-iphone-14-pro',
      category_id: 'cat1',
      description: 'Great phone',
      specs: null,
      key_features: null,
      images: ['/product-image.jpg'],
      original_price_kes: 150000,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      fts: null,
    },
  }

  // ── Pure logic tests ──

  test('computes product name from brand and model', () => {
    const productName = `${mockListing.product.brand} ${mockListing.product.model}`
    expect(productName).toBe('Apple iPhone 14 Pro')
  })

  test('tier 1 (sale): final < price AND is_on_sale', () => {
    const tier = getPricingTier(100000, 150000, true)
    expect(tier).toBe('sale')
    const discount = calculateDiscount(150000, 100000)
    expect(discount).toBe(33)
  })

  test('tier 2 (discounted): final < price, NOT on sale', () => {
    const tier = getPricingTier(100000, 150000, false)
    expect(tier).toBe('discounted')
  })

  test('tier 3 (normal): final >= price', () => {
    const tier = getPricingTier(150000, 150000, true)
    expect(tier).toBe('normal')
    const discount = calculateDiscount(150000, 150000)
    expect(discount).toBe(0)
  })

  test('formats price in KES', () => {
    expect(formatKes(mockListing.price_kes)).toContain('120')
  })

  test('prefers listing image over product image', () => {
    const imageUrl = mockListing.images?.[0] || mockListing.product.images?.[0]
    expect(imageUrl).toBe('/listing-image.jpg')
  })

  test('falls back to product image when no listing image', () => {
    const noImageListing = { ...mockListing, images: null }
    const imageUrl =
      noImageListing.images?.[0] || noImageListing.product.images?.[0]
    expect(imageUrl).toBe('/product-image.jpg')
  })

  // ── Source analysis tests ──

  test('wraps entire card in Link (not stretched overlay)', () => {
    // The component should open with <Link> as root element
    expect(src).toContain("href={`/listings/${listing.listing_id}`}")
    // Should NOT have the old stretched link pattern
    expect(src).not.toContain('absolute inset-0 z-0')
    expect(src).not.toContain('sr-only')
  })

  test('does not contain Add-to-Cart button', () => {
    expect(src).not.toContain('Add to Cart')
    expect(src).not.toContain('TbShoppingCartPlus')
    expect(src).not.toContain('useCartStore')
    expect(src).not.toContain('In Cart')
  })

  test('does not contain wishlist heart', () => {
    expect(src).not.toContain('TbHeart')
    expect(src).not.toContain('TbHeartFilled')
    expect(src).not.toContain('useWishlist')
    expect(src).not.toContain('wishlist')
  })

  test('does not display listing ID on card', () => {
    // listing_id should NOT be rendered as visible text (old: <span>{listing.listing_id}</span>)
    expect(src).not.toContain('>{listing.listing_id}<')
    // listing_id is only used in the href, NOT displayed
    const matches = src.match(/listing\.listing_id/g)
    // Should appear exactly once (in href template)
    expect(matches).not.toBeNull()
    expect(matches!.length).toBe(1)
  })

  test('is not a client component', () => {
    expect(src).not.toContain("'use client'")
    expect(src).not.toContain('"use client"')
  })

  test('uses getPricingTier for 3-tier pricing', () => {
    expect(src).toContain('getPricingTier')
    expect(src).toContain('listing.final_price_kes')
    expect(src).toContain('listing.price_kes')
    expect(src).toContain('listing.is_on_sale')
  })

  test('sale tier shows discount pill and crossed-out price', () => {
    expect(src).toContain("tier === 'sale'")
    expect(src).toContain('line-through')
    expect(src).toContain('text-pedie-discount')
  })

  test('discounted tier shows inline discount without pill', () => {
    expect(src).toContain("tier === 'discounted'")
  })

  test('exports PRODUCT_CARD_ICONS constant', async () => {
    const mod = await import('@components/ui/productCard')
    expect(mod.PRODUCT_CARD_ICONS).toBeDefined()
    expect(Array.isArray(mod.PRODUCT_CARD_ICONS)).toBe(true)
    expect(mod.PRODUCT_CARD_ICONS.length).toBe(3)
  })

  test('PRODUCT_CARD_ICONS contains expected icon names', async () => {
    const { PRODUCT_CARD_ICONS } = await import('@components/ui/productCard')
    expect(PRODUCT_CARD_ICONS).toContain('TbBolt')
    expect(PRODUCT_CARD_ICONS).toContain('TbPhoto')
    expect(PRODUCT_CARD_ICONS).toContain('TbFlame')
  })

  test('uses BatteryBadge component', () => {
    expect(src).toContain('BatteryBadge')
    expect(src).toContain('batteryBadge')
  })

  test('sale tier shows Flash Sale pill with TbFlame', () => {
    expect(src).toContain('TbFlame')
    expect(src).toContain('Flash Sale')
  })

  test('sale tier uses circle variant for condition badge', () => {
    expect(src).toContain("variant='circle'")
  })

  test('glassmorphed badges use backdrop-blur', () => {
    expect(src).toContain('backdrop-blur')
  })
})
