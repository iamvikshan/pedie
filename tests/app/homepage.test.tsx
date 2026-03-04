import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("Homepage (page.tsx)", () => {
	const content = readFileSync(resolve("src/app/page.tsx"), "utf-8");
	const layoutSource = readFileSync(resolve("src/app/layout.tsx"), "utf-8");

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
		expect(content).toContain("HotDeals");
		expect(content).toContain("CategoryShowcase");
		expect(content).toContain("SustainabilitySection");
	});

	test("main element has overflow-x-hidden to prevent horizontal scroll", () => {
		expect(layoutSource).toMatch(/main\s+className=['"][^'"]*overflow-x-hidden/);
	});

	test("imports Suspense from react", () => {
		expect(content).toContain("Suspense");
		expect(content).toMatch(/from\s+['"]react['"]/);
	});

	test("uses Suspense boundaries", () => {
		expect(content).toContain("<Suspense");
	});

	test("has skeleton fallbacks", () => {
		expect(content).toContain("fallback=");
		expect(content).toContain("Skeleton");
	});
});
