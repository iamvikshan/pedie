import { beforeEach, describe, expect, mock, test } from "bun:test";

const mockReviews = [
	{
		id: "rev-1",
		product_id: "prod-1",
		user_id: "user-1",
		rating: 5,
		title: "Great phone",
		body: "Works perfectly!",
		verified_purchase: true,
		created_at: "2025-06-15T00:00:00Z",
	},
	{
		id: "rev-2",
		product_id: "prod-1",
		user_id: "user-2",
		rating: 4,
		title: "Good condition",
		body: "Minor scratches but works well",
		verified_purchase: false,
		created_at: "2025-06-10T00:00:00Z",
	},
	{
		id: "rev-3",
		product_id: "prod-1",
		user_id: "user-3",
		rating: 5,
		title: "Excellent",
		body: "Like new!",
		verified_purchase: true,
		created_at: "2025-06-05T00:00:00Z",
	},
];

function chainable(resolveValue: {
	data: unknown;
	error: unknown;
	count?: number | null;
}) {
	const chain: Record<string, unknown> = {
		select: mock(() => chain),
		eq: mock(() => chain),
		neq: mock(() => chain),
		order: mock(() => chain),
		limit: mock(() => chain),
		range: mock(() => chain),
		single: mock(() => Promise.resolve(resolveValue)),
		then: (resolve: (val: unknown) => void) => resolve(resolveValue),
	};
	return chain;
}

let fromHandler: (table: string) => unknown;

mock.module("@lib/supabase/server", () => ({
	createClient: mock(() =>
		Promise.resolve({
			from: mock((table: string) => fromHandler(table)),
		}),
	),
}));

import type { Review, ReviewStats } from "@lib/data/reviews";
import { getProductReviews, getReviewStats } from "@lib/data/reviews";

describe("Reviews Data Functions", () => {
	describe("getProductReviews", () => {
		beforeEach(() => {
			fromHandler = () =>
				chainable({ data: mockReviews, error: null, count: 3 });
		});

		test("returns paginated reviews", async () => {
			const result = await getProductReviews("prod-1", {
				page: 1,
				perPage: 10,
			});
			expect(result.data).toBeArray();
			expect(result.data.length).toBe(3);
			expect(result.page).toBe(1);
			expect(result.perPage).toBe(10);
		});

		test("returns empty result on error", async () => {
			fromHandler = () =>
				chainable({ data: null, error: { message: "DB error" }, count: null });

			const result = await getProductReviews("prod-1", {
				page: 1,
				perPage: 10,
			});
			expect(result.data).toEqual([]);
			expect(result.total).toBe(0);
		});

		test("calculates totalPages correctly", async () => {
			const result = await getProductReviews("prod-1", {
				page: 1,
				perPage: 2,
			});
			// count: 3 from mock, perPage: 2 → ceil(3/2) = 2
			expect(result.totalPages).toBe(2);
		});
	});

	describe("getReviewStats", () => {
		beforeEach(() => {
			fromHandler = () => chainable({ data: mockReviews, error: null });
		});

		test("calculates review statistics", async () => {
			const stats = await getReviewStats("prod-1");
			expect(stats.totalReviews).toBe(3);
			// (5 + 4 + 5) / 3 = 4.67
			expect(stats.averageRating).toBeCloseTo(4.67, 1);
			expect(stats.histogram[5]).toBe(2);
			expect(stats.histogram[4]).toBe(1);
			expect(stats.histogram[3]).toBe(0);
			expect(stats.histogram[2]).toBe(0);
			expect(stats.histogram[1]).toBe(0);
		});

		test("returns zero stats on error", async () => {
			fromHandler = () =>
				chainable({ data: null, error: { message: "error" } });

			const stats = await getReviewStats("prod-1");
			expect(stats.totalReviews).toBe(0);
			expect(stats.averageRating).toBe(0);
			expect(stats.histogram[1]).toBe(0);
			expect(stats.histogram[5]).toBe(0);
		});

		test("returns zero stats when no reviews exist", async () => {
			fromHandler = () => chainable({ data: [], error: null });

			const stats = await getReviewStats("prod-1");
			expect(stats.totalReviews).toBe(0);
			expect(stats.averageRating).toBe(0);
		});
	});

	describe("Types", () => {
		test("Review type is properly exported", () => {
			const review: Review = {
				id: "rev-1",
				product_id: "prod-1",
				user_id: "user-1",
				rating: 5,
				title: "Great",
				body: "Excellent",
				verified_purchase: true,
				created_at: "2025-06-15T00:00:00Z",
			};
			expect(review.id).toBe("rev-1");
		});

		test("ReviewStats type is properly exported", () => {
			const stats: ReviewStats = {
				averageRating: 4.5,
				totalReviews: 10,
				histogram: { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 },
			};
			expect(stats.totalReviews).toBe(10);
		});
	});
});
