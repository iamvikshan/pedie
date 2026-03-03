import { beforeEach, describe, expect, mock, test } from "bun:test";

// --- Mock Setup ---

const mockCategoryData = { id: "cat-123", slug: "phones" };

const mockListings = [
	{
		id: "uuid-1",
		listing_id: "L001",
		product_id: "prod-1",
		storage: "128GB",
		color: "Black",
		carrier: "Unlocked",
		condition: "excellent",
		battery_health: 92,
		price_kes: 45000,
		original_price_usd: 300,
		landed_cost_kes: 40000,
		source: "swappa",
		source_listing_id: null,
		source_url: null,
		images: null,
		is_featured: true,
		status: "available",
		sheets_row_id: null,
		notes: null,
		created_at: "2025-06-01T00:00:00Z",
		updated_at: "2025-06-01T00:00:00Z",
		product: {
			id: "prod-1",
			brand: "Apple",
			model: "iPhone 13",
			slug: "apple-iphone-13",
			category_id: "cat-123",
			description: null,
			specs: null,
			key_features: null,
			images: null,
			original_price_kes: 60000,
			created_at: "2025-06-01T00:00:00Z",
			updated_at: "2025-06-01T00:00:00Z",
			fts: null,
			category: {
				id: "cat-123",
				name: "Phones",
				slug: "phones",
				description: null,
				image_url: null,
				parent_id: null,
				sort_order: 1,
				created_at: "2025-06-01T00:00:00Z",
				updated_at: "2025-06-01T00:00:00Z",
			},
		},
	},
	{
		id: "uuid-2",
		listing_id: "L002",
		product_id: "prod-2",
		storage: "256GB",
		color: "White",
		carrier: "Safaricom",
		condition: "good",
		battery_health: 85,
		price_kes: 55000,
		original_price_usd: 400,
		landed_cost_kes: 50000,
		source: "swappa",
		source_listing_id: null,
		source_url: null,
		images: null,
		is_featured: false,
		status: "available",
		sheets_row_id: null,
		notes: null,
		created_at: "2025-06-02T00:00:00Z",
		updated_at: "2025-06-02T00:00:00Z",
		product: {
			id: "prod-2",
			brand: "Samsung",
			model: "Galaxy S22",
			slug: "samsung-galaxy-s22",
			category_id: "cat-123",
			description: null,
			specs: null,
			key_features: null,
			images: null,
			original_price_kes: 70000,
			created_at: "2025-06-02T00:00:00Z",
			updated_at: "2025-06-02T00:00:00Z",
			fts: null,
			category: null,
		},
	},
];

// Chainable mock builder
function chainable(resolveValue: {
	data: unknown;
	error: unknown;
	count?: number | null;
}) {
	const chain: Record<string, unknown> = {
		select: mock(() => chain),
		eq: mock(() => chain),
		neq: mock(() => chain),
		in: mock(() => chain),
		gte: mock(() => chain),
		lte: mock(() => chain),
		order: mock(() => chain),
		limit: mock(() => chain),
		range: mock(() => chain),
		single: mock(() => Promise.resolve(resolveValue)),
		textSearch: mock(() => chain),
		then: (resolve: (val: unknown) => void) => resolve(resolveValue),
	};
	return chain;
}

let fromHandler: (table: string) => unknown;

mock.module("@lib/supabase/server", () => ({
	createClient: mock(() =>
		Promise.resolve({
			from: mock((table: string) => fromHandler(table)),
		}),
	),
}));

// Import after mock
import {
	getAvailableFilters,
	getFilteredListings,
	getListingById,
	getSimilarListings,
} from "@lib/data/listings";

