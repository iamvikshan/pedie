import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const src = readFileSync(
  resolve("src/app/(store)/products/[slug]/page.tsx"),
  "utf-8"
);

const clientSrc = readFileSync(
  resolve("src/components/listing/productDetailClient.tsx"),
  "utf-8"
);

describe("Product Detail Page", () => {
  test("imports getProductFamilyBySlug", () => {
    expect(src).toContain("getProductFamilyBySlug");
  });

  test("uses VariantSelector component (in client wrapper)", () => {
    expect(clientSrc).toContain("<VariantSelector");
  });

  test("uses BetterDealNudge component (in client wrapper)", () => {
    expect(clientSrc).toContain("<BetterDealNudge");
  });

  test("calls notFound() when family is null", () => {
    expect(src).toContain("notFound()");
  });

  test("generates metadata with product title", () => {
    expect(src).toContain("title: `${product.brand} ${product.model} | Pedie`");
  });
});