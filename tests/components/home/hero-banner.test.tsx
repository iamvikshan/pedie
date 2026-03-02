import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { resolve } from "path";

const SOURCE = readFileSync(
	resolve("src/components/home/heroBanner.tsx"),
	"utf-8",
);

describe("HeroBanner", () => {
	test("module exports the component", async () => {
		const mod = await import("@components/home/heroBanner");
		expect(mod.HeroBanner).toBeDefined();
		expect(typeof mod.HeroBanner).toBe("function");
	});

	test("exports SLIDES constant with 3 slides", async () => {
		const mod = await import("@components/home/heroBanner");
		expect(mod.SLIDES).toBeDefined();
		expect(Array.isArray(mod.SLIDES)).toBe(true);
		expect(mod.SLIDES.length).toBe(3);
	});

	test("each slide has title, subtitle, cta, and link", async () => {
		const { SLIDES } = await import("@components/home/heroBanner");
		for (const slide of SLIDES) {
			expect(typeof slide.title).toBe("string");
			expect(typeof slide.subtitle).toBe("string");
			expect(typeof slide.cta).toBe("string");
			expect(typeof slide.link).toBe("string");
			expect(slide.title.length).toBeGreaterThan(0);
			expect(slide.link.startsWith("/")).toBe(true);
		}
	});

	test("each slide has an image path", async () => {
		const { SLIDES } = await import("@components/home/heroBanner");
		for (const slide of SLIDES) {
			expect(typeof slide.image).toBe("string");
			expect(slide.image.startsWith("/")).toBe(true);
		}
	});

	test("imports chevron icons for nav", () => {
		expect(SOURCE).toContain("TbChevronLeft");
		expect(SOURCE).toContain("TbChevronRight");
	});

	test("chevrons are desktop-only (hidden md:flex)", () => {
		expect(SOURCE).toContain("hidden md:flex");
	});

	test("has auto-hide logic with lastInteraction", () => {
		expect(SOURCE).toContain("lastInteraction");
	});
});
