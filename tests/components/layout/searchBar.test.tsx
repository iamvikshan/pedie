import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { resolve } from "path";

const searchBarSource = readFileSync(
	resolve("src/components/layout/searchBar.tsx"),
	"utf-8",
);

describe("SearchBar", () => {
	test("module exports the component", async () => {
		const mod = await import("@components/layout/searchBar");
		expect(mod.SearchBar).toBeDefined();
		expect(typeof mod.SearchBar).toBe("function");
	});

	test("applies glass-search class for sunken depth effect", () => {
		expect(searchBarSource).toContain("glass-search");
	});

	test("does NOT use the old bg-pedie-glass class", () => {
		expect(searchBarSource).not.toContain("bg-pedie-glass");
	});

	test("has accessible search label", () => {
		expect(searchBarSource).toContain("aria-label='Search'");
		expect(searchBarSource).toContain("aria-label='Search devices'");
	});

	test("uses TbSearch icon", () => {
		expect(searchBarSource).toContain("TbSearch");
	});

	test("has expandable behavior on mobile", () => {
		expect(searchBarSource).toContain("isExpanded");
		expect(searchBarSource).toContain("setIsExpanded");
	});

	test("navigates to search page on submit", () => {
		expect(searchBarSource).toContain("/search?q=");
		expect(searchBarSource).toContain("encodeURIComponent");
	});

	test("has rounded-full form styling", () => {
		expect(searchBarSource).toContain("rounded-full");
	});

	test("supports blur collapse when query is empty", () => {
		expect(searchBarSource).toContain("handleBlur");
		expect(searchBarSource).toContain("!query");
	});

	test('accepts defaultExpanded prop', () => {
		expect(searchBarSource).toContain('defaultExpanded')
	})

	test('initializes isExpanded from defaultExpanded prop', () => {
		expect(searchBarSource).toContain('useState(defaultExpanded)')
	})

	test('uses useDebouncedCallback for autocomplete', () => {
		expect(searchBarSource).toContain('useDebouncedCallback')
	})

	test('fetches suggestions from API', () => {
		expect(searchBarSource).toContain('/api/search/suggestions')
	})

	test('has autocomplete dropdown with role listbox', () => {
		expect(searchBarSource).toContain("role='listbox'")
		expect(searchBarSource).toContain("role='option'")
	})

	test('supports keyboard navigation in dropdown', () => {
		expect(searchBarSource).toContain('ArrowDown')
		expect(searchBarSource).toContain('ArrowUp')
		expect(searchBarSource).toContain('Escape')
	})

	test('has aria-autocomplete attribute', () => {
		expect(searchBarSource).toContain('aria-autocomplete')
		expect(searchBarSource).toContain('aria-expanded')
	})

	test('shows suggestion brand and model', () => {
		expect(searchBarSource).toContain('s.brand')
		expect(searchBarSource).toContain('s.model')
	})
});
