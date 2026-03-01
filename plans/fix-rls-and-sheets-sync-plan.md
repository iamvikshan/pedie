## Plan: Fix RLS Recursion & Sheets Sync

Fix the empty homepage caused by infinite recursion in Supabase RLS admin policies, then fix and enhance the Google Sheets ↔ Supabase bidirectional sync (tab name, deletions, images, reverse sync, docs).

**Phase Count Rationale:**
- Phase 1 is the critical blocker — RLS recursion breaks ALL anon queries, making the homepage empty
- Phase 2 groups all Sheets sync fixes together since they share the same files and are logically coupled (config, parser, sync engine, Apps Script, docs)
- Two phases is the minimum: the RLS fix is independent and must land first; Sheets changes depend on a working DB layer

**Phases (2)**

1. **Phase 1: Fix RLS Infinite Recursion**
    - **Objective:** Eliminate the `42P17` infinite recursion error by replacing all inline `EXISTS (SELECT 1 FROM profiles ...)` admin policy checks with a `SECURITY DEFINER` function `is_admin()`. This breaks the recursion chain because `SECURITY DEFINER` functions execute with the definer's privileges, bypassing RLS on the queried table.
    - **Files/Functions to Modify/Create:**
      - `supabase/migrations/20250704000000_fix_rls_recursion.sql` — new migration
      - `tests/lib/supabase/rls.test.ts` — new test file for RLS policy verification
    - **Tests to Write:**
      - `should create is_admin function` — verify the function exists
      - `should allow anonymous SELECT on public tables` — verify listings, products, categories are readable without auth
      - `should not cause recursion on profiles table` — verify no 42P17 error
    - **Steps:**
      1. Write RLS tests that assert anon access to public tables and absence of recursion errors (tests will fail initially since DB isn't fixed yet)
      2. Create migration `20250704000000_fix_rls_recursion.sql`:
         - Create `is_admin()` function as `SECURITY DEFINER` owned by `postgres`, checking `profiles.role = 'admin'` for `auth.uid()`
         - DROP all admin policies on: categories, products, listings, profiles, orders, order_items, reviews, wishlist, newsletter_subscribers, price_comparisons, sync_log
         - Recreate admin policies using `is_admin()` instead of inline subqueries
         - For `profiles` specifically: ensure the "Users can view own profile" and "Users can update own profile" policies remain unchanged; only the admin policies get rewritten
      3. Apply the migration to the remote Supabase instance
      4. Run tests to verify the fix resolves the recursion and homepage data loads

2. **Phase 2: Fix & Enhance Google Sheets Sync**
    - **Objective:** Fix the wrong sheet tab name, add deletion handling, add images column support, implement reverse DB→Sheets sync, and update docs.
    - **Files/Functions to Modify/Create:**
      - `packages/config/index.ts` — add `SHEETS_TAB_NAME = 'inv'`
      - `src/lib/sheets/parser.ts` — add `images` field to `SheetRow`, update `parseSheetRow()` and `EXPECTED_HEADERS`
      - `src/lib/sheets/sync.ts` — import tab name from config, add deletion handling, add images to upsert, upgrade auth scope from `readonly` to `spreadsheets`, add `syncToSheets()` function
      - `src/app/api/sync/export/route.ts` — new route for manual DB→Sheets trigger
      - `scripts/gAppS/sheetsSync.gs` — make tab name configurable via Script Property `SHEET_TAB_NAME`, fix hardcoded `'Inventory'` check
      - `docs/ops/nextjs-setup.md` — clarify that `GS_SHEET_NAME` is removed, tab name lives in config, document images workflow
      - `tests/lib/sheets/sync.test.ts` — new/updated tests for sync changes
      - `tests/lib/sheets/parser.test.ts` — new/updated tests for parser changes
    - **Tests to Write:**
      - `should use SHEETS_TAB_NAME from config instead of env` — verify tab name import
      - `should parse images column from sheet row` — verify parser handles images field
      - `should detect and hard-delete removed listings` — verify deletion logic
      - `should export listings to Google Sheets` — verify reverse sync function
      - `should handle empty images gracefully` — verify parser edge case
    - **Steps:**
      1. Write tests for the new parser fields, deletion detection, and reverse sync (tests fail initially)
      2. Add `SHEETS_TAB_NAME = 'inv'` to `packages/config/index.ts`
      3. Update `src/lib/sheets/parser.ts`: add `images` field (comma-separated Supabase Storage URLs) to `SheetRow` interface, update `EXPECTED_HEADERS` and `parseSheetRow()`
      4. Update `src/lib/sheets/sync.ts`:
         - Import `SHEETS_TAB_NAME` from `@packages/config` instead of reading `GS_SHEET_NAME` from env
         - Upgrade Google auth scope from `spreadsheets.readonly` to `spreadsheets`
         - Add `images` array to the listing upsert
         - Add deletion detection: after upserting, compare synced `source_listing_id` set against DB listings for the same sources, hard-delete any not present in sheet (soft-delete via `status='delisted'` if FK constraints prevent hard delete)
         - Add `syncToSheets()` function: read listings from DB, write rows back to the sheet
      5. Create `src/app/api/sync/export/route.ts` — POST endpoint protected by `x-api-key`, calls `syncToSheets()`
      6. Update `scripts/gAppS/sheetsSync.gs`: read tab name from Script Property `SHEET_TAB_NAME` (fallback to `'inv'`), remove hardcoded `'Inventory'`
      7. Update `docs/ops/nextjs-setup.md`: remove `GS_SHEET_NAME` env var docs, document new `SHEETS_TAB_NAME` config constant, document images workflow, clarify spreadsheet ID vs tab name distinction
      8. Run all tests to confirm everything passes, lint, typecheck

**Open Questions (Resolved)**
1. Tab name → `inv`, stored in `packages/config/index.ts` (not `.env`)
2. Deletions → hard delete; soft-delete (`status='delisted'`) if FK constraints block
3. DB→Sheets → both automatic and manual (export route + potential cron)
4. Images → Supabase Storage public URLs in `products.images` or `listings.images` array column
