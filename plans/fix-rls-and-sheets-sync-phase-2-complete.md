## Phase 2 Complete: Fix & Enhance Google Sheets Sync

Fixed the Google Sheets ↔ Supabase sync: moved tab name to config constant, fixed column name bugs (`condition`, `original_price_usd`, removed non-existent `deposit_amount`/`warranty_months`), added images support, deletion detection, reverse DB→Sheets export, and updated docs/Apps Script.

**Files created/changed:**
- `src/config/index.ts` — added `SHEETS_TAB_NAME = 'inv'`
- `src/lib/sheets/parser.ts` — added `images` field to `SheetRow`
- `src/lib/sheets/sync.ts` — major refactor: config import, column fixes, images, deletion, `syncToSheets()`
- `src/app/api/sync/export/route.ts` — new DB→Sheets export endpoint
- `scripts/gAppS/sheetsSync.gs` — configurable `SHEET_TAB_NAME` Script Property
- `docs/ops/nextjs-setup.md` — removed `GS_SHEET_NAME`, fixed paths, added images/export docs
- `tests/setup.ts` — removed `GS_SHEET_NAME` env var
- `.env.example` — removed `GS_SHEET_NAME`
- `tests/lib/sheets/parser.test.ts` — new parser images tests
- `tests/api/sync-export.test.ts` — new export route tests

**Functions created/changed:**
- `syncFromSheets()` — uses config constant, fixes column mappings, adds images, deletion detection
- `syncToSheets()` — new: exports listings to Google Sheet with product data
- `getGoogleSheetsClient()` — upgraded scope to `spreadsheets` (bidirectional)
- `parseSheetRow()` — handles `images` field
- `POST /api/sync/export` — new endpoint for DB→Sheets sync
- `getConfig()` (Apps Script) — reads `SHEET_TAB_NAME` property
- `onSheetEdit()` (Apps Script) — uses configurable tab name

**Tests created/changed:**
- `should include images in parsed row`
- `should return undefined images when column is empty`
- `returns sync report with valid API key` (export)
- `returns 401 without API key` (export)
- `returns 401 with invalid API key` (export)
- `returns 500 on sync error` (export)

**Review Status:** APPROVED (after revisions: fixed deletion gate, export column mapping, docs table formatting)

**Git Commit Message:**
```
feat: fix and enhance Google Sheets bidirectional sync

- Move sheet tab name from env var to src/config (SHEETS_TAB_NAME = 'inv')
- Fix column name bugs: condition_grade→condition, price_usd→original_price_usd
- Remove non-existent deposit_amount and warranty_months from listing upsert
- Add images support (comma-separated URLs ↔ TEXT[] array)
- Add deletion detection: hard-delete stale sourced listings, soft-delete fallback
- Add syncToSheets() reverse sync and /api/sync/export endpoint
- Make Apps Script tab name configurable via SHEET_TAB_NAME property
- Update docs: remove GS_SHEET_NAME, fix file paths, add images/export docs
```
