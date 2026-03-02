import { describe, expect, test } from "bun:test";
import type { Category, ListingWithProduct } from "@app-types/product";
import {
	breadcrumbJsonLd,
	collectionJsonLd,
	organizationJsonLd,
	productJsonLd,
} from "@lib/seo/structuredData";

const mockListing: ListingWithProduct = {
	id: "1",
	listing_id: "PD-ABC12",
	product_id: "p1",
	storage: "256GB",
	color: "Black",
	carrier: null,
	condition: "excellent" as const,
	battery_health: 92,
	price_kes: 58000,
	original_price_usd: 500,
	landed_cost_kes: 52000,
	source: "reebelo",
	source_listing_id: null,
	source_url: null,
	images: ["https://example.com/img1.jpg"],
	is_preorder: false,
	is_sold: false,
	is_featured: true,
	is_on_sale: false,
	status: "available" as const,
	sheets_row_id: null,
	notes: null,
	created_at: "2025-01-01T00:00:00Z",
	updated_at: "2025-01-01T00:00:00Z",
	product: {
		id: "p1",
		brand: "Apple",
		model: "iPhone 13 Pro",
		slug: "apple-iphone-13-pro",
		category_id: "c1",
		description: "A great phone",
		specs: null,
		key_features: ["A15 Bionic", "ProMotion"],
		images: ["https://example.com/product1.jpg"],
		original_price_kes: 75000,
		created_at: "2025-01-01T00:00:00Z",
		updated_at: "2025-01-01T00:00:00Z",
		fts: null,
		category: {
			id: "c1",
			name: "Smartphones",
			slug: "smartphones",
			description: "All smartphones",
			image_url: null,
			parent_id: null,
			sort_order: 1,
			created_at: "2025-01-01T00:00:00Z",
			updated_at: "2025-01-01T00:00:00Z",
		},
	},
};

describe("structured data edge cases", () => {
	test("productJsonLd with empty images arrays", () => {
		const listing = {
			...mockListing,
			images: [] as string[],
			product: { ...mockListing.product, images: [] as string[] },
		};
		const result = productJsonLd(listing);
		expect(result.image).toBeUndefined();
	});

	test("productJsonLd serializes to valid JSON", () => {
		const result = productJsonLd(mockListing);
		const json = JSON.stringify(result);
		expect(() => JSON.parse(json)).not.toThrow();
	});

	test("organizationJsonLd serializes to valid JSON", () => {
		const result = organizationJsonLd();
		const json = JSON.stringify(result);
		expect(() => JSON.parse(json)).not.toThrow();
	});

	test("breadcrumbJsonLd with single item", () => {
		const result = breadcrumbJsonLd([
			{ name: "Home", url: "https://pedie.tech" },
		]);
		expect(result.itemListElement).toHaveLength(1);
		expect(result.itemListElement[0].position).toBe(1);
	});

	test("collectionJsonLd with zero items", () => {
		const category: Category = {
			id: "c1",
			name: "Empty Category",
			slug: "empty",
			description: null,
			image_url: null,
			parent_id: null,
			sort_order: 1,
			created_at: "2025-01-01T00:00:00Z",
			updated_at: "2025-01-01T00:00:00Z",
		};
		const result = collectionJsonLd(category, 0);
		expect(result.numberOfItems).toBe(0);
		expect(result.description).toBe("Browse Empty Category at Pedie");
	});

	test("productJsonLd with premium condition returns RefurbishedCondition", () => {
		const premiumListing = { ...mockListing, condition: "premium" as const };
		const result = productJsonLd(premiumListing);
		expect(result.offers.itemCondition).toBe(
			"https://schema.org/RefurbishedCondition",
		);
	});

	test("productJsonLd with acceptable condition returns UsedCondition", () => {
		const listing = { ...mockListing, condition: "acceptable" as const };
		const result = productJsonLd(listing);
		expect(result.offers.itemCondition).toBe(
			"https://schema.org/UsedCondition",
		);
	});

	test("productJsonLd offers url includes listing_id", () => {
		const result = productJsonLd(mockListing);
		expect(result.offers.url).toBe("https://pedie.tech/listings/PD-ABC12");
	});

	test("collectionJsonLd serializes to valid JSON", () => {
		const category: Category = {
			id: "c1",
			name: "Smartphones",
			slug: "smartphones",
			description: "All smartphones",
			image_url: null,
			parent_id: null,
			sort_order: 1,
			created_at: "2025-01-01T00:00:00Z",
			updated_at: "2025-01-01T00:00:00Z",
		};
		const result = collectionJsonLd(category, 5);
		const json = JSON.stringify(result);
		expect(() => JSON.parse(json)).not.toThrow();
	});
});
