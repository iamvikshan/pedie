import { beforeEach, describe, expect, test } from 'bun:test'
import type { ListingWithProduct } from '@app-types/product'
import { calculateDeposit } from '@helpers'
import { useCartStore } from '@lib/cart/store'

function makeListing(
  overrides: Partial<ListingWithProduct> = {}
): ListingWithProduct {
  return {
    id: '1',
    sku: 'PD-00001',
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
      brand_id: 'brand-1',
      description: 'A great phone',
      specs: null,
      key_features: null,
      images: ['/img1.jpg'],
      is_active: true,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      fts: null,
      brand: {
        id: 'brand-1',
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
    ...overrides,
  }
}

describe('CartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] })
  })

  test('initializes with empty cart', () => {
    const state = useCartStore.getState()
    expect(state.items).toEqual([])
    expect(state.getItemCount()).toBe(0)
  })

  test('addListing adds a listing to cart', () => {
    const listing = makeListing()
    useCartStore.getState().addListing(listing)

    const state = useCartStore.getState()
    expect(state.items).toHaveLength(1)
    expect(state.items[0].id).toBe('1')
  })

  test('addListing prevents duplicate listings (same id)', () => {
    const listing = makeListing()
    useCartStore.getState().addListing(listing)
    useCartStore.getState().addListing(listing)

    expect(useCartStore.getState().items).toHaveLength(1)
  })

  test('addListing allows different ids', () => {
    const listing1 = makeListing()
    const listing2 = makeListing({
      id: '2',
      sku: 'PD-00002',
      price_kes: 30000,
    })
    useCartStore.getState().addListing(listing1)
    useCartStore.getState().addListing(listing2)

    expect(useCartStore.getState().items).toHaveLength(2)
  })

  test('removeListing removes by id', () => {
    const listing1 = makeListing()
    const listing2 = makeListing({ id: '2', sku: 'PD-00002' })
    useCartStore.getState().addListing(listing1)
    useCartStore.getState().addListing(listing2)

    useCartStore.getState().removeListing('1')

    const state = useCartStore.getState()
    expect(state.items).toHaveLength(1)
    expect(state.items[0].id).toBe('2')
  })

  test('clearCart empties the cart', () => {
    useCartStore.getState().addListing(makeListing())
    useCartStore
      .getState()
      .addListing(makeListing({ id: '2', sku: 'PD-00002' }))

    useCartStore.getState().clearCart()

    expect(useCartStore.getState().items).toHaveLength(0)
  })

  test('hasListing returns true when listing exists', () => {
    useCartStore.getState().addListing(makeListing())

    expect(useCartStore.getState().hasListing('1')).toBe(true)
  })

  test('hasListing returns false when listing does not exist', () => {
    expect(useCartStore.getState().hasListing('99999')).toBe(false)
  })

  test('getTotal sums effective prices (sale_price_kes ?? price_kes)', () => {
    useCartStore.getState().addListing(makeListing({ price_kes: 50000 }))
    useCartStore
      .getState()
      .addListing(makeListing({ id: '2', sku: 'PD-00002', price_kes: 30000 }))

    expect(useCartStore.getState().getTotal()).toBe(80000)
  })

  test('getTotal uses sale_price_kes when set', () => {
    useCartStore
      .getState()
      .addListing(makeListing({ price_kes: 100000, sale_price_kes: 80000 }))
    useCartStore.getState().addListing(
      makeListing({
        id: '2',
        sku: 'PD-00002',
        price_kes: 50000,
        sale_price_kes: 40000,
      })
    )

    expect(useCartStore.getState().getTotal()).toBe(120000)
  })

  test('getDepositTotal sums deposits for preorder items only (5% < 70k)', () => {
    // Non-preorder -- should not contribute to deposit total
    useCartStore.getState().addListing(
      makeListing({
        price_kes: 50000,
        listing_type: 'standard',
      })
    )
    // Preorder, under 70k -- 5% deposit = 2500
    useCartStore.getState().addListing(
      makeListing({
        id: '2',
        sku: 'PD-00002',
        price_kes: 50000,
        listing_type: 'preorder',
      })
    )

    expect(useCartStore.getState().getDepositTotal()).toBe(2500)
  })

  test('getDepositTotal sums deposits for preorder items (10% >= 70k)', () => {
    // Preorder, at 70k -- 10% deposit = 7000
    useCartStore.getState().addListing(
      makeListing({
        id: '1',
        price_kes: 70000,
        listing_type: 'preorder',
      })
    )
    // Preorder, above 70k -- 10% deposit = 10000
    useCartStore.getState().addListing(
      makeListing({
        id: '2',
        sku: 'PD-00002',
        price_kes: 100000,
        listing_type: 'preorder',
      })
    )

    expect(useCartStore.getState().getDepositTotal()).toBe(17000)
  })

  test('getDepositTotal uses sale_price_kes for preorder deposit when set', () => {
    useCartStore.getState().addListing(
      makeListing({
        price_kes: 100000,
        sale_price_kes: 50000,
        listing_type: 'preorder',
      })
    )
    // sale_price_kes = 50000 < 70k -> 5% = 2500
    expect(useCartStore.getState().getDepositTotal()).toBe(2500)
  })

  test('getItemCount returns correct count', () => {
    expect(useCartStore.getState().getItemCount()).toBe(0)

    useCartStore.getState().addListing(makeListing())
    expect(useCartStore.getState().getItemCount()).toBe(1)

    useCartStore
      .getState()
      .addListing(makeListing({ id: '2', sku: 'PD-00002' }))
    expect(useCartStore.getState().getItemCount()).toBe(2)

    useCartStore.getState().removeListing('1')
    expect(useCartStore.getState().getItemCount()).toBe(1)
  })

  test('addListing rejects sold listing', () => {
    const sold = makeListing({ id: 'sold-1', status: 'sold' as const })
    useCartStore.getState().addListing(sold)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  test('addListing rejects reserved listing', () => {
    const reserved = makeListing({
      id: 'res-1',
      status: 'reserved' as const,
    })
    useCartStore.getState().addListing(reserved)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  test('addListing rejects referral listing', () => {
    const referral = makeListing({
      id: 'ref-1',
      listing_type: 'referral' as const,
    })
    useCartStore.getState().addListing(referral)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  test('addListing rejects affiliate listing', () => {
    const affiliate = makeListing({
      id: 'aff-1',
      listing_type: 'affiliate' as const,
    })
    useCartStore.getState().addListing(affiliate)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  test('addListing allows active standard listing', () => {
    const standard = makeListing({
      id: 'std-1',
      status: 'active' as const,
      listing_type: 'standard' as const,
    })
    useCartStore.getState().addListing(standard)
    expect(useCartStore.getState().items).toHaveLength(1)
  })

  test('addListing allows preorder listing', () => {
    const preorder = makeListing({
      id: 'pre-1',
      listing_type: 'preorder' as const,
    })
    useCartStore.getState().addListing(preorder)
    expect(useCartStore.getState().items).toHaveLength(1)
  })

  test('deposit_kes is zero for standard items and positive for preorder items in order payload', () => {
    const standard = makeListing({
      id: 'std-1',
      price_kes: 50000,
      listing_type: 'standard',
    })
    const preorder = makeListing({
      id: 'pre-1',
      sku: 'PD-00002',
      price_kes: 50000,
      listing_type: 'preorder',
    })

    useCartStore.getState().addListing(standard)
    useCartStore.getState().addListing(preorder)

    const items = useCartStore.getState().items
    const orderItems = items.map(listing => {
      const effectivePrice = listing.sale_price_kes ?? listing.price_kes
      return {
        listing_id: listing.id,
        product_name: listing.product.name,
        unit_price_kes: effectivePrice,
        deposit_kes:
          listing.listing_type === 'preorder'
            ? calculateDeposit(effectivePrice)
            : 0,
      }
    })

    const stdItem = orderItems.find(i => i.listing_id === 'std-1')!
    const preItem = orderItems.find(i => i.listing_id === 'pre-1')!

    expect(stdItem.deposit_kes).toBe(0)
    expect(preItem.deposit_kes).toBe(calculateDeposit(50000))
    expect(preItem.deposit_kes).toBeGreaterThan(0)
  })
})
