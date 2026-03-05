import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const cssSource = readFileSync(resolve('src/app/globals.css'), 'utf-8')

describe('globals.css', () => {
  test('glass utility uses 24px blur (not 16px)', () => {
    expect(cssSource).toContain('blur(24px)')
    expect(cssSource).not.toContain('blur(16px)')
  })

  test('glass-search utility has inset box-shadow for sunken effect', () => {
    expect(cssSource).toContain('.glass-search')
    expect(cssSource).toContain('inset 0 2px 4px')
  })

  test('glass-depth utility exists for header depth', () => {
    expect(cssSource).toContain('.glass-depth')
    expect(cssSource).toContain('border-bottom')
  })

  test('dark mode overrides for glass-search', () => {
    expect(cssSource).toContain('.dark .glass-search')
  })

  test('dark mode overrides for glass-depth', () => {
    expect(cssSource).toContain('.dark .glass-depth')
  })

  test('html element has overflow-x hidden to prevent horizontal scroll', () => {
    expect(cssSource).toMatch(/html\s*\{[^}]*overflow-x:\s*hidden/)
  })

  test('defines pedie-green color tokens', () => {
    expect(cssSource).toContain('--color-pedie-green: #22c55e')
    expect(cssSource).toContain('--color-pedie-green-light')
    expect(cssSource).toContain('--color-pedie-green-dark')
  })

  test('defines light and dark glass tokens', () => {
    expect(cssSource).toContain('--color-pedie-glass:')
    expect(cssSource).toContain('--color-pedie-glass-border:')
    expect(cssSource).toContain('--color-pedie-glass-hover:')
  })
})
