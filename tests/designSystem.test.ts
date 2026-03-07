import { describe, expect, test } from 'bun:test'
import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'

const ROOT = join(import.meta.dir, '..')
const GLOBALS_CSS = join(ROOT, 'src/app/globals.css')
const COMPONENTS_DIR = join(ROOT, 'src/components')

function walkFiles(dir: string): string[] {
  const results: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      results.push(...walkFiles(full))
    } else {
      results.push(full)
    }
  }
  return results
}

function componentFiles(): string[] {
  return walkFiles(COMPONENTS_DIR).filter(f => /\.(tsx?|jsx?)$/.test(f))
}

describe('Design System Tokens', () => {
  const css = readFileSync(GLOBALS_CSS, 'utf-8')

  // Split CSS into @theme (light) and .dark sections for structural validation
  const darkBlockStart = css.indexOf('.dark {')
  const themeBlock = css.slice(0, darkBlockStart)
  const darkBlock = css.slice(darkBlockStart)

  const requiredTokens = [
    '--color-pedie-success',
    '--color-pedie-success-bg',
    '--color-pedie-error',
    '--color-pedie-error-bg',
    '--color-pedie-warning',
    '--color-pedie-warning-bg',
    '--color-pedie-info',
    '--color-pedie-info-bg',
    '--color-pedie-sunken',
  ]

  test.each(requiredTokens)(
    'globals.css @theme block contains semantic token %s',
    token => {
      expect(themeBlock).toContain(token)
    }
  )

  test.each(requiredTokens)(
    'globals.css .dark block contains semantic token %s',
    token => {
      expect(darkBlock).toContain(token)
    }
  )

  test('no component uses the banned pedie-primary token', () => {
    const violations: string[] = []
    for (const file of componentFiles()) {
      const content = readFileSync(file, 'utf-8')
      if (content.includes('pedie-primary')) {
        violations.push(file.replace(ROOT + '/', ''))
      }
    }
    expect(violations).toEqual([])
  })

  test('no component uses bare pedie-muted token (should be pedie-text-muted)', () => {
    // Match pedie-muted that is NOT part of pedie-text-muted
    const barePattern = /pedie-(?!text-)muted/g
    const violations: string[] = []
    for (const file of componentFiles()) {
      const content = readFileSync(file, 'utf-8')
      if (barePattern.test(content)) {
        violations.push(file.replace(ROOT + '/', ''))
        barePattern.lastIndex = 0
      }
    }
    expect(violations).toEqual([])
  })
})
