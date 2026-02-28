import { describe, test, expect } from 'bun:test'

describe('DailyDeals', () => {
  test('module exports the component', async () => {
    const mod = await import('@components/home/dailyDeals')
    expect(mod.DailyDeals).toBeDefined()
    expect(typeof mod.DailyDeals).toBe('function')
  })
})
