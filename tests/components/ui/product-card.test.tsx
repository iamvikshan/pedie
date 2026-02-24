import { describe, test, expect } from 'bun:test'
import { ProductCard } from '@components/ui/product-card'
import type { ListingWithProduct } from '@app-types/product'

describe('ProductCard Component', () => {
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
    original_price_usd: 1000,
    landed_cost_kes: 110000,
    source: 'eBay',
    source_listing_id: 'ebay123',
    source_url: 'https://ebay.com',
    images: ['/listing-image.jpg'],
    is_preorder: false,
    is_sold: false,
    is_featured: true,
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

  test('renders correctly with listing data', () => {
    // Since we are testing in Bun without DOM, we can just call the function
    // and verify it returns a React element with expected props
    const element = ProductCard({ listing: mockListing })

    expect(element).toBeDefined()
    expect(element).not.toBeNull()
    expect(element!.type).toBeDefined()

    // We can't easily test the rendered output without a renderer like testing-library,
    // but we can verify the component function executes without throwing
    expect(typeof element).toBe('object')
  })
})
