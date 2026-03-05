import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const src = readFileSync(resolve('src/components/ui/breadcrumbs.tsx'), 'utf-8')

describe('Breadcrumbs', () => {
  test('module exports the component and types', async () => {
    const mod = await import('@components/ui/breadcrumbs')
    expect(mod.Breadcrumbs).toBeDefined()
    expect(typeof mod.Breadcrumbs).toBe('function')
  })

  test('exports BreadcrumbSegment type', () => {
    expect(src).toContain('export type BreadcrumbSegment')
    expect(src).toContain('name: string')
    expect(src).toContain('href?: string')
  })

  test('renders Shop link as first breadcrumb', () => {
    expect(src).toContain("href='/shop'")
    expect(src).toContain('Shop')
  })

  test('has accessible nav landmark with aria-label', () => {
    expect(src).toContain("aria-label='Breadcrumb'")
    expect(src).toContain('<nav')
  })

  test('uses TbChevronRight as separator icon', () => {
    expect(src).toContain('TbChevronRight')
    expect(src).toContain("import { TbChevronRight } from 'react-icons/tb'")
  })

  test('renders last segment as plain text, not a link', () => {
    expect(src).toContain('isLast')
    expect(src).toContain('<span')
    expect(src).toContain('text-pedie-text font-medium')
  })

  test('uses pedie design tokens for styling', () => {
    expect(src).toContain('text-pedie-text-muted')
    expect(src).toContain('hover:text-pedie-green')
  })

  test('uses ordered list for semantic structure', () => {
    expect(src).toContain('<ol')
    expect(src).toContain('<li')
  })

  test('is a server component (no use client directive)', () => {
    expect(src).not.toContain("'use client'")
    expect(src).not.toContain('"use client"')
  })
})
