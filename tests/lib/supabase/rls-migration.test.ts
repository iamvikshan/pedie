import { describe, expect, test } from "bun:test";
import { resolve } from "path";

const MIGRATION_PATH = resolve(
	import.meta.dir,
	"../../../supabase/migrations/20250704000000_fix_rls_recursion.sql",
);

const ADMIN_POLICIES = [
	{ name: "Admin can manage categories", table: "categories" },
	{ name: "Admin can manage products", table: "products" },
	{ name: "Admin can manage listings", table: "listings" },
	{ name: "Admin can view all profiles", table: "profiles" },
	{ name: "Admin can manage profiles", table: "profiles" },
	{ name: "Admin can manage orders", table: "orders" },
	{ name: "Admin can manage order items", table: "order_items" },
	{ name: "Admin can manage reviews", table: "reviews" },
	{ name: "Admin can view all wishlists", table: "wishlist" },
	{ name: "Admin can manage newsletter", table: "newsletter_subscribers" },
	{ name: "Admin can manage price comparisons", table: "price_comparisons" },
	{ name: "Admin can view sync_log", table: "sync_log" },
];

const NON_ADMIN_POLICIES = [
	"Users can view own profile",
	"Users can update own profile",
	"Anyone can view categories",
	"Anyone can view products",
	"Anyone can view available listings",
	"Users can view own orders",
	"Users can create own orders",
	"Users can view own order items",
	"Users can create own order items",
	"Anyone can view reviews",
	"Users can create own reviews",
	"Users can update own reviews",
	"Users can delete own reviews",
	"Users can manage own wishlist",
	"Anyone can subscribe to newsletter",
	"Anyone can view price comparisons",
];

describe("RLS recursion fix migration", () => {
	let sql: string;

	test("migration file exists and is readable", async () => {
		const file = Bun.file(MIGRATION_PATH);
		expect(await file.exists()).toBe(true);
		sql = await file.text();
		expect(sql.length).toBeGreaterThan(0);
	});

	test("creates is_admin() function with SECURITY DEFINER", async () => {
		if (!sql) sql = await Bun.file(MIGRATION_PATH).text();

		expect(sql).toContain("CREATE OR REPLACE FUNCTION");
		expect(sql).toContain("is_admin()");
		expect(sql).toContain("SECURITY DEFINER");
		expect(sql).toContain("STABLE");
		expect(sql).toContain("SET search_path = public");
		expect(sql).toContain("auth.uid() IS NULL");
		expect(sql).toContain("role = 'admin'");
		expect(sql).toContain("ALTER FUNCTION public.is_admin() OWNER TO postgres");
	});

	test("drops all 12 old admin policies", async () => {
		if (!sql) sql = await Bun.file(MIGRATION_PATH).text();

		for (const policy of ADMIN_POLICIES) {
			const dropPattern = `DROP POLICY IF EXISTS "${policy.name}" ON ${policy.table}`;
			expect(sql).toContain(dropPattern);
		}

		// Count total DROP POLICY statements
		const dropCount = (sql.match(/DROP POLICY IF EXISTS/g) || []).length;
		expect(dropCount).toBe(ADMIN_POLICIES.length);
	});

	test("recreates all policies using is_admin()", async () => {
		if (!sql) sql = await Bun.file(MIGRATION_PATH).text();

		for (const policy of ADMIN_POLICIES) {
			const createPattern = `CREATE POLICY "${policy.name}" ON ${policy.table}`;
			expect(sql).toContain(createPattern);
			// Ensure the policy uses is_admin()
			const policyRegex = new RegExp(
				`CREATE POLICY "${policy.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}" ON ${policy.table}[^;]*is_admin\\(\\)`,
				"s",
			);
			expect(sql).toMatch(policyRegex);
		}

		// Count CREATE POLICY statements (should match admin policies count)
		const createCount = (sql.match(/CREATE POLICY/g) || []).length;
		expect(createCount).toBe(ADMIN_POLICIES.length);
	});

	test("does NOT contain the old inline subquery pattern in policies", async () => {
		if (!sql) sql = await Bun.file(MIGRATION_PATH).text();

		// Extract CREATE POLICY ... ; blocks and verify none use the old inline subquery
		const policyBlocks = sql.match(/CREATE POLICY[^;]*;/g) || [];
		expect(policyBlocks.length).toBeGreaterThan(0);

		for (const block of policyBlocks) {
			expect(block).not.toContain(
				"EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')",
			);
		}
	});

	test("does NOT touch non-admin policies", async () => {
		if (!sql) sql = await Bun.file(MIGRATION_PATH).text();

		for (const policyName of NON_ADMIN_POLICIES) {
			expect(sql).not.toContain(`"${policyName}"`);
		}
	});
});
