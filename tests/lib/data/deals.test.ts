import { describe, expect, test } from 'bun:test'
import { applyPromotionDiscount } from '@data/listings'
import type { ListingWithProduct } from '@app-types/product'

function makeListing(
  overrides: Partial<ListingWithProduct> = {}
): ListingWithProduct {
  return {
    id: 'test-id',
    sku: 'PD-TEST-001',
    product_id: 'prod-1',
    condition: 'good',
    color: null,
    storage: null,
    ram: null,
    battery_health: null,
    warranty_months: null,
    attributes: {},
    cost_kes: null,
    price_kes: 100000,
    sale_price_kes: null,
    images: [],
    quantity: 1,
    listing_type: 'standard',
    status: 'active',
    is_featured: false,
    admin_notes: null,
    notes: [],
    includes: [],
    source: null,
    source_url: null,
    source_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    product: {
      id: 'prod-1',
      brand_id: 'brand-1',
      name: 'Test Phone',
      slug: 'test-phone',
      description: null,
      key_features: [],
      images: [],
      specs: {},
      is_active: true,
      fts: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      brand: {
        id: 'brand-1',
        name: 'TestBrand',
        slug: 'testbrand',
        logo_url: null,
        website_url: null,
        is_active: true,
        sort_order: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    },
    ...overrides,
  } as ListingWithProduct
}

describe('applyPromotionDiscount (behavioral)', () => {
  test('applies percentage discount correctly', () => {
    const listing = makeListing({ price_kes: 100000 })
    const result = applyPromotionDiscount(listing, {
      discount_pct: 20,
      discount_amount_kes: null,
    })
    expect(result.sale_price_kes).toBe(80000)
  })

  test('applies amount discount correctly', () => {
    const listing = makeListing({ price_kes: 100000 })
    const result = applyPromotionDiscount(listing, {
      discount_pct: null,
      discount_amount_kes: 15000,
    })
    expect(result.sale_price_kes).toBe(85000)
  })

  test('returns original listing when no discount provided', () => {
    const listing = makeListing({ price_kes: 100000 })
    const result = applyPromotionDiscount(listing, {
      discount_pct: null,
      discount_amount_kes: null,
    })
    expect(result).toBe(listing)
  })

  test('keeps existing sale_price_kes when it is already better', () => {
    const listing = makeListing({ price_kes: 100000, sale_price_kes: 70000 })
    const result = applyPromotionDiscount(listing, {
      discount_pct: 20,
      discount_amount_kes: null,
    })
    // 20% off = 80000, but existing 70000 is better
    expect(result.sale_price_kes).toBe(70000)
  })

  test('applies promotion when it gives a better price than existing sale_price_kes', () => {
    const listing = makeListing({ price_kes: 100000, sale_price_kes: 90000 })
    const result = applyPromotionDiscount(listing, {
      discount_pct: 20,
      discount_amount_kes: null,
    })
    // 20% off = 80000, better than existing 90000
    expect(result.sale_price_kes).toBe(80000)
  })

  test('handles zero discount_pct', () => {
    const listing = makeListing({ price_kes: 100000 })
    const result = applyPromotionDiscount(listing, {
      discount_pct: 0,
      discount_amount_kes: null,
    })
    expect(result).toBe(listing)
  })

  test('handles 100% discount', () => {
    const listing = makeListing({ price_kes: 100000 })
    const result = applyPromotionDiscount(listing, {
      discount_pct: 100,
      discount_amount_kes: null,
    })
    expect(result.sale_price_kes).toBe(0)
  })

  test('clamps amount discount to 0 (no negative prices)', () => {
    const listing = makeListing({ price_kes: 10000 })
    const result = applyPromotionDiscount(listing, {
      discount_pct: null,
      discount_amount_kes: 50000,
    })
    expect(result.sale_price_kes).toBe(0)
  })
})
