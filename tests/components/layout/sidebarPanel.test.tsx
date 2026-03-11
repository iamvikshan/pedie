import { describe, expect, mock, test } from 'bun:test'
import type { Category } from '@app-types/product'
import { SidebarPanel } from '@components/layout/sidebarPanel'
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
    description: 'Mobile phones',
    image_url: '/images/categories/smartphones.jpg',
    icon: null,
    is_active: true,
    parent_id: null,
    sort_order: 1,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cat-2',
    name: 'Laptops',
    slug: 'laptops',
    description: 'Portable computers',
    image_url: null,
    icon: null,
    is_active: true,
    parent_id: null,
    sort_order: 2,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
]

const mockBrands = [
  {
    id: 'b-1',
    name: 'Apple',
    slug: 'apple',
    logo_url: '/brands/apple.png',
    sort_order: 1,
  },
  {
    id: 'b-2',
    name: 'Samsung',
    slug: 'samsung',
    logo_url: null,
    sort_order: 2,
  },
]

const defaultProps = {
  isOpen: true,
  onClose: mock(),
  categories: mockCategories,
  brands: mockBrands,
  variant: 'mobile' as const,
}

describe('SidebarPanel', () => {
  test('renders dialog with aria-modal when open', () => {
    render(<SidebarPanel {...defaultProps} />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  test('renders Hot Deals banner', () => {
    render(<SidebarPanel {...defaultProps} />)

    expect(screen.getByText('Hot Deals')).toBeInTheDocument()
    expect(screen.getByText('Shop Deals')).toBeInTheDocument()
  })

  test('renders quick links', () => {
    render(<SidebarPanel {...defaultProps} />)

    expect(screen.getByText('New Arrivals')).toBeInTheDocument()
    expect(screen.getByText('Best Sellers')).toBeInTheDocument()
    expect(screen.getByText('Trade In')).toBeInTheDocument()
    expect(screen.getByText('Repairs')).toBeInTheDocument()
  })

  test('renders top brands section', () => {
    render(<SidebarPanel {...defaultProps} />)

    expect(screen.getByText('Top Brands')).toBeInTheDocument()
    // Apple has a logo, Samsung has no logo and shows initial
    expect(screen.getByAltText('Apple')).toBeInTheDocument()
    expect(screen.getByText('S')).toBeInTheDocument()
  })

  test('renders category grid', () => {
    render(<SidebarPanel {...defaultProps} />)

    expect(screen.getByText('Categories')).toBeInTheDocument()
    // Category names appear as overlay text
    expect(screen.getAllByText('Smartphones').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Laptops').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('All Products')).toBeInTheDocument()
  })

  test('mobile variant shows Sign In and ThemeToggle', () => {
    render(<SidebarPanel {...defaultProps} variant='mobile' />)

    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument()
  })

  test('desktop variant hides account and theme section', () => {
    render(<SidebarPanel {...defaultProps} variant='desktop' />)

    expect(screen.queryByText('Sign In')).not.toBeInTheDocument()
    expect(
      screen.queryByLabelText('Switch to dark mode')
    ).not.toBeInTheDocument()
  })

  test('renders close button with accessible label', () => {
    render(<SidebarPanel {...defaultProps} />)

    expect(screen.getByLabelText('Close menu')).toBeInTheDocument()
  })

  test('does not render when closed', () => {
    render(<SidebarPanel {...defaultProps} isOpen={false} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('renders pedie logo link', () => {
    render(<SidebarPanel {...defaultProps} />)

    expect(screen.getByText('pedie')).toBeInTheDocument()
  })
})
