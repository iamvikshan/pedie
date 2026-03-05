import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = readFileSync(
  resolve('src/components/skeletons/productCardSkeleton.tsx'),
  'utf-8'
)

describe('ProductCardSkeleton', () => {
  test('module exports ProductCardSkeleton function', async () => {
    const mod = await import('@components/skeletons/productCardSkeleton')
    expect(mod.ProductCardSkeleton).toBeDefined()
    expect(typeof mod.ProductCardSkeleton).toBe('function')
  })

  test('has accessible role and aria-label', () => {
    expect(src).toContain("role='status'")
    expect(src).toContain("aria-label='Loading'")
  })

  test('uses animate-pulse class', () => {
    expect(src).toContain('animate-pulse')
  })

  test('has aspect-square image placeholder', () => {
    expect(src).toContain('aspect-square')
  })

  test('uses glass styling with border', () => {
    expect(src).toContain('glass')
    expect(src).toContain('border-pedie-border')
  })

  test('has pricing area with border-t', () => {
    expect(src).toContain('border-t')
  })
})
