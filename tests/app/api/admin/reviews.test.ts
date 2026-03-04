import { beforeEach, describe, expect, mock, test } from "bun:test";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockGetUser = mock(() => Promise.resolve(null as any));
const mockIsUserAdmin = mock(() => Promise.resolve(false));

mock.module("@helpers/auth", () => ({
	getUser: mockGetUser,
}));

mock.module("@lib/auth/admin", () => ({
	isUserAdmin: mockIsUserAdmin,
}));

const mockGetAdminReviews = mock<any>(() =>
	Promise.resolve({
		data: [],
		total: 0,
		page: 1,
		totalPages: 0,
	}),
);
const mockDeleteReview = mock<any>(() => Promise.resolve(true));

mock.module("@data/admin", () => ({
	getAdminReviews: mockGetAdminReviews,
	deleteReview: mockDeleteReview,
	getAdminOrders: mock(),
	getAdminOrderDetail: mock(),
	updateOrder: mock(),
	getAdminListings: mock(),
	createListing: mock(),
	updateListing: mock(),
	deleteListing: mock(),
	getAdminProducts: mock(),
	createProduct: mock(),
	updateProduct: mock(),
	deleteProduct: mock(),
	getAdminCategories: mock(),
	createCategory: mock(),
	updateCategory: mock(),
	deleteCategory: mock(),
	getAdminCustomers: mock(),
	getAdminCustomerDetail: mock(),
	updateUserRole: mock(),
	getNewsletterSubscribers: mock(),
	exportNewsletterCSV: mock(),
	getSyncHistory: mock(),
	logSyncResult: mock(),
	getAdminDashboardStats: mock(),
	getRevenueData: mock(),
	getPriceComparisons: mock(),
	getLatestCrawlDate: mock(),
}));

// Import AFTER mocking
const { GET, DELETE } = await import("@/app/api/admin/reviews/route");

// ── Helpers ────────────────────────────────────────────────────────────────

function makeRequest(
	method: string,
	url = "http://localhost:3000/api/admin/reviews",
) {
	return new Request(url, {
		method,
		headers: { "Content-Type": "application/json" },
	});
}

const adminUser = { id: "admin-user-1", email: "admin@test.com" };

// ── Tests ──────────────────────────────────────────────────────────────────

describe("GET /api/admin/reviews", () => {
	beforeEach(() => {
		mockGetUser.mockReset();
		mockIsUserAdmin.mockReset();
		mockGetAdminReviews.mockReset();
		mockGetAdminReviews.mockResolvedValue({
			data: [
				{
					id: "r1",
					rating: 5,
					title: "Great phone",
					product: { brand: "Apple", model: "iPhone 15" },
					profile: { full_name: "Alice" },
				},
			],
			total: 1,
			page: 1,
			totalPages: 1,
		});
	});

	test("returns 401 when not authenticated", async () => {
		mockGetUser.mockResolvedValue(null);
		const res = await GET(makeRequest("GET"));
		expect(res.status).toBe(401);
	});

	test("returns 403 when not admin", async () => {
		mockGetUser.mockResolvedValue({ id: "user-1" });
		mockIsUserAdmin.mockResolvedValue(false);
		const res = await GET(makeRequest("GET"));
		expect(res.status).toBe(403);
	});

	test("returns reviews for admin", async () => {
		mockGetUser.mockResolvedValue(adminUser);
		mockIsUserAdmin.mockResolvedValue(true);

		const res = await GET(makeRequest("GET"));
		expect(res.status).toBe(200);

		const data = await res.json();
		expect(data.data).toHaveLength(1);
		expect(data.data[0].title).toBe("Great phone");
	});

	test("passes rating filter", async () => {
		mockGetUser.mockResolvedValue(adminUser);
		mockIsUserAdmin.mockResolvedValue(true);

		await GET(
			makeRequest("GET", "http://localhost:3000/api/admin/reviews?rating=5"),
		);

		expect(mockGetAdminReviews).toHaveBeenCalledWith(
			expect.objectContaining({ rating: 5 }),
		);
	});
});

describe("DELETE /api/admin/reviews", () => {
	beforeEach(() => {
		mockGetUser.mockReset();
		mockIsUserAdmin.mockReset();
		mockDeleteReview.mockReset();
		mockDeleteReview.mockResolvedValue(true);
	});

	test("returns 401 when not authenticated", async () => {
		mockGetUser.mockResolvedValue(null);
		const res = await DELETE(
			makeRequest(
				"DELETE",
				"http://localhost:3000/api/admin/reviews?id=review-1",
			),
		);
		expect(res.status).toBe(401);
	});

	test("returns 400 when no id provided", async () => {
		mockGetUser.mockResolvedValue(adminUser);
		mockIsUserAdmin.mockResolvedValue(true);

		const res = await DELETE(makeRequest("DELETE"));
		expect(res.status).toBe(400);
	});

	test("deletes review", async () => {
		mockGetUser.mockResolvedValue(adminUser);
		mockIsUserAdmin.mockResolvedValue(true);

		const res = await DELETE(
			makeRequest(
				"DELETE",
				"http://localhost:3000/api/admin/reviews?id=review-1",
			),
		);
		expect(res.status).toBe(200);

		const data = await res.json();
		expect(data.success).toBe(true);
		expect(mockDeleteReview).toHaveBeenCalledWith("review-1");
	});
});