describe("Listings Data Functions", () => {
	describe("getFilteredListings", () => {
		beforeEach(() => {
			fromHandler = (table: string) => {
				if (table === "categories") {
					return chainable({ data: mockCategoryData, error: null });
				}
				// listings table - for count query (head: true) or data query
				return chainable({ data: mockListings, error: null, count: 2 });
			};
		});

		test("returns paginated result with data", async () => {
			const result = await getFilteredListings("phones", {}, "newest", {
				page: 1,
				perPage: 10,
			});
			expect(result.data).toBeArray();
			expect(result.page).toBe(1);
			expect(result.perPage).toBe(10);
		});

		test("returns empty result when category not found", async () => {
			fromHandler = (table: string) => {
				if (table === "categories") {
					return chainable({
						data: null,
						error: { message: "Not found" },
					});
				}
				return chainable({ data: [], error: null });
			};

			const result = await getFilteredListings("nonexistent", {}, "newest", {
				page: 1,
				perPage: 10,
			});
			expect(result.data).toEqual([]);
			expect(result.total).toBe(0);
			expect(result.totalPages).toBe(0);
		});

		test("applies filters correctly", async () => {
			const result = await getFilteredListings(
				"phones",
				{
					condition: ["excellent", "good"],
					storage: ["128GB"],
					color: ["Black"],
					carrier: ["Unlocked"],
					brand: ["Apple"],
					priceMin: 30000,
					priceMax: 60000,
				},
				"price-asc",
				{ page: 1, perPage: 10 },
			);
			expect(result.data).toBeArray();
		});

		test("handles sort options", async () => {
			const resultNewest = await getFilteredListings("phones", {}, "newest", {
				page: 1,
				perPage: 10,
			});
			expect(resultNewest.data).toBeArray();

			const resultPriceAsc = await getFilteredListings(
				"phones",
				{},
				"price-asc",
				{ page: 1, perPage: 10 },
			);
			expect(resultPriceAsc.data).toBeArray();

			const resultPriceDesc = await getFilteredListings(
				"phones",
				{},
				"price-desc",
				{ page: 1, perPage: 10 },
			);
			expect(resultPriceDesc.data).toBeArray();
		});

		test("handles listing query error", async () => {
			fromHandler = (table: string) => {
				if (table === "categories") {
					return chainable({ data: mockCategoryData, error: null });
				}
				return chainable({
					data: null,
					error: { message: "DB error" },
					count: null,
				});
			};

			const result = await getFilteredListings("phones", {}, "newest", {
				page: 1,
				perPage: 10,
			});
			expect(result.data).toEqual([]);
			expect(result.total).toBe(0);
		});
	});

	describe("getListingById", () => {
		beforeEach(() => {
			fromHandler = () => chainable({ data: mockListings[0], error: null });
		});

		test("returns a listing by listing_id", async () => {
			const listing = await getListingById("L001");
			expect(listing).not.toBeNull();
			expect(listing!.listing_id).toBe("L001");
		});

		test("returns null when not found", async () => {
			fromHandler = () =>
				chainable({ data: null, error: { message: "Not found" } });

			const listing = await getListingById("INVALID");
			expect(listing).toBeNull();
		});
	});

	describe("getSimilarListings", () => {
		beforeEach(() => {
			fromHandler = () => chainable({ data: [mockListings[1]], error: null });
		});

		test("returns similar listings excluding current", async () => {
			const listings = await getSimilarListings("prod-1", "L001", 4);
			expect(listings).toBeArray();
		});

		test("returns empty array on error", async () => {
			fromHandler = () =>
				chainable({ data: null, error: { message: "error" } });

			const listings = await getSimilarListings("prod-1", "L001");
			expect(listings).toEqual([]);
		});

		test("uses default limit of 4", async () => {
			const listings = await getSimilarListings("prod-1", "L001");
			expect(listings).toBeArray();
		});
	});

	describe("getAvailableFilters", () => {
		beforeEach(() => {
			fromHandler = (table: string) => {
				if (table === "categories") {
					return chainable({ data: mockCategoryData, error: null });
				}
				if (table === "products") {
					return chainable({
						data: [{ brand: "Apple" }, { brand: "Samsung" }],
						error: null,
					});
				}
				// listings
				return chainable({
					data: [
						{
							storage: "128GB",
							color: "Black",
							carrier: "Unlocked",
							condition: "excellent",
							price_kes: 45000,
						},
						{
							storage: "256GB",
							color: "White",
							carrier: "Safaricom",
							condition: "good",
							price_kes: 55000,
						},
					],
					error: null,
				});
			};
		});

		test("returns available filter values", async () => {
			const filters = await getAvailableFilters("phones");
			expect(filters).toBeDefined();
			expect(filters.conditions).toBeArray();
			expect(filters.storages).toBeArray();
			expect(filters.colors).toBeArray();
			expect(filters.carriers).toBeArray();
			expect(filters.brands).toBeArray();
			expect(filters.priceRange).toBeDefined();
			expect(typeof filters.priceRange.min).toBe("number");
			expect(typeof filters.priceRange.max).toBe("number");
		});

		test("returns empty filters when category not found", async () => {
			fromHandler = (table: string) => {
				if (table === "categories") {
					return chainable({
						data: null,
						error: { message: "Not found" },
					});
				}
				return chainable({ data: [], error: null });
			};

			const filters = await getAvailableFilters("nonexistent");
			expect(filters.conditions).toEqual([]);
			expect(filters.storages).toEqual([]);
			expect(filters.brands).toEqual([]);
			expect(filters.priceRange.min).toBe(0);
			expect(filters.priceRange.max).toBe(0);
		});
	});
});
