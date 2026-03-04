import { describe, expect, test } from "bun:test";
import heroSlides from "../../src/lib/data/hero.json";

describe("hero.json", () => {
	test("has 3 slides", () => {
		expect(Array.isArray(heroSlides)).toBe(true);
		expect(heroSlides.length).toBe(3);
	});

	test("each slide has required fields", () => {
		for (const slide of heroSlides) {
			expect(typeof slide.title).toBe("string");
			expect(typeof slide.subtitle).toBe("string");
			expect(typeof slide.cta).toBe("string");
			expect(typeof slide.link).toBe("string");
			expect(typeof slide.image).toBe("string");
			expect(slide.title.length).toBeGreaterThan(0);
			expect(slide.link.startsWith("/")).toBe(true);
			expect(slide.image.startsWith("/")).toBe(true);
		}
	});
});
