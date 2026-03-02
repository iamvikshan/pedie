import { describe, expect, test } from "bun:test";
import { SITE_NAME, URLS } from "@/config";

describe("Config", () => {
	test("SITE_NAME is Pedie", () => {
		expect(SITE_NAME).toBe("Pedie");
	});

	test("URLS contains social media links", () => {
		expect(URLS.social).toBeDefined();
		expect(URLS.social.x).toContain("iamvikshan");
		expect(URLS.social.youtube).toContain("vikshan");
		expect(URLS.social.instagram).toContain("iamvikshan");
		expect(URLS.social.github).toContain("iamvikshan");
		expect(URLS.social.tiktok).toContain("iamvikshan");
	});
});
