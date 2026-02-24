## Phase 3.1 Complete: DB Types Alignment & Condition Mapping

Reverted incorrect `premium` → `fair` rename in app types and components. Regenerated `types/database.ts` from live Supabase schema (now includes all DB columns: storage, color, carrier, battery_health, images, sort_order, etc.). Created `types/filters.ts` for filter/sort/pagination interfaces. Added condition mapping utility for multi-source crawlers (Swappa, Reebelo, Back Market).

**Files created/changed:**

- `types/product.ts` — reverted ConditionGrade `fair` → `premium`
- `types/database.ts` — regenerated from live Supabase schema
- `types/filters.ts` — new filter/sort/pagination types
- `src/components/ui/condition-badge.tsx` — reverted `fair` → `premium` case
- `src/app/globals.css` — renamed `badge-fair` → `badge-premium`
- `src/lib/sync/condition-mapping.ts` — new condition mapping utility

**Functions created/changed:**

- `mapConditionToPedie(condition, source)` — maps source conditions to Pedie grades

**Tests created/changed:**

- `tests/lib/sync/condition-mapping.test.ts` — 22 tests covering Reebelo, Swappa, Back Market mappings, case insensitivity, fallback

**Review Status:** Ready for Review

**Git Commit Message:**

```
feat: add condition mapping and regenerate DB types

- Revert incorrect premium→fair rename in app types and components
- Regenerate types/database.ts from live Supabase schema
- Add condition mapping utility for multi-source crawlers
- Create filter/sort/pagination type interfaces
- Add 22 tests for condition mapping (Swappa, Reebelo, Back Market)
```
