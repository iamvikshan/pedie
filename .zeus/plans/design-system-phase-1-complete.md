## Phase 1 Complete: Fix Broken + Add Missing Tokens

Fixed two critical token bugs and added 9 semantic tokens with light/dark mode support. Admin dashboard buttons and text now render correctly.

**Files created/changed:**
- tests/designSystem.test.ts (created)
- src/app/globals.css
- src/components/admin/sidebar.tsx
- src/components/admin/categoryForm.tsx
- src/components/admin/newsletterExportButton.tsx
- src/components/admin/syncStatus.tsx
- src/components/admin/orderStatusUpdater.tsx
- src/components/admin/customerRoleSwitcher.tsx
- src/components/admin/dataTableToolbar.tsx
- src/components/admin/recentOrders.tsx
- src/components/admin/productForm.tsx
- src/components/admin/listingForm.tsx
- src/components/admin/trackingForm.tsx
- src/components/admin/dataTable.tsx
- src/components/admin/dataTableColumnHeader.tsx
- src/components/admin/dataTablePagination.tsx
- src/components/admin/syncLog.tsx
- src/components/admin/kpiCards.tsx
- src/components/admin/priceComparisonTable.tsx
- src/components/admin/marginIndicator.tsx

**Tests created/changed:**
- 20 source analysis tests: 9 @theme token checks, 9 .dark token checks, 1 banned pedie-primary check, 1 banned bare pedie-muted check

**Review Status:** APPROVED (after strengthening test validation per review feedback)

**Git Commit Message:**
```
fix: replace broken admin tokens and add semantic color tokens

- Replace non-existent pedie-primary with pedie-green in 12 admin files
- Replace non-existent bare pedie-muted with pedie-text-muted in 11 admin files
- Add semantic status tokens (success, error, warning, info, sunken) with light/dark variants
- Add source analysis tests validating token presence in both @theme and .dark blocks
```
