import { describe, expect, test } from 'bun:test'
import brands from '../../src/lib/data/brands.json'

describe('brands.json', () => {
  test('has at least 6 brands', () => {
    expect(brands.length).toBeGreaterThanOrEqual(6)
  })

  test('each brand has name, slug, and logo', () => {
    for (const brand of brands) {
      expect(brand.name).toBeTruthy()
      expect(brand.slug).toBeTruthy()
      expect(brand.logo).toBeTruthy()
      expect(brand.logo).toMatch(/^\/images\/brands\//)
    }
  })

  test('contains expected brands', () => {
    const names = brands.map(b => b.name)
    expect(names).toContain('Apple')
    expect(names).toContain('Samsung')
    expect(names).toContain('Google')
  })
})
