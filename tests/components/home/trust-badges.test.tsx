import { describe, expect, test } from "bun:test";

describe("TrustBadges", () => {
	test("module exports the component", async () => {
		const mod = await import("@components/home/trustBadges");
		expect(mod.TrustBadges).toBeDefined();
		expect(typeof mod.TrustBadges).toBe("function");
	});

	test("exports BADGE_TITLES with 4 items", async () => {
		const mod = await import("@components/home/trustBadges");
		expect(mod.BADGE_TITLES).toBeDefined();
		expect(Array.isArray(mod.BADGE_TITLES)).toBe(true);
		expect(mod.BADGE_TITLES.length).toBe(4);
	});

	test("badge titles are non-empty strings", async () => {
		const { BADGE_TITLES } = await import("@components/home/trustBadges");
		for (const title of BADGE_TITLES) {
			expect(typeof title).toBe("string");
			expect(title.length).toBeGreaterThan(0);
		}
	});
});
