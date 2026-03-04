import { beforeEach, describe, expect, mock, test } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockRedirect = mock(() => {
	throw new Error("NEXT_REDIRECT");
});
const mockNotFound = mock(() => {
	throw new Error("NEXT_NOT_FOUND");
});

mock.module("next/navigation", () => ({
	redirect: mockRedirect,
	notFound: mockNotFound,
	useRouter: mock(() => ({})),
	usePathname: mock(() => "/account"),
	useSearchParams: mock(() => new URLSearchParams()),
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

// Mock auth helpers
const mockGetUser = mock(() => Promise.resolve(null as any));
const mockGetProfile = mock(() => Promise.resolve(null as any));
const mockRequireAuth = mock(() => Promise.resolve(null as any));

mock.module("@helpers/auth", () => ({
	getUser: mockGetUser,
	getProfile: mockGetProfile,
	requireAuth: mockRequireAuth,
	isAdmin: mock(() => Promise.resolve(false)),
}));

// Mock orders data
const mockGetOrdersByUser = mock(() => Promise.resolve([] as any[]));
const mockGetOrderById = mock(() => Promise.resolve(null as any));

mock.module("@data/orders", () => ({
	getOrdersByUser: mockGetOrdersByUser,
	getOrderById: mockGetOrderById,
	createOrder: mock(() =>
		Promise.resolve({ id: "order-1", status: "pending" }),
	),
}));

// Mock order sub-components
mock.module("@components/orders/statusTimeline", () => ({
	OrderStatusTimeline: mock(({ status }: { status: string }) =>
		React.createElement("div", { "data-testid": "status-timeline" }, status),
	),
}));

mock.module("@components/orders/orderItems", () => ({
	OrderItemsList: mock(({ items }: { items: any[] }) =>
		React.createElement(
			"div",
			{ "data-testid": "order-items" },
			`${items.length} items`,
		),
	),
}));

// Mock @lib/constants
mock.module("@config", () => ({
	formatKes: mock((amount: number) => `KES ${amount.toLocaleString("en-KE")}`),
	calculateDeposit: mock((price: number) => Math.round(price * 0.05)),
	KES_USD_RATE: 130,
}));

// Mock client-side hooks used by WishlistPage
const mockUseAuth = mock(() => ({
	user: null as { id: string; email: string } | null,
	loading: false,
	profile: null,
}));
mock.module("@components/auth/authProvider", () => ({
	useAuth: mockUseAuth,
}));

const mockRemoveFromWishlist = mock(() => Promise.resolve());
const mockToggleWishlist = mock(() => Promise.resolve());

mock.module("@components/wishlist/wishlistProvider", () => ({
	useWishlistContext: mock(() => ({
		productIds: new Set(),
		isWishlisted: mock(() => false),
		toggleWishlist: mockToggleWishlist,
		removeFromWishlist: mockRemoveFromWishlist,
		loading: false,
	})),
}));

mock.module("@lib/wishlist/useWishlist", () => ({
	useWishlist: mock(() => ({
		isWishlisted: mock(() => false),
		toggleWishlist: mock(() => Promise.resolve()),
		removeFromWishlist: mock(() => Promise.resolve()),
		wishlistCount: 0,
		loading: false,
	})),
}));

// Import components AFTER mocking
const { default: AccountDashboard } = await import(
	"@/app/(account)/account/page"
);
const { default: OrdersListPage } = await import(
	"@/app/(account)/account/orders/page"
);
const { default: OrderDetailPage } = await import(
	"@/app/(account)/account/orders/[id]/page"
);
const { default: WishlistPage } = await import(
	"@/app/(account)/account/wishlist/page"
);
const { default: AccountLayout } = await import(
	"@/app/(account)/account/layout"
);

// ── Helpers ────────────────────────────────────────────────────────────────

const mockUser = {
	id: "user-123",
	email: "test@example.com",
	user_metadata: {},
};

const mockProfile = {
	id: "user-123",
	full_name: "John Doe",
	role: "customer" as const,
	phone: "+254700000000",
	avatar_url: null,
	address: null,
	created_at: "2025-01-15T10:00:00Z",
	updated_at: "2025-06-01T10:00:00Z",
};

const mockOrders = [
	{
		id: "order-abc-123-def-456",
		user_id: "user-123",
		status: "pending",
		total_kes: 50000,
		subtotal_kes: 50000,
		deposit_amount_kes: 2500,
		balance_due_kes: 47500,
		shipping_fee_kes: 0,
		shipping_address: { full_name: "John Doe", city: "Nairobi" },
		payment_method: "mpesa",
		payment_ref: null,
		notes: null,
		created_at: "2025-06-01T10:00:00Z",
		updated_at: "2025-06-01T10:00:00Z",
	},
	{
		id: "order-xyz-789-ghi-012",
		user_id: "user-123",
		status: "delivered",
		total_kes: 120000,
		subtotal_kes: 120000,
		deposit_amount_kes: 12000,
		balance_due_kes: 108000,
		shipping_fee_kes: 0,
		shipping_address: { full_name: "John Doe", city: "Mombasa" },
		payment_method: "paypal",
		payment_ref: "PAY-REF-123",
		notes: null,
		created_at: "2025-05-01T10:00:00Z",
		updated_at: "2025-05-15T10:00:00Z",
	},
];

const mockOrderWithItems = {
	...mockOrders[0],
	items: [
		{
			id: "item-1",
			order_id: "order-abc-123-def-456",
			listing_id: "PD-ABC12",
			unit_price_kes: 50000,
			deposit_kes: 2500,
			created_at: "2025-06-01T10:00:00Z",
		},
	],
};

// ── Tests ──────────────────────────────────────────────────────────────────

describe("Account Pages", () => {
	beforeEach(() => {
		mockGetUser.mockReset();
		mockGetProfile.mockReset();
		mockRequireAuth.mockReset();
		mockGetOrdersByUser.mockReset();
		mockGetOrderById.mockReset();
		mockRedirect.mockClear();
		mockNotFound.mockClear();
	});

	describe("Account Layout", () => {
		test("redirects to signin if not authenticated", async () => {
			mockRequireAuth.mockImplementation(() => {
				throw new Error("NEXT_REDIRECT");
			});

			await expect(
				AccountLayout({
					children: React.createElement("div", null, "content"),
				}),
			).rejects.toThrow("NEXT_REDIRECT");
		});

		test("renders layout with sidebar navigation when authenticated", async () => {
			mockRequireAuth.mockResolvedValue(mockUser);

			const element = await AccountLayout({
				children: React.createElement("div", null, "page-content"),
			});
			const html = renderToString(element);

			expect(html).toContain("Dashboard");
			expect(html).toContain("Orders");
			expect(html).toContain("Wishlist");
			expect(html).toContain("/account");
			expect(html).toContain("/account/orders");
			expect(html).toContain("/account/wishlist");
			expect(html).toContain("page-content");
		});
	});

	describe("Account Dashboard", () => {
		test("renders welcome message with user name", async () => {
			mockGetProfile.mockResolvedValue(mockProfile);
			mockRequireAuth.mockResolvedValue(mockUser);
			mockGetOrdersByUser.mockResolvedValue(mockOrders);

			const element = await AccountDashboard();
			const html = renderToString(element);

			expect(html).toContain("John Doe");
		});

		test("renders order stats", async () => {
			mockGetProfile.mockResolvedValue(mockProfile);
			mockRequireAuth.mockResolvedValue(mockUser);
			mockGetOrdersByUser.mockResolvedValue(mockOrders);

			const element = await AccountDashboard();
			const html = renderToString(element);

			// Should show total order count
			expect(html).toContain("2");
		});

		test("shows member since date", async () => {
			mockGetProfile.mockResolvedValue(mockProfile);
			mockRequireAuth.mockResolvedValue(mockUser);
			mockGetOrdersByUser.mockResolvedValue([]);

			const element = await AccountDashboard();
			const html = renderToString(element);

			expect(html).toContain("2025");
		});

		test("shows admin dashboard link for admins", async () => {
			const adminProfile = { ...mockProfile, role: "admin" as const };
			mockGetProfile.mockResolvedValue(adminProfile);
			mockRequireAuth.mockResolvedValue(mockUser);
			mockGetOrdersByUser.mockResolvedValue([]);

			const element = await AccountDashboard();
			const html = renderToString(element);

			expect(html).toContain("/admin");
			expect(html).toContain("Admin Dashboard");
		});

		test("does not show admin link for customers", async () => {
			mockGetProfile.mockResolvedValue(mockProfile);
			mockRequireAuth.mockResolvedValue(mockUser);
			mockGetOrdersByUser.mockResolvedValue([]);

			const element = await AccountDashboard();
			const html = renderToString(element);

			expect(html).not.toContain("/admin");
		});

		test("shows quick links", async () => {
			mockGetProfile.mockResolvedValue(mockProfile);
			mockRequireAuth.mockResolvedValue(mockUser);
			mockGetOrdersByUser.mockResolvedValue([]);

			const element = await AccountDashboard();
			const html = renderToString(element);

			expect(html).toContain("/account/orders");
			expect(html).toContain("/account/wishlist");
		});
	});

	describe("Orders List Page", () => {
		test("renders list of orders", async () => {
			mockRequireAuth.mockResolvedValue(mockUser);
			mockGetOrdersByUser.mockResolvedValue(mockOrders);

			const element = await OrdersListPage();
			const html = renderToString(element);

			// Order IDs (truncated)
			expect(html).toContain("order-ab");
			expect(html).toContain("order-xy");
			// Status
			expect(html).toContain("pending");
			expect(html).toContain("delivered");
			// Totals
			expect(html).toContain("50,000");
			expect(html).toContain("120,000");
			// Payment methods
			expect(html).toContain("mpesa");
			expect(html).toContain("paypal");
		});

		test("renders empty state when no orders", async () => {
			mockRequireAuth.mockResolvedValue(mockUser);
			mockGetOrdersByUser.mockResolvedValue([]);

			const element = await OrdersListPage();
			const html = renderToString(element);

			expect(html).toContain("No orders");
		});

		test("links to order detail pages", async () => {
			mockRequireAuth.mockResolvedValue(mockUser);
			mockGetOrdersByUser.mockResolvedValue(mockOrders);

			const element = await OrdersListPage();
			const html = renderToString(element);

			expect(html).toContain("/account/orders/order-abc-123-def-456");
			expect(html).toContain("/account/orders/order-xyz-789-ghi-012");
		});
	});

	describe("Order Detail Page", () => {
		test("renders order details for owner", async () => {
			mockRequireAuth.mockResolvedValue(mockUser);
			mockGetOrderById.mockResolvedValue(mockOrderWithItems);

			const params = Promise.resolve({ id: "order-abc-123-def-456" });
			const element = await OrderDetailPage({ params });
			const html = renderToString(element);

			expect(html).toContain("order-ab");
			expect(html).toContain("status-timeline");
			expect(html).toContain("order-items");
		});

		test("calls notFound for non-existent order", async () => {
			mockRequireAuth.mockResolvedValue(mockUser);
			mockGetOrderById.mockResolvedValue(null);

			const params = Promise.resolve({ id: "nonexistent" });
			await expect(OrderDetailPage({ params })).rejects.toThrow(
				"NEXT_NOT_FOUND",
			);
		});

		test("calls notFound if user does not own the order", async () => {
			const otherUserOrder = {
				...mockOrderWithItems,
				user_id: "other-user-456",
			};
			mockRequireAuth.mockResolvedValue(mockUser);
			mockGetOrderById.mockResolvedValue(otherUserOrder);

			const params = Promise.resolve({ id: "order-abc-123-def-456" });
			await expect(OrderDetailPage({ params })).rejects.toThrow(
				"NEXT_NOT_FOUND",
			);
		});
	});

	describe("Wishlist Page", () => {
		test("renders wishlist page heading", () => {
			const element = React.createElement(WishlistPage);
			const html = renderToString(element);

			expect(html).toContain("Wishlist");
		});

		test("shows sign in prompt when not authenticated", () => {
			mockUseAuth.mockReturnValue({
				user: null,
				loading: false,
				profile: null,
			});

			const element = React.createElement(WishlistPage);
			const html = renderToString(element);

			expect(html).toContain("Sign in to view your wishlist");
			expect(html).toContain("/auth/signin");
		});

		test("shows empty wishlist state for authenticated user", () => {
			mockUseAuth.mockReturnValue({
				user: { id: "user-123", email: "test@example.com" },
				loading: false,
				profile: null,
			});

			const element = React.createElement(WishlistPage);
			const html = renderToString(element);

			expect(html).toContain("Your wishlist is empty");
			expect(html).toContain("Browse Products");
			expect(html).toContain("/collections");
		});

		test("shows loading state", () => {
			mockUseAuth.mockReturnValue({
				user: null,
				loading: true,
				profile: null,
			});

			const element = React.createElement(WishlistPage);
			const html = renderToString(element);

			expect(html).toContain("Loading your wishlist");
		});
	});
});
