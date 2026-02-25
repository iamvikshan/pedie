import { describe, test, expect } from 'bun:test'

const { parseJijiPage } = await import('../../../scripts/crawlers/jiji')

// ── HTML Fixtures ──────────────────────────────────────────────────────────

const JIJI_HTML = `
<html>
<body>
  <div data-testid="listing-card">
    <a href="/mobile-phones/apple-iphone-14-128gb-abc123.html">
      <h3>Apple iPhone 14 128GB</h3>
    </a>
    <span data-testid="listing-price">KES 78,000</span>
  </div>
  <div data-testid="listing-card">
    <a href="/mobile-phones/samsung-galaxy-s23-xyz789.html">
      <h3>Samsung Galaxy S23</h3>
    </a>
    <span data-testid="listing-price">Ksh 95,500</span>
  </div>
</body>
</html>
`

const JIJI_EMPTY_HTML = `
<html><body><p>No ads found</p></body></html>
`

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Jiji Crawler', () => {
  describe('parseJijiPage', () => {
    test('parses KES prices from listings', () => {
      const results = parseJijiPage(JIJI_HTML)
      expect(results).toHaveLength(2)

      expect(results[0].price_kes).toBe(78000)
      expect(results[0].url).toContain('/mobile-phones/apple-iphone-14')
    })

    test('returns empty array for no results page', () => {
      const results = parseJijiPage(JIJI_EMPTY_HTML)
      expect(results).toHaveLength(0)
    })

    test('parses Ksh prefix', () => {
      const results = parseJijiPage(JIJI_HTML)
      expect(results[1].price_kes).toBe(95500)
    })

    test('resolves relative URLs to absolute', () => {
      const results = parseJijiPage(JIJI_HTML)
      expect(results[0].url).toBe(
        'https://jiji.co.ke/mobile-phones/apple-iphone-14-128gb-abc123.html',
      )
    })
  })
})
