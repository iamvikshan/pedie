import { beforeEach, describe, expect, mock, test } from "bun:test";

// Mutable result object — tests change this to control the mock's return value
let mockSingleResult: { data: unknown; error: unknown } = {
	data: null,
	error: null,
};

mock.module("@lib/supabase/admin", () => ({
	createAdminClient: () => ({
		from: () => ({
			select: () => ({
				eq: () => ({
					single: () => mockSingleResult,
				}),
			}),
		}),
	}),
}));

// Must import AFTER mock.module
const { isUserAdmin } = await import("@lib/auth/admin");

describe("isUserAdmin", () => {
	beforeEach(() => {
		mockSingleResult = { data: null, error: null };
	});

	test("returns true when user has admin role", async () => {
		mockSingleResult = { data: { role: "admin" }, error: null };
		const result = await isUserAdmin("admin-user-id");
		expect(result).toBe(true);
	});

	test("returns false when user has customer role", async () => {
		mockSingleResult = { data: { role: "customer" }, error: null };
		const result = await isUserAdmin("customer-user-id");
		expect(result).toBe(false);
	});

	test("returns false when user does not exist", async () => {
		mockSingleResult = { data: null, error: { message: "not found" } };
		const result = await isUserAdmin("nonexistent-user-id");
		expect(result).toBe(false);
	});

	test("returns false when profile has no role field", async () => {
		mockSingleResult = { data: {}, error: null };
		const result = await isUserAdmin("user-without-role");
		expect(result).toBe(false);
	});
});
