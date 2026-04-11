## Phase 1 Complete: Schema Migration

Replaced 13 legacy migration files with a single unified migration that defines the entire Pedie database schema from scratch. Applied to live Supabase, verified all functions (SKU generation, FTS, category descendants), updated seed script and tests.

**Details:**
- Deleted all 13 old migration files from `supabase/migrations/`
- Created `20250800000000_schema.sql`: 7 enums, 16 tables (15 domain + sku_sequences helper), 10 functions, 12 triggers, 24 indexes, 37 RLS policies
- SKU auto-generation trigger strips brand prefix from product slug before building model segment
- Brand FTS cascade trigger refreshes product FTS vectors when brand name changes
- `resolve_username()` restricted to service_role only (prevents email enumeration)
- `handle_new_user()` lowercases username from auth metadata
- Promotions table has CHECK constraints: must target a listing or product, flash_sale requires a discount
- Unique partial index enforces at most one primary category per product
- Rewrote `scripts/seed.ts` for new schema with idempotent listing insertion
- Updated RLS migration tests for new unified migration
- Regenerated `types/database.ts` from live Supabase schema

**Deviations from plan:**
- Added promotions CHECK constraints not in original plan (caught during review)
- Added brand FTS cascade trigger (caught during review)
- Added SKU column DEFAULT '' for TypeScript type ergonomics (sku becomes optional in Insert type)
- Policy names use snake_case convention (`brands_public_read`) instead of quoted descriptive names (`"Anyone can view brands"`)
- `types/database.ts` regenerated in Phase 1 instead of Phase 6 (needed to unblock seed script typecheck)
- `products_backup` table was not in old schema, no drop needed

**Files created/changed:**
- supabase/migrations/20250800000000_schema.sql (created)
- scripts/seed.ts (rewritten)
- types/database.ts (regenerated)
- tests/lib/supabase/rls-migration.test.ts (rewritten)

**Functions created/changed:**
- `update_updated_at()` -- supabase/migrations/20250800000000_schema.sql
- `crawled_utc_date()` -- supabase/migrations/20250800000000_schema.sql
- `is_admin()` -- supabase/migrations/20250800000000_schema.sql
- `get_category_descendants()` -- supabase/migrations/20250800000000_schema.sql
- `generate_sku()` -- supabase/migrations/20250800000000_schema.sql
- `trg_generate_sku_fn()` -- supabase/migrations/20250800000000_schema.sql
- `resolve_username()` -- supabase/migrations/20250800000000_schema.sql
- `handle_new_user()` -- supabase/migrations/20250800000000_schema.sql
- `update_product_fts()` -- supabase/migrations/20250800000000_schema.sql
- `update_brand_fts_cascade()` -- supabase/migrations/20250800000000_schema.sql

**Tests created/changed:**
- Unified migration RLS (6 tests): file exists, is_admin SECURITY DEFINER, RLS enabled on all tables, no inline subqueries, public catalog read, user-scoped policies

**Review Status:** APPROVED (after addressing 5 major + 1 minor findings)

**Git Commit Message:**
```
feat: unified database schema migration

- Replace 13 legacy migrations with single 20250800000000_schema.sql
- Add 7 enums, 16 tables, 10 functions, 12 triggers, 24 indexes, 37 RLS policies
- Auto-generate SKUs via trigger with brand/model/condition format
- Add promotions table with type/discount/date constraints
- Add brand FTS cascade, username resolution, category descendants
- Rewrite seed script for new schema with idempotent listings
- Regenerate TypeScript database types
- Update RLS migration tests for unified schema
```
