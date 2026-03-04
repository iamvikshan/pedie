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

const mockGetSyncHistory = mock<any>(() => Promise.resolve([]));
const mockLogSyncResult = mock<any>(() =>
	Promise.resolve({ id: "log-1", status: "success" }),
);

mock.module("@data/admin", () => ({
	getSyncHistory: mockGetSyncHistory,
	logSyncResult: mockLogSyncResult,
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
	getAdminReviews: mock(),
	deleteReview: mock(),
	getNewsletterSubscribers: mock(),
	exportNewsletterCSV: mock(),
	getAdminDashboardStats: mock(),
	getRevenueData: mock(),
	getPriceComparisons: mock(),
	getLatestCrawlDate: mock(),
}));

const mockSyncFromSheets = mock<any>(() =>
	Promise.resolve({ created: 5, updated: 2, errors: 0, details: [] }),
);

mock.module("@lib/sheets/sync", () => ({
	syncFromSheets: mockSyncFromSheets,
}));

// Import AFTER mocking
const { GET, POST } = await import("@/app/api/admin/sync/route");

// ── Helpers ────────────────────────────────────────────────────────────────

const adminUser = { id: "admin-user-1", email: "admin@test.com" };

// ── Tests ──────────────────────────────────────────────────────────────────

describe("GET /api/admin/sync", () => {
	beforeEach(() => {
		mockGetUser.mockReset();
		mockIsUserAdmin.mockReset();
		mockGetSyncHistory.mockReset();
		mockGetSyncHistory.mockResolvedValue([
			{
				id: "log-1",
				triggered_by: "admin-user-1",
				status: "success",
				rows_synced: 10,
				started_at: "2025-01-01T00:00:00Z",
				completed_at: "2025-01-01T00:00:30Z",
			},
		]);
	});

	test("returns 401 when not authenticated", async () => {
		mockGetUser.mockResolvedValue(null);
		const res = await GET();
		expect(res.status).toBe(401);
	});

	test("returns 403 when not admin", async () => {
		mockGetUser.mockResolvedValue({ id: "user-1" });
		mockIsUserAdmin.mockResolvedValue(false);
		const res = await GET();
		expect(res.status).toBe(403);
	});

	test("returns sync history for admin", async () => {
		mockGetUser.mockResolvedValue(adminUser);
		mockIsUserAdmin.mockResolvedValue(true);

		const res = await GET();
		expect(res.status).toBe(200);

		const data = await res.json();
		expect(data).toHaveLength(1);
		expect(data[0].status).toBe("success");
		expect(data[0].rows_synced).toBe(10);
	});
});

describe("POST /api/admin/sync", () => {
	beforeEach(() => {
		mockGetUser.mockReset();
		mockIsUserAdmin.mockReset();
		mockSyncFromSheets.mockReset();
		mockLogSyncResult.mockReset();
		mockSyncFromSheets.mockResolvedValue({
			created: 5,
			updated: 2,
			errors: 0,
			details: [],
		});
		mockLogSyncResult.mockResolvedValue({ id: "log-1", status: "success" });
	});

	test("returns 401 when not authenticated", async () => {
		mockGetUser.mockResolvedValue(null);
		const res = await POST();
		expect(res.status).toBe(401);
	});

	test("returns 403 when not admin", async () => {
		mockGetUser.mockResolvedValue({ id: "user-1" });
		mockIsUserAdmin.mockResolvedValue(false);
		const res = await POST();
		expect(res.status).toBe(403);
	});

	test("triggers sync and returns result", async () => {
		mockGetUser.mockResolvedValue(adminUser);
		mockIsUserAdmin.mockResolvedValue(true);

		const res = await POST();
		expect(res.status).toBe(200);

		const data = await res.json();
		expect(data.success).toBe(true);
		expect(data.report.created).toBe(5);
		expect(data.report.updated).toBe(2);

		expect(mockSyncFromSheets).toHaveBeenCalledTimes(1);
		expect(mockLogSyncResult).toHaveBeenCalledTimes(1);
	});

	test("logs error on sync failure", async () => {
		mockGetUser.mockResolvedValue(adminUser);
		mockIsUserAdmin.mockResolvedValue(true);
		mockSyncFromSheets.mockRejectedValue(new Error("Sheets API error"));

		const res = await POST();
		expect(res.status).toBe(500);

		const data = await res.json();
		expect(data.error).toBe("Sync failed");
		expect(mockLogSyncResult).toHaveBeenCalledWith(
			expect.objectContaining({
				status: "error",
				rows_synced: 0,
			}),
		);
	});
});
