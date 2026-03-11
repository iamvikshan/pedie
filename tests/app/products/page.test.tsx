import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import React from 'react'
import type {
  Category,
  Listing,
  ListingWithProduct,
  ProductFamily,
  ProductWithBrand,
} from '@app-types/product'
import { render, screen } from '../../utils'

const mockNotFound = mock(() => {
  throw new Error('NEXT_NOT_FOUND')
})

const mockGetProductFamilyBySlug = mock(() =>
  Promise.resolve(null as ProductFamily | null)
)
const mockGetRelatedListings = mock(() =>
  Promise.resolve([] as ListingWithProduct[])
)
const mockGetCategoryBreadcrumb = mock(() =>
  Promise.resolve([] as Array<{ name: string; slug: string }>)
)
const mockGetPrimaryCategoryForProduct = mock(() =>
  Promise.resolve(null as Category | null)
)

mock.module('next/navigation', () => ({
  notFound: mockNotFound,
}))

mock.module('@data/products', () => ({
  getProductFamilyBySlug: mockGetProductFamilyBySlug,
  getRelatedListings: mockGetRelatedListings,
}))

mock.module('@data/categories', () => ({
  getCategoryBreadcrumb: mockGetCategoryBreadcrumb,
  getPrimaryCategoryForProduct: mockGetPrimaryCategoryForProduct,
}))

mock.module('@components/ui/breadcrumbs', () => ({
  Breadcrumbs: ({
    segments,
  }: {
    segments: Array<{ name: string; href?: string }>
  }) =>
    React.createElement(
      'nav',
      { 'aria-label': 'Breadcrumb', 'data-testid': 'breadcrumbs' },
      segments.map(segment => segment.name).join(' > ')
    ),
}))

mock.module('@components/listing/imageGallery', () => ({
  ImageGallery: ({ productName }: { productName: string }) =>
    React.createElement('div', { 'data-testid': 'image-gallery' }, productName),
}))

mock.module('@components/listing/productSpecs', () => ({
  ProductSpecs: ({ specs }: { specs: Record<string, unknown> | null }) =>
    React.createElement(
      'div',
      { 'data-testid': 'product-specs' },
      specs ? Object.keys(specs).join(', ') : 'no specs'
    ),
}))

mock.module('@components/listing/productDescription', () => ({
  ProductDescription: ({
    description,
    keyFeatures,
  }: {
    description: string
    keyFeatures: string[] | null
  }) =>
    React.createElement(
      'div',
      { 'data-testid': 'product-description' },
      `${description} ${(keyFeatures ?? []).join(', ')}`
    ),
}))

mock.module('@components/listing/similarListings', () => ({
  SimilarListings: ({ listings }: { listings: ListingWithProduct[] }) =>
    React.createElement(
      'div',
      { 'data-testid': 'similar-listings' },
      `Similar listings: ${listings.length}`
    ),
}))

mock.module('@components/listing/productDetailClient', () => ({
  default: ({
    family,
    product,
  }: {
    family: ProductFamily
    product: ProductWithBrand
  }) =>
    React.createElement(
      'div',
      { 'data-testid': 'product-detail-client' },
      `${product.brand.name} ${product.name} (${family.variantCount})`
    ),
}))

