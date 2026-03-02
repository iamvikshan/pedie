import { describe, expect, test } from "bun:test";
import { mapConditionToPedie } from "@lib/sync/conditionMapping";

describe("mapConditionToPedie", () => {
	describe("Reebelo (1:1 mapping)", () => {
		test("maps acceptable", () => {
			expect(mapConditionToPedie("acceptable", "reebelo")).toBe("acceptable");
		});

		test("maps good", () => {
			expect(mapConditionToPedie("good", "reebelo")).toBe("good");
		});

		test("maps excellent", () => {
			expect(mapConditionToPedie("excellent", "reebelo")).toBe("excellent");
		});

		test("maps premium", () => {
			expect(mapConditionToPedie("premium", "reebelo")).toBe("premium");
		});
	});

	describe("Swappa mapping", () => {
		test("maps fair to acceptable", () => {
			expect(mapConditionToPedie("fair", "swappa")).toBe("acceptable");
		});

		test("maps good to good", () => {
			expect(mapConditionToPedie("good", "swappa")).toBe("good");
		});

		test("maps mint to excellent", () => {
			expect(mapConditionToPedie("mint", "swappa")).toBe("excellent");
		});

		test("maps new to premium", () => {
			expect(mapConditionToPedie("new", "swappa")).toBe("premium");
		});
	});

	describe("Back Market mapping", () => {
		test("maps fair to acceptable", () => {
			expect(mapConditionToPedie("fair", "backmarket")).toBe("acceptable");
		});

		test("maps good to good", () => {
			expect(mapConditionToPedie("good", "backmarket")).toBe("good");
		});

		test("maps excellent to excellent", () => {
			expect(mapConditionToPedie("excellent", "backmarket")).toBe("excellent");
		});

		test("maps premium to premium", () => {
			expect(mapConditionToPedie("premium", "backmarket")).toBe("premium");
		});

		test("maps stallone to premium", () => {
			expect(mapConditionToPedie("stallone", "backmarket")).toBe("premium");
		});

		test('accepts "back market" as source name', () => {
			expect(mapConditionToPedie("fair", "back market")).toBe("acceptable");
		});
	});

	describe("case insensitivity", () => {
		test("handles uppercase condition", () => {
			expect(mapConditionToPedie("FAIR", "swappa")).toBe("acceptable");
		});

		test("handles uppercase source", () => {
			expect(mapConditionToPedie("fair", "SWAPPA")).toBe("acceptable");
		});

		test("handles mixed case", () => {
			expect(mapConditionToPedie("Mint", "Swappa")).toBe("excellent");
		});
	});

	describe("fallback behavior", () => {
		test("falls back to direct Pedie grade match for unknown source", () => {
			expect(mapConditionToPedie("excellent", "unknown-source")).toBe(
				"excellent",
			);
		});

		test("defaults to good for completely unknown condition and source", () => {
			expect(mapConditionToPedie("mystery", "unknown")).toBe("good");
		});

		test("handles trimming whitespace", () => {
			expect(mapConditionToPedie("  fair  ", "  swappa  ")).toBe("acceptable");
		});
	});
});
