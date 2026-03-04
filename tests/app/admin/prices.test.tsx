import { describe, expect, mock, test } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";

// ── Mocks ──────────────────────────────────────────────────────────────────

mock.module("@data/admin", () => ({
	getPriceComparisons: mock(() =>
		Promise.resolve([
			{
				id: "pc-1",
				product_id: "p1",
				competitor: "badili",
				competitor_price_kes: 45000,
				url: "https://badili.ke/product/iphone-15",
				crawled_at: "2025-06-01T03:00:00Z",
				product: { brand: "Apple", model: "iPhone 15" },
			},
			{
				id: "pc-2",
				product_id: "p1",
				competitor: "phoneplace",
				competitor_price_kes: 44500,
				url: "https://phoneplacekenya.com/shop/iphone-15",
				crawled_at: "2025-06-01T03:00:00Z",
				product: { brand: "Apple", model: "iPhone 15" },
			},
			{
				id: "pc-3",
				product_id: "p2",
				competitor: "badili",
				competitor_price_kes: 62000,
				url: "https://badili.ke/product/galaxy-s24",
				crawled_at: "2025-06-01T03:00:00Z",
				product: { brand: "Samsung", model: "Galaxy S24" },
			},
		]),
	),
	getLatestCrawlDate: mock(() =>
		Promise.resolve(new Date("2025-06-01T03:00:00Z")),
	),
	getProductMinPrices: mock(() =>
		Promise.resolve(
			new Map([
				["p1", 43000],
				["p2", 60000],
			]),
		),
	),
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: mock(), refresh: mock() }),
	useSearchParams: () => new URLSearchParams(),
}));

// Import AFTER mocking
const { PriceComparisonTable } = await import(
	"@components/admin/priceComparisonTable"
);
const { MarginIndicator } = await import("@components/admin/marginIndicator");

// ── Tests ──────────────────────────────────────────────────────────────────

describe("Admin Prices", () => {
	describe("PriceComparisonTable", () => {
		test("renders table with product and competitor data", () => {
			const comparisons = [
				{
					productId: "p1",
					productName: "Apple iPhone 15",
					pediePriceKes: 43000,
					competitors: [
						{
							competitor: "badili",
							priceKes: 45000,
							url: "https://badili.ke/product/iphone-15",
						},
						{
							competitor: "phoneplace",
							priceKes: 44500,
							url: "https://phoneplacekenya.com/shop/iphone-15",
						},
					],
				},
			];
			const html = renderToString(
				React.createElement(PriceComparisonTable, { comparisons }),
			);

			expect(html).toContain("Apple iPhone 15");
			expect(html).toContain("badili");
			expect(html).toContain("phoneplace");
		});

		test("shows empty state when no comparisons", () => {
			const html = renderToString(
				React.createElement(PriceComparisonTable, { comparisons: [] }),
			);
			expect(html).toContain("No price comparison data");
		});

		test("shows competitor prices", () => {
			const comparisons = [
				{
					productId: "p1",
					productName: "Apple iPhone 15",
					pediePriceKes: 43000,
					competitors: [
						{
							competitor: "badili",
							priceKes: 45000,
							url: null,
						},
					],
				},
			];
			const html = renderToString(
				React.createElement(PriceComparisonTable, { comparisons }),
			);
			expect(html).toContain("45,000");
		});
	});

	describe("MarginIndicator", () => {
		test("shows green when Pedie is cheaper", () => {
			const html = renderToString(
				React.createElement(MarginIndicator, {
					pediePriceKes: 40000,
					competitorPriceKes: 50000,
				}),
			);
			// Should have green indicator (competitive advantage)
			expect(html).toContain("green");
		});

		test("shows red when competitor is cheaper", () => {
			const html = renderToString(
				React.createElement(MarginIndicator, {
					pediePriceKes: 50000,
					competitorPriceKes: 40000,
				}),
			);
			// Should have red indicator (needs attention)
			expect(html).toContain("red");
		});

		test("shows yellow when prices are close (within 5%)", () => {
			const html = renderToString(
				React.createElement(MarginIndicator, {
					pediePriceKes: 45000,
					competitorPriceKes: 46000,
				}),
			);
			// Within 5% — should show yellow
			expect(html).toContain("yellow");
		});

		test("shows percentage difference", () => {
			const html = renderToString(
				React.createElement(MarginIndicator, {
					pediePriceKes: 40000,
					competitorPriceKes: 50000,
				}),
			);
			// (50000-40000)/50000 = 20%
			expect(html).toContain("20");
		});
	});

	describe("Prices Page", () => {
		test("renders page with last crawl date", async () => {
			const AdminPricesPage = (await import("@/app/(admin)/admin/prices/page"))
				.default;
			const element = await AdminPricesPage();
			const html = renderToString(element);

			expect(html).toContain("Price Comparisons");
		});

		test("shows total comparisons count", async () => {
			const AdminPricesPage = (await import("@/app/(admin)/admin/prices/page"))
				.default;
			const element = await AdminPricesPage();
			const html = renderToString(element);

			// Should show number of comparisons
			expect(html).toContain("comparison(s)");
			expect(html).toMatch(/3.*comparison/);
		});

		test("shows last crawl date", async () => {
			const AdminPricesPage = (await import("@/app/(admin)/admin/prices/page"))
				.default;
			const element = await AdminPricesPage();
			const html = renderToString(element);

			expect(html).toContain("Last crawl");
		});
	});
});
