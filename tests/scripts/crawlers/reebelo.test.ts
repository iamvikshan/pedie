import { describe, expect, test } from "bun:test";

const { parseReebeloPage } = await import("../../../scripts/crawlers/reebelo");

// ── HTML Fixtures ──────────────────────────────────────────────────────────

const REEBELO_HTML = `
<html>
<body>
  <div data-testid="product-card">
    <a href="/products/apple-iphone-15-128gb">
      <h3>Apple iPhone 15 128GB</h3>
    </a>
    <span data-testid="product-price">$459.00</span>
  </div>
  <div data-testid="product-card">
    <a href="/products/apple-iphone-15-256gb">
      <h3>Apple iPhone 15 256GB</h3>
    </a>
    <span data-testid="product-price">$529.99</span>
  </div>
</body>
</html>
`;

const REEBELO_EMPTY_HTML = `
<html><body><p>No products found</p></body></html>
`;

// ── Tests ──────────────────────────────────────────────────────────────────

describe("Reebelo Crawler", () => {
	describe("parseReebeloPage", () => {
		test("parses USD prices and converts to KES", () => {
			const results = parseReebeloPage(REEBELO_HTML);
			expect(results).toHaveLength(2);

			const first = results[0];
			// $459.00 * 130 = 59670
			expect(first.price_kes).toBe(59670);
			expect(first.url).toContain("/products/apple-iphone-15-128gb");
		});

		test("returns empty array for no results page", () => {
			const results = parseReebeloPage(REEBELO_EMPTY_HTML);
			expect(results).toHaveLength(0);
		});

		test("converts fractional USD correctly", () => {
			const results = parseReebeloPage(REEBELO_HTML);
			// $529.99 * 130 = 68898.7 → round to 68899
			expect(results[1].price_kes).toBe(68899);
		});

		test("resolves relative URLs to absolute", () => {
			const results = parseReebeloPage(REEBELO_HTML);
			expect(results[0].url).toBe(
				"https://www.reebelo.com/products/apple-iphone-15-128gb",
			);
		});
	});
});
