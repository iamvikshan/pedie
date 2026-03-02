import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = readFileSync(
  resolve('src/components/ui/batteryBadge.tsx'),
  'utf-8'
)

describe('BatteryBadge Component', () => {
  test('exports BatteryBadge function', async () => {
    const mod = await import('@components/ui/batteryBadge')
    expect(mod.BatteryBadge).toBeDefined()
    expect(typeof mod.BatteryBadge).toBe('function')
  })

  test('exports BATTERY_THRESHOLDS constant', async () => {
    const mod = await import('@components/ui/batteryBadge')
    expect(mod.BATTERY_THRESHOLDS).toBeDefined()
    expect(mod.BATTERY_THRESHOLDS.good).toBe(80)
    expect(mod.BATTERY_THRESHOLDS.warning).toBe(50)
  })

  test('exports getBatteryColor function', async () => {
    const { getBatteryColor } = await import('@components/ui/batteryBadge')
    expect(getBatteryColor(95)).toContain('excellent')
    expect(getBatteryColor(65)).toContain('amber')
    expect(getBatteryColor(30)).toContain('discount')
  })

  test('uses TbBolt icon', () => {
    expect(src).toContain('TbBolt')
  })

  test('uses glassmorphed styling', () => {
    expect(src).toContain('backdrop-blur')
    expect(src).toContain('rounded-full')
  })

  test('includes aria-hidden on icon', () => {
    expect(src).toContain("aria-hidden='true'")
  })
})
