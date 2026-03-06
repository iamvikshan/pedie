import { describe, expect, mock, test } from 'bun:test'
import React from 'react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mockNextLink, render, screen } from '../../utils'

// Simulate mobile viewport for accordion tests
window.matchMedia = (query: string) =>
  ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
  }) as MediaQueryList

// Mock NewsletterSignup as it uses client hooks
mock.module('@components/layout/newsletterSignup', () => ({
  NewsletterSignup: () =>
    React.createElement(
      'div',
      { 'data-testid': 'newsletter-signup' },
      'Newsletter'
    ),
}))

mockNextLink()

const { Footer, FOOTER_LINKS } = await import('@components/layout/footer')
const footerSrc = readFileSync(
  resolve('src/components/layout/footer.tsx'),
  'utf-8'
)

describe('Footer', () => {
  test('renders pedie brand name', () => {
    render(<Footer />)

    expect(screen.getByText('pedie')).toBeInTheDocument()
  })

  test('FOOTER_LINKS has 4 groups', () => {
    expect(FOOTER_LINKS.length).toBe(4)
  })

  test('renders all link group titles', () => {
    render(<Footer />)

    expect(
      screen.getByRole('button', { name: 'About Pedie' })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Shop' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Help' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Policies' })).toBeInTheDocument()
  })

  test('renders shop links', () => {
    render(<Footer />)

    expect(screen.getByText('Smartphones')).toBeInTheDocument()
    expect(screen.getByText('Laptops')).toBeInTheDocument()
    expect(screen.getByText('Deals')).toBeInTheDocument()
  })

  test('renders social media links', () => {
    render(<Footer />)

    expect(screen.getByLabelText('TikTok')).toBeInTheDocument()
    expect(screen.getByLabelText('Instagram')).toBeInTheDocument()
    expect(screen.getByLabelText('X (Twitter)')).toBeInTheDocument()
    expect(screen.getByLabelText('YouTube')).toBeInTheDocument()
    expect(screen.getByLabelText('GitHub')).toBeInTheDocument()
  })

  test('renders M-PESA and PayPal badges', () => {
    render(<Footer />)

    expect(screen.getByText('M-PESA')).toBeInTheDocument()
    expect(screen.getByText('PayPal')).toBeInTheDocument()
  })

  test('renders copyright text', () => {
    render(<Footer />)

    expect(screen.getByText(/All rights reserved/)).toBeInTheDocument()
  })

  test('renders newsletter signup', () => {
    render(<Footer />)

    expect(screen.getByTestId('newsletter-signup')).toBeInTheDocument()
  })

  test('renders legal links', () => {
    render(<Footer />)

    expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
    expect(screen.getByText('Terms of Service')).toBeInTheDocument()
  })

  test('does not use details/summary elements for accordions', () => {
    expect(footerSrc).not.toContain('<details')
    expect(footerSrc).not.toContain('<summary')
  })

  test('uses footer accordion component', () => {
    expect(footerSrc).toContain('<FooterAccordion')
  })

  test('renders footer-accordion wrappers collapsed by default on mobile', () => {
    const { container } = render(<Footer />)
    const accordions = container.querySelectorAll('.footer-accordion')

    expect(accordions.length).toBe(FOOTER_LINKS.length)
    accordions.forEach(accordion => {
      expect(accordion.hasAttribute('data-open')).toBe(false)
    })
  })
})
