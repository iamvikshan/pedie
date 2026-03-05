import { describe, expect, test } from 'bun:test'

describe('PopularCategories', () => {
  test('module exports the component', async () => {
    const mod = await import('@components/home/popularCategories')
    expect(mod.PopularCategories).toBeDefined()
    expect(typeof mod.PopularCategories).toBe('function')
  })

  test('exports CATEGORY_IMAGES mapping', async () => {
    const mod = await import('@components/home/popularCategories')
    expect(mod.CATEGORY_IMAGES).toBeDefined()
    expect(typeof mod.CATEGORY_IMAGES).toBe('object')
  })

  test('CATEGORY_IMAGES values are image paths', async () => {
    const { CATEGORY_IMAGES } =
      await import('@components/home/popularCategories')
    const values = Object.values(CATEGORY_IMAGES)
    expect(values.length).toBeGreaterThan(0)
    for (const path of values) {
      expect(typeof path).toBe('string')
      expect(path).toMatch(/^\/images\/categories\//)
    }
  })
})
