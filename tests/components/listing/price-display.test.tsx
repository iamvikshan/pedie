import { describe, test, expect } from 'bun:test'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { PriceDisplay } from '@components/listing/priceDisplay'

describe('PriceDisplay', () => {
  test('shows formatted price', () => {
    const html = renderToString(
      <PriceDisplay
        priceKes={45000}
        originalPriceKes={45000}
        isPreorder={false}
      />
    )

    expect(html).toContain('45,000')
  })

  test('shows discount when original > current', () => {
    const html = renderToString(
      <PriceDisplay
        priceKes={45000}
        originalPriceKes={55000}
        isPreorder={false}
      />
    )

    expect(html).toContain('45,000')
    expect(html).toContain('55,000')
    // React renderToString inserts <!-- --> between JSX expressions
    expect(html).toMatch(/18<!-- -->%/)
    expect(html).toContain('line-through')
  })

  test('does not show discount when prices are equal', () => {
    const html = renderToString(
      <PriceDisplay
        priceKes={50000}
        originalPriceKes={50000}
        isPreorder={false}
      />
    )

    expect(html).toContain('50,000')
    expect(html).not.toContain('line-through')
  })

  test('shows deposit info for preorder', () => {
    const html = renderToString(
      <PriceDisplay
        priceKes={45000}
        originalPriceKes={55000}
        isPreorder={true}
      />
    )

    expect(html).toContain('Preorder Deposit')
    // 5% of 45000 = 2250
    expect(html).toContain('2,250')
  })

  test('shows higher deposit for expensive items', () => {
    const html = renderToString(
      <PriceDisplay
        priceKes={100000}
        originalPriceKes={120000}
        isPreorder={true}
      />
    )

    expect(html).toContain('Preorder Deposit')
    // 10% of 100000 = 10000
    expect(html).toContain('10,000')
  })

  test('does not show deposit info when not preorder', () => {
    const html = renderToString(
      <PriceDisplay
        priceKes={45000}
        originalPriceKes={55000}
        isPreorder={false}
      />
    )

    expect(html).not.toContain('Preorder Deposit')
  })
})
