import { describe, test, expect } from 'bun:test'
import { proxy, config } from '@/proxy'

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
})
