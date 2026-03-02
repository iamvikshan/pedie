import { describe, expect, test } from "bun:test";

describe("CategoryShowcase", () => {
	test("module exports the component", async () => {
		const mod = await import("@components/home/categoryShowcase");
		expect(mod.CategoryShowcase).toBeDefined();
		expect(typeof mod.CategoryShowcase).toBe("function");
	});
});

describe("CategoryShowcaseWrapper", () => {
	test("module exports the wrapper component", async () => {
		const mod = await import("@components/home/categoryShowcaseWrapper");
		expect(mod.CategoryShowcaseWrapper).toBeDefined();
		expect(typeof mod.CategoryShowcaseWrapper).toBe("function");
	});

	test("exports ViewAllArrow component", async () => {
		const mod = await import("@components/home/categoryShowcaseWrapper");
		expect(mod.ViewAllArrow).toBeDefined();
		expect(typeof mod.ViewAllArrow).toBe("function");
	});
});
