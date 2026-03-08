import { describe, expect, test } from 'bun:test'
import type { Category, ListingWithProduct } from '@app-types/product'
import {
  breadcrumbJsonLd,
  collectionJsonLd,
  organizationJsonLd,
  productJsonLd,
  safeJsonLd,
} from '@lib/seo/structuredData'

const mockCategory: Category = {
  id: 'c1',
  name: 'Smartphones',
  slug: 'smartphones',
  description: 'All smartphones',
  image_url: null,
  icon: null,
  is_active: true,
  parent_id: null,
  sort_order: 1,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

const mockListing: ListingWithProduct = {
  id: '1',
  sku: 'PD-ABC12',
  product_id: 'p1',
  storage: '256GB',
  color: 'Black',
  condition: 'excellent' as const,
  battery_health: 92,
  price_kes: 58000,
  sale_price_kes: null,
  cost_kes: 52000,
  source: 'reebelo',
  source_id: null,
  source_url: null,
  images: ['https://example.com/img1.jpg'],
  is_featured: true,
  listing_type: 'standard' as const,
  ram: null,
  warranty_months: null,
  attributes: null,
  includes: null,
  admin_notes: null,
  quantity: 1,
  status: 'active' as const,
  notes: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  product: {
    id: 'p1',
    name: 'iPhone 13 Pro',
    slug: 'apple-iphone-13-pro',
    brand_id: 'b1',
    description: 'A great phone',
    specs: null,
    key_features: ['A15 Bionic', 'ProMotion'],
    images: ['https://example.com/product1.jpg'],
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    fts: null,
    brand: {
      id: 'b1',
      name: 'Apple',
      slug: 'apple',
      logo_url: null,
      website_url: null,
      is_active: true,
      sort_order: 1,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
  },
}

describe('productJsonLd', () => {
  test('returns correct @type and @context', () => {
    const result = productJsonLd(mockListing)
    expect(result['@context']).toBe('https://schema.org')
    expect(result['@type']).toBe('Product')
  })

  test('returns correct product name', () => {
    const result = productJsonLd(mockListing)
    expect(result.name).toBe('iPhone 13 Pro')
  })

  test('returns correct sku', () => {
    const result = productJsonLd(mockListing)
    expect(result.sku).toBe('PD-ABC12')
  })

  test('returns correct brand', () => {
    const result = productJsonLd(mockListing)
    expect(result.brand).toEqual({ '@type': 'Brand', name: 'Apple' })
  })

  test('returns correct offers with priceCurrency and price', () => {
    const result = productJsonLd(mockListing)
    expect(result.offers.priceCurrency).toBe('KES')
    expect(result.offers.price).toBe(58000)
  })

  test('returns InStock availability for available listing', () => {
    const result = productJsonLd(mockListing)
    expect(result.offers.availability).toBe('https://schema.org/InStock')
  })

  test('returns OutOfStock availability for sold listing', () => {
    const soldListing = { ...mockListing, status: 'sold' as const }
    const result = productJsonLd(soldListing)
    expect(result.offers.availability).toBe('https://schema.org/OutOfStock')
  })

  test('returns RefurbishedCondition for excellent condition', () => {
    const result = productJsonLd(mockListing)
    expect(result.offers.itemCondition).toBe(
      'https://schema.org/RefurbishedCondition'
    )
  })

  test('returns UsedCondition for good condition', () => {
    const goodListing = { ...mockListing, condition: 'good' as const }
    const result = productJsonLd(goodListing)
    expect(result.offers.itemCondition).toBe('https://schema.org/UsedCondition')
  })

  test('uses listing images first', () => {
    const result = productJsonLd(mockListing)
    expect(result.image).toBe('https://example.com/img1.jpg')
  })

  test('falls back to product images when listing has none', () => {
    const noImgListing = { ...mockListing, images: null }
    const result = productJsonLd(noImgListing)
    expect(result.image).toBe('https://example.com/product1.jpg')
  })

  test('returns undefined image when no images exist', () => {
    const noImgListing = {
      ...mockListing,
      images: null,
      product: { ...mockListing.product, images: null },
    }
    const result = productJsonLd(noImgListing)
    expect(result.image).toBeUndefined()
  })

  test('uses description when available', () => {
    const result = productJsonLd(mockListing)
    expect(result.description).toBe('A great phone')
  })

  test('falls back to generated description when product description is null', () => {
    const noDescListing = {
      ...mockListing,
      product: { ...mockListing.product, description: null },
    }
    const result = productJsonLd(noDescListing)
    expect(result.description).toBe('Apple iPhone 13 Pro - excellent condition')
  })
})

describe('organizationJsonLd', () => {
  test('returns correct @type', () => {
    const result = organizationJsonLd()
    expect(result['@type']).toBe('Organization')
  })

  test('returns correct name', () => {
    const result = organizationJsonLd()
    expect(result.name).toBe('Pedie')
  })

  test('returns correct url', () => {
    const result = organizationJsonLd()
    expect(result.url).toBe('https://pedie.tech')
  })

  test('returns correct @context', () => {
    const result = organizationJsonLd()
    expect(result['@context']).toBe('https://schema.org')
  })

  test('includes contact point', () => {
    const result = organizationJsonLd()
    expect(result.contactPoint['@type']).toBe('ContactPoint')
    expect(result.contactPoint.contactType).toBe('customer service')
  })
})

describe('breadcrumbJsonLd', () => {
  test('returns correct @type', () => {
    const result = breadcrumbJsonLd([
      { name: 'Home', url: 'https://pedie.tech' },
    ])
    expect(result['@type']).toBe('BreadcrumbList')
  })

  test('returns correct positions', () => {
    const items = [
      { name: 'Home', url: 'https://pedie.tech' },
      {
        name: 'Smartphones',
        url: 'https://pedie.tech/collections/smartphones',
      },
      { name: 'iPhone 13 Pro', url: 'https://pedie.tech/listings/PD-ABC12' },
    ]
    const result = breadcrumbJsonLd(items)
    expect(result.itemListElement).toHaveLength(3)
    expect(result.itemListElement[0].position).toBe(1)
    expect(result.itemListElement[1].position).toBe(2)
    expect(result.itemListElement[2].position).toBe(3)
  })

  test('returns correct URLs', () => {
    const items = [
      { name: 'Home', url: 'https://pedie.tech' },
      {
        name: 'Smartphones',
        url: 'https://pedie.tech/collections/smartphones',
      },
    ]
    const result = breadcrumbJsonLd(items)
    expect(result.itemListElement[0].item).toBe('https://pedie.tech')
    expect(result.itemListElement[1].item).toBe(
      'https://pedie.tech/collections/smartphones'
    )
  })

  test('returns correct names', () => {
    const items = [
      { name: 'Home', url: 'https://pedie.tech' },
      {
        name: 'Smartphones',
        url: 'https://pedie.tech/collections/smartphones',
      },
    ]
    const result = breadcrumbJsonLd(items)
    expect(result.itemListElement[0].name).toBe('Home')
    expect(result.itemListElement[1].name).toBe('Smartphones')
  })

  test('handles empty items array', () => {
    const result = breadcrumbJsonLd([])
    expect(result.itemListElement).toHaveLength(0)
  })
})

describe('collectionJsonLd', () => {
  test('returns correct @type', () => {
    const result = collectionJsonLd(mockCategory, 42)
    expect(result['@type']).toBe('CollectionPage')
  })

  test('returns correct name', () => {
    const result = collectionJsonLd(mockCategory, 42)
    expect(result.name).toBe('Smartphones')
  })

  test('returns correct numberOfItems', () => {
    const result = collectionJsonLd(mockCategory, 42)
    expect(result.numberOfItems).toBe(42)
  })

  test('uses category description when available', () => {
    const result = collectionJsonLd(mockCategory, 10)
    expect(result.description).toBe('All smartphones')
  })

  test('falls back to generated description when category description is null', () => {
    const noDescCategory = { ...mockCategory, description: null }
    const result = collectionJsonLd(noDescCategory, 10)
    expect(result.description).toBe('Browse Smartphones at Pedie')
  })

  test('returns correct url', () => {
    const result = collectionJsonLd(mockCategory, 10)
    expect(result.url).toBe('https://pedie.tech/collections/smartphones')
  })

  test('includes isPartOf with WebSite', () => {
    const result = collectionJsonLd(mockCategory, 10)
    expect(result.isPartOf['@type']).toBe('WebSite')
    expect(result.isPartOf.name).toBe('Pedie')
  })
})

describe('safeJsonLd', () => {
  test('escapes </script> to prevent script injection', () => {
    const data = { '@type': 'Product', name: '</script><script>alert("xss")' }
    const result = safeJsonLd(data)
    expect(result).not.toContain('</script>')
    expect(result).toContain('\\u003c')
    expect(result).toContain('\\u003e')
  })

  test('escapes angle brackets in values', () => {
    const data = { '@type': 'Product', name: '<img src=x onerror=alert(1)>' }
    const result = safeJsonLd(data)
    expect(result).not.toContain('<')
    expect(result).not.toContain('>')
  })

  test('escapes ampersands', () => {
    const data = { '@type': 'Product', name: 'AT&T Phones' }
    const result = safeJsonLd(data)
    expect(result).not.toContain('&')
    expect(result).toContain('\\u0026')
  })

  test('output is valid JSON when unescaped', () => {
    const data = productJsonLd(mockListing)
    const result = safeJsonLd(data)
    // Replace escaped sequences back for parsing validation
    const unescaped = result
      .replace(/\\u003c/g, '<')
      .replace(/\\u003e/g, '>')
      .replace(/\\u0026/g, '&')
    expect(() => JSON.parse(unescaped)).not.toThrow()
  })

  test('handles normal data without corruption', () => {
    const data = organizationJsonLd()
    const result = safeJsonLd(data)
    // Parse it back (escaped chars are valid JSON unicode escapes)
    const parsed = JSON.parse(result)
    expect(parsed['@type']).toBe('Organization')
    expect(parsed.name).toBe('Pedie')
  })
})
