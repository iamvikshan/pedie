import { describe, test, expect } from 'bun:test'

describe('MobileNav', () => {
  test('module exports the component', async () => {
    const mod = await import('@components/layout/mobileNav')
    expect(mod.MobileNav).toBeDefined()
    expect(typeof mod.MobileNav).toBe('function')
  })
})
