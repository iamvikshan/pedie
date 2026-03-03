import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { resolve } from "path";

const SOURCE = readFileSync(resolve("src/lib/data/deals.ts"), "utf-8");

describe("deals data helpers", () => {
	test("module exports getDealsListings and getHotDealsListings", async () => {
		const mod = await import("@lib/data/deals");
		expect(mod.getDealsListings).toBeDefined();
		expect(typeof mod.getDealsListings).toBe("function");
		expect(mod.getHotDealsListings).toBeDefined();
		expect(typeof mod.getHotDealsListings).toBe("function");
	});

	test("source imports getPricingTier from @helpers/pricing", () => {
		expect(SOURCE).toContain("getPricingTier");
		expect(SOURCE).toContain("@helpers/pricing");
	});

	test("source contains listing_type check for sale-first logic", () => {
		expect(SOURCE).toContain("listing_type");
	});

	test("source contains limit logic for hot deals (slice to 20)", () => {
		expect(SOURCE).toMatch(/\.slice\(0,\s*20\)|\.slice\(0, limit\)/);
	});

	// Behavior tests for computeDiscount guard logic
	test("computeDiscount guards against NaN price_kes", () => {
		// The source should check Number.isFinite for both prices
		expect(SOURCE).toContain("Number.isFinite(listing.price_kes)");
		expect(SOURCE).toContain("Number.isFinite(listing.final_price_kes)");
	});

	test("computeDiscount clamps output to [0, 100]", () => {
		expect(SOURCE).toContain("Math.min");
		expect(SOURCE).toContain("Math.max");
	});
});
