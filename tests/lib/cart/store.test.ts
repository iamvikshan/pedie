import { beforeEach, describe, expect, test } from "bun:test";
import type { ListingWithProduct } from "@app-types/product";
import { useCartStore } from "@lib/cart/store";

function makeListing(
	overrides: Partial<ListingWithProduct> = {},
): ListingWithProduct {
	return {
		id: "1",
		listing_id: "PD-00001",
		product_id: "PROD-001",
		storage: "128GB",
		color: "Black",
		carrier: "Unlocked",
		condition: "excellent",
		battery_health: 95,
		price_kes: 50000,
		final_price_kes: 50000,
		original_price_usd: 500,
		landed_cost_kes: 40000,
		source: "eBay",
		source_listing_id: "EBAY-001",
		source_url: "https://ebay.com/1",
		images: ["/img1.jpg"],
		is_featured: false,
		listing_type: 'standard' as const,
		ram: null,
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
		...overrides,
	};
}

describe("CartStore", () => {
	beforeEach(() => {
		useCartStore.setState({ items: [] });
	});

	test("initializes with empty cart", () => {
		const state = useCartStore.getState();
		expect(state.items).toEqual([]);
		expect(state.getItemCount()).toBe(0);
	});

	test("addListing adds a listing to cart", () => {
		const listing = makeListing();
		useCartStore.getState().addListing(listing);

		const state = useCartStore.getState();
		expect(state.items).toHaveLength(1);
		expect(state.items[0].listing_id).toBe("PD-00001");
	});

	test("addListing prevents duplicate listings (same listing_id)", () => {
		const listing = makeListing();
		useCartStore.getState().addListing(listing);
		useCartStore.getState().addListing(listing);

		expect(useCartStore.getState().items).toHaveLength(1);
	});

	test("addListing allows different listing_ids", () => {
		const listing1 = makeListing({ listing_id: "PD-00001" });
		const listing2 = makeListing({
			id: "2",
			listing_id: "PD-00002",
			price_kes: 30000,
		});
		useCartStore.getState().addListing(listing1);
		useCartStore.getState().addListing(listing2);

		expect(useCartStore.getState().items).toHaveLength(2);
	});

	test("removeListing removes by listing_id", () => {
		const listing1 = makeListing({ listing_id: "PD-00001" });
		const listing2 = makeListing({ id: "2", listing_id: "PD-00002" });
		useCartStore.getState().addListing(listing1);
		useCartStore.getState().addListing(listing2);

		useCartStore.getState().removeListing("PD-00001");

		const state = useCartStore.getState();
		expect(state.items).toHaveLength(1);
		expect(state.items[0].listing_id).toBe("PD-00002");
	});

	test("clearCart empties the cart", () => {
		useCartStore.getState().addListing(makeListing({ listing_id: "PD-00001" }));
		useCartStore
			.getState()
			.addListing(makeListing({ id: "2", listing_id: "PD-00002" }));

		useCartStore.getState().clearCart();

		expect(useCartStore.getState().items).toHaveLength(0);
	});

	test("hasListing returns true when listing exists", () => {
		useCartStore.getState().addListing(makeListing({ listing_id: "PD-00001" }));

		expect(useCartStore.getState().hasListing("PD-00001")).toBe(true);
	});

	test("hasListing returns false when listing does not exist", () => {
		expect(useCartStore.getState().hasListing("PD-99999")).toBe(false);
	});

	test("getTotal sums all price_kes values", () => {
		useCartStore
			.getState()
			.addListing(makeListing({ listing_id: "PD-00001", price_kes: 50000 }));
		useCartStore
			.getState()
			.addListing(
				makeListing({ id: "2", listing_id: "PD-00002", price_kes: 30000 }),
			);

		expect(useCartStore.getState().getTotal()).toBe(80000);
	});

	test("getDepositTotal sums deposits for preorder items only (5% < 70k)", () => {
		// Non-preorder — should not contribute to deposit total
		useCartStore.getState().addListing(
			makeListing({
				listing_id: "PD-00001",
				price_kes: 50000,
				final_price_kes: 50000,
				listing_type: 'standard',
			}),
		);
		// Preorder, under 70k — 5% deposit = 2500
		useCartStore.getState().addListing(
			makeListing({
				id: "2",
				listing_id: "PD-00002",
				price_kes: 50000,
				final_price_kes: 50000,
				listing_type: 'preorder',
			}),
		);

		expect(useCartStore.getState().getDepositTotal()).toBe(2500);
	});

	test("getDepositTotal sums deposits for preorder items (10% >= 70k)", () => {
		// Preorder, at 70k — 10% deposit = 7000
		useCartStore.getState().addListing(
			makeListing({
				id: "1",
				listing_id: "PD-00001",
				price_kes: 70000,
				final_price_kes: 70000,
				listing_type: 'preorder',
			}),
		);
		// Preorder, above 70k — 10% deposit = 10000
		useCartStore.getState().addListing(
			makeListing({
				id: "2",
				listing_id: "PD-00002",
				price_kes: 100000,
				final_price_kes: 100000,
				listing_type: 'preorder',
			}),
		);

		expect(useCartStore.getState().getDepositTotal()).toBe(17000);
	});

	test("getItemCount returns correct count", () => {
		expect(useCartStore.getState().getItemCount()).toBe(0);

		useCartStore.getState().addListing(makeListing({ listing_id: "PD-00001" }));
		expect(useCartStore.getState().getItemCount()).toBe(1);

		useCartStore
			.getState()
			.addListing(makeListing({ id: "2", listing_id: "PD-00002" }));
		expect(useCartStore.getState().getItemCount()).toBe(2);

		useCartStore.getState().removeListing("PD-00001");
		expect(useCartStore.getState().getItemCount()).toBe(1);
	});
});
