import { describe, expect, mock, test } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockStats = {
	totalRevenue: 500000,
	ordersToday: 12,
	pendingOrders: 3,
	activeListings: 45,
	totalCustomers: 200,
};

const mockRevenueData = [
	{ date: "2025-06-01", revenue: 10000 },
	{ date: "2025-06-02", revenue: 15000 },
];

const mockOrders = {
	data: [
		{
			id: "order-1",
			total_kes: 25000,
			status: "pending",
			created_at: "2025-06-01T10:00:00Z",
			profile: { full_name: "John Doe" },
		},
		{
			id: "order-2",
			total_kes: 30000,
			status: "delivered",
			created_at: "2025-06-02T10:00:00Z",
			profile: { full_name: "Jane Smith" },
		},
	],
	total: 2,
	page: 1,
	totalPages: 1,
};

mock.module("@data/admin", () => ({
	getAdminDashboardStats: mock(() => Promise.resolve(mockStats)),
	getRevenueData: mock(() => Promise.resolve(mockRevenueData)),
	getAdminOrders: mock(() => Promise.resolve(mockOrders)),
}));

mock.module("next/link", () => ({
	default: mock(({ children, href, ...props }: Record<string, unknown>) => {
		return React.createElement(
			"a",
			{ href: href as string, ...props },
			children as React.ReactNode,
		);
	}),
}));

// Mock recharts to avoid client-side rendering issues in SSR tests
mock.module("recharts", () => ({
	AreaChart: mock(({ children }: any) =>
		React.createElement("div", { "data-testid": "area-chart" }, children),
	),
	Area: mock(() => React.createElement("div", { "data-testid": "area" })),
	XAxis: mock(() => React.createElement("div", { "data-testid": "x-axis" })),
	YAxis: mock(() => React.createElement("div", { "data-testid": "y-axis" })),
	CartesianGrid: mock(() =>
		React.createElement("div", { "data-testid": "grid" }),
	),
	Tooltip: mock(() => React.createElement("div", { "data-testid": "tooltip" })),
	ResponsiveContainer: mock(({ children }: any) =>
		React.createElement(
			"div",
			{ "data-testid": "responsive-container" },
			children,
		),
	),
}));

// Import AFTER mocking
const AdminDashboardPage = (await import("@/app/(admin)/admin/page")).default;
const { KpiCards } = await import("@components/admin/kpiCards");
const { RecentOrders } = await import("@components/admin/recentOrders");

// ── Tests ──────────────────────────────────────────────────────────────────

describe("Admin Dashboard", () => {
	describe("KpiCards", () => {
		test("renders all 5 KPI cards with correct values", () => {
			const html = renderToString(
				React.createElement(KpiCards, { stats: mockStats }),
			);

			expect(html).toContain("Total Revenue");
			expect(html).toContain("Orders Today");
			expect(html).toContain("Pending Orders");
			expect(html).toContain("Active Listings");
			expect(html).toContain("Total Customers");
			// Check formatted values
			expect(html).toContain("500,000");
			expect(html).toContain("12");
			expect(html).toContain("45");
			expect(html).toContain("200");
		});
	});

	describe("RevenueChart", () => {
		test("renders chart container", async () => {
			// Revenue chart is a client component, mock it at the dashboard level
			const element = await AdminDashboardPage();
			const html = renderToString(element);
			// Chart is rendered via recharts mock
			expect(html).toContain("Revenue");
		});
	});

	describe("RecentOrders", () => {
		test("renders orders table with data", () => {
			const html = renderToString(
				React.createElement(RecentOrders, { orders: mockOrders.data }),
			);

			expect(html).toContain("Recent Orders");
			expect(html).toContain("Order ID");
			expect(html).toContain("Customer");
			expect(html).toContain("Status");
			expect(html).toContain("Total");
			expect(html).toContain("Date");
			expect(html).toContain("John Doe");
			expect(html).toContain("Jane Smith");
			expect(html).toContain("pending");
			expect(html).toContain("delivered");
		});

		test("shows empty message when no orders", () => {
			const html = renderToString(
				React.createElement(RecentOrders, { orders: [] }),
			);

			expect(html).toContain("No orders yet");
		});
	});

	describe("Dashboard page", () => {
		test("renders full dashboard with KPIs, chart, and orders", async () => {
			const element = await AdminDashboardPage();
			const html = renderToString(element);

			// KPIs
			expect(html).toContain("Total Revenue");
			expect(html).toContain("500,000");
			// Revenue chart
			expect(html).toContain("Revenue");
			// Recent orders
			expect(html).toContain("Recent Orders");
			expect(html).toContain("John Doe");
		});
	});
});
