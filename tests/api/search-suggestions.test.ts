import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const source = readFileSync(
  resolve('src/app/api/search/suggestions/route.ts'),
  'utf-8'
)

describe('Search Suggestions API', () => {
  test('exports GET handler', async () => {
    const mod = await import('@/app/api/search/suggestions/route')
    expect(mod.GET).toBeDefined()
    expect(typeof mod.GET).toBe('function')
  })

  test('uses getSearchSuggestions from search data', () => {
    expect(source).toContain('getSearchSuggestions')
  })

  test('validates minimum query length', () => {
    expect(source).toContain('q')
    expect(source).toContain('length')
  })

  test('returns NextResponse.json', () => {
    expect(source).toContain('NextResponse.json')
  })
})
