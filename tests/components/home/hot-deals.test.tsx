import { describe, expect, test } from 'bun:test'
import type { ListingWithProduct } from '@app-types/product'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { mockNextImage, mockNextLink, render, screen } from '../../utils'

mockNextLink()
mockNextImage()

const { HotDeals } = await import('@components/home/hotDeals')

const mockListings: ListingWithProduct[] = [
  {
    id: '1',
    listing_id: 'L001',
    product_id: 'p1',
    storage: '128GB',
    color: 'Black',
    carrier: null,
    condition: 'good',
    battery_health: 90,
    price_kes: 45000,
    final_price_kes: 45000,
    original_price_usd: 300,
    landed_cost_kes: 40000,
    source: 'test',
    source_listing_id: null,
    source_url: null,
    images: ['https://example.com/img1.jpg'],
    is_featured: true,
    listing_type: 'standard',
    ram: '4GB',
    status: 'available',
    sheets_row_id: null,
    notes: null,
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
    product: {
      id: 'p1',
      brand: 'Apple',
      model: 'iPhone 13',
      slug: 'iphone-13',
      category_id: 'c1',
      description: null,
      specs: null,
      key_features: null,
      images: null,
      original_price_kes: 55000,
      created_at: '2025-01-01',
      updated_at: '2025-01-01',
      fts: null,
    },
  },
  {
    id: '2',
    listing_id: 'L002',
    product_id: 'p2',
    storage: '256GB',
    color: 'White',
    carrier: null,
    condition: 'excellent',
    battery_health: 95,
    price_kes: 85000,
    final_price_kes: 85000,
    original_price_usd: 600,
    landed_cost_kes: 70000,
    source: 'test',
    source_listing_id: null,
    source_url: null,
    images: ['https://example.com/img2.jpg'],
    is_featured: true,
    listing_type: 'standard',
    ram: '6GB',
    status: 'available',
    sheets_row_id: null,
    notes: null,
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
    product: {
      id: 'p2',
      brand: 'Samsung',
      model: 'Galaxy S23',
      slug: 'galaxy-s23',
      category_id: 'c1',
      description: null,
      specs: null,
      key_features: null,
      images: null,
      original_price_kes: 100000,
      created_at: '2025-01-01',
      updated_at: '2025-01-01',
      fts: null,
    },
  },
]

const SOURCE = readFileSync(
  resolve('src/components/home/hotDeals.tsx'),
  'utf-8'
)

describe('HotDeals', () => {
  test('module exports the component', () => {
    expect(HotDeals).toBeDefined()
    expect(typeof HotDeals).toBe('function')
  })

  test('uses 6-column grid layout (1:5 split)', () => {
    expect(SOURCE).toContain('grid-cols-6')
    expect(SOURCE).toContain('md:col-span-1')
    expect(SOURCE).toContain('md:col-span-5')
  })

  test('has /deals View All link', () => {
    expect(SOURCE).toContain('/deals')
  })

  test('uses horizontal snap-swiper', () => {
    expect(SOURCE).toContain('snap-x')
  })

  test('timer card uses semantic sunken background', () => {
    expect(SOURCE).toContain('bg-pedie-sunken')
  })

  test('uses amber/gold accent', () => {
    expect(SOURCE).toContain('amber')
  })
})

describe('HotDeals DOM rendering', () => {
  test('renders heading', () => {
    render(<HotDeals listings={mockListings} />)
    expect(screen.getByText('Hot Deals')).toBeInTheDocument()
  })

  test('renders product cards', () => {
    render(<HotDeals listings={mockListings} />)
    expect(screen.getByLabelText('View iPhone 13')).toBeInTheDocument()
    expect(screen.getByLabelText('View Galaxy S23')).toBeInTheDocument()
    expect(screen.getByText('iPhone 13')).toBeInTheDocument()
    expect(screen.getByText('Galaxy S23')).toBeInTheDocument()
  })

  test('returns null for empty listings', () => {
    const { container } = render(<HotDeals listings={[]} />)
    expect(container.innerHTML).toBe('')
  })

  test('renders Today Deals timer card', () => {
    render(<HotDeals listings={mockListings} />)
    expect(screen.getByText('Today Deals')).toBeInTheDocument()
  })

  test('renders See all and Shop all links', () => {
    render(<HotDeals listings={mockListings} />)
    const links = screen.getAllByRole('link')
    const dealLinks = links.filter(l => l.getAttribute('href') === '/deals')
    expect(dealLinks.length).toBeGreaterThanOrEqual(1)
  })
})
