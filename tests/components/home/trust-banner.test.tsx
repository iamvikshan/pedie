import { describe, expect, test } from 'bun:test'
import { TrustBanner } from '@components/home/trustBanner'
import React from 'react'
import { mockNextLink, render, screen } from '../../utils'

mockNextLink()

describe('TrustBanner component', () => {
  test('renders heading', () => {
    render(<TrustBanner />)
    expect(screen.getByText('Why Buy Refurbished?')).toBeInTheDocument()
  })

  test('renders trust badges', () => {
    render(<TrustBanner />)
    expect(screen.getByText('Save up to 60%')).toBeInTheDocument()
    expect(screen.getByText('3-Month Warranty')).toBeInTheDocument()
    expect(screen.getByText('Quality Tested')).toBeInTheDocument()
    expect(screen.getByText('Fast Delivery')).toBeInTheDocument()
  })

  test('renders Learn More link', () => {
    render(<TrustBanner />)
    const link = screen.getByRole('link', { name: 'Learn More' })
    expect(link).toHaveAttribute('href', '/about')
  })
})
