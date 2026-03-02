import { describe, expect, test } from "bun:test";

describe("Footer", () => {
	test("module exports the component", async () => {
		const mod = await import("@components/layout/footer");
		expect(mod.Footer).toBeDefined();
		expect(typeof mod.Footer).toBe("function");
	});

	test("config uses Pedie branding", async () => {
		const { SITE_NAME } = await import("@/config");
		expect(SITE_NAME).toBe("Pedie");
		expect(SITE_NAME).not.toContain("Tech");
	});
});
