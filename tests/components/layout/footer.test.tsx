import { describe, test, expect } from 'bun:test'

describe('Footer', () => {
  test('module exports the component', async () => {
    const mod = await import('@components/layout/footer')
    expect(mod.Footer).toBeDefined()
    expect(typeof mod.Footer).toBe('function')
  })
})
