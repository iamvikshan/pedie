import { describe, expect, test } from 'bun:test'
import type { Listing } from '@app-types/product'
import {
  LISTING_TYPE_PRIORITY,
  findBetterDeal,
  selectRepresentative,
} from '@utils/products'

const makeListing = (overrides: Partial<Listing> = {}): Listing => ({
  id: 'uuid-1',
  sku: 'PD-TEST1',
  product_id: 'prod-1',
  storage: '256GB',
  color: 'Black',
  condition: 'excellent',
  battery_health: 95,
  price_kes: 60000,
  sale_price_kes: null,
  cost_kes: 50000,
  source: 'swappa',
  source_id: null,
  source_url: null,
  images: null,
  is_featured: false,
  listing_type: 'standard',
  ram: '8GB',
  warranty_months: null,
  attributes: null,
  includes: null,
  admin_notes: null,
  quantity: 1,
  status: 'active',
  notes: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  ...overrides,
})

describe('LISTING_TYPE_PRIORITY', () => {
  test('exports the priority map', () => {
    expect(LISTING_TYPE_PRIORITY).toBeDefined()
    expect(typeof LISTING_TYPE_PRIORITY).toBe('object')
  })

  test('standard has priority 1, preorder 2, affiliate 3, referral 4', () => {
    expect(LISTING_TYPE_PRIORITY.standard).toBe(1)
    expect(LISTING_TYPE_PRIORITY.preorder).toBe(2)
    expect(LISTING_TYPE_PRIORITY.affiliate).toBe(3)
    expect(LISTING_TYPE_PRIORITY.referral).toBe(4)
  })
})

describe('selectRepresentative', () => {
  test('returns null for empty array', () => {
    expect(selectRepresentative([])).toBeNull()
  })

  test('returns null when all listings are sold', () => {
    const listings = [
      makeListing({ sku: 'PD-1', status: 'sold' }),
      makeListing({ sku: 'PD-2', status: 'sold' }),
    ]
    expect(selectRepresentative(listings)).toBeNull()
  })

  test('returns null when all listings are reserved', () => {
    const listings = [
      makeListing({ sku: 'PD-1', status: 'reserved' }),
      makeListing({ sku: 'PD-2', status: 'reserved' }),
    ]
    expect(selectRepresentative(listings)).toBeNull()
  })

  test('excludes reserved listings from selection', () => {
    const listings = [
      makeListing({
        sku: 'PD-RESERVED',
        listing_type: 'standard',
        sale_price_kes: 30000,
        status: 'reserved',
      }),
      makeListing({
        sku: 'PD-AVAILABLE',
        listing_type: 'preorder',
        sale_price_kes: 50000,
        status: 'active',
      }),
    ]
    const rep = selectRepresentative(listings)
    expect(rep).not.toBeNull()
    expect(rep!.sku).toBe('PD-AVAILABLE')
  })

  test('standard always wins over preorder regardless of price', () => {
    const listings = [
      makeListing({
        sku: 'PD-STD',
        listing_type: 'standard',
        sale_price_kes: 60000,
      }),
      makeListing({
        sku: 'PD-PRE',
        listing_type: 'preorder',
        sale_price_kes: 55000,
      }),
    ]
    const rep = selectRepresentative(listings)
    expect(rep).not.toBeNull()
    expect(rep!.sku).toBe('PD-STD')
  })

  test('standard always wins over affiliate regardless of price', () => {
    const listings = [
      makeListing({
        sku: 'PD-AFF',
        listing_type: 'affiliate',
        sale_price_kes: 40000,
      }),
      makeListing({
        sku: 'PD-STD',
        listing_type: 'standard',
        sale_price_kes: 60000,
      }),
    ]
    const rep = selectRepresentative(listings)
    expect(rep).not.toBeNull()
    expect(rep!.sku).toBe('PD-STD')
  })

  test('standard always wins over referral regardless of price', () => {
    const listings = [
      makeListing({
        sku: 'PD-REF',
        listing_type: 'referral',
        sale_price_kes: 30000,
      }),
      makeListing({
        sku: 'PD-STD',
        listing_type: 'standard',
        sale_price_kes: 60000,
      }),
    ]
    const rep = selectRepresentative(listings)
    expect(rep).not.toBeNull()
    expect(rep!.sku).toBe('PD-STD')
  })

  test('within same type tier, picks lowest effective price', () => {
    const listings = [
      makeListing({
        sku: 'PD-STD1',
        listing_type: 'standard',
        sale_price_kes: 70000,
      }),
      makeListing({
        sku: 'PD-STD2',
        listing_type: 'standard',
        sale_price_kes: 55000,
      }),
      makeListing({
        sku: 'PD-STD3',
        listing_type: 'standard',
        sale_price_kes: 65000,
      }),
    ]
    const rep = selectRepresentative(listings)
    expect(rep).not.toBeNull()
    expect(rep!.sku).toBe('PD-STD2')
  })

  test('preorder beats affiliate when no standard exists', () => {
    const listings = [
      makeListing({
        sku: 'PD-AFF',
        listing_type: 'affiliate',
        sale_price_kes: 40000,
      }),
      makeListing({
        sku: 'PD-PRE',
        listing_type: 'preorder',
        sale_price_kes: 50000,
      }),
    ]
    const rep = selectRepresentative(listings)
    expect(rep).not.toBeNull()
    expect(rep!.sku).toBe('PD-PRE')
  })

  test('referral is lowest priority', () => {
    const listings = [
      makeListing({
        sku: 'PD-REF',
        listing_type: 'referral',
        sale_price_kes: 30000,
      }),
      makeListing({
        sku: 'PD-AFF',
        listing_type: 'affiliate',
        sale_price_kes: 50000,
      }),
    ]
    const rep = selectRepresentative(listings)
    expect(rep).not.toBeNull()
    expect(rep!.sku).toBe('PD-AFF')
  })

  test('unknown listing_type defaults to low priority', () => {
    const listings = [
      makeListing({
        sku: 'PD-UNK',
        listing_type: 'mystery' as Listing['listing_type'],
        sale_price_kes: 20000,
      }),
      makeListing({
        sku: 'PD-PRE',
        listing_type: 'preorder',
        sale_price_kes: 50000,
      }),
    ]
    const rep = selectRepresentative(listings)
    expect(rep).not.toBeNull()
    expect(rep!.sku).toBe('PD-PRE')
  })
})

