import { describe, expect, test } from "bun:test";
import type { Listing } from "@app-types/product";
import {
	LISTING_TYPE_PRIORITY,
	findBetterDeal,
	selectRepresentative,
} from "@utils/products";

const makeListing = (overrides: Partial<Listing> = {}): Listing => ({
	id: "uuid-1",
	listing_id: "PD-TEST1",
	product_id: "prod-1",
	storage: "256GB",
	color: "Black",
	carrier: "Unlocked",
	condition: "excellent",
	battery_health: 95,
	price_kes: 60000,
	final_price_kes: 60000,
	original_price_usd: 500,
	landed_cost_kes: 50000,
	source: "swappa",
	source_listing_id: null,
	source_url: null,
	images: null,
	is_featured: false,
	listing_type: "standard",
	ram: "8GB",
	status: "available",
	sheets_row_id: null,
	notes: null,
	created_at: "2025-01-01T00:00:00Z",
	updated_at: "2025-01-01T00:00:00Z",
	...overrides,
});

describe("LISTING_TYPE_PRIORITY", () => {
	test("exports the priority map", () => {
		expect(LISTING_TYPE_PRIORITY).toBeDefined();
		expect(typeof LISTING_TYPE_PRIORITY).toBe("object");
	});

	test("standard has priority 1, preorder 2, affiliate 3, referral 4", () => {
		expect(LISTING_TYPE_PRIORITY.standard).toBe(1);
		expect(LISTING_TYPE_PRIORITY.preorder).toBe(2);
		expect(LISTING_TYPE_PRIORITY.affiliate).toBe(3);
		expect(LISTING_TYPE_PRIORITY.referral).toBe(4);
	});
});

describe("selectRepresentative", () => {
	test("returns null for empty array", () => {
		expect(selectRepresentative([])).toBeNull();
	});

	test("returns null when all listings are sold", () => {
		const listings = [
			makeListing({ listing_id: "PD-1", status: "sold" }),
			makeListing({ listing_id: "PD-2", status: "sold" }),
		];
		expect(selectRepresentative(listings)).toBeNull();
	});

	test("returns null when all listings are reserved", () => {
		const listings = [
			makeListing({ listing_id: "PD-1", status: "reserved" }),
			makeListing({ listing_id: "PD-2", status: "reserved" }),
		];
		expect(selectRepresentative(listings)).toBeNull();
	});

	test("excludes reserved listings from selection", () => {
		const listings = [
			makeListing({
				listing_id: "PD-RESERVED",
				listing_type: "standard",
				final_price_kes: 30000,
				status: "reserved",
			}),
			makeListing({
				listing_id: "PD-AVAILABLE",
				listing_type: "preorder",
				final_price_kes: 50000,
				status: "available",
			}),
		];
		const rep = selectRepresentative(listings);
		expect(rep).not.toBeNull();
		expect(rep!.listing_id).toBe("PD-AVAILABLE");
	});

	test("standard always wins over preorder regardless of price", () => {
		const listings = [
			makeListing({
				listing_id: "PD-STD",
				listing_type: "standard",
				final_price_kes: 60000,
			}),
			makeListing({
				listing_id: "PD-PRE",
				listing_type: "preorder",
				final_price_kes: 55000,
			}),
		];
		const rep = selectRepresentative(listings);
		expect(rep).not.toBeNull();
		expect(rep!.listing_id).toBe("PD-STD");
	});

	test("standard always wins over affiliate regardless of price", () => {
		const listings = [
			makeListing({
				listing_id: "PD-AFF",
				listing_type: "affiliate",
				final_price_kes: 40000,
			}),
			makeListing({
				listing_id: "PD-STD",
				listing_type: "standard",
				final_price_kes: 60000,
			}),
		];
		const rep = selectRepresentative(listings);
		expect(rep).not.toBeNull();
		expect(rep!.listing_id).toBe("PD-STD");
	});

	test("standard always wins over referral regardless of price", () => {
		const listings = [
			makeListing({
				listing_id: "PD-REF",
				listing_type: "referral",
				final_price_kes: 30000,
			}),
			makeListing({
				listing_id: "PD-STD",
				listing_type: "standard",
				final_price_kes: 60000,
			}),
		];
		const rep = selectRepresentative(listings);
		expect(rep).not.toBeNull();
		expect(rep!.listing_id).toBe("PD-STD");
	});

	test("within same type tier, picks lowest final_price_kes", () => {
		const listings = [
			makeListing({
				listing_id: "PD-STD1",
				listing_type: "standard",
				final_price_kes: 70000,
			}),
			makeListing({
				listing_id: "PD-STD2",
				listing_type: "standard",
				final_price_kes: 55000,
			}),
			makeListing({
				listing_id: "PD-STD3",
				listing_type: "standard",
				final_price_kes: 65000,
			}),
		];
		const rep = selectRepresentative(listings);
		expect(rep).not.toBeNull();
		expect(rep!.listing_id).toBe("PD-STD2");
	});

	test("preorder beats affiliate when no standard exists", () => {
		const listings = [
			makeListing({
				listing_id: "PD-AFF",
				listing_type: "affiliate",
				final_price_kes: 40000,
			}),
			makeListing({
				listing_id: "PD-PRE",
				listing_type: "preorder",
				final_price_kes: 50000,
			}),
		];
		const rep = selectRepresentative(listings);
		expect(rep).not.toBeNull();
		expect(rep!.listing_id).toBe("PD-PRE");
	});

	test("referral is lowest priority", () => {
		const listings = [
			makeListing({
				listing_id: "PD-REF",
				listing_type: "referral",
				final_price_kes: 30000,
			}),
			makeListing({
				listing_id: "PD-AFF",
				listing_type: "affiliate",
				final_price_kes: 50000,
			}),
		];
		const rep = selectRepresentative(listings);
		expect(rep).not.toBeNull();
		expect(rep!.listing_id).toBe("PD-AFF");
	});

	test("unknown listing_type defaults to low priority", () => {
		const listings = [
			makeListing({
				listing_id: "PD-UNK",
				listing_type: "mystery" as Listing["listing_type"],
				final_price_kes: 20000,
			}),
			makeListing({
				listing_id: "PD-PRE",
				listing_type: "preorder",
				final_price_kes: 50000,
			}),
		];
		const rep = selectRepresentative(listings);
		expect(rep).not.toBeNull();
		expect(rep!.listing_id).toBe("PD-PRE");
	});
});

