import { readFileSync } from 'fs'
import { describe, expect, test } from 'bun:test'

const src = readFileSync('src/lib/data/brands.ts', 'utf-8')

describe('brands data module', () => {
  test('exports getBrands async function', () => {
    expect(src).toContain('export async function getBrands')
  })

  test('exports Brand interface with required fields', () => {
    expect(src).toContain('export interface Brand')
    expect(src).toContain('name: string')
    expect(src).toContain('slug: string')
    expect(src).toContain('logo_url: string | null')
  })

  test('fetches from brands table via supabase', () => {
    expect(src).toContain(".from('brands')")
    expect(src).toContain(".select('*')")
  })

  test('does not use unsafe casts', () => {
    expect(src).not.toContain('as unknown as')
    expect(src).not.toContain('as any')
  })

  test('orders by sort_order ascending', () => {
    expect(src).toContain("order('sort_order'")
  })
})
