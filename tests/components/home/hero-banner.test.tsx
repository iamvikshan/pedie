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

describe("HeroBanner slideVariants direction", () => {
	test("exports slideVariants object", async () => {
		const mod = await import("@components/home/heroBanner");
		expect(mod.slideVariants).toBeDefined();
	});

	test("slideVariants.enter is a function accepting direction", async () => {
		const { slideVariants } = await import("@components/home/heroBanner");
		expect(typeof slideVariants.enter).toBe("function");
	});

	test("slideVariants.exit is a function accepting direction", async () => {
		const { slideVariants } = await import("@components/home/heroBanner");
		expect(typeof slideVariants.exit).toBe("function");
	});

	test("enter returns x:300 for direction=1 (next)", async () => {
		const { slideVariants } = await import("@components/home/heroBanner");
		const result = (slideVariants.enter as (d: number) => { x: number })(1);
		expect(result.x).toBe(300);
		expect(result).toHaveProperty("opacity", 0);
	});

	test("enter returns x:-300 for direction=-1 (prev)", async () => {
		const { slideVariants } = await import("@components/home/heroBanner");
		const result = (slideVariants.enter as (d: number) => { x: number })(-1);
		expect(result.x).toBe(-300);
		expect(result).toHaveProperty("opacity", 0);
	});

	test("exit returns x:-300 for direction=1 (next)", async () => {
		const { slideVariants } = await import("@components/home/heroBanner");
		const result = (slideVariants.exit as (d: number) => { x: number })(1);
		expect(result.x).toBe(-300);
		expect(result).toHaveProperty("opacity", 0);
	});

	test("exit returns x:300 for direction=-1 (prev)", async () => {
		const { slideVariants } = await import("@components/home/heroBanner");
		const result = (slideVariants.exit as (d: number) => { x: number })(-1);
		expect(result.x).toBe(300);
		expect(result).toHaveProperty("opacity", 0);
	});

	test("center variant is static with x:0 and opacity:1", async () => {
		const { slideVariants } = await import("@components/home/heroBanner");
		expect(slideVariants.center).toEqual({ x: 0, opacity: 1 });
	});

	test("source uses custom prop on AnimatePresence and motion.div", () => {
		expect(SOURCE).toContain("custom={direction}");
	});

	test("source tracks direction state", () => {
		expect(SOURCE).toContain("useState<number>");
		expect(SOURCE).toContain("setDirection");
	});
});
