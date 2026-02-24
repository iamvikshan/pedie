import { describe, test, expect } from 'bun:test'

describe('Header', () => {
  test('module exports the component', async () => {
    const mod = await import('@components/layout/header')
    expect(mod.Header).toBeDefined()
    expect(typeof mod.Header).toBe('function')
  })
})
