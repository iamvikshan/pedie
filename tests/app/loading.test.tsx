import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = readFileSync(
  resolve('src/app/loading.tsx'),
  'utf-8'
)

describe('Homepage Loading', () => {
  test('imports Skeleton component', () => {
    expect(src).toContain("from '@components/ui/skeleton'")
  })

  test('renders skeleton placeholders', () => {
    expect(src).toContain('Skeleton')
  })

  test('has hero skeleton area', () => {
    expect(src).toContain('h-[400px]')
  })

  test('has product grid skeletons', () => {
    expect(src).toContain('aspect-square')
  })
})
