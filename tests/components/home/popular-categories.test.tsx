import { describe, expect, mock, test } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { mockNextImage, mockNextLink, render, screen } from '../../utils'

mockNextLink()
mockNextImage()

const mockCategories = [
  {
    id: '1',
    name: 'Smartphones',
    slug: 'smartphones',
    description: null,
    image_url: null,
    parent_id: null,
    sort_order: 0,
    created_at: '',
    updated_at: '',
  },
  {
    id: '2',
    name: 'Laptops',
    slug: 'laptops',
    description: null,
    image_url: null,
    parent_id: null,
    sort_order: 1,
    created_at: '',
    updated_at: '',
  },
]

mock.module('@lib/data/categories', () => ({
  getTopLevelCategories: mock(() => Promise.resolve(mockCategories)),
}))

const { PopularCategories, CATEGORY_IMAGES } =
  await import('@components/home/popularCategories')

describe('PopularCategories', () => {
  test('module exports the component', () => {
    expect(PopularCategories).toBeDefined()
    expect(typeof PopularCategories).toBe('function')
  })

  test('exports CATEGORY_IMAGES mapping', () => {
    expect(CATEGORY_IMAGES).toBeDefined()
    expect(typeof CATEGORY_IMAGES).toBe('object')
  })

  test('CATEGORY_IMAGES values are image paths', () => {
    const values = Object.values(CATEGORY_IMAGES)
    expect(values.length).toBeGreaterThan(0)
    for (const path of values) {
      expect(typeof path).toBe('string')
      expect(path).toMatch(/^\/images\/categories\//)
    }
  })
})

describe('PopularCategories Phase 6b', () => {
  const src = readFileSync(
    resolve('src/components/home/popularCategories.tsx'),
    'utf-8'
  )

  test('does not slice categories — shows all', () => {
    expect(src).not.toContain('.slice(')
  })

  test('uses rounded-full circular thumbnails, not rounded-xl squares', () => {
    expect(src).toContain('rounded-full')
    expect(src).not.toContain('rounded-xl')
    expect(src).not.toContain('aspect-square')
    expect(src).toContain('h-20 w-20 md:h-24 md:w-24')
  })

  test('category image sizes match fixed circle dimensions', () => {
    expect(src).toContain("sizes='(max-width: 768px) 80px, 96px'")
  })

  test('uses responsive grid-cols-4 md:grid-cols-5 lg:grid-cols-7', () => {
    expect(src).toContain('grid-cols-4')
    expect(src).toContain('md:grid-cols-5')
    expect(src).toContain('lg:grid-cols-7')
  })

  test('heading uses text-xl font-bold', () => {
    expect(src).toContain('text-xl font-bold')
    expect(src).not.toContain('text-2xl')
    expect(src).not.toContain('text-3xl')
  })

  test('has See all link to /shop', () => {
    expect(src).toContain('/shop')
    expect(src).toContain('See all')
  })
})

describe('PopularCategories DOM rendering', () => {
  test('renders category links', async () => {
    const jsx = await PopularCategories()
    render(jsx)
    expect(screen.getByText('Smartphones')).toBeInTheDocument()
    expect(screen.getByText('Laptops')).toBeInTheDocument()
  })

  test('renders heading', async () => {
    const jsx = await PopularCategories()
    render(jsx)
    expect(screen.getByText('Popular Categories')).toBeInTheDocument()
  })

  test('renders See all link to /shop', async () => {
    const jsx = await PopularCategories()
    render(jsx)
    const link = screen.getByRole('link', { name: /See all/ })
    expect(link).toHaveAttribute('href', '/shop')
  })

  test('renders category images for known slugs', async () => {
    const jsx = await PopularCategories()
    render(jsx)
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(0)
  })

  test('links to correct collection paths', async () => {
    const jsx = await PopularCategories()
    render(jsx)
    const links = screen.getAllByRole('link')
    const smartphonesLink = links.find(
      l => l.getAttribute('href') === '/collections/smartphones'
    )
    const laptopsLink = links.find(
      l => l.getAttribute('href') === '/collections/laptops'
    )
    expect(smartphonesLink).toBeDefined()
    expect(laptopsLink).toBeDefined()
  })
})