describe("findBetterDeal", () => {
	test("returns null when current listing is not standard", () => {
		const current = makeListing({ listing_type: "preorder" });
		const all = [current, makeListing({ listing_type: "affiliate", final_price_kes: 40000 })];
		expect(findBetterDeal(current, all)).toBeNull();
	});

	test("returns null when no matching spec variants exist", () => {
		const current = makeListing({
			listing_id: "PD-STD",
			listing_type: "standard",
			storage: "256GB",
			color: "Black",
			condition: "excellent",
			final_price_kes: 60000,
		});
		const otherListing = makeListing({
			listing_id: "PD-AFF",
			listing_type: "affiliate",
			storage: "128GB", // different storage
			color: "Black",
			condition: "excellent",
			final_price_kes: 40000,
		});
		expect(findBetterDeal(current, [current, otherListing])).toBeNull();
	});

	test("returns the cheapest non-standard variant with same specs", () => {
		const current = makeListing({
			listing_id: "PD-STD",
			listing_type: "standard",
			storage: "256GB",
			color: "Black",
			condition: "excellent",
			final_price_kes: 60000,
		});
		const affiliate1 = makeListing({
			listing_id: "PD-AFF1",
			listing_type: "affiliate",
			storage: "256GB",
			color: "Black",
			condition: "excellent",
			final_price_kes: 50000,
		});
		const affiliate2 = makeListing({
			listing_id: "PD-AFF2",
			listing_type: "affiliate",
			storage: "256GB",
			color: "Black",
			condition: "excellent",
			final_price_kes: 45000,
		});
		const result = findBetterDeal(current, [current, affiliate1, affiliate2]);
		expect(result).not.toBeNull();
		expect(result!.listing_id).toBe("PD-AFF2");
	});

	test("returns null when non-standard variants are more expensive", () => {
		const current = makeListing({
			listing_id: "PD-STD",
			listing_type: "standard",
			storage: "256GB",
			color: "Black",
			condition: "excellent",
			final_price_kes: 40000,
		});
		const affiliate = makeListing({
			listing_id: "PD-AFF",
			listing_type: "affiliate",
			storage: "256GB",
			color: "Black",
			condition: "excellent",
			final_price_kes: 50000,
		});
		expect(findBetterDeal(current, [current, affiliate])).toBeNull();
	});

	test("ignores sold listings in candidates", () => {
		const current = makeListing({
			listing_id: "PD-STD",
			listing_type: "standard",
			storage: "256GB",
			color: "Black",
			condition: "excellent",
			final_price_kes: 60000,
		});
		const soldAffiliate = makeListing({
			listing_id: "PD-AFF",
			listing_type: "affiliate",
			storage: "256GB",
			color: "Black",
			condition: "excellent",
			final_price_kes: 40000,
			status: "sold",
		});
		expect(findBetterDeal(current, [current, soldAffiliate])).toBeNull();
	});

	test("ignores reserved listings in candidates", () => {
		const current = makeListing({
			listing_id: "PD-STD",
			listing_type: "standard",
			storage: "256GB",
			color: "Black",
			condition: "excellent",
			final_price_kes: 60000,
		});
		const reservedAffiliate = makeListing({
			listing_id: "PD-AFF",
			listing_type: "affiliate",
			storage: "256GB",
			color: "Black",
			condition: "excellent",
			final_price_kes: 40000,
			status: "reserved",
		});
		expect(findBetterDeal(current, [current, reservedAffiliate])).toBeNull();
	});

	test("only matches same storage/color/condition", () => {
		const current = makeListing({
			listing_id: "PD-STD",
			listing_type: "standard",
			storage: "256GB",
			color: "Black",
			condition: "excellent",
			final_price_kes: 60000,
		});
		// Different color
		const diffColor = makeListing({
			listing_id: "PD-AFF1",
			listing_type: "affiliate",
			storage: "256GB",
			color: "White",
			condition: "excellent",
			final_price_kes: 40000,
		});
		// Different condition
		const diffCondition = makeListing({
			listing_id: "PD-AFF2",
			listing_type: "affiliate",
			storage: "256GB",
			color: "Black",
			condition: "good",
			final_price_kes: 40000,
		});
		// Matching specs - should be the only match
		const matching = makeListing({
			listing_id: "PD-AFF3",
			listing_type: "affiliate",
			storage: "256GB",
			color: "Black",
			condition: "excellent",
			final_price_kes: 45000,
		});
		const result = findBetterDeal(current, [
			current,
			diffColor,
			diffCondition,
			matching,
		]);
		expect(result).not.toBeNull();
		expect(result!.listing_id).toBe("PD-AFF3");
	});
});
