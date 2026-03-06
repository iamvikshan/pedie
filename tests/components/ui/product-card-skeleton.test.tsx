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

  test('uses aspect-[3/4] image placeholder', () => {
    expect(src).toContain('aspect-[3/4]')
    expect(src).not.toContain('aspect-square')
  })

  test('uses glass styling with border', () => {
    expect(src).toContain('glass')
    expect(src).toContain('border-pedie-border')
  })

  test('has pricing area with border-t', () => {
    expect(src).toContain('border-t')
  })

  test('does not include specs placeholder row', () => {
    expect(src).not.toContain('h-4 w-1/2 rounded bg-pedie-card mb-3')
  })

  test('uses rounded-lg not rounded-2xl', () => {
    expect(src).toContain('rounded-lg')
    expect(src).not.toContain('rounded-2xl')
  })

  test('uses shadow-sm not shadow-lg', () => {
    expect(src).toContain('shadow-sm')
    expect(src).not.toContain('shadow-lg')
  })
})
