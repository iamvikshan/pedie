import { describe, expect, mock, test } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";

// Mock ProductCard and its dependencies
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

import { SimilarListings } from "@components/listing/similarListings";

const mockListing = {
	id: "uuid-1",
	listing_id: "PD-SIM01",
	product_id: "prod-1",
	condition: "good" as const,
	price_kes: 40000,
	storage: "64GB",
	color: "White",
	battery_health: 88,
	is_preorder: false,
	is_sold: false,
	is_featured: false,
	is_on_sale: false,
	status: "available" as const,
	images: [],
	original_price_usd: 400,
	landed_cost_kes: 35000,
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
		model: "iPhone 12",
		slug: "apple-iphone-12",
		category_id: "cat-1",
		description: null,
		specs: null,
		key_features: null,
		images: null,
		original_price_kes: 50000,
		created_at: "2024-01-01",
		updated_at: "2024-01-01",
		fts: null,
	},
};

describe("SimilarListings", () => {
	test("renders similar listings section with heading and cards", () => {
		const html = renderToString(
			<SimilarListings
				listings={[
					mockListing,
					{ ...mockListing, id: "uuid-2", listing_id: "PD-SIM02" },
				]}
			/>,
		);

		expect(html).toContain("Similar Listings");
		expect(html).toContain("PD-SIM01");
		expect(html).toContain("PD-SIM02");
	});

	test("returns null when listings array is empty", () => {
		const html = renderToString(<SimilarListings listings={[]} />);

		expect(html).toBe("");
	});
});
