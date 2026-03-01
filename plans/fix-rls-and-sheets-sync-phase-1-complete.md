## Phase 1 Complete: Fix RLS Infinite Recursion

Eliminated the `42P17` infinite recursion error on the `profiles` table by creating a `SECURITY DEFINER` function `is_admin()` and rewriting all 12 admin RLS policies to use it. The homepage now loads successfully — 28 available listings are queryable via the anon key. Migration has been applied to the remote Supabase instance.

**Files created/changed:**
- `supabase/migrations/20250704000000_fix_rls_recursion.sql`
- `tests/lib/supabase/rls-migration.test.ts`

**Functions created/changed:**
- `public.is_admin()` — SECURITY DEFINER SQL function that checks `profiles.role = 'admin'` for `auth.uid()`, bypassing RLS to break the recursion chain

**Tests created/changed:**
- `migration file exists and is readable`
- `creates is_admin() function with SECURITY DEFINER`
- `drops all 12 old admin policies`
- `recreates all policies using is_admin()`
- `does NOT contain the old inline subquery pattern`
- `does NOT touch non-admin policies`

**Review Status:** APPROVED (after revision to add OWNER TO postgres assertion)

**Git Commit Message:**
```
fix: resolve RLS infinite recursion on profiles table

- Create SECURITY DEFINER is_admin() function to break recursion chain
- Rewrite all 12 admin RLS policies to use is_admin() instead of inline subqueries
- Add migration validation tests (6 tests)
```
