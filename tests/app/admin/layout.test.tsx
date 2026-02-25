import { describe, test, expect, mock, beforeEach } from 'bun:test'
import React from 'react'
import { renderToString } from 'react-dom/server'

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockRedirect = mock(() => {
  throw new Error('NEXT_REDIRECT')
})

mock.module('next/navigation', () => ({
  redirect: mockRedirect,
  useRouter: mock(() => ({})),
  usePathname: mock(() => '/admin'),
  useSearchParams: mock(() => new URLSearchParams()),
}))

mock.module('next/link', () => ({
  default: mock(({ children, href, ...props }: Record<string, unknown>) => {
    return React.createElement(
      'a',
      { href: href as string, ...props },
      children as React.ReactNode
    )
  }),
}))

const mockRequireAuth = mock(
  () => Promise.resolve({ id: 'user-1' }) as any
)

mock.module('@lib/auth/helpers', () => ({
  requireAuth: mockRequireAuth,
  getUser: mock(() => Promise.resolve(null)),
  getProfile: mock(() => Promise.resolve(null)),
  isAdmin: mock(() => Promise.resolve(false)),
}))

const mockIsUserAdmin = mock(() => Promise.resolve(true))

mock.module('@lib/auth/admin', () => ({
  isUserAdmin: mockIsUserAdmin,
}))

// Mock the sidebar as a simple component
mock.module('@components/admin/sidebar', () => ({
  AdminSidebar: mock(() =>
    React.createElement('nav', { 'data-testid': 'admin-sidebar' }, 'Sidebar')
  ),
}))

const AdminLayout = (await import('@/app/admin/layout')).default

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Admin Layout', () => {
  beforeEach(() => {
    mockRedirect.mockReset()
    mockRedirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })
    mockRequireAuth.mockReset()
    mockRequireAuth.mockResolvedValue({ id: 'user-1' } as any)
    mockIsUserAdmin.mockReset()
    mockIsUserAdmin.mockResolvedValue(true)
  })

  test('renders layout for admin user', async () => {
    mockIsUserAdmin.mockResolvedValue(true)

    const element = await AdminLayout({
      children: React.createElement('div', null, 'Admin Content'),
    })
    const html = renderToString(element)

    expect(html).toContain('Admin Dashboard')
    expect(html).toContain('Admin Content')
    expect(html).toContain('Sidebar')
  })

  test('redirects non-admin user to /', async () => {
    mockIsUserAdmin.mockResolvedValue(false)

    await expect(
      AdminLayout({
        children: React.createElement('div', null, 'Content'),
      })
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith('/')
  })

  test('redirects unauthenticated user', async () => {
    mockRequireAuth.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    await expect(
      AdminLayout({
        children: React.createElement('div', null, 'Content'),
      })
    ).rejects.toThrow('NEXT_REDIRECT')
  })
})
