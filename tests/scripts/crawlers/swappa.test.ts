import { describe, expect, test } from 'bun:test'

const { parseSwappaPage } = await import('../../../scripts/crawlers/swappa')

// ── HTML Fixtures ──────────────────────────────────────────────────────────

const SWAPPA_HTML = `
<html>
<body>
  <div class="listing_row">
    <a href="/listing/view/ABCD" class="listing-link">
      <h3>Apple iPhone 15 128GB</h3>
    </a>
    <div class="price">$499</div>
  </div>
  <div class="listing_row">
    <a href="/listing/view/EFGH" class="listing-link">
      <h3>Apple iPhone 15 256GB</h3>
    </a>
    <div class="price">$549.99</div>
  </div>
</body>
</html>
`

const SWAPPA_EMPTY_HTML = `
<html><body><p>No listings found</p></body></html>
`

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Swappa Crawler', () => {
  describe('parseSwappaPage', () => {
    test('parses USD prices and converts to KES', () => {
      const results = parseSwappaPage(SWAPPA_HTML)
      expect(results.length).toBeGreaterThanOrEqual(1)

      const first = results[0]
      // $499 * 130 = 64870
      expect(first.price_kes).toBe(64870)
      expect(first.url).toContain('/listing/')
    })

    test('returns empty array for no results page', () => {
      const results = parseSwappaPage(SWAPPA_EMPTY_HTML)
      expect(results).toHaveLength(0)
    })

    test('converts fractional USD correctly', () => {
      const results = parseSwappaPage(SWAPPA_HTML)
      expect(results.length).toBeGreaterThanOrEqual(2)
      // $549.99 * 130 = 71498.7 → round to 71499
      expect(results[1].price_kes).toBe(71499)
    })
  })
})