describe('findBetterDeal', () => {
  test('returns null when current listing is not standard', () => {
    const current = makeListing({ listing_type: 'preorder' })
    const all = [
      current,
      makeListing({ listing_type: 'affiliate', sale_price_kes: 40000 }),
    ]
    expect(findBetterDeal(current, all)).toBeNull()
  })

  test('returns null when no matching spec variants exist', () => {
    const current = makeListing({
      sku: 'PD-STD',
      listing_type: 'standard',
      storage: '256GB',
      color: 'Black',
      condition: 'excellent',
      sale_price_kes: 60000,
    })
    const otherListing = makeListing({
      sku: 'PD-AFF',
      listing_type: 'affiliate',
      storage: '128GB', // different storage
      color: 'Black',
      condition: 'excellent',
      sale_price_kes: 40000,
    })
    expect(findBetterDeal(current, [current, otherListing])).toBeNull()
  })

  test('returns the cheapest non-standard variant with same specs', () => {
    const current = makeListing({
      id: 'id-std',
      sku: 'PD-STD',
      listing_type: 'standard',
      storage: '256GB',
      color: 'Black',
      condition: 'excellent',
      sale_price_kes: 60000,
    })
    const affiliate1 = makeListing({
      id: 'id-aff1',
      sku: 'PD-AFF1',
      listing_type: 'affiliate',
      storage: '256GB',
      color: 'Black',
      condition: 'excellent',
      sale_price_kes: 50000,
    })
    const affiliate2 = makeListing({
      id: 'id-aff2',
      sku: 'PD-AFF2',
      listing_type: 'affiliate',
      storage: '256GB',
      color: 'Black',
      condition: 'excellent',
      sale_price_kes: 45000,
    })
    const result = findBetterDeal(current, [current, affiliate1, affiliate2])
    expect(result).not.toBeNull()
    expect(result!.sku).toBe('PD-AFF2')
  })

  test('returns null when non-standard variants are more expensive', () => {
    const current = makeListing({
      sku: 'PD-STD',
      listing_type: 'standard',
      storage: '256GB',
      color: 'Black',
      condition: 'excellent',
      sale_price_kes: 40000,
    })
    const affiliate = makeListing({
      sku: 'PD-AFF',
      listing_type: 'affiliate',
      storage: '256GB',
      color: 'Black',
      condition: 'excellent',
      sale_price_kes: 50000,
    })
    expect(findBetterDeal(current, [current, affiliate])).toBeNull()
  })

  test('ignores sold listings in candidates', () => {
    const current = makeListing({
      sku: 'PD-STD',
      listing_type: 'standard',
      storage: '256GB',
      color: 'Black',
      condition: 'excellent',
      sale_price_kes: 60000,
    })
    const soldAffiliate = makeListing({
      sku: 'PD-AFF',
      listing_type: 'affiliate',
      storage: '256GB',
      color: 'Black',
      condition: 'excellent',
      sale_price_kes: 40000,
      status: 'sold',
    })
    expect(findBetterDeal(current, [current, soldAffiliate])).toBeNull()
  })

  test('ignores reserved listings in candidates', () => {
    const current = makeListing({
      sku: 'PD-STD',
      listing_type: 'standard',
      storage: '256GB',
      color: 'Black',
      condition: 'excellent',
      sale_price_kes: 60000,
    })
    const reservedAffiliate = makeListing({
      sku: 'PD-AFF',
      listing_type: 'affiliate',
      storage: '256GB',
      color: 'Black',
      condition: 'excellent',
      sale_price_kes: 40000,
      status: 'reserved',
    })
    expect(findBetterDeal(current, [current, reservedAffiliate])).toBeNull()
  })

  test('only matches same storage/color/condition', () => {
    const current = makeListing({
      id: 'id-std',
      sku: 'PD-STD',
      listing_type: 'standard',
      storage: '256GB',
      color: 'Black',
      condition: 'excellent',
      sale_price_kes: 60000,
    })
    // Different color
    const diffColor = makeListing({
      id: 'id-aff1',
      sku: 'PD-AFF1',
      listing_type: 'affiliate',
      storage: '256GB',
      color: 'White',
      condition: 'excellent',
      sale_price_kes: 40000,
    })
    // Different condition
    const diffCondition = makeListing({
      id: 'id-aff2',
      sku: 'PD-AFF2',
      listing_type: 'affiliate',
      storage: '256GB',
      color: 'Black',
      condition: 'good',
      sale_price_kes: 40000,
    })
    // Matching specs - should be the only match
    const matching = makeListing({
      id: 'id-aff3',
      sku: 'PD-AFF3',
      listing_type: 'affiliate',
      storage: '256GB',
      color: 'Black',
      condition: 'excellent',
      sale_price_kes: 45000,
    })
    const result = findBetterDeal(current, [
      current,
      diffColor,
      diffCondition,
      matching,
    ])
    expect(result).not.toBeNull()
    expect(result!.sku).toBe('PD-AFF3')
  })
})
