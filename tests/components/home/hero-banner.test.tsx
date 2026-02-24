import { describe, test, expect } from 'bun:test'

describe('HeroBanner', () => {
  test('module exports the component', async () => {
    const mod = await import('@components/home/hero-banner')
    expect(mod.HeroBanner).toBeDefined()
    expect(typeof mod.HeroBanner).toBe('function')
  })

  test('exports SLIDES constant with 3 slides', async () => {
    const mod = await import('@components/home/hero-banner')
    expect(mod.SLIDES).toBeDefined()
    expect(Array.isArray(mod.SLIDES)).toBe(true)
    expect(mod.SLIDES.length).toBe(3)
  })

  test('each slide has title, subtitle, cta, and link', async () => {
    const { SLIDES } = await import('@components/home/hero-banner')
    for (const slide of SLIDES) {
      expect(typeof slide.title).toBe('string')
      expect(typeof slide.subtitle).toBe('string')
      expect(typeof slide.cta).toBe('string')
      expect(typeof slide.link).toBe('string')
      expect(slide.title.length).toBeGreaterThan(0)
      expect(slide.link.startsWith('/')).toBe(true)
    }
  })
})
