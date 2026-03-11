import { describe, expect, mock, test } from 'bun:test'
import type { Category } from '@app-types/product'
import { MobileNav } from '@components/layout/mobileNav'
import React from 'react'
import {
  mockFramerMotion,
  mockNextImage,
  mockNextLink,
  mockNextNavigation,
  render,
  screen,
} from '../../utils'

// Mock auth provider
mock.module('@components/auth/authProvider', () => ({
  useAuth: mock(() => ({ user: null, loading: false, profile: null })),
}))

// Mock next-themes for ThemeToggle
mock.module('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    resolvedTheme: 'light',
    setTheme: mock(() => {}),
  }),
}))

mockFramerMotion()
mockNextLink()
mockNextImage()
mockNextNavigation()

const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Smartphones',
    slug: 'smartphones',
    description: null,
    image_url: null,
    icon: null,
    is_active: true,
    parent_id: null,
    sort_order: 1,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
]

const mockBrands = [
  { id: 'b-1', name: 'Apple', slug: 'apple', logo_url: null, sort_order: 1 },
]

describe('MobileNav', () => {
  test('renders hamburger button with accessible label', () => {
    render(<MobileNav categories={mockCategories} brands={mockBrands} />)

    expect(screen.getByLabelText('Open menu')).toBeInTheDocument()
  })

  test('does not show sidebar panel initially', () => {
    render(<MobileNav categories={mockCategories} brands={mockBrands} />)

    // SidebarPanel is rendered but with isOpen=false, so dialog should not be visible
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('passes mobile variant to SidebarPanel', async () => {
    const { fireEvent } = await import('@testing-library/react')
    render(<MobileNav categories={mockCategories} brands={mockBrands} />)

    // Click hamburger to open
    fireEvent.click(screen.getByLabelText('Open menu'))

    // SidebarPanel should now render with mobile variant (shows Sign In)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  test('passes categories to SidebarPanel', async () => {
    const { fireEvent } = await import('@testing-library/react')
    render(<MobileNav categories={mockCategories} brands={mockBrands} />)

    fireEvent.click(screen.getByLabelText('Open menu'))

    // Categories are rendered inside the sidebar
    expect(screen.getAllByText('Smartphones').length).toBeGreaterThanOrEqual(1)
  })
})
