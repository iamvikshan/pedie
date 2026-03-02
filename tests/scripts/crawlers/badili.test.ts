import { describe, expect, test } from "bun:test";

const { parseBadiliPage } = await import("../../../scripts/crawlers/badili");

// ── HTML Fixtures ──────────────────────────────────────────────────────────

const BADILI_PRODUCT_HTML = `
<html>
<body>
  <div class="product-card">
    <a href="/product/apple-iphone-15-128gb" class="product-link">
      <h3 class="product-title">Apple iPhone 15 128GB</h3>
      <span class="product-price">KES 45,000</span>
    </a>
  </div>
  <div class="product-card">
    <a href="/product/apple-iphone-15-256gb" class="product-link">
      <h3 class="product-title">Apple iPhone 15 256GB</h3>
      <span class="product-price">KES 52,000</span>
    </a>
  </div>
</body>
</html>
`;

const BADILI_EMPTY_HTML = `
<html>
<body>
  <div class="no-results">No products found</div>
</body>
</html>
`;

const BADILI_MALFORMED_HTML = `
<html>
<body>
  <div class="product-card">
    <span class="product-price">Not a price</span>
  </div>
</body>
</html>
`;

// ── Tests ──────────────────────────────────────────────────────────────────

describe("Badili Crawler", () => {
	describe("parseBadiliPage", () => {
		test("parses product listings with prices", () => {
			const results = parseBadiliPage(BADILI_PRODUCT_HTML);
			expect(results.length).toBeGreaterThanOrEqual(1);

			const first = results[0];
			expect(first.price_kes).toBe(45000);
			expect(first.url).toContain("/product/");
		});

		test("returns empty array for no results page", () => {
			const results = parseBadiliPage(BADILI_EMPTY_HTML);
			expect(results).toHaveLength(0);
		});

		test("handles malformed HTML gracefully", () => {
			const results = parseBadiliPage(BADILI_MALFORMED_HTML);
			// Should not crash, may return empty array since price text is invalid
			expect(Array.isArray(results)).toBe(true);
		});

		test("extracts URLs from product links", () => {
			const results = parseBadiliPage(BADILI_PRODUCT_HTML);
			expect(results.length).toBeGreaterThan(0);
			expect(results[0].url).toBeTruthy();
		});
	});
});
