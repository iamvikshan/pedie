import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { resolve } from "path";

const SOURCE = readFileSync(
	resolve("src/components/home/customerFavorites.tsx"),
	"utf-8",
);

describe("CustomerFavorites", () => {
	test("module exports the component", async () => {
		const mod = await import("@components/home/customerFavorites");
		expect(mod.CustomerFavorites).toBeDefined();
		expect(typeof mod.CustomerFavorites).toBe("function");
	});

	test("exports TABS constant with correct tabs", async () => {
		const mod = await import("@components/home/customerFavorites");
		expect(mod.TABS).toBeDefined();
		expect(Array.isArray(mod.TABS)).toBe(true);
		expect(mod.TABS.length).toBe(4);
	});

	test("each tab has id and label", async () => {
		const { TABS } = await import("@components/home/customerFavorites");
		for (const tab of TABS) {
			expect(typeof tab.id).toBe("string");
			expect(typeof tab.label).toBe("string");
			expect(tab.id.length).toBeGreaterThan(0);
			expect(tab.label.length).toBeGreaterThan(0);
		}
	});

	test("first tab is 'all' for unfiltered view", async () => {
		const { TABS } = await import("@components/home/customerFavorites");
		expect(TABS[0].id).toBe("all");
		expect(TABS[0].label).toBe("All");
	});

	test("tabs include expected category slugs", async () => {
		const { TABS } = await import("@components/home/customerFavorites");
		const ids = TABS.map((t: { id: string }) => t.id);
		expect(ids).toContain("smartphones");
		expect(ids).toContain("laptops");
		expect(ids).toContain("tablets");
	});

	test("has /collections View All link", () => {
		expect(SOURCE).toContain("/collections");
	});

	test("has View All text", () => {
		expect(SOURCE).toContain("View All");
	});
});
