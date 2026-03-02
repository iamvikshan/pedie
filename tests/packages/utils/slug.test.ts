import { describe, expect, test } from "bun:test";
import { productSlug, slugify } from "@utils/slug";

describe("slugify", () => {
	test("converts to lowercase", () => {
		expect(slugify("Hello World")).toBe("hello-world");
	});

	test("replaces spaces with dashes", () => {
		expect(slugify("foo bar baz")).toBe("foo-bar-baz");
	});

	test("removes special characters", () => {
		expect(slugify("Hello! @World#")).toBe("hello-world");
	});

	test("collapses multiple dashes", () => {
		expect(slugify("foo---bar")).toBe("foo-bar");
	});

	test("trims leading/trailing dashes", () => {
		expect(slugify("-hello-")).toBe("hello");
	});

	test("handles empty string", () => {
		expect(slugify("")).toBe("");
	});
});

describe("productSlug", () => {
	test("combines brand and model", () => {
		expect(productSlug("Apple", "iPhone 15 Pro")).toBe("apple-iphone-15-pro");
	});

	test("handles special characters", () => {
		expect(productSlug("Samsung", "Galaxy S24+")).toBe("samsung-galaxy-s24");
	});
});
