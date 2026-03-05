import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const hookSource = readFileSync(
  resolve('src/hooks/useScrollDirection.ts'),
  'utf-8'
)

describe('useScrollDirection', () => {
  test('module exports useScrollDirection function', async () => {
    const mod = await import('@/hooks/useScrollDirection')
    expect(mod.useScrollDirection).toBeDefined()
    expect(typeof mod.useScrollDirection).toBe('function')
  })

  test('SCROLL_THRESHOLD is exported and equals 10', async () => {
    const mod = await import('@/hooks/useScrollDirection')
    expect(mod.SCROLL_THRESHOLD).toBe(10)
  })

  test('exports ScrollDirection type as up | down', () => {
    expect(hookSource).toContain("'up' | 'down'")
  })

  test('uses use client directive for client-side hook', () => {
    expect(hookSource).toContain("'use client'")
  })

  test('initializes direction state to up', () => {
    expect(hookSource).toContain("useState<ScrollDirection>('up')")
  })

  test('registers scroll event listener with passive option', () => {
    expect(hookSource).toContain('{ passive: true }')
  })

  test('cleans up scroll listener on unmount', () => {
    expect(hookSource).toContain('removeEventListener')
  })

  test('compares delta against SCROLL_THRESHOLD before updating', () => {
    expect(hookSource).toContain('Math.abs(delta) >= SCROLL_THRESHOLD')
  })

  test('sets direction to down when delta is positive', () => {
    expect(hookSource).toContain("delta > 0 ? 'down' : 'up'")
  })
})
