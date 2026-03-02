import { describe, expect, test } from "bun:test";

const { parsePhonePlacePage } = await import(
	"../../../scripts/crawlers/phoneplace"
);

// ── HTML Fixtures ──────────────────────────────────────────────────────────

const PHONEPLACE_HTML = `
<html>
<body>
  <div class="product-item">
    <a href="/shop/apple-iphone-15/" class="product-item-link">
      <span class="product-title">Apple iPhone 15</span>
    </a>
    <span class="price">Ksh 44,500</span>
  </div>
  <div class="product-item">
    <a href="/shop/samsung-galaxy-s24/" class="product-item-link">
      <span class="product-title">Samsung Galaxy S24</span>
    </a>
    <span class="price">Ksh 62,000</span>
  </div>
</body>
</html>
`;

const PHONEPLACE_EMPTY_HTML = `
<html><body><p>No products found.</p></body></html>
`;

// ── Tests ──────────────────────────────────────────────────────────────────

describe("PhonePlace Crawler", () => {
	describe("parsePhonePlacePage", () => {
		test("parses product listings with prices", () => {
			const results = parsePhonePlacePage(PHONEPLACE_HTML);
			expect(results.length).toBeGreaterThanOrEqual(1);

			const first = results[0];
			expect(first.price_kes).toBe(44500);
			expect(first.url).toContain("/shop/");
		});

		test("returns empty array for no results page", () => {
			const results = parsePhonePlacePage(PHONEPLACE_EMPTY_HTML);
			expect(results).toHaveLength(0);
		});

		test("extracts URLs from product links", () => {
			const results = parsePhonePlacePage(PHONEPLACE_HTML);
			expect(results.length).toBeGreaterThan(0);
			expect(results[0].url).toBeTruthy();
		});

		test("picks sale price from <ins> element over <del> price", () => {
			const saleHtml = `
<html>
<body>
  <div class="product-item">
    <a href="/shop/apple-iphone-14/" class="product-item-link">
      <span class="product-title">Apple iPhone 14</span>
    </a>
    <span class="price"><del>Ksh 50,000</del> <ins>Ksh 42,000</ins></span>
  </div>
</body>
</html>
`;
			const results = parsePhonePlacePage(saleHtml);
			expect(results.length).toBeGreaterThan(0);
			// Should pick the sale (ins) price, not the original (del) price
			expect(results[0].price_kes).toBe(42000);
			expect(results[0].url).toContain("/shop/");
		});
	});
});
