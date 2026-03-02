import { describe, test, expect } from 'bun:test'

describe('SearchBar', () => {
  test('module exports the component', async () => {
    const mod = await import('@components/layout/searchBar')
    expect(mod.SearchBar).toBeDefined()
    expect(typeof mod.SearchBar).toBe('function')
  })
})
