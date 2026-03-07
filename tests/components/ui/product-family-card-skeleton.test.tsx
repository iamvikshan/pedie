import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// productFamilyCardSkeleton is now a re-export of productCardSkeleton.
// Source-analysis tests validate the canonical implementation.
const src = readFileSync(
  resolve('src/components/skeletons/productCardSkeleton.tsx'),
  'utf-8'
)

const reExportSrc = readFileSync(
  resolve('src/components/skeletons/productFamilyCardSkeleton.tsx'),
  'utf-8'
)

describe('ProductFamilyCardSkeleton', () => {
  test('module exports ProductFamilyCardSkeleton function', async () => {
    const mod = await import('@components/skeletons/productFamilyCardSkeleton')
    expect(mod.ProductFamilyCardSkeleton).toBeDefined()
    expect(typeof mod.ProductFamilyCardSkeleton).toBe('function')
  })

  test('is a re-export of ProductCardSkeleton', () => {
    expect(reExportSrc).toContain(
      'ProductCardSkeleton as ProductFamilyCardSkeleton'
    )
  })

  test('canonical skeleton has accessible role and aria-label', () => {
    expect(src).toContain("role='status'")
    expect(src).toContain("aria-label='Loading'")
  })

  test('canonical skeleton uses animate-pulse class', () => {
    expect(src).toContain('animate-pulse')
  })

  test('canonical skeleton uses aspect-[3/4] image placeholder', () => {
    expect(src).toContain('aspect-[3/4]')
    expect(src).not.toContain('aspect-square')
  })

  test('canonical skeleton uses glass styling with border', () => {
    expect(src).toContain('glass')
    expect(src).toContain('border-pedie-border')
  })

  test('canonical skeleton has pricing area with border-t', () => {
    expect(src).toContain('border-t')
  })

  test('does not include specs placeholder row', () => {
    expect(src).not.toContain('h-4 w-1/2 rounded bg-pedie-card mb-3')
  })

  test('canonical skeleton uses rounded-lg not rounded-2xl', () => {
    expect(src).toContain('rounded-lg')
    expect(src).not.toContain('rounded-2xl')
  })

  test('canonical skeleton uses shadow-sm not shadow-lg', () => {
    expect(src).toContain('shadow-sm')
    expect(src).not.toContain('shadow-lg')
  })
})
