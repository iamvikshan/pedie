import { describe, expect, test } from "bun:test";
import { KES_USD_RATE } from "../../../src/config";

const { parseBackMarketPage } = await import(
	"../../../scripts/crawlers/backmarket"
);

// ── HTML Fixtures ──────────────────────────────────────────────────────────

const BACKMARKET_HTML = `
<html>
<body>
  <div class="productCard">
    <a href="/en-us/p/apple-iphone-15/abc123" class="product-link">
      <span class="product-title">Apple iPhone 15 128GB</span>
    </a>
    <span class="product-price">$459</span>
  </div>
  <div class="productCard">
    <a href="/en-us/p/apple-iphone-15-256gb/def456" class="product-link">
      <span class="product-title">Apple iPhone 15 256GB</span>
    </a>
    <span class="product-price">$519.00</span>
  </div>
</body>
</html>
`;

const BACKMARKET_EMPTY_HTML = `
<html><body><div class="no-results">Nothing found</div></body></html>
`;

// ── Tests ──────────────────────────────────────────────────────────────────

describe("BackMarket Crawler", () => {
	describe("parseBackMarketPage", () => {
		test("parses USD prices and converts to KES", () => {
			const results = parseBackMarketPage(BACKMARKET_HTML);
			expect(results.length).toBeGreaterThan(0);

			const first = results[0];
			expect(first.price_kes).toBe(Math.round(459 * KES_USD_RATE));
			expect(first.url).toContain("/p/");
		});

		test("returns empty array for no results page", () => {
			const results = parseBackMarketPage(BACKMARKET_EMPTY_HTML);
			expect(results).toHaveLength(0);
		});

		test("extracts product URLs", () => {
			const results = parseBackMarketPage(BACKMARKET_HTML);
			expect(results.length).toBeGreaterThan(0);
			expect(results[0].url).toBeTruthy();
		});
	});
});
