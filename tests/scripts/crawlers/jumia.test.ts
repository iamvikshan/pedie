import { describe, test, expect } from 'bun:test'

const { parseJumiaPage } = await import('../../../scripts/crawlers/jumia')

// ── HTML Fixtures ──────────────────────────────────────────────────────────

const JUMIA_HTML = `
<html>
<body>
  <article class="prd">
    <a href="/apple-iphone-14-128gb-midnight-mp123.html">
      <h3>Apple iPhone 14 128GB Midnight</h3>
    </a>
    <div class="prc">KES 82,000</div>
  </article>
  <article class="prd">
    <a href="/samsung-galaxy-s24-ultra-256gb-mp456.html">
      <h3>Samsung Galaxy S24 Ultra 256GB</h3>
    </a>
    <div class="prc">KES 168,000</div>
  </article>
</body>
</html>
`

const JUMIA_EMPTY_HTML = `
<html><body><div>No products found for your search</div></body></html>
`

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Jumia Crawler', () => {
  describe('parseJumiaPage', () => {
    test('parses KES prices from product cards', () => {
      const results = parseJumiaPage(JUMIA_HTML)
      expect(results).toHaveLength(2)

      expect(results[0].price_kes).toBe(82000)
      expect(results[0].url).toContain('/apple-iphone-14')
    })

    test('returns empty array for no results page', () => {
      const results = parseJumiaPage(JUMIA_EMPTY_HTML)
      expect(results).toHaveLength(0)
    })

    test('parses large KES prices', () => {
      const results = parseJumiaPage(JUMIA_HTML)
      expect(results[1].price_kes).toBe(168000)
    })

    test('resolves relative URLs to absolute', () => {
      const results = parseJumiaPage(JUMIA_HTML)
      expect(results[0].url).toBe(
        'https://www.jumia.co.ke/apple-iphone-14-128gb-midnight-mp123.html',
      )
    })
  })
})
