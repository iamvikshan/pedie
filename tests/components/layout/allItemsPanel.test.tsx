import { describe, test, expect } from 'bun:test'

describe('AllItemsPanel', () => {
  test('module exports the component', async () => {
    const mod = await import('@components/layout/allItemsPanel')
    expect(mod.AllItemsPanel).toBeDefined()
    expect(typeof mod.AllItemsPanel).toBe('function')
  })
})
