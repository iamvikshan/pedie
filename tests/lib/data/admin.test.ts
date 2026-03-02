import { beforeEach, describe, expect, mock, test } from "bun:test";

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
	getAdminDashboardStats,
	getRevenueData,
	getAdminOrders,
	getAdminListings,
	createListing,
	updateListing,
	deleteListing,
	getAdminProducts,
	createProduct,
	updateProduct,
	deleteProduct,
	getAdminCategories,
	createCategory,
	updateCategory,
	deleteCategory,
	getAdminCustomers,
	getAdminCustomerDetail,
	updateUserRole,
	getAdminReviews,
	deleteReview,
	getNewsletterSubscribers,
	exportNewsletterCSV,
	getSyncHistory,
	logSyncResult,
	getPriceComparisons,
	getLatestCrawlDate,
} = await import("@lib/data/admin");

// ── Helpers ────────────────────────────────────────────────────────────────

function chainMock(overrides: Record<string, any> = {}): any {
	const base: Record<string, any> = {
		select: mock(function (this: any) {
			return this;
		}),
		insert: mock(function (this: any) {
			return this;
		}),
		update: mock(function (this: any) {
			return this;
		}),
		delete: mock(function (this: any) {
			return this;
		}),
		eq: mock(function (this: any) {
			return this;
		}),
		neq: mock(function (this: any) {
			return this;
		}),
		in: mock(function (this: any) {
			return this;
		}),
		gte: mock(function (this: any) {
			return this;
		}),
		lte: mock(function (this: any) {
			return this;
		}),
		ilike: mock(function (this: any) {
			return this;
		}),
		or: mock(function (this: any) {
			return this;
		}),
		order: mock(function (this: any) {
			return this;
		}),
		range: mock(function (this: any) {
			return this;
		}),
		limit: mock(function (this: any) {
			return this;
		}),
		single: mock(() => ({ data: null, error: null, count: null })),
		then: undefined,
	};

	// Apply overrides
	Object.assign(base, overrides);

	// Make chainable - every method that isn't overridden returns base
	for (const key of Object.keys(base)) {
		if (key === "then" || key === "single") continue;
		const original = base[key];
		if (typeof original === "function" && !overrides[key]) {
			base[key] = mock((...args: any[]) => {
				original(...args);
				return base;
			});
		}
	}

	return base;
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("admin data layer", () => {
	beforeEach(() => {
		mockFrom.mockReset();
	});

	// ── Dashboard Stats ────────────────────────────────────────────────────

	describe("getAdminDashboardStats", () => {
		test("returns correct stats", async () => {
			let callIndex = 0;
			mockFrom.mockImplementation(() => {
				callIndex++;
				if (callIndex === 1) {
					// revenue query - orders with select + in
					const p = Promise.resolve({
						data: [{ total_kes: 10000 }, { total_kes: 20000 }],
						error: null,
					});
					return chainMock({
						in: mock(() => p),
					});
				}
				// count queries
				return chainMock({
					range: mock(
						() =>
							({
								then: undefined,
								count: 5,
								data: null,
								error: null,
							}) as any,
					),
					eq: mock(
						() =>
							({
								then: undefined,
								count: 5,
								data: null,
								error: null,
								eq: mock(
									() =>
										({
											then: undefined,
											count: 5,
											data: null,
											error: null,
										}) as any,
								),
							}) as any,
					),
					gte: mock(
						() =>
							({
								then: undefined,
								count: 5,
								data: null,
								error: null,
							}) as any,
					),
				});
			});

			const stats = await getAdminDashboardStats();
			expect(stats).toHaveProperty("totalRevenue");
			expect(stats).toHaveProperty("ordersToday");
			expect(stats).toHaveProperty("pendingOrders");
			expect(stats).toHaveProperty("activeListings");
			expect(stats).toHaveProperty("totalCustomers");
			expect(typeof stats.totalRevenue).toBe("number");
		});
	});

	// ── Revenue Data ───────────────────────────────────────────────────────

	describe("getRevenueData", () => {
		test("returns array of date-revenue pairs", async () => {
			// Use today's date for the mock data so it falls within the range
			const today = new Date().toISOString().split("T")[0];
			mockFrom.mockReturnValue(
				chainMock({
					order: mock(() =>
						Promise.resolve({
							data: [
								{ total_kes: 5000, created_at: `${today}T10:00:00Z` },
								{ total_kes: 3000, created_at: `${today}T15:00:00Z` },
							],
							error: null,
						}),
					),
				}),
			);

			const data = await getRevenueData(7);
			expect(Array.isArray(data)).toBe(true);
			expect(data.length).toBe(7);
			data.forEach((point) => {
				expect(point).toHaveProperty("date");
				expect(point).toHaveProperty("revenue");
			});
			// The last entry should have the sum of both orders
			const todayEntry = data.find((p) => p.date === today);
			expect(todayEntry?.revenue).toBe(8000);
		});
	});

	// ── Admin Orders ───────────────────────────────────────────────────────

	describe("getAdminOrders", () => {
		test("returns paginated orders", async () => {
			const mockOrders = [
				{ id: "o1", total_kes: 10000, status: "pending" },
				{ id: "o2", total_kes: 20000, status: "confirmed" },
			];

			mockFrom.mockReturnValue(
				chainMock({
					range: mock(() =>
						Promise.resolve({
							data: mockOrders,
							count: 2,
							error: null,
						}),
					),
				}),
			);

			const result = await getAdminOrders({ page: 1, limit: 10 });
			expect(result.data).toHaveLength(2);
			expect(result.total).toBe(2);
			expect(result.page).toBe(1);
			expect(result.totalPages).toBe(1);
		});

		test("returns empty on error", async () => {
			mockFrom.mockReturnValue(
				chainMock({
					range: mock(() =>
						Promise.resolve({
							data: null,
							count: null,
							error: { message: "fail" },
						}),
					),
				}),
			);

			const result = await getAdminOrders();
			expect(result.data).toHaveLength(0);
			expect(result.total).toBe(0);
		});
	});

	// ── Admin Listings ─────────────────────────────────────────────────────

	describe("getAdminListings", () => {
		test("returns paginated listings", async () => {
			mockFrom.mockReturnValue(
				chainMock({
					range: mock(() =>
						Promise.resolve({
							data: [{ id: "l1", listing_id: "PD-001" }],
							count: 1,
							error: null,
						}),
					),
				}),
			);

			const result = await getAdminListings({ page: 1, limit: 10 });
			expect(result.data).toHaveLength(1);
			expect(result.total).toBe(1);
		});
	});

	describe("createListing", () => {
		test("creates and returns listing", async () => {
			const newListing = {
				id: "l1",
				listing_id: "PD-NEW",
				price_kes: 50000,
			};

			mockFrom.mockReturnValue(
				chainMock({
					single: mock(() => ({
						data: newListing,
						error: null,
					})),
				}),
			);

			const result = await createListing({
				listing_id: "PD-NEW",
				price_kes: 50000,
				product_id: "p1",
			});
			expect(result).toEqual(newListing);
		});

		test("throws on error", async () => {
			mockFrom.mockReturnValue(
				chainMock({
					single: mock(() => ({
						data: null,
						error: { message: "insert failed" },
					})),
				}),
			);

			await expect(createListing({ listing_id: "PD-FAIL" })).rejects.toThrow(
				"Failed to create listing",
			);
		});
	});

	describe("updateListing", () => {
		test("updates and returns listing", async () => {
			const updated = { id: "l1", price_kes: 60000 };

			mockFrom.mockReturnValue(
				chainMock({
					single: mock(() => ({
						data: updated,
						error: null,
					})),
				}),
			);

			const result = await updateListing("l1", { price_kes: 60000 });
			expect(result).toEqual(updated);
		});
	});

	describe("deleteListing", () => {
		test("returns true on success", async () => {
			mockFrom.mockReturnValue(
				chainMock({
					eq: mock(() => Promise.resolve({ error: null })),
				}),
			);

			const result = await deleteListing("l1");
			expect(result).toBe(true);
		});

		test("throws on error", async () => {
			mockFrom.mockReturnValue(
				chainMock({
					eq: mock(() =>
						Promise.resolve({ error: { message: "delete failed" } }),
					),
				}),
			);

			await expect(deleteListing("l1")).rejects.toThrow(
				"Failed to delete listing",
			);
		});
	});

	// ── Admin Products ─────────────────────────────────────────────────────

	describe("getAdminProducts", () => {
		test("returns paginated products", async () => {
			mockFrom.mockReturnValue(
				chainMock({
					range: mock(() =>
						Promise.resolve({
							data: [{ id: "p1", brand: "Apple", model: "iPhone 15" }],
							count: 1,
							error: null,
						}),
					),
				}),
			);

			const result = await getAdminProducts({ page: 1, limit: 10 });
			expect(result.data).toHaveLength(1);
			expect(result.total).toBe(1);
		});
	});

	describe("createProduct", () => {
		test("creates and returns product", async () => {
			const newProduct = { id: "p1", brand: "Apple", model: "iPhone 15" };

			mockFrom.mockReturnValue(
				chainMock({
					single: mock(() => ({
						data: newProduct,
						error: null,
					})),
				}),
			);

			const result = await createProduct({
				brand: "Apple",
				model: "iPhone 15",
				slug: "apple-iphone-15",
			});
			expect(result).toEqual(newProduct);
		});
	});

	describe("updateProduct", () => {
		test("updates and returns product", async () => {
			const updated = { id: "p1", brand: "Apple", model: "iPhone 15 Pro" };

			mockFrom.mockReturnValue(
				chainMock({
					single: mock(() => ({
						data: updated,
						error: null,
					})),
				}),
			);

			const result = await updateProduct("p1", { model: "iPhone 15 Pro" });
			expect(result).toEqual(updated);
		});
	});

	describe("deleteProduct", () => {
		test("returns true on success", async () => {
			mockFrom.mockReturnValue(
				chainMock({
					eq: mock(() => Promise.resolve({ error: null })),
				}),
			);

			const result = await deleteProduct("p1");
			expect(result).toBe(true);
		});
	});

	// ── Categories ─────────────────────────────────────────────────────────

	describe("getAdminCategories", () => {
		test("returns categories array", async () => {
			const categories = [
				{ id: "c1", name: "Phones", slug: "phones" },
				{ id: "c2", name: "Tablets", slug: "tablets" },
			];

			mockFrom.mockReturnValue(
				chainMock({
					order: mock(() => Promise.resolve({ data: categories, error: null })),
				}),
			);

			const result = await getAdminCategories();
			expect(result).toHaveLength(2);
		});

		test("returns empty on error", async () => {
			mockFrom.mockReturnValue(
				chainMock({
					order: mock(() =>
						Promise.resolve({ data: null, error: { message: "fail" } }),
					),
				}),
			);

			const result = await getAdminCategories();
			expect(result).toHaveLength(0);
		});
	});

	describe("createCategory", () => {
		test("creates and returns category", async () => {
			const newCat = { id: "c1", name: "Laptops", slug: "laptops" };

			mockFrom.mockReturnValue(
				chainMock({
					single: mock(() => ({
						data: newCat,
						error: null,
					})),
				}),
			);

			const result = await createCategory({
				name: "Laptops",
				slug: "laptops",
			});
			expect(result).toEqual(newCat);
		});
	});

	describe("updateCategory", () => {
		test("updates and returns category", async () => {
			const updated = { id: "c1", name: "Laptops Updated" };

			mockFrom.mockReturnValue(
				chainMock({
					single: mock(() => ({
						data: updated,
						error: null,
					})),
				}),
			);

			const result = await updateCategory("c1", { name: "Laptops Updated" });
			expect(result).toEqual(updated);
		});
	});

	describe("deleteCategory", () => {
		test("returns true on success", async () => {
			mockFrom.mockReturnValue(
				chainMock({
					eq: mock(() => Promise.resolve({ error: null })),
				}),
			);

			const result = await deleteCategory("c1");
			expect(result).toBe(true);
		});
	});

	// ── Customers ──────────────────────────────────────────────────────────

	describe("getAdminCustomers", () => {
		test("returns paginated customers", async () => {
			mockFrom.mockReturnValue(
				chainMock({
					range: mock(() =>
						Promise.resolve({
							data: [{ id: "u1", full_name: "John" }],
							count: 1,
							error: null,
						}),
					),
				}),
			);

			const result = await getAdminCustomers({ page: 1, limit: 10 });
			expect(result.data).toHaveLength(1);
			expect(result.total).toBe(1);
		});
	});

	describe("getAdminCustomerDetail", () => {
		test("returns profile, orders, and wishlist", async () => {
			let callIndex = 0;
			mockFrom.mockImplementation(() => {
				callIndex++;
				if (callIndex === 1) {
					return chainMock({
						single: mock(() => ({
							data: { id: "u1", full_name: "John" },
							error: null,
						})),
					});
				}
				if (callIndex === 2) {
					return chainMock({
						order: mock(() =>
							Promise.resolve({
								data: [{ id: "o1", status: "pending" }],
								error: null,
							}),
						),
					});
				}
				return chainMock({
					eq: mock(() =>
						Promise.resolve({
							data: [{ id: "w1", product_id: "p1" }],
							error: null,
						}),
					),
				});
			});

			const result = await getAdminCustomerDetail("u1");
			expect(result.profile).toBeTruthy();
			expect(Array.isArray(result.orders)).toBe(true);
			expect(Array.isArray(result.wishlist)).toBe(true);
		});
	});

	describe("updateUserRole", () => {
		test("updates and returns profile", async () => {
			const updated = { id: "u1", role: "admin" };

			mockFrom.mockReturnValue(
				chainMock({
					single: mock(() => ({
						data: updated,
						error: null,
					})),
				}),
			);

			const result = await updateUserRole("u1", "admin");
			expect(result).toEqual(updated);
		});

		test("throws on error", async () => {
			mockFrom.mockReturnValue(
				chainMock({
					single: mock(() => ({
						data: null,
						error: { message: "update failed" },
					})),
				}),
			);

			await expect(updateUserRole("u1", "admin")).rejects.toThrow(
				"Failed to update user role",
			);
		});
	});

	// ── Reviews ────────────────────────────────────────────────────────────

	describe("getAdminReviews", () => {
		test("returns paginated reviews", async () => {
			mockFrom.mockReturnValue(
				chainMock({
					range: mock(() =>
						Promise.resolve({
							data: [{ id: "r1", rating: 5 }],
							count: 1,
							error: null,
						}),
					),
				}),
			);

			const result = await getAdminReviews({ page: 1, limit: 10 });
			expect(result.data).toHaveLength(1);
			expect(result.total).toBe(1);
		});
	});

	describe("deleteReview", () => {
		test("returns true on success", async () => {
			mockFrom.mockReturnValue(
				chainMock({
					eq: mock(() => Promise.resolve({ error: null })),
				}),
			);

			const result = await deleteReview("r1");
			expect(result).toBe(true);
		});
	});

	// ── Newsletter ─────────────────────────────────────────────────────────

	describe("getNewsletterSubscribers", () => {
		test("returns paginated subscribers", async () => {
			mockFrom.mockReturnValue(
				chainMock({
					range: mock(() =>
						Promise.resolve({
							data: [{ id: "s1", email: "test@test.com" }],
							count: 1,
							error: null,
						}),
					),
				}),
			);

			const result = await getNewsletterSubscribers({ page: 1, limit: 10 });
			expect(result.data).toHaveLength(1);
			expect(result.total).toBe(1);
		});
	});

	describe("exportNewsletterCSV", () => {
		test("returns CSV string with headers", async () => {
			mockFrom.mockReturnValue(
				chainMock({
					order: mock(() =>
						Promise.resolve({
							data: [
								{ email: "a@test.com", subscribed_at: "2025-01-01" },
								{ email: "b@test.com", subscribed_at: "2025-01-02" },
							],
							error: null,
						}),
					),
				}),
			);

			const csv = await exportNewsletterCSV();
			expect(csv).toContain("email,subscribed_at");
			expect(csv).toContain("a@test.com");
			expect(csv).toContain("b@test.com");
		});

		test("returns headers only on error", async () => {
			mockFrom.mockReturnValue(
				chainMock({
					order: mock(() =>
						Promise.resolve({
							data: null,
							error: { message: "fail" },
						}),
					),
				}),
			);

			const csv = await exportNewsletterCSV();
			expect(csv).toBe("email,subscribed_at");
		});
	});

	// ── Sync Log ───────────────────────────────────────────────────────────

	describe("getSyncHistory", () => {
		test("returns sync log entries", async () => {
			mockFrom.mockReturnValue(
				chainMock({
					limit: mock(() =>
						Promise.resolve({
							data: [{ id: "sl1", status: "completed" }],
							error: null,
						}),
					),
				}),
			);

			const result = await getSyncHistory(10);
			expect(result).toHaveLength(1);
		});

		test("returns empty on error", async () => {
			mockFrom.mockReturnValue(
				chainMock({
					limit: mock(() =>
						Promise.resolve({
							data: null,
							error: { message: "fail" },
						}),
					),
				}),
			);

			const result = await getSyncHistory();
			expect(result).toHaveLength(0);
		});
	});

	describe("logSyncResult", () => {
		test("logs and returns sync result", async () => {
			const logEntry = {
				id: "sl1",
				triggered_by: "admin",
				status: "completed",
				rows_synced: 50,
			};

			mockFrom.mockReturnValue(
				chainMock({
					single: mock(() => ({
						data: logEntry,
						error: null,
					})),
				}),
			);

			const result = await logSyncResult({
				triggered_by: "admin",
				status: "completed",
				rows_synced: 50,
			});
			expect(result).toEqual(logEntry);
		});

		test("throws on error", async () => {
			mockFrom.mockReturnValue(
				chainMock({
					single: mock(() => ({
						data: null,
						error: { message: "log failed" },
					})),
				}),
			);

			await expect(
				logSyncResult({
					triggered_by: "admin",
					status: "failed",
					rows_synced: 0,
				}),
			).rejects.toThrow("Failed to log sync result");
		});
	});

	// ── Price Comparisons ──────────────────────────────────────────────────

	describe("getPriceComparisons", () => {
		test("returns price comparisons", async () => {
			mockFrom.mockReturnValue(
				chainMock({
					order: mock(() =>
						Promise.resolve({
							data: [
								{
									id: "pc1",
									competitor: "Amazon",
									competitor_price_kes: 55000,
								},
							],
							error: null,
						}),
					),
				}),
			);

			const result = await getPriceComparisons();
			expect(result).toHaveLength(1);
		});

		test("filters by productId", async () => {
			const mockEq = mock(() =>
				Promise.resolve({
					data: [{ id: "pc1", product_id: "p1" }],
					error: null,
				}),
			);

			mockFrom.mockReturnValue(
				chainMock({
					order: mock(() => ({
						eq: mockEq,
					})),
				}),
			);

			const result = await getPriceComparisons({ productId: "p1" });
			expect(result).toHaveLength(1);
		});
	});

	describe("getLatestCrawlDate", () => {
		test("returns date when data exists", async () => {
			mockFrom.mockReturnValue(
				chainMock({
					single: mock(() => ({
						data: { crawled_at: "2025-06-15T10:00:00Z" },
						error: null,
					})),
				}),
			);

			const result = await getLatestCrawlDate();
			expect(result).toBeInstanceOf(Date);
		});

		test("returns null when no data", async () => {
			mockFrom.mockReturnValue(
				chainMock({
					single: mock(() => ({
						data: null,
						error: { message: "not found" },
					})),
				}),
			);

			const result = await getLatestCrawlDate();
			expect(result).toBeNull();
		});
	});
});
