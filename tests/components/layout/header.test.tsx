import { describe, test, expect } from 'bun:test'

describe('Header', () => {
  test('module exports the component', async () => {
    const mod = await import('@components/layout/header')
    expect(mod.Header).toBeDefined()
    expect(typeof mod.Header).toBe('function')
  })

  test('config uses Pedie branding', async () => {
    const { SITE_NAME } = await import('@/config')
    expect(SITE_NAME).toBe('Pedie')
    expect(SITE_NAME).not.toContain('Tech')
  })

  test('categoryNav is imported by header', async () => {
    const catMod = await import('@components/layout/categoryNav')
    expect(catMod.CategoryNav).toBeDefined()
    expect(typeof catMod.CategoryNav).toBe('function')
  })
})
