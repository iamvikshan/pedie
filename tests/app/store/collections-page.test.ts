import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = readFileSync(
  resolve('src/app/(store)/collections/[slug]/page.tsx'),
  'utf-8'
)

describe('Collections Page', () => {
  test('uses Breadcrumbs component', () => {
    expect(src).toContain('<Breadcrumbs')
    expect(src).toContain("from '@components/ui/breadcrumbs'")
  })

  test('structured data uses Shop instead of Home', () => {
    expect(src).toContain("name: 'Shop'")
    expect(src).not.toContain("name: 'Home'")
  })

  test('structured data breadcrumb URL points to /shop', () => {
    expect(src).toContain('`${SITE_URL}/shop`')
  })
})
