import { describe, expect, test } from "bun:test";

describe("CategoryNav", () => {
	test("module exports the component", async () => {
		const mod = await import("@components/layout/categoryNav");
		expect(mod.CategoryNav).toBeDefined();
		expect(typeof mod.CategoryNav).toBe("function");
	});

	test("exports CATEGORIES with 6 items", async () => {
		const mod = await import("@components/layout/categoryNav");
		expect(mod.CATEGORIES).toBeDefined();
		expect(Array.isArray(mod.CATEGORIES)).toBe(true);
		expect(mod.CATEGORIES.length).toBe(6);
	});

	test("each category has name and href", async () => {
		const { CATEGORIES } = await import("@components/layout/categoryNav");
		for (const cat of CATEGORIES) {
			expect(cat.name).toBeTruthy();
			expect(cat.href).toMatch(/^\/collections\//);
		}
	});
});
