import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const src = readFileSync(resolve('src/app/(store)/repairs/page.tsx'), 'utf-8')

describe('Repairs Page', () => {
  test('module exports default function', async () => {
    const mod = await import('@/../src/app/(store)/repairs/page')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  test('exports metadata with title', async () => {
    const mod = await import('@/../src/app/(store)/repairs/page')
    expect(mod.metadata).toBeDefined()
    expect(mod.metadata.title).toContain('Repairs')
  })

  test('renders Coming Soon badge', () => {
    expect(src).toContain('Coming Soon')
  })

  test('uses TbTool icon', () => {
    expect(src).toContain('TbTool')
  })

  test('has Repairs heading', () => {
    expect(src).toContain('Repairs')
  })

  test('has description about repair services', () => {
    expect(src).toContain('repair services')
  })

  test('uses pedie design tokens', () => {
    expect(src).toContain('text-pedie-text')
    expect(src).toContain('text-pedie-text-muted')
    expect(src).toContain('text-pedie-green')
  })
})
