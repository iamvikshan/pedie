import { describe, expect, test } from 'bun:test'
import { Breadcrumbs } from '@components/ui/breadcrumbs'
import React from 'react'
import { mockNextLink, render, screen } from '../../utils'

mockNextLink()

describe('Breadcrumbs Component', () => {
  test('renders breadcrumb links correctly', () => {
    const segments = [
      { name: 'Phones', href: '/shop/phones' },
      { name: 'iPhone 13' },
    ]
    render(<Breadcrumbs segments={segments} />)

    // "Shop" is always rendered as the first link
    expect(screen.getByText('Shop')).toBeInTheDocument()
    expect(screen.getByText('Phones')).toBeInTheDocument()
    expect(screen.getByText('iPhone 13')).toBeInTheDocument()

    const links = screen.getAllByRole('link')
    expect(links.length).toBe(2) // Shop + Phones
    expect(links[0].getAttribute('href')).toBe('/shop')
    expect(links[1].getAttribute('href')).toBe('/shop/phones')
  })
})
