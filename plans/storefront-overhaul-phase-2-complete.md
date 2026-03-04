## Phase 2 Complete: Category Hierarchy DB Migration + Many-to-Many

Restructured the flat 5-category schema into a full hierarchy with Electronics as root, reparented existing categories, added Audio and 26+ subcategories, and created a `product_categories` junction table for many-to-many product-category relationships. Updated all types, data-fetching functions, product queries, and seed script to support the new hierarchy.

**Files created/changed:**
- `supabase/migrations/20250707000000_category_hierarchy.sql` (new)
- `types/product.ts`
- `types/database.ts`
- `src/lib/data/categories.ts`
- `src/lib/data/products.ts`
- `scripts/seed.ts`
- `tests/data/categories.test.ts` (new)

**Functions created/changed:**
- `getTopLevelCategories()` — returns children of Electronics root
- `getCategoryTree()` — full hierarchy as CategoryWithChildren[]
- `getCategoryWithChildren(slug)` — single category with its children
- `getCategoryBreadcrumb(slug)` — root→leaf trail with cycle protection
- `getCategoryAndDescendantIds(categoryId)` — BFS all descendant IDs with cycle protection
- `getProductFamiliesByCategory()` — updated to use descendant IDs + junction table
- `getRelatedFamilies()` — updated to use descendant IDs
- `getRelatedListings()` — updated to use descendant IDs
- `getListingsByCategory()` — updated to use descendant IDs

**Tests created/changed:**
- `getCategoryTree returns nested hierarchy`
- `getCategoryWithChildren returns parent with children array`
- `getCategoryBreadcrumb returns path from root to leaf`
- `product query includes junction-table category matches`
- `getCategories exports async function`
- `getCategoryBySlug exports async function`

**Review Status:** APPROVED (after addressing 3 revision items: type nullability, policy idempotency, cycle protection)

**Git Commit Message:**
```
feat: add category hierarchy with subcategories and M2M junction

- Restructure flat categories into Electronics root with subcategories
- Add Audio parent category with Earphones/Headphones/Speakers children
- Create product_categories junction table for many-to-many relationships
- Add getCategoryTree, getCategoryBreadcrumb, getCategoryAndDescendantIds
- Update product queries to include subcategory and junction matches
- Add cycle protection to hierarchy traversal functions
```
