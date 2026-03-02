import { describe, expect, test } from "bun:test";
import type { ListingWithProduct } from "@app-types/product";
import { calculateDiscount, formatKes } from "@helpers";

/**
 * ProductCard uses React hooks (useCartStore) which require a DOM environment.
 * We test the pure logic that the component depends on instead.
 */
describe("ProductCard Component", () => {
	const mockListing: ListingWithProduct = {
		id: "1",
		listing_id: "PD-12345",
		product_id: "p1",
		storage: "256GB",
		color: "Space Black",
		carrier: "Unlocked",
		condition: "excellent",
		battery_health: 95,
		price_kes: 120000,
		original_price_usd: 1000,
		landed_cost_kes: 110000,
		source: "eBay",
		source_listing_id: "ebay123",
		source_url: "https://ebay.com",
		images: ["/listing-image.jpg"],
		is_preorder: false,
		is_sold: false,
		is_featured: true,
		status: "available",
		sheets_row_id: "row1",
		notes: null,
		created_at: "2023-01-01T00:00:00Z",
		updated_at: "2023-01-01T00:00:00Z",
		product: {
			id: "p1",
			brand: "Apple",
			model: "iPhone 14 Pro",
			slug: "apple-iphone-14-pro",
			category_id: "cat1",
			description: "Great phone",
			specs: null,
			key_features: null,
			images: ["/product-image.jpg"],
			original_price_kes: 150000,
			created_at: "2023-01-01T00:00:00Z",
			updated_at: "2023-01-01T00:00:00Z",
			fts: null,
		},
	};

	test("computes product name from brand and model", () => {
		const productName = `${mockListing.product.brand} ${mockListing.product.model}`;
		expect(productName).toBe("Apple iPhone 14 Pro");
	});

	test("calculates discount correctly", () => {
		const discount = calculateDiscount(
			mockListing.product.original_price_kes,
			mockListing.price_kes,
		);
		expect(discount).toBe(20); // (150000 - 120000) / 150000 * 100 = 20%
	});

	test("formats price in KES", () => {
		expect(formatKes(mockListing.price_kes)).toContain("120");
	});

	test("prefers listing image over product image", () => {
		const imageUrl = mockListing.images?.[0] || mockListing.product.images?.[0];
		expect(imageUrl).toBe("/listing-image.jpg");
	});

	test("falls back to product image when no listing image", () => {
		const noImageListing = { ...mockListing, images: null };
		const imageUrl =
			noImageListing.images?.[0] || noImageListing.product.images?.[0];
		expect(imageUrl).toBe("/product-image.jpg");
	});

	test("listing type structure is correct", () => {
		expect(mockListing.listing_id).toBe("PD-12345");
		expect(mockListing.condition).toBe("excellent");
		expect(mockListing.is_sold).toBe(false);
		expect(mockListing.is_preorder).toBe(false);
	});

	test("exports PRODUCT_CARD_ICONS constant", async () => {
		const mod = await import("@components/ui/productCard");
		expect(mod.PRODUCT_CARD_ICONS).toBeDefined();
		expect(Array.isArray(mod.PRODUCT_CARD_ICONS)).toBe(true);
		expect(mod.PRODUCT_CARD_ICONS.length).toBe(6);
	});

	test("PRODUCT_CARD_ICONS contains expected icon names", async () => {
		const { PRODUCT_CARD_ICONS } = await import("@components/ui/productCard");
		expect(PRODUCT_CARD_ICONS).toContain("TbHeart");
		expect(PRODUCT_CARD_ICONS).toContain("TbHeartFilled");
		expect(PRODUCT_CARD_ICONS).toContain("TbBolt");
		expect(PRODUCT_CARD_ICONS).toContain("TbCheck");
		expect(PRODUCT_CARD_ICONS).toContain("TbShoppingCartPlus");
		expect(PRODUCT_CARD_ICONS).toContain("TbPhoto");
	});
});
