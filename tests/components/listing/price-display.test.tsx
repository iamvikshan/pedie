import { describe, expect, test } from 'bun:test'
import { PriceDisplay } from '@components/listing/priceDisplay'
import React from 'react'
import { render, screen } from '../../utils'

describe('PriceDisplay', () => {
  test('shows formatted price', () => {
    render(
      <PriceDisplay
        priceKes={45000}
        originalPriceKes={45000}
        isPreorder={false}
      />
    )

    expect(screen.getByText(/45,000/)).toBeInTheDocument()
  })

  test('shows discount when original > current', () => {
    const { container } = render(
      <PriceDisplay
        priceKes={45000}
        originalPriceKes={55000}
        isPreorder={false}
      />
    )

    expect(screen.getByText(/45,000/)).toBeInTheDocument()
    expect(screen.getByText(/55,000/)).toBeInTheDocument()
    // Discount percentage rendered in DOM (no HTML comments like renderToString)
    expect(container.textContent).toContain('18%')
    // line-through class on original price
    const strikethrough = screen.getByText(/55,000/)
    expect(strikethrough.className).toContain('line-through')
  })

  test('does not show discount when prices are equal', () => {
    const { container } = render(
      <PriceDisplay
        priceKes={50000}
        originalPriceKes={50000}
        isPreorder={false}
      />
    )

    expect(screen.getByText(/50,000/)).toBeInTheDocument()
    expect(container.innerHTML).not.toContain('line-through')
  })

  test('shows deposit info for preorder', () => {
    render(
      <PriceDisplay
        priceKes={45000}
        originalPriceKes={55000}
        isPreorder={true}
      />
    )

    expect(screen.getByText(/Preorder Deposit/)).toBeInTheDocument()
    // 5% of 45000 = 2250
    expect(screen.getByText(/2,250/)).toBeInTheDocument()
  })

  test('shows higher deposit for expensive items', () => {
    render(
      <PriceDisplay
        priceKes={100000}
        originalPriceKes={120000}
        isPreorder={true}
      />
    )

    expect(screen.getByText(/Preorder Deposit/)).toBeInTheDocument()
    // 10% of 100000 = 10000
    expect(screen.getByText(/10,000/)).toBeInTheDocument()
  })

  test('does not show deposit info when not preorder', () => {
    render(
      <PriceDisplay
        priceKes={45000}
        originalPriceKes={55000}
        isPreorder={false}
      />
    )

    expect(screen.queryByText(/Preorder Deposit/)).not.toBeInTheDocument()
  })
})
