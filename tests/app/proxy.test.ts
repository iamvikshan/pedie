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

  test('should set enforcing CSP header in source', () => {
    const proxySource = readFileSync('src/proxy.ts', 'utf8')
    expect(proxySource).toContain('Content-Security-Policy')
    expect(proxySource).toContain("frame-ancestors 'none'")
    expect(proxySource).toContain('script-src')
  })

  test('should set HSTS header in source', () => {
    const proxySource = readFileSync('src/proxy.ts', 'utf8')
    expect(proxySource).toContain('Strict-Transport-Security')
    expect(proxySource).toContain('max-age=63072000')
  })

  test('should implement nonce-based CSP for all routes', () => {
    const proxySource = readFileSync('src/proxy.ts', 'utf8')
    expect(proxySource).toContain('nonce')
    expect(proxySource).toContain("'self' 'nonce-")
    expect(proxySource).toContain('x-csp-nonce')
  })

  test('should add unsafe-eval only in development', () => {
    const proxySource = readFileSync('src/proxy.ts', 'utf8')
    expect(proxySource).toContain("'unsafe-eval'")
    expect(proxySource).toContain('development')
  })
})
