import { describe, expect, test } from "bun:test";

describe("DailyDeals", () => {
	test("module exports the component", async () => {
		const mod = await import("@components/home/dailyDeals");
		expect(mod.DailyDeals).toBeDefined();
		expect(typeof mod.DailyDeals).toBe("function");
	});

	test("URGENCY_TEXT is defined in config and non-empty", async () => {
		const { URGENCY_TEXT } = await import("@/config");
		expect(URGENCY_TEXT).toBeDefined();
		expect(typeof URGENCY_TEXT).toBe("string");
		expect(URGENCY_TEXT.length).toBeGreaterThan(0);
	});
});
