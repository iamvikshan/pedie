import { describe, expect, test } from 'bun:test'
import type { CategoryWithChildren } from '@app-types/product'
import { MegaMenu } from '@components/layout/megaMenu'
import React from 'react'
import { mockNextLink, render, screen } from '../../utils'

mockNextLink()

const mockCategories: CategoryWithChildren[] = [
  {
    id: 'cat-1',
    name: 'Smartphones',
    slug: 'smartphones',
    description: null,
    image_url: null,
    parent_id: null,
    sort_order: 1,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    children: [
      {
        id: 'cat-1a',
        name: 'iPhones',
        slug: 'iphones',
        description: 'Apple smartphones',
        image_url: null,
        parent_id: 'cat-1',
        sort_order: 1,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
      {
        id: 'cat-1b',
        name: 'Samsung Galaxy',
        slug: 'samsung-galaxy',
        description: null,
        image_url: null,
        parent_id: 'cat-1',
        sort_order: 2,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
    ],
  },
  {
    id: 'cat-2',
    name: 'Laptops',
    slug: 'laptops',
    description: null,
    image_url: null,
    parent_id: null,
    sort_order: 2,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    children: [],
  },
]

const onClose = () => {}

describe('MegaMenu', () => {
  test('returns null when no activeCategory', () => {
    const { container } = render(
      <MegaMenu
        categories={mockCategories}
        activeCategory={null}
        onClose={onClose}
      />
    )
    expect(container.innerHTML).toBe('')
  })

  test('returns null when active category has no children', () => {
    const { container } = render(
      <MegaMenu
        categories={mockCategories}
        activeCategory='laptops'
        onClose={onClose}
      />
    )
    expect(container.innerHTML).toBe('')
  })

  test('renders subcategory links', () => {
    render(
      <MegaMenu
        categories={mockCategories}
        activeCategory='smartphones'
        onClose={onClose}
      />
    )

    const iphoneLink = screen.getByText('iPhones')
    expect(iphoneLink).toBeInTheDocument()
    expect(iphoneLink.closest('a')).toHaveAttribute(
      'href',
      '/collections/iphones'
    )

    expect(screen.getByText('Samsung Galaxy')).toBeInTheDocument()
  })

  test('shows description when available', () => {
    render(
      <MegaMenu
        categories={mockCategories}
        activeCategory='smartphones'
        onClose={onClose}
      />
    )

    expect(screen.getByText('Apple smartphones')).toBeInTheDocument()
  })

  test('renders grid layout', () => {
    const { container } = render(
      <MegaMenu
        categories={mockCategories}
        activeCategory='smartphones'
        onClose={onClose}
      />
    )

    const grid = container.querySelector('.grid')
    expect(grid).toBeInTheDocument()
  })
})
