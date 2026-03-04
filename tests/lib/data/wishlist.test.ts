import { beforeEach, describe, expect, mock, spyOn, test } from "bun:test";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockFrom = mock(() => ({}) as any);

mock.module("@lib/supabase/admin", () => ({
	createAdminClient: mock(() => ({
		from: mockFrom,
	})),
}));

// Import AFTER mocking
const {
	getWishlistByUser,
	addToWishlist,
	removeFromWishlist,
	isInWishlist,
	getWishlistProductIds,
} = await import("@data/wishlist");

// ── Helpers ────────────────────────────────────────────────────────────────

const mockWishlistItems = [
	{
		id: "w1",
		product_id: "prod-1",
		user_id: "user-1",
		created_at: "2025-01-01",
		product: {
			id: "prod-1",
			brand: "Apple",
			model: "iPhone 15",
			images: ["img1.jpg"],
			original_price_kes: 150000,
		},
	},
	{
		id: "w2",
		product_id: "prod-2",
		user_id: "user-1",
		created_at: "2025-01-02",
		product: {
			id: "prod-2",
			brand: "Samsung",
			model: "Galaxy S24",
			images: ["img2.jpg"],
			original_price_kes: 120000,
		},
	},
];

// ── Tests ──────────────────────────────────────────────────────────────────

describe("wishlist data helpers", () => {
	beforeEach(() => {
		mockFrom.mockReset();
	});

	describe("getWishlistByUser", () => {
		test("returns wishlist items with product data", async () => {
			mockFrom.mockReturnValue({
				select: mock(() => ({
					eq: mock(() => ({
						order: mock(() =>
							Promise.resolve({ data: mockWishlistItems, error: null }),
						),
					})),
				})),
			});

			const result = await getWishlistByUser("user-1");
			expect(result).toEqual(mockWishlistItems);
			expect(mockFrom).toHaveBeenCalledWith("wishlist");
		});

		test("returns empty array on error", async () => {
			mockFrom.mockReturnValue({
				select: mock(() => ({
					eq: mock(() => ({
						order: mock(() =>
							Promise.resolve({ data: null, error: { message: "DB error" } }),
						),
					})),
				})),
			});

			const result = await getWishlistByUser("user-1");
			expect(result).toEqual([]);
		});
	});

	describe("addToWishlist", () => {
		test("upserts wishlist item", async () => {
			const mockUpsert = mock(() => ({
				select: mock(() => ({
					single: mock(() =>
						Promise.resolve({
							data: {
								id: "w1",
								product_id: "prod-1",
								user_id: "user-1",
								created_at: null,
							},
							error: null,
						}),
					),
				})),
			}));

			mockFrom.mockReturnValue({ upsert: mockUpsert });

			const result = await addToWishlist("user-1", "prod-1");
			expect(result).toEqual({
				id: "w1",
				product_id: "prod-1",
				user_id: "user-1",
				created_at: null,
			});
			expect(mockFrom).toHaveBeenCalledWith("wishlist");
		});

		test("returns null on error", async () => {
			mockFrom.mockReturnValue({
				upsert: mock(() => ({
					select: mock(() => ({
						single: mock(() =>
							Promise.resolve({ data: null, error: { message: "conflict" } }),
						),
					})),
				})),
			});

			const result = await addToWishlist("user-1", "prod-1");
			expect(result).toBeNull();
		});
	});

	describe("removeFromWishlist", () => {
		test("deletes wishlist item by user and product", async () => {
			const innerEq = mock(() => Promise.resolve({ error: null }));
			const outerEq = mock(() => ({
				eq: innerEq,
			}));
			const mockDelete = mock(() => ({
				eq: outerEq,
			}));

			mockFrom.mockReturnValue({ delete: mockDelete });

			const result = await removeFromWishlist("user-1", "prod-1");
			expect(result).toBe(true);
			expect(mockFrom).toHaveBeenCalledWith("wishlist");
		});

		test("returns false on error", async () => {
			mockFrom.mockReturnValue({
				delete: mock(() => ({
					eq: mock(() => ({
						eq: mock(() =>
							Promise.resolve({ error: { message: "not found" } }),
						),
					})),
				})),
			});

			const result = await removeFromWishlist("user-1", "prod-1");
			expect(result).toBe(false);
		});
	});

	describe("isInWishlist", () => {
		test("returns true when product is in wishlist", async () => {
			mockFrom.mockReturnValue({
				select: mock(() => ({
					eq: mock(() => ({
						eq: mock(() => ({
							maybeSingle: mock(() =>
								Promise.resolve({
									data: { id: "w1" },
									error: null,
								}),
							),
						})),
					})),
				})),
			});

			const result = await isInWishlist("user-1", "prod-1");
			expect(result).toBe(true);
		});

		test("returns false when product is not in wishlist", async () => {
			mockFrom.mockReturnValue({
				select: mock(() => ({
					eq: mock(() => ({
						eq: mock(() => ({
							maybeSingle: mock(() =>
								Promise.resolve({ data: null, error: null }),
							),
						})),
					})),
				})),
			});

			const result = await isInWishlist("user-1", "prod-1");
			expect(result).toBe(false);
		});

		test("returns false and logs error on Supabase error", async () => {
			const consoleSpy = spyOn(console, "error").mockImplementation(() => {});

			mockFrom.mockReturnValue({
				select: mock(() => ({
					eq: mock(() => ({
						eq: mock(() => ({
							maybeSingle: mock(() =>
								Promise.resolve({
									data: null,
									error: { message: "DB connection failed" },
								}),
							),
						})),
					})),
				})),
			});

			const result = await isInWishlist("user-1", "prod-1");
			expect(result).toBe(false);
			expect(consoleSpy).toHaveBeenCalled();
			consoleSpy.mockRestore();
		});
	});

	describe("getWishlistProductIds", () => {
		test("returns array of product IDs", async () => {
			mockFrom.mockReturnValue({
				select: mock(() => ({
					eq: mock(() =>
						Promise.resolve({
							data: [{ product_id: "prod-1" }, { product_id: "prod-2" }],
							error: null,
						}),
					),
				})),
			});

			const result = await getWishlistProductIds("user-1");
			expect(result).toEqual(["prod-1", "prod-2"]);
		});

		test("returns empty array on error", async () => {
			mockFrom.mockReturnValue({
				select: mock(() => ({
					eq: mock(() =>
						Promise.resolve({ data: null, error: { message: "DB error" } }),
					),
				})),
			});

			const result = await getWishlistProductIds("user-1");
			expect(result).toEqual([]);
		});
	});
});
