import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen } from '../../utils'

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

const src = readFileSync(
  resolve('src/components/layout/footerAccordion.tsx'),
  'utf-8'
)

describe('FooterAccordion', () => {
  test('module exports FooterAccordion function', async () => {
    const mod = await import('@components/layout/footerAccordion')
    expect(mod.FooterAccordion).toBeDefined()
    expect(typeof mod.FooterAccordion).toBe('function')
  })

  test('uses footer-accordion class and button-based heading', () => {
    expect(src).toContain("className='footer-accordion'")
    expect(src).toContain('<button')
    expect(src).not.toContain('<details')
    expect(src).not.toContain('<summary')
  })

  test('renders accordion heading button and links content', async () => {
    const { FooterAccordion } =
      await import('@components/layout/footerAccordion')

    render(
      <FooterAccordion title='Shop'>
        <li>
          <span>Smartphones</span>
        </li>
      </FooterAccordion>
    )

    expect(screen.getByRole('button', { name: 'Shop' })).toBeInTheDocument()
    expect(screen.getByText('Smartphones')).toBeInTheDocument()
  })

  test('toggles data-open and aria-expanded on click', async () => {
    const { fireEvent } = await import('@testing-library/react')
    const { FooterAccordion } =
      await import('@components/layout/footerAccordion')

    render(
      <FooterAccordion title='Help'>
        <li>
          <span>FAQ</span>
        </li>
      </FooterAccordion>
    )

    const button = screen.getByRole('button', { name: 'Help' })
    const wrapper = button.closest('.footer-accordion')

    expect(wrapper).not.toBeNull()
    expect(wrapper?.hasAttribute('data-open')).toBe(false)
    expect(button.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(button)

    expect(wrapper?.getAttribute('data-open')).toBe('true')
    expect(button.getAttribute('aria-expanded')).toBe('true')

    fireEvent.click(button)

    expect(wrapper?.hasAttribute('data-open')).toBe(false)
    expect(button.getAttribute('aria-expanded')).toBe('false')
  })
})
