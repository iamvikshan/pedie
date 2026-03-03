import { describe, expect, test } from "bun:test";
import {
	calculateDeposit,
	calculateDiscount,
	formatKes,
	getPricingTier,
	usdToKes,
} from "@helpers/pricing";
import { DEPOSIT_THRESHOLD_KES, KES_USD_RATE } from "@/config";

describe("usdToKes", () => {
	test("converts USD to KES at rate 130", () => {
		expect(usdToKes(100)).toBe(100 * KES_USD_RATE);
	});

	test("rounds to nearest integer", () => {
		expect(usdToKes(10.5)).toBe(Math.round(10.5 * KES_USD_RATE));
	});

	test("handles zero", () => {
		expect(usdToKes(0)).toBe(0);
	});
});

describe("calculateDeposit", () => {
	test("returns 5% for items under KES 70,000", () => {
		expect(calculateDeposit(50_000)).toBe(2500);
	});

	test("returns 10% for items at KES 70,000", () => {
		expect(calculateDeposit(DEPOSIT_THRESHOLD_KES)).toBe(7000);
	});

	test("returns 10% for items above KES 70,000", () => {
		expect(calculateDeposit(100_000)).toBe(10_000);
	});

	test("handles small amounts", () => {
		expect(calculateDeposit(1000)).toBe(50);
	});
});

describe("formatKes", () => {
	test("formats amount with KES prefix", () => {
		const result = formatKes(50000);
		expect(result).toStartWith("KES ");
		expect(result).toContain("50");
	});

	test("formats zero", () => {
		expect(formatKes(0)).toBe("KES 0");
	});
});

describe("calculateDiscount", () => {
	test("calculates percentage correctly", () => {
		expect(calculateDiscount(100, 80)).toBe(20);
	});

	test("returns 0 when original is 0", () => {
		expect(calculateDiscount(0, 50)).toBe(0);
	});

	test("returns 0 when original is negative", () => {
		expect(calculateDiscount(-10, 50)).toBe(0);
	});

	test("handles same price (no discount)", () => {
		expect(calculateDiscount(100, 100)).toBe(0);
	});

	test("rounds to nearest integer", () => {
		expect(calculateDiscount(300, 200)).toBe(33);
	});
});

describe("getPricingTier", () => {
	test("returns 'sale' when final < price and listing_type = sale", () => {
		expect(getPricingTier(100000, 150000, 'sale')).toBe("sale");
	});

	test("returns 'discounted' when final < price but listing_type = standard", () => {
		expect(getPricingTier(100000, 150000, 'standard')).toBe("discounted");
	});

	test("returns 'normal' when final equals price", () => {
		expect(getPricingTier(150000, 150000, 'sale')).toBe("normal");
	});

	test("returns 'normal' when final exceeds price", () => {
		expect(getPricingTier(160000, 150000, 'standard')).toBe("normal");
	});

	test("returns 'sale' for small discount with listing_type = sale", () => {
		expect(getPricingTier(149000, 150000, 'sale')).toBe("sale");
	});

	test("returns 'discounted' when final < price and listing_type = affiliate", () => {
		expect(getPricingTier(100000, 150000, 'affiliate')).toBe("discounted");
	});

	test("returns 'normal' when final equals price and listing_type = affiliate", () => {
		expect(getPricingTier(150000, 150000, 'affiliate')).toBe("normal");
	});
});
