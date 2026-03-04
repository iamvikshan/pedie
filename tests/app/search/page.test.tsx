import { describe, expect, mock, test } from "bun:test";
import { readFileSync } from "fs";
import { resolve } from "path";
import React from "react";
import { renderToString } from "react-dom/server";

const searchPageSource = readFileSync(
	resolve("src/app/(store)/search/page.tsx"),
	"utf-8",
);

// Mock search data
mock.module("@data/search", () => ({
	searchListings: mock((query: string) => {
		if (query === "iphone") {
			return Promise.resolve({
				data: [
					{
						id: "uuid-1",
						listing_id: "PD-S001",
						product_id: "prod-1",
						condition: "excellent",
						price_kes: 45000,
						storage: "128GB",
						color: "Black",
						battery_health: 92,
						is_featured: false,
						listing_type: 'standard' as const,
						ram: null,
						final_price_kes: 45000,
						status: "available",
						images: [],
						original_price_usd: 400,
						landed_cost_kes: 40000,
						carrier: null,
						source: null,
						source_listing_id: null,
						source_url: null,
						sheets_row_id: null,
						notes: null,
						created_at: "2024-01-01",
						updated_at: "2024-01-01",
						product: {
							id: "prod-1",
							brand: "Apple",
							model: "iPhone 13",
							slug: "apple-iphone-13",
							category_id: "cat-1",
							description: null,
							specs: null,
							key_features: null,
							images: null,
							original_price_kes: 55000,
							created_at: "2024-01-01",
							updated_at: "2024-01-01",
							fts: null,
						},
					},
				],
				total: 1,
				page: 1,
				perPage: 12,
				totalPages: 1,
			});
		}
		return Promise.resolve({
			data: [],
			total: 0,
			page: 1,
			perPage: 12,
			totalPages: 0,
		});
	}),
	getAvailableFilters: mock(() =>
		Promise.resolve({
			conditions: ["excellent", "good"],
			storages: ["128GB", "256GB"],
			colors: ["Black"],
			carriers: [],
			brands: ["Apple"],
			priceRange: { min: 30000, max: 90000 },
		}),
	),
}));

// Mock next/link and next/image
mock.module("next/link", () => ({
	default: mock(
		({
			children,
			href,
			...props
		}: {
			children: React.ReactNode;
			href: string;
			[key: string]: unknown;
		}) => React.createElement("a", { href, ...props }, children),
	),
}));
mock.module("next/image", () => ({
	default: mock((props: { src: string; alt: string; [key: string]: unknown }) =>
		React.createElement("img", { src: props.src, alt: props.alt }),
	),
}));

// Mock @lib/cart/store
mock.module("@lib/cart/store", () => ({
	useCartStore: mock(
		(selector: (state: Record<string, unknown>) => unknown) => {
			const state = {
				items: [],
				addListing: mock(),
				removeListing: mock(),
				hasListing: () => false,
			};
			return selector(state);
		},
	),
}));

// Mock FilterSidebar (client component with hooks)
mock.module("@components/search/filterSidebar", () => ({
	FilterSidebar: mock(({ query }: { filters: unknown; query: string }) =>
		React.createElement("div", { "data-testid": "filter-sidebar" }, `filters for ${query}`),
	),
}));

// Mock next/navigation for useSearchParams
mock.module("next/navigation", () => ({
	useRouter: mock(() => ({ push: mock(), replace: mock() })),
	useSearchParams: mock(() => ({
		get: mock(() => null),
		getAll: mock(() => []),
	})),
}));

import SearchPage from "@/app/(store)/search/page";

describe("SearchPage", () => {
	test("renders search results for query", async () => {
		const page = await SearchPage({
			searchParams: Promise.resolve({ q: "iphone" }),
		});
		const html = renderToString(page);

		expect(html).toContain("iphone");
		// React renderToString inserts <!-- --> between JSX expressions
		expect(html).toMatch(/1<!-- --> <!-- -->result<!-- --> found/);
		expect(html).toContain("iPhone 13");
	});

	test("shows empty state for no results", async () => {
		const page = await SearchPage({
			searchParams: Promise.resolve({ q: "nonexistent" }),
		});
		const html = renderToString(page);

		expect(html).toContain("No results found");
		expect(html).toContain("nonexistent");
		// React renderToString inserts <!-- --> between JSX expressions
		expect(html).toMatch(/0<!-- --> <!-- -->results<!-- --> found/);
	});

	test("shows prompt when no query provided", async () => {
		const page = await SearchPage({
			searchParams: Promise.resolve({}),
		});
		const html = renderToString(page);

		expect(html).toContain("Search for refurbished devices");
	});

	test("imports FilterSidebar component", () => {
		expect(searchPageSource).toContain("FilterSidebar");
	});

	test("calls getAvailableFilters for filter sidebar", () => {
		expect(searchPageSource).toContain("getAvailableFilters");
	});

	test("uses buildSearchUrl to preserve filters in pagination", () => {
		expect(searchPageSource).toContain("buildSearchUrl");
		expect(searchPageSource).toContain("buildSearchUrl(search,");
	});
});
