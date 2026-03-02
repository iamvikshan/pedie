import { describe, expect, mock, test } from "bun:test";
import { getCategories, getCategoryBySlug } from "@lib/data/categories";

// Mock the server client
mock.module("@lib/supabase/server", () => ({
	createClient: mock(() =>
		Promise.resolve({
			from: mock(() => ({
				select: mock(() => ({
					order: mock(() =>
						Promise.resolve({
							data: [{ id: "1", name: "Phones", slug: "phones" }],
							error: null,
						}),
					),
					eq: mock(() => ({
						single: mock(() =>
							Promise.resolve({
								data: { id: "1", name: "Phones", slug: "phones" },
								error: null,
							}),
						),
					})),
				})),
			})),
		}),
	),
}));

describe("Categories Data Functions", () => {
	test("getCategories returns an array of categories", async () => {
		const categories = await getCategories();
		expect(Array.isArray(categories)).toBe(true);
		expect(categories.length).toBe(1);
		expect(categories[0].name).toBe("Phones");
	});

	test("getCategoryBySlug returns a category", async () => {
		const category = await getCategoryBySlug("phones");
		expect(category).not.toBeNull();
		expect(category?.name).toBe("Phones");
	});
});
