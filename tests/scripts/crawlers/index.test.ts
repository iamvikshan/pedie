import { describe, expect, mock, test } from "bun:test";
import type {
	CrawlerProduct,
	PriceResult,
} from "../../../scripts/crawlers/types";

// Import directly — no mock.module needed since runCrawlers accepts overrides
const { runCrawlers } = await import("../../../scripts/crawlers/index");

// ── Test data ──────────────────────────────────────────────────────────────

const mockProducts: CrawlerProduct[] = [
	{ id: "p1", brand: "Apple", model: "iPhone 15", slug: "apple-iphone-15" },
	{
		id: "p2",
		brand: "Samsung",
		model: "Galaxy S24",
		slug: "samsung-galaxy-s24",
	},
];

const mockBadiliResults: PriceResult[] = [
	{
		product_id: "p1",
		competitor: "badili",
		competitor_price_kes: 45000,
		url: "https://badili.ke/product/iphone-15",
		crawled_at: "2025-06-01T03:00:00Z",
	},
];

const mockPhonePlaceResults: PriceResult[] = [
	{
		product_id: "p1",
		competitor: "phoneplace",
		competitor_price_kes: 44500,
		url: "https://phoneplacekenya.com/shop/iphone-15",
		crawled_at: "2025-06-01T03:00:00Z",
	},
];

// ── Tests ──────────────────────────────────────────────────────────────────

describe("Crawler Orchestrator", () => {
	test("runs all crawlers and collects results", async () => {
		const testCrawlers = [
			{
				name: "badili",
				crawl: mock(() => Promise.resolve(mockBadiliResults)),
			},
			{
				name: "phoneplace",
				crawl: mock(() => Promise.resolve(mockPhonePlaceResults)),
			},
			{ name: "swappa", crawl: mock(() => Promise.resolve([])) },
			{ name: "backmarket", crawl: mock(() => Promise.resolve([])) },
		];

		const results = await runCrawlers(mockProducts, testCrawlers);
		expect(results).toHaveLength(2);
		expect(results[0].competitor).toBe("badili");
		expect(results[1].competitor).toBe("phoneplace");
	});

	test("handles individual crawler failures gracefully", async () => {
		const testCrawlers = [
			{
				name: "badili",
				crawl: mock(() => {
					throw new Error("Badili network failure");
				}),
			},
			{
				name: "phoneplace",
				crawl: mock(() => Promise.resolve(mockPhonePlaceResults)),
			},
		];

		// Should not throw
		const results = await runCrawlers(mockProducts, testCrawlers);
		expect(Array.isArray(results)).toBe(true);
		expect(results).toHaveLength(1);
		expect(results[0].competitor).toBe("phoneplace");
	});

	test("returns empty array when all crawlers fail", async () => {
		const testCrawlers = [
			{
				name: "badili",
				crawl: mock(() => {
					throw new Error("fail");
				}),
			},
			{
				name: "swappa",
				crawl: mock(() => {
					throw new Error("fail");
				}),
			},
		];

		const results = await runCrawlers(mockProducts, testCrawlers);
		expect(results).toHaveLength(0);
	});
});
