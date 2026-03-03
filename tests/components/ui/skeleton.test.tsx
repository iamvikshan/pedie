import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = readFileSync(
  resolve('src/components/ui/skeleton.tsx'),
  'utf-8'
)

describe('Skeleton Component', () => {
  test('module exports Skeleton function', async () => {
    const mod = await import('@components/ui/skeleton')
    expect(mod.Skeleton).toBeDefined()
    expect(typeof mod.Skeleton).toBe('function')
  })

  test('uses animate-pulse class', () => {
    expect(src).toContain('animate-pulse')
  })

  test('has accessible role and aria-label', () => {
    expect(src).toContain("role='status'")
    expect(src).toContain("aria-label='Loading'")
  })

  test('accepts className prop', () => {
    expect(src).toContain('className')
  })
})
