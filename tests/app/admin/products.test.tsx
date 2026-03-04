import { describe, expect, mock, test } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Mocks ──────────────────────────────────────────────────────────────────

mock.module("@data/admin", () => ({
	getAdminProducts: mock(() =>
		Promise.resolve({
			data: [
				{
					id: "prod-1",
					brand: "Apple",
					model: "iPhone 15",
					slug: "apple-iphone-15",
					category: { name: "Phones" },
					created_at: "2025-06-01T10:00:00Z",
				},
			],
			total: 1,
			page: 1,
			totalPages: 1,
		}),
	),
	getAdminCategories: mock(() =>
		Promise.resolve([{ id: "cat-1", name: "Phones", slug: "phones" }]),
	),
}));

mock.module("next/link", () => ({
	default: mock(({ children, href, ...props }: Record<string, unknown>) =>
		React.createElement(
			"a",
			{ href: href as string, ...props },
			children as React.ReactNode,
		),
	),
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({
		push: mock(),
		refresh: mock(),
	}),
	useSearchParams: () => new URLSearchParams(),
}));

// Import AFTER mocking
const { ProductForm } = await import("@components/admin/productForm");
const { productColumns } = await import("@/app/(admin)/admin/products/columns");

// ── Tests ──────────────────────────────────────────────────────────────────

describe("Admin Products", () => {
	describe("ProductForm", () => {
		const mockCategories = [
			{ id: "cat-1", name: "Phones", slug: "phones" },
			{ id: "cat-2", name: "Tablets", slug: "tablets" },
		];

		test("renders all required form fields", () => {
			const html = renderToString(
				React.createElement(ProductForm, {
					categories: mockCategories as any,
					onSubmit: mock(() => Promise.resolve()),
				}),
			);

			expect(html).toContain("Brand");
			expect(html).toContain("Model");
			expect(html).toContain("Slug");
			expect(html).toContain("Category");
		});

		test("renders optional fields", () => {
			const html = renderToString(
				React.createElement(ProductForm, {
					categories: mockCategories as any,
					onSubmit: mock(() => Promise.resolve()),
				}),
			);

			expect(html).toContain("Description");
			expect(html).toContain("Key Features");
		});

		test("pre-fills data when editing", () => {
			const initialData = {
				id: "prod-1",
				brand: "Apple",
				model: "iPhone 15",
				slug: "apple-iphone-15",
				category_id: "cat-1",
				description: "Latest Apple phone",
				key_features: ["A16 Bionic", "Dynamic Island"],
			};

			const html = renderToString(
				React.createElement(ProductForm, {
					categories: mockCategories as any,
					initialData: initialData as any,
					onSubmit: mock(() => Promise.resolve()),
				}),
			);

			expect(html).toContain("Apple");
			expect(html).toContain("iPhone 15");
			expect(html).toContain("apple-iphone-15");
			expect(html).toContain("Latest Apple phone");
		});

		test("renders submit button", () => {
			const html = renderToString(
				React.createElement(ProductForm, {
					categories: mockCategories as any,
					onSubmit: mock(() => Promise.resolve()),
				}),
			);

			expect(html).toContain("button");
		});

		test("renders category select options", () => {
			const html = renderToString(
				React.createElement(ProductForm, {
					categories: mockCategories as any,
					onSubmit: mock(() => Promise.resolve()),
				}),
			);

			expect(html).toContain("Phones");
			expect(html).toContain("Tablets");
		});
	});

	describe("Product Columns", () => {
		test("defines expected columns", () => {
			const columnIds = productColumns.map(
				(col: any) => col.accessorKey || col.id,
			);
			expect(columnIds).toContain("select");
			expect(columnIds).toContain("brand");
			expect(columnIds).toContain("model");
			expect(columnIds).toContain("category");
			expect(columnIds).toContain("slug");
			expect(columnIds).toContain("created_at");
			expect(columnIds).toContain("actions");
		});

		test("has correct number of columns", () => {
			expect(productColumns.length).toBe(7);
		});
	});
});
