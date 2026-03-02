import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("Homepage (page.tsx)", () => {
	const content = readFileSync(resolve("src/app/page.tsx"), "utf-8");

	test("does not import NewsletterSignup", () => {
		expect(content).not.toContain("NewsletterSignup");
	});

	test("imports ErrorBoundary", () => {
		expect(content).toContain("ErrorBoundary");
	});

	test("wraps sections in ErrorBoundary", () => {
		expect(content).toContain("<ErrorBoundary>");
	});

	test("renders all major homepage sections", () => {
		expect(content).toContain("HeroBanner");
		expect(content).toContain("TrustBadges");
		expect(content).toContain("PopularCategories");
		expect(content).toContain("CustomerFavorites");
		expect(content).toContain("DailyDeals");
		expect(content).toContain("CategoryShowcase");
		expect(content).toContain("SustainabilitySection");
	});
});
