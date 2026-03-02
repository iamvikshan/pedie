import { describe, expect, test } from "bun:test";

describe("SustainabilitySection", () => {
	test("module exports the component", async () => {
		const mod = await import("@components/home/sustainabilitySection");
		expect(mod.SustainabilitySection).toBeDefined();
		expect(typeof mod.SustainabilitySection).toBe("function");
	});

	test("exports SUSTAINABILITY_STATS with 3 items", async () => {
		const mod = await import("@components/home/sustainabilitySection");
		expect(mod.SUSTAINABILITY_STATS).toBeDefined();
		expect(Array.isArray(mod.SUSTAINABILITY_STATS)).toBe(true);
		expect(mod.SUSTAINABILITY_STATS.length).toBe(3);
	});

	test("each stat has label, value, suffix, and icon", async () => {
		const { SUSTAINABILITY_STATS } = await import(
			"@components/home/sustainabilitySection"
		);
		for (const stat of SUSTAINABILITY_STATS) {
			expect(typeof stat.label).toBe("string");
			expect(typeof stat.value).toBe("number");
			expect(typeof stat.suffix).toBe("string");
			expect(typeof stat.icon).toBe("string");
			expect(stat.label.length).toBeGreaterThan(0);
			expect(stat.value).toBeGreaterThan(0);
		}
	});

	test("stats cover devices saved, savings, and warranty", async () => {
		const { SUSTAINABILITY_STATS } = await import(
			"@components/home/sustainabilitySection"
		);
		const labels = SUSTAINABILITY_STATS.map(
			(s: { label: string }) => s.label,
		);
		expect(labels).toContain("Devices Saved");
		expect(labels).toContain("Average Savings");
		expect(labels).toContain("Warranty");
	});

	test("stat icons are Tabler icon names", async () => {
		const { SUSTAINABILITY_STATS } = await import(
			"@components/home/sustainabilitySection"
		);
		for (const stat of SUSTAINABILITY_STATS) {
			expect(stat.icon.startsWith("Tb")).toBe(true);
		}
	});
});
