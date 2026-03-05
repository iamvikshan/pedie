import { describe, expect, test } from 'bun:test'

describe('ErrorBoundary', () => {
  test('module exports the component', async () => {
    const mod = await import('@components/ui/errorBoundary')
    expect(mod.ErrorBoundary).toBeDefined()
    expect(typeof mod.ErrorBoundary).toBe('function')
  })
})
