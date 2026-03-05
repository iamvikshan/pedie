import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const src = readFileSync(resolve('src/app/(store)/trade-in/page.tsx'), 'utf-8')

describe('Trade In Page', () => {
  test('module exports default function', async () => {
    const mod = await import('@/../src/app/(store)/trade-in/page')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  test('exports metadata with title', async () => {
    const mod = await import('@/../src/app/(store)/trade-in/page')
    expect(mod.metadata).toBeDefined()
    expect(mod.metadata.title).toContain('Trade In')
  })

  test('renders Coming Soon badge', () => {
    expect(src).toContain('Coming Soon')
  })

  test('uses TbArrowsExchange icon', () => {
    expect(src).toContain('TbArrowsExchange')
  })

  test('has Trade In heading', () => {
    expect(src).toContain('Trade In')
  })

  test('has description about trading devices', () => {
    expect(src).toContain('Trade in your old devices')
  })

  test('uses pedie design tokens', () => {
    expect(src).toContain('text-pedie-text')
    expect(src).toContain('text-pedie-text-muted')
    expect(src).toContain('text-pedie-green')
  })
})
