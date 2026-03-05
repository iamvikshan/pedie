import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const SOURCE = readFileSync(
  resolve('src/components/home/hotDeals.tsx'),
  'utf-8'
)

describe('HotDeals', () => {
  test('module exports the component', async () => {
    const mod = await import('@components/home/hotDeals')
    expect(mod.HotDeals).toBeDefined()
    expect(typeof mod.HotDeals).toBe('function')
  })

  test('URGENCY_TEXT is defined in config and non-empty', async () => {
    const { URGENCY_TEXT } = await import('@/config')
    expect(URGENCY_TEXT).toBeDefined()
    expect(typeof URGENCY_TEXT).toBe('string')
    expect(URGENCY_TEXT.length).toBeGreaterThan(0)
  })

  test('uses 12-column grid layout', () => {
    expect(SOURCE).toContain('grid-cols-12')
  })

  test('has /deals View All link', () => {
    expect(SOURCE).toContain('/deals')
  })

  test('uses horizontal snap-swiper', () => {
    expect(SOURCE).toContain('snap-x')
  })

  test('timer card has dark background', () => {
    expect(SOURCE).toContain('bg-pedie-dark')
  })

  test('uses amber/gold accent', () => {
    expect(SOURCE).toContain('amber')
  })

  test('timer card has gradient glow border', () => {
    expect(SOURCE).toContain('bg-gradient-to-br')
    expect(SOURCE).toContain('from-amber-400')
  })

  test('section has warm gradient background', () => {
    expect(SOURCE).toContain('bg-gradient-to-r')
  })
})
