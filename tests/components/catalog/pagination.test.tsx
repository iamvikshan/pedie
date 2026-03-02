import { describe, expect, mock, test } from "bun:test";
import { Pagination } from "@components/catalog/pagination";
import React from "react";
import { renderToString } from "react-dom/server";

// Mock next/navigation
mock.module("next/navigation", () => ({
	useRouter: mock(() => ({ push: mock(), replace: mock(), back: mock() })),
	useSearchParams: mock(() => new URLSearchParams()),
	usePathname: mock(() => "/collections/smartphones"),
}));

describe("Pagination", () => {
	test("renders page numbers", () => {
		const html = renderToString(
			<Pagination currentPage={2} totalPages={5} categorySlug="smartphones" />,
		);

		expect(html).toContain("1");
		expect(html).toContain("2");
		expect(html).toContain("3");
		expect(html).toContain("4");
		expect(html).toContain("5");
		expect(html).toContain("Prev");
		expect(html).toContain("Next");
	});

	test("does not render when totalPages <= 1", () => {
		const html = renderToString(
			<Pagination currentPage={1} totalPages={1} categorySlug="smartphones" />,
		);

		expect(html).toBe("");
	});

	test("disables prev button on first page", () => {
		const html = renderToString(
			<Pagination currentPage={1} totalPages={5} categorySlug="smartphones" />,
		);

		// The Prev button should have disabled attribute
		// In React 18/19 renderToString, disabled attributes are rendered as disabled=""
		expect(html).toContain('disabled=""');
	});
});
