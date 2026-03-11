import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'fs'
import { config, proxy } from '@/proxy'

describe('proxy', () => {
  test('exports proxy function', () => {
    expect(typeof proxy).toBe('function')
  })

  test('exports config with matcher', () => {
    expect(config).toBeDefined()
    expect(Array.isArray(config.matcher)).toBe(true)
    expect(config.matcher.length).toBeGreaterThan(0)
  })

  test('matcher excludes static files', () => {
    const pattern = config.matcher[0]
    expect(pattern).toContain('_next/static')
    expect(pattern).toContain('_next/image')
    expect(pattern).toContain('favicon.ico')
  })

  test('does not set deprecated X-XSS-Protection header', () => {
    const proxySource = readFileSync('src/proxy.ts', 'utf8')
    expect(proxySource).not.toContain('X-XSS-Protection')
  })
})
