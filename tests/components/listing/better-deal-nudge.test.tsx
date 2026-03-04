import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const src = readFileSync(
  resolve("src/components/listing/betterDealNudge.tsx"),
  "utf-8"
);

describe("BetterDealNudge", () => {
  test("is a client component", () => {
    expect(src).toContain("'use client'");
  });

  test("uses TbSparkles icon", () => {
    expect(src).toContain("TbSparkles");
    expect(src).toContain("react-icons/tb");
  });

  test("links to /listings/ path", () => {
    expect(src).toContain("href={`/listings/${betterDeal.listing_id}`}");
  });

  test("uses formatKes for savings display", () => {
    expect(src).toContain("formatKes(savings)");
  });

  test("uses Framer Motion for animation", () => {
    expect(src).toContain("motion.div");
    expect(src).toContain("framer-motion");
  });

  test("renders nothing when betterDeal is null", () => {
    expect(src).toContain("if (!betterDeal) return null");
  });
});