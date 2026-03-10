## Phase 3.5 Complete: Sync Engine Hardening

Replaced single-tab SHEETS_TAB_NAME config with multi-tab SHEETS_TAB object, added HEADER_MAP for human-readable sheet headers with backward compatibility, implemented bidirectional multi-tab sync for brands/categories/promotions, added SyncSource audit trail via sync_metadata, and wired fire-and-forget sheet sync after admin listing mutations.

**Details:**
- SHEETS_TAB config object in src/config.ts with human-friendly tab names (Listings, Brands, Categories, Products, Promotions)
- HEADER_MAP in parser.ts maps human-readable headers ("Price (KES)" -> "price_kes") with backward compat for snake_case headers
- SyncSource type ('admin' | 'sheets' | 'system') for audit trail in sync_metadata
- Three new import functions: syncBrandsFromSheet, syncCategoriesFromSheet, syncPromotionsFromSheet
- Three export functions: syncBrandsToSheet, syncCategoriesToSheet, syncPromotionsToSheet
- syncFromSheets imports reference tabs in order (brands -> categories -> promotions -> listings)
- syncToSheets exports to all tabs (listings + brands + categories + promotions) with per-tab result tracking
- Admin sync route accepts direction param ('pull' | 'push' | 'both')
- Admin listing create/update fire-and-forget syncToSheets via dynamic import
- Apps Script template default tab name updated to 'Listings'
- Human-readable SHEET_HEADERS used for export columns
- Case-insensitive SKU header matching for additive sync mode
- All Google Sheets API calls wrapped in try/catch per CodeRabbit feedback

**Deviations from plan:**
- Loop prevention is architectural (import/export are separate endpoints that never trigger each other) rather than timestamp-based filtering via sync_metadata. SyncSource is for audit trail only.
- Admin fire-and-forget sync uses additive mode (append-only for new listings). Full update-by-SKU semantics for existing rows deferred to Phase 5.
- Dynamic import pattern used for fire-and-forget sync in admin routes to avoid importing sheets code at module level.

**Files created/changed:**
- src/config.ts
- src/lib/sheets/parser.ts
- src/lib/sheets/sync.ts
- src/app/api/sync/route.ts
- src/app/api/sync/export/route.ts
- src/app/api/admin/sync/route.ts
- src/app/api/admin/listings/route.ts
- src/app/api/admin/listings/[id]/route.ts
- scripts/sheets.ts
- scripts/sheetsToSupabase.gs
- tests/lib/sheets/parser.test.ts
- tests/lib/sheets/sync.test.ts
- tests/app/api/admin/sync.test.ts

**Functions created/changed:**
- SHEETS_TAB constant -- src/config.ts
- HEADER_MAP constant -- src/lib/sheets/parser.ts
- parseSheetRow (updated to use HEADER_MAP) -- src/lib/sheets/parser.ts
- syncBrandsFromSheet -- src/lib/sheets/sync.ts
- syncCategoriesFromSheet -- src/lib/sheets/sync.ts
- syncPromotionsFromSheet -- src/lib/sheets/sync.ts
- syncBrandsToSheet -- src/lib/sheets/sync.ts
- syncCategoriesToSheet -- src/lib/sheets/sync.ts
- syncPromotionsToSheet -- src/lib/sheets/sync.ts
- syncFromSheets (updated: accepts source param, calls reference tab imports) -- src/lib/sheets/sync.ts
- syncToSheets (updated: accepts source in options, exports all tabs) -- src/lib/sheets/sync.ts
- POST /api/admin/sync (updated: direction param) -- src/app/api/admin/sync/route.ts
- POST /api/admin/listings (updated: fire-and-forget sync) -- src/app/api/admin/listings/route.ts
- PUT /api/admin/listings/[id] (updated: fire-and-forget sync) -- src/app/api/admin/listings/[id]/route.ts

**Tests created/changed:**
- HEADER_MAP covers all SheetRow fields with backward compat -- parser.test.ts
- parseSheetRow with human-readable headers -- parser.test.ts
- parseSheetRow with backward-compatible snake_case headers -- parser.test.ts
- SHEETS_TAB constant structure test -- config.test.ts
- syncBrandsFromSheet creates/updates brands -- sync.test.ts
- syncCategoriesFromSheet creates/updates categories -- sync.test.ts
- syncPromotionsFromSheet creates/updates promotions -- sync.test.ts
- syncFromSheets calls reference tab imports -- sync.test.ts
- syncToSheets exports all tabs -- sync.test.ts
- Admin sync direction param tests -- admin/sync.test.ts
- 18 new tests added, 1224 total passing

**Review Status:** APPROVED with fixes (parser HEADER_MAP backward-compat entries restored, test confirmed green)

**Git Commit Message:**
```
feat: sync engine hardening with multi-tab support

- Replace SHEETS_TAB_NAME with SHEETS_TAB config for 5 tabs
- Add HEADER_MAP for human-readable sheet headers with backward compat
- Implement bidirectional sync for brands, categories, promotions tabs
- Add SyncSource type and sync_metadata audit trail
- Admin sync route accepts direction param (pull/push/both)
- Fire-and-forget syncToSheets after admin listing create/update
- Update Apps Script template default tab to 'Listings'
- Wrap all Google Sheets API calls in try/catch
```
