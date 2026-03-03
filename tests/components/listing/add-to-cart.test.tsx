import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const src = readFileSync(
  resolve('src/components/listing/addToCart.tsx'),
  'utf-8'
)

describe('AddToCart Component', () => {
  test('standard listing renders Add to Cart text', () => {
    expect(src).toContain("listing.is_preorder ? 'Preorder Now' : 'Add to Cart'")
  })

  test('sold out listing renders Sold Out button', () => {
    expect(src).toContain('Sold Out')
    expect(src).toContain('listing.is_sold')
  })

  test('affiliate listing renders external link', () => {
    expect(src).toContain("listing.listing_type === 'affiliate' && listing.source_url")
    expect(src).toContain("target='_blank'")
    expect(src).toContain("rel='noopener noreferrer'")
  })

  test('preorder listing renders Preorder Now text', () => {
    expect(src).toContain("'Preorder Now'")
  })
})
