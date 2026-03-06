import { describe, expect, mock, test } from 'bun:test'
import React from 'react'
import { mockFramerMotion, mockNextModules, render, screen } from '../../utils'

// Mock auth provider
mock.module('@components/auth/authProvider', () => ({
  useAuth: mock(() => ({ user: null, loading: false, profile: null })),
}))

// Mock useScrollDirection
mock.module('@/hooks/useScrollDirection', () => ({
  useScrollDirection: mock(() => 'up'),
}))

// Mock next-themes for ThemeToggle
mock.module('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    resolvedTheme: 'light',
    setTheme: mock(() => {}),
  }),
}))

// Mock UserMenu
mock.module('@components/auth/userMenu', () => ({
  UserMenu: () =>
    React.createElement('div', { 'data-testid': 'user-menu' }, 'UserMenu'),
}))

// Mock SearchBar
mock.module('@components/layout/searchBar', () => ({
  SearchBar: ({ defaultExpanded }: { defaultExpanded?: boolean }) =>
    React.createElement(
      'div',
      { 'data-testid': 'search-bar', 'data-expanded': defaultExpanded },
      'SearchBar'
    ),
}))

// Mock CategoryNav
mock.module('@components/layout/categoryNav', () => ({
  CategoryNav: () =>
    React.createElement(
      'div',
      { 'data-testid': 'category-nav' },
      'CategoryNav'
    ),
}))

// Mock MobileNav
mock.module('@components/layout/mobileNav', () => ({
  MobileNav: ({ categories }: { categories: unknown[] }) =>
    React.createElement(
      'div',
      { 'data-testid': 'mobile-nav', 'data-categories': categories?.length },
      'MobileNav'
    ),
}))

// Mock SidebarPanel
mock.module('@components/layout/sidebarPanel', () => ({
  SidebarPanel: () =>
    React.createElement(
      'div',
      { 'data-testid': 'sidebar-panel' },
      'SidebarPanel'
    ),
}))

mockFramerMotion()
mockNextModules()

// Import after mocks
const { Header } = await import('@components/layout/header')

describe('Header', () => {
  test('renders pedie logo', () => {
    render(<Header />)

    expect(screen.getByText('pedie')).toBeInTheDocument()
  })

  test('renders cart link with accessible label', () => {
    render(<Header />)

    expect(screen.getByLabelText('Cart')).toBeInTheDocument()
  })

  test('renders sign-in link when not authenticated', () => {
    render(<Header />)

    expect(screen.getByLabelText('Sign In')).toBeInTheDocument()
  })

  test('renders Trade In link', () => {
    render(<Header />)

    expect(screen.getByLabelText('Trade In')).toBeInTheDocument()
  })

  test('renders Repairs link', () => {
    render(<Header />)

    expect(screen.getByLabelText('Repairs')).toBeInTheDocument()
  })

  test('renders Deals link in Row 2', () => {
    render(<Header />)

    expect(screen.getByText('Deals')).toBeInTheDocument()
  })

  test('renders All Items button in Row 2', () => {
    render(<Header />)

    expect(screen.getByLabelText('All Items')).toBeInTheDocument()
  })

  test('renders SearchBar component', () => {
    render(<Header />)

    expect(screen.getAllByTestId('search-bar').length).toBeGreaterThanOrEqual(1)
  })

  test('renders MobileNav component', () => {
    render(<Header />)

    expect(screen.getByTestId('mobile-nav')).toBeInTheDocument()
  })

  test('renders CategoryNav component', () => {
    render(<Header />)

    expect(screen.getByTestId('category-nav')).toBeInTheDocument()
  })

  test('renders ThemeToggle', () => {
    render(<Header />)

    expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument()
  })

  test('renders SidebarPanel component', () => {
    render(<Header />)

    expect(screen.getByTestId('sidebar-panel')).toBeInTheDocument()
  })
})
