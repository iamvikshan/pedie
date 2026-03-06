import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = readFileSync(resolve('src/app/loading.tsx'), 'utf-8')

describe('Homepage Loading', () => {
  test('imports Skeleton component', () => {
    expect(src).toContain("from '@components/skeletons/skeleton'")
  })

  test('renders skeleton placeholders', () => {
    expect(src).toContain('Skeleton')
  })

  test('has hero skeleton area', () => {
    expect(src).toContain('h-[400px]')
  })

  test('has product grid skeletons with aspect-[3/4]', () => {
    expect(src).toContain('aspect-[3/4]')
    expect(src).not.toContain('aspect-square')
  })

  test('uses pedie-container', () => {
    expect(src).toContain('pedie-container')
    expect(src).not.toContain('max-w-7xl')
  })

  test('uses rounded-lg not rounded-2xl for card shapes', () => {
    expect(src).toContain('rounded-lg')
    expect(src).not.toContain('rounded-2xl')
  })
})
