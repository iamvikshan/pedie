import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { resolve } from "path";

const SOURCE = readFileSync(
        resolve("src/components/home/customerFavorites.tsx"),
        "utf-8",
);

describe("CustomerFavorites", () => {
        test("module exports the component", async () => {
                const mod = await import("@components/home/customerFavorites");
                expect(mod.CustomerFavorites).toBeDefined();
                expect(typeof mod.CustomerFavorites).toBe("function");
        });

        test("exports TABS constant with correct tabs", async () => {
                const mod = await import("@components/home/customerFavorites");
                expect(mod.TABS).toBeDefined();
                expect(Array.isArray(mod.TABS)).toBe(true);
                expect(mod.TABS.length).toBe(4);
        });

        test("each tab has id and label", async () => {
                const { TABS } = await import("@components/home/customerFavorites");
                for (const tab of TABS) {
                        expect(typeof tab.id).toBe("string");
                        expect(typeof tab.label).toBe("string");
                        expect(tab.id.length).toBeGreaterThan(0);
                        expect(tab.label.length).toBeGreaterThan(0);
                }
        });

        test("first tab is 'all' for unfiltered view", async () => {
                const { TABS } = await import("@components/home/customerFavorites");
                expect(TABS[0].id).toBe("all");
                expect(TABS[0].label).toBe("All");
        });

        test("tabs include expected category slugs", async () => {
                const { TABS } = await import("@components/home/customerFavorites");
                const ids = TABS.map((t: { id: string }) => t.id);
                expect(ids).toContain("smartphones");
                expect(ids).toContain("laptops");
                expect(ids).toContain("tablets");
        });

        test("has /collections View All link", () => {
                expect(SOURCE).toContain("/collections");
        });

        test("has View All text", () => {
                expect(SOURCE).toContain("View All");
        });

        test('has useRef for scroll container', () => {
                expect(SOURCE).toContain('useRef');
                expect(SOURCE).toContain('scrollRef');
        });

        test('has scroll reset logic (scrollLeft = 0) on tab change', () => {
                expect(SOURCE).toContain('scrollLeft = 0');
                expect(SOURCE).toContain('setActiveTab');
        });

        test('animation container uses key={activeTab} for re-animation', () => {
                expect(SOURCE).toContain('key={activeTab}');
        });

        test('cards have flex-shrink-0 class', () => {
                expect(SOURCE).toContain('flex-shrink-0');
        });

        // Phase 3: ProductFamily integration tests
        test('accepts families prop instead of listings', () => {
                expect(SOURCE).toContain('families: ProductFamily[]');
                expect(SOURCE).not.toContain('listings: ListingWithProduct[]');
        });

        test('uses ProductFamilyCard instead of ProductCard', () => {
                expect(SOURCE).toContain('ProductFamilyCard');
                expect(SOURCE).not.toContain('ProductCard');
        });

        test('filters by product category slug', () => {
                expect(SOURCE).toContain('category?.slug === activeTab');
        });

        test('guards against null product before accessing properties', () => {
                expect(SOURCE).toContain('f.product &&');
        });
});
