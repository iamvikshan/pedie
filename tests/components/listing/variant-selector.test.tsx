import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'fs'
import { join } from 'path'
import { findBestMatch } from '../../../src/components/listing/variantSelector'
import type { Listing } from '../../../types/product'

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
    expect(source).toContain("'carrier'")
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
  const mockListings: Listing[] = [
    {
      id: '1',
      listing_id: 'l1',
      product_id: 'p1',
      storage: '128GB',
      color: 'Black',
      carrier: 'Unlocked',
      condition: 'excellent',
      battery_health: null,
      price_kes: 50000,
      final_price_kes: 50000,
      original_price_usd: 500,
      landed_cost_kes: 45000,
      source: null,
      source_listing_id: null,
      source_url: null,
      images: null,
      is_featured: false,
      listing_type: 'standard',
      ram: null,
      status: 'available',
      sheets_row_id: null,
      notes: null,
      created_at: '',
      updated_at: '',
    },
    {
      id: '2',
      listing_id: 'l2',
      product_id: 'p1',
      storage: '256GB',
      color: 'Black',
      carrier: 'Unlocked',
      condition: 'excellent',
      battery_health: null,
      price_kes: 60000,
      final_price_kes: 60000,
      original_price_usd: 600,
      landed_cost_kes: 55000,
      source: null,
      source_listing_id: null,
      source_url: null,
      images: null,
      is_featured: false,
      listing_type: 'standard',
      ram: null,
      status: 'available',
      sheets_row_id: null,
      notes: null,
      created_at: '',
      updated_at: '',
    },
    {
      id: '3',
      listing_id: 'l3',
      product_id: 'p1',
      storage: '256GB',
      color: 'White',
      carrier: 'Unlocked',
      condition: 'good',
      battery_health: null,
      price_kes: 55000,
      final_price_kes: 55000,
      original_price_usd: 550,
      landed_cost_kes: 50000,
      source: null,
      source_listing_id: null,
      source_url: null,
      images: null,
      is_featured: false,
      listing_type: 'standard',
      ram: null,
      status: 'available',
      sheets_row_id: null,
      notes: null,
      created_at: '',
      updated_at: '',
    },
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
