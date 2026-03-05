import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const SOURCE = readFileSync(resolve('src/app/(store)/deals/page.tsx'), 'utf-8')

describe('Deals Page', () => {
  test('module exports default function', async () => {
    const mod = await import('@/../src/app/(store)/deals/page')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  test('imports getDealsListings from @data/deals', () => {
    expect(SOURCE).toContain('getDealsListings')
    expect(SOURCE).toContain('@data/deals')
  })

  test('imports ProductCard', () => {
    expect(SOURCE).toContain('ProductCard')
  })

  test('has Deals as page title', () => {
    expect(SOURCE).toContain('Deals')
  })

  test('exports metadata', () => {
    expect(SOURCE).toContain('export const metadata')
  })
})
