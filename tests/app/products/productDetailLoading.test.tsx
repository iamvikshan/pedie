import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = readFileSync(
  resolve('src/app/(store)/products/[slug]/loading.tsx'),
  'utf-8'
)

describe('Product Detail Loading Page', () => {
  test('module exports default function', async () => {
    const mod = await import('@/app/(store)/products/[slug]/loading')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  test('uses animate-pulse for loading animation', () => {
    expect(src).toContain('animate-pulse')
  })

  test('has 2-column grid layout', () => {
    expect(src).toContain('grid-cols-2')
  })

  test('has aspect-square image placeholder', () => {
    expect(src).toContain('aspect-square')
  })

  test('uses pedie-container', () => {
    expect(src).toContain('pedie-container')
    expect(src).not.toContain('max-w-7xl')
  })

  test('has below-fold details section with 3-col grid', () => {
    expect(src).toContain('grid-cols-3')
  })

  test('has thumbnail row', () => {
    expect(src).toContain('h-16')
    expect(src).toContain('w-16')
  })

  test('has accessible role and aria-label', () => {
    expect(src).toContain("role='status'")
    expect(src).toContain("aria-label='Loading'")
  })
})
