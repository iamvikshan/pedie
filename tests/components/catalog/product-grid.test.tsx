import { describe, expect, mock, test } from "bun:test";
import type { ListingWithProduct } from "@app-types/product";
import { ProductGrid } from "@components/catalog/productGrid";
import React from "react";
import { renderToString } from "react-dom/server";

// Mock next/link
mock.module("next/link", () => ({
	default: mock(({ children, href, ...props }: Record<string, unknown>) => {
		return React.createElement(
			"a",
			{ href: href as string, ...props },
			children as React.ReactNode,
		);
	}),
}));

// Mock next/image
mock.module("next/image", () => ({
	default: mock(({ src, alt, fill, ...props }: Record<string, unknown>) => {
		return React.createElement("img", {
			src,
			alt,
			"data-fill": fill ? "true" : undefined,
			...props,
		});
	}),
}));

const mockListings: ListingWithProduct[] = [
	{
		id: "1",
		listing_id: "LST-001",
		product_id: "PROD-001",
		storage: "128GB",
		color: "Black",
		carrier: "Unlocked",
		condition: "excellent",
		battery_health: 95,
		price_kes: 50000,
		original_price_usd: 500,
		landed_cost_kes: 40000,
		source: "eBay",
		source_listing_id: "EBAY-001",
		source_url: "https://ebay.com/1",
		images: ["/img1.jpg"],
		is_preorder: false,
		is_sold: false,
		is_featured: false,
		is_on_sale: false,
		status: "available",
		sheets_row_id: null,
		notes: null,
		created_at: "2023-01-01T00:00:00Z",
		updated_at: "2023-01-01T00:00:00Z",
		product: {
			id: "PROD-001",
			brand: "Apple",
			model: "iPhone 12",
			slug: "apple-iphone-12",
			category_id: "CAT-001",
			description: "A great phone",
			specs: null,
			key_features: null,
			images: ["/img1.jpg"],
			original_price_kes: 60000,
			created_at: "2023-01-01T00:00:00Z",
			updated_at: "2023-01-01T00:00:00Z",
			fts: null,
		},
	},
];

describe("ProductGrid", () => {
	test("renders ProductCard for each listing", () => {
		const html = renderToString(<ProductGrid listings={mockListings} />);

		expect(html).toContain("Apple iPhone 12");
		expect(html).toContain("LST-001");
		expect(html).toContain("50,000");
	});

	test("shows empty state when no listings", () => {
		const html = renderToString(<ProductGrid listings={[]} />);

		expect(html).toContain("No products found");
		expect(html).toContain(
			"We couldn&#x27;t find any products matching your current filters",
		);
	});
});
