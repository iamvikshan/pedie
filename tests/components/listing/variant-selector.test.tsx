import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'fs'
import { join } from 'path'
import { findBestMatch } from '../../../src/components/listing/variantSelector'
import type { Listing } from '../../../types/product'
import { mockNextNavigation, render, screen } from '../../utils'

mockNextNavigation()

describe('Variant Selector Component', () => {
  const componentPath = join(
    process.cwd(),
    'src/components/listing/variantSelector.tsx'
  )

  it("Source analysis: component is a client component ('use client')", () => {
    const source = readFileSync(componentPath, 'utf-8')
    expect(source).toContain("'use client'")
  })

  it('Source analysis: uses formatKes for price display', () => {
    const source = readFileSync(componentPath, 'utf-8')
    expect(source).toContain('formatKes')
  })

  it('Source analysis: imports condition icons (TbCrown, TbDiamond, TbThumbUp, TbCircleCheck)', () => {
    const source = readFileSync(componentPath, 'utf-8')
    expect(source).toContain('TbCrown')
    expect(source).toContain('TbDiamond')
    expect(source).toContain('TbThumbUp')
    expect(source).toContain('TbCircleCheck')
  })

  it('Source analysis: has disabled prop with aria-disabled on buttons', () => {
    const source = readFileSync(componentPath, 'utf-8')
    expect(source).toContain('aria-disabled={disabled}')
    expect(source).toContain('disabled={disabled}')
  })

  it('Source analysis: VariantDimension type restricts dimension to valid keys', () => {
    const source = readFileSync(componentPath, 'utf-8')
    expect(source).toContain('type VariantDimension')
    expect(source).toContain("'storage'")
    expect(source).toContain("'color'")
    expect(source).toContain("'condition'")
    expect(source).not.toContain("'carrier'")
  })

  it('Source analysis: onSelect is optional (disabled mode works without handler)', () => {
    const source = readFileSync(componentPath, 'utf-8')
    expect(source).toContain('onSelect?: (listing: Listing) => void')
  })

  it('Source analysis: renders storage section conditionally', () => {
    const source = readFileSync(componentPath, 'utf-8')
    expect(source).toMatch(/storage(s?)\.length > 1/i)
  })

  it('Source analysis: renders color section conditionally', () => {
    const source = readFileSync(componentPath, 'utf-8')
    expect(source).toMatch(/color(s?)\.length > 1/i)
  })

  it('Source analysis: always renders condition section', () => {
    const source = readFileSync(componentPath, 'utf-8')
    expect(source).toContain('Condition')
  })
})

describe('findBestMatch', () => {
  const createListing = (overrides: Partial<Listing>): Listing => ({
    id: '1',
    sku: 'SKU-001',
    product_id: 'p1',
    storage: '128GB',
    color: 'Black',
    condition: 'excellent',
    battery_health: null,
    price_kes: 50000,
    sale_price_kes: null,
    cost_kes: null,
    source: null,
    source_id: null,
    source_url: null,
    images: null,
    is_featured: false,
    listing_type: 'standard',
    ram: null,
    warranty_months: null,
    attributes: null,
    includes: null,
    admin_notes: null,
    quantity: 1,
    status: 'active',
    notes: null,
    created_at: '',
    updated_at: '',
    ...overrides,
  })

  const mockListings: Listing[] = [
    createListing({ id: '1', sku: 'SKU-001' }),
    createListing({
      id: '2',
      sku: 'SKU-002',
      storage: '256GB',
      price_kes: 60000,
    }),
    createListing({
      id: '3',
      sku: 'SKU-003',
      storage: '256GB',
      color: 'White',
      condition: 'good',
      price_kes: 55000,
    }),
  ]

  it('Pure logic: selection algorithm finds best match when changing storage', () => {
    const current = mockListings[0]
    const best = findBestMatch(mockListings, current, 'storage', '256GB')
    expect(best.id).toBe('2')
  })

  it('Pure logic: selection algorithm falls back to cheapest when no exact match', () => {
    const current = mockListings[0]
    const best = findBestMatch(mockListings, current, 'color', 'White')
    expect(best.id).toBe('3')
  })
})

describe('VariantSelector DOM Rendering', () => {
  const createListing = (overrides: Partial<Listing>): Listing => ({
    id: '1',
    sku: 'SKU-101',
    product_id: 'p1',
    storage: '128GB',
    color: 'Black',
    condition: 'excellent',
    battery_health: null,
    price_kes: 50000,
    sale_price_kes: null,
    cost_kes: null,
    source: null,
    source_id: null,
    source_url: null,
    images: null,
    is_featured: false,
    listing_type: 'standard',
    ram: null,
    warranty_months: null,
    attributes: null,
    includes: null,
    admin_notes: null,
    quantity: 1,
    status: 'active',
    notes: null,
    created_at: '',
    updated_at: '',
    ...overrides,
  })

  const mockListings: Listing[] = [
    createListing({ id: '1', sku: 'SKU-101' }),
    createListing({
      id: '2',
      sku: 'SKU-102',
      storage: '256GB',
      color: 'White',
      condition: 'good',
      price_kes: 60000,
    }),
  ]

  it('renders storage dimension buttons', async () => {
    const VariantSelector = (
      await import('@components/listing/variantSelector')
    ).default
    render(
      <VariantSelector
        listings={mockListings}
        selectedListing={mockListings[0]}
      />
    )
    expect(screen.getByRole('button', { name: '128GB' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '256GB' })).toBeInTheDocument()
  })

  it('renders condition dimension buttons', async () => {
    const VariantSelector = (
      await import('@components/listing/variantSelector')
    ).default
    render(
      <VariantSelector
        listings={mockListings}
        selectedListing={mockListings[0]}
      />
    )
    expect(
      screen.getByRole('button', { name: /excellent/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /good/i })).toBeInTheDocument()
  })

  it('disables buttons when disabled prop is true', async () => {
    const VariantSelector = (
      await import('@components/listing/variantSelector')
    ).default
    render(
      <VariantSelector
        listings={mockListings}
        selectedListing={mockListings[0]}
        disabled
      />
    )
    const storageBtn = screen.getByRole('button', { name: '128GB' })
    expect(storageBtn).toBeDisabled()
    expect(storageBtn).toHaveAttribute('aria-disabled', 'true')
  })
})
