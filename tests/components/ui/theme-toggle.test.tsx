import { describe, expect, test } from 'bun:test'

describe('ThemeToggle', () => {
  test('module exports the component', async () => {
    const mod = await import('@components/ui/themeToggle')
    expect(mod.ThemeToggle).toBeDefined()
    expect(typeof mod.ThemeToggle).toBe('function')
  })
})
