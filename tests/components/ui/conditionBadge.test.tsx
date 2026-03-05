import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = readFileSync(
  resolve('src/components/ui/conditionBadge.tsx'),
  'utf-8'
)

describe('ConditionBadge Component', () => {
  test('exports CONDITION_ICONS mapping', async () => {
    const mod = await import('@components/ui/conditionBadge')
    expect(mod.CONDITION_ICONS).toBeDefined()
    expect(mod.CONDITION_ICONS.premium).toBe('TbCrown')
    expect(mod.CONDITION_ICONS.excellent).toBe('TbDiamond')
    expect(mod.CONDITION_ICONS.good).toBe('TbThumbUp')
    expect(mod.CONDITION_ICONS.acceptable).toBe('TbCircleCheck')
  })

  test('uses icon-only rendering (no text pill)', () => {
    // Should NOT have getConditionLabel or text rendering
    expect(src).not.toContain('getConditionLabel')
    // Should use Tabler icons
    expect(src).toContain('TbCrown')
    expect(src).toContain('TbDiamond')
    expect(src).toContain('TbThumbUp')
    expect(src).toContain('TbCircleCheck')
  })

  test('renders tooltip via title attribute', () => {
    expect(src).toContain('title={label}')
    // label is capitalized condition
    expect(src).toContain('condition.charAt(0).toUpperCase()')
  })

  test('includes sr-only label for accessibility', () => {
    expect(src).toContain('sr-only')
    expect(src).toContain('{label}')
  })

  test('maps each grade to a color class', () => {
    expect(src).toContain('text-pedie-badge-premium')
    expect(src).toContain('text-pedie-badge-excellent')
    expect(src).toContain('text-pedie-badge-good')
    expect(src).toContain('text-pedie-badge-acceptable')
  })

  test('uses aria-hidden on icon element', () => {
    expect(src).toContain("aria-hidden='true'")
  })

  test('exports CONDITION_BADGE_VARIANTS', async () => {
    const mod = await import('@components/ui/conditionBadge')
    expect(mod.CONDITION_BADGE_VARIANTS).toBeDefined()
    expect(mod.CONDITION_BADGE_VARIANTS).toContain('default')
    expect(mod.CONDITION_BADGE_VARIANTS).toContain('circle')
  })

  test('circle variant uses glassmorphed background', () => {
    expect(src).toContain('circle')
    expect(src).toContain('backdrop-blur')
    expect(src).toContain('rounded-full')
    expect(src).toContain('p-1.5')
  })
})