const mockProduct: ProductWithBrand = {
  id: 'product-1',
  name: 'iPhone 15 Pro',
  slug: 'apple-iphone-15-pro',
  brand_id: 'brand-1',
  description: 'Titanium flagship phone',
  specs: { display: '6.1-inch', chip: 'A17 Pro' },
  key_features: ['USB-C', 'Titanium build'],
  images: ['https://example.com/iphone-15-pro.jpg'],
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  fts: null,
  brand: {
    id: 'brand-1',
    name: 'Apple',
    slug: 'apple',
    logo_url: null,
    website_url: null,
    is_active: true,
    sort_order: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
}

const mockRepresentative: Listing = {
  id: 'listing-1',
  sku: 'IP15PRO-256-BLK',
  product_id: 'product-1',
  storage: '256GB',
  color: 'Black Titanium',
  condition: 'excellent',
  battery_health: 99,
  price_kes: 89999,
  sale_price_kes: 79999,
  cost_kes: 70000,
  source: null,
  source_id: null,
  source_url: null,
  images: ['https://example.com/listing-1.jpg'],
  is_featured: true,
  listing_type: 'standard',
  ram: null,
  warranty_months: 12,
  attributes: null,
  includes: ['USB-C cable'],
  admin_notes: null,
  quantity: 2,
  status: 'active',
  notes: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockProductFamily: ProductFamily = {
  product: mockProduct,
  listings: [
    mockRepresentative,
    {
      ...mockRepresentative,
      id: 'listing-2',
      sku: 'IP15PRO-512-BLK',
      storage: '512GB',
      price_kes: 99999,
      sale_price_kes: null,
    },
  ],
  representative: mockRepresentative,
  variantCount: 2,
}

const mockRelatedListings: ListingWithProduct[] = [
  {
    ...mockRepresentative,
    id: 'listing-3',
    sku: 'IP14-128-BLU',
    product_id: 'product-2',
    price_kes: 65999,
    sale_price_kes: null,
    product: {
      ...mockProduct,
      id: 'product-2',
      name: 'iPhone 14',
      slug: 'apple-iphone-14',
    },
  },
]

const mockPrimaryCategory: Category = {
  id: 'category-1',
  name: 'Phones',
  slug: 'phones',
  description: null,
  image_url: null,
  icon: null,
  is_active: true,
  parent_id: null,
  sort_order: 1,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const { default: ProductPage, generateMetadata } =
  await import('@/app/(store)/products/[slug]/page')

const src = readFileSync(
  resolve('src/app/(store)/products/[slug]/page.tsx'),
  'utf-8'
)

const clientSrc = readFileSync(
  resolve('src/components/listing/productDetailClient.tsx'),
  'utf-8'
)

describe('Product Detail Page', () => {
  beforeEach(() => {
    document.body.innerHTML = ''

    mockNotFound.mockClear()
    mockGetProductFamilyBySlug.mockClear()
    mockGetRelatedListings.mockClear()
    mockGetCategoryBreadcrumb.mockClear()
    mockGetPrimaryCategoryForProduct.mockClear()

    mockGetProductFamilyBySlug.mockResolvedValue(mockProductFamily)
    mockGetRelatedListings.mockResolvedValue(mockRelatedListings)
    mockGetCategoryBreadcrumb.mockResolvedValue([
      { name: 'Phones', slug: 'phones' },
    ])
    mockGetPrimaryCategoryForProduct.mockResolvedValue(mockPrimaryCategory)
  })

  test('generateMetadata includes the product brand and name in the title', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: mockProduct.slug }),
    })

    expect(mockGetProductFamilyBySlug).toHaveBeenCalledWith(mockProduct.slug)
    expect(metadata.title).toContain(mockProduct.brand.name)
    expect(metadata.title).toContain(mockProduct.name)
  })

  test('generateMetadata description uses the representative effective price', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: mockProduct.slug }),
    })

    expect(metadata.description).toContain('KES 79,999')
    expect(metadata.description).toContain('2 variants available')
  })

  test('renders the product page using fetched family, category, and related listings', async () => {
    const page = await ProductPage({
      params: Promise.resolve({ slug: mockProduct.slug }),
    })

    render(page)

    expect(
      screen.getByRole('heading', {
        name: `${mockProduct.brand.name} ${mockProduct.name}`,
      })
    ).toBeInTheDocument()
    expect(screen.getByTestId('breadcrumbs')).toHaveTextContent(
      `Phones > ${mockProduct.brand.name} ${mockProduct.name}`
    )
    expect(screen.getByTestId('similar-listings')).toHaveTextContent(
      'Similar listings: 1'
    )
    expect(mockGetRelatedListings).toHaveBeenCalledWith(mockProduct.id)
    expect(mockGetPrimaryCategoryForProduct).toHaveBeenCalledWith(
      mockProduct.id
    )
    expect(mockGetCategoryBreadcrumb).toHaveBeenCalledWith('phones')
  })

  test('calls notFound() when the product family is missing', async () => {
    mockGetProductFamilyBySlug.mockResolvedValueOnce(null)

    await expect(
      ProductPage({ params: Promise.resolve({ slug: 'missing-product' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND')

    expect(mockGetProductFamilyBySlug).toHaveBeenCalledWith('missing-product')
    expect(mockNotFound).toHaveBeenCalledTimes(1)
  })
})

describe('Product Detail Page structure', () => {
  test('imports getProductFamilyBySlug', () => {
    expect(src).toContain('getProductFamilyBySlug')
  })

  test('builds breadcrumb context from the product-category junction', () => {
    expect(src).toContain('getPrimaryCategoryForProduct(product.id)')
    expect(src).toContain('getCategoryBreadcrumb(primaryCategory.slug)')
  })

  test('uses VariantSelector component (in client wrapper)', () => {
    expect(clientSrc).toContain('<VariantSelector')
  })

  test('uses BetterDealNudge component (in client wrapper)', () => {
    expect(clientSrc).toContain('<BetterDealNudge')
  })

  test('fetches related listings with product id only', () => {
    expect(src).toContain('getRelatedListings(product.id)')
    expect(src).not.toMatch(/getRelatedListings\([^)]*,[^)]*\)/)
  })
})
