# AGENTS.md

- Prefer little code that does more. Reach for mature packages instead of reinventing common solutions.
- Keep modules cohesive, reusable, and easy to share without creating needless file sprawl.
- Breaking changes are acceptable in this repo. Remove dead code instead of adding rollback/backward-compatibility or deprecation layers.
- `node/npx/npm run` is prohibited (unless explicitly required for a specific task), use `bun` at all times.
- Absolutely no downgrading packages or tools for the sake of compatibility with old code. Update old code to be compatible with up-to-date tools and packages.

---

## project.tools

```yaml
language: typescript
pm: bun
format: bun run f # formats changed files only — NEVER use bun f:all
lint: bun check # combined lint + typecheck
typecheck: bun check # standalone alternative: bunx tsc --noEmit
test: bun test
build: bun run build
iconLib: react-icons/tb
detected: 2026-03-08
```

## project.conventions

```yaml
fileNaming: camelCase (files/modules/components) | PascalCase (exported classes/types) | UPPER_SNAKE_CASE (.env & config.ts constants)
docs: jsdoc # primary language default; actual style is per-file-extension
planDir: .agents/plans/
testDir: tests/
```

**Naming enforcement:** Inconsistencies exist in the codebase — fix on encounter.

---

## Stack

- Bun + Next.js 16+ App Router (`src/app`) — no Pages Router patterns
- TypeScript + Tailwind CSS + Framer Motion
- `react-icons/tb` (Tabler icons)
- Supabase SSR + RLS
- Google Sheets sync

---

## Path Aliases

| Alias                     | Target                          |
| ------------------------- | ------------------------------- |
| `@/*`                     | `src/*`                         |
| `@components/*`           | `src/components/*`              |
| `@data/*`                 | `src/lib/data/*`                |
| `@app-types/*`            | `types/*`                       |
| `@helpers` / `@helpers/*` | `src/helpers` / `src/helpers/*` |
| `@lib/*`                  | `src/lib/*`                     |

---

## Structure

- Route code: `src/app` using App Router conventions including route groups `(store)`, `(auth)`, `(admin)`, `(account)`
- Shared types: `types/` — import via `@app-types/*` only, never scattered through `src/`
- Tests: `tests/`
- Store temporary files in project's `.temp/` folder.

---

## Workflow Rules

- Use canonical commands from `project.tools` above. No substitutes.
- Use `bun run build` for production validation when a task requires a build check.
- Update `docs/DESIGN.md` and `docs/product-architecture.md` when architecture, UI patterns, or major data-flow assumptions change.

---

## Database & Schema

- **Supabase is the source of truth.** All schema changes must go through Supabase MCP and include a tested SQL migration in `supabase/migrations/`. Never change schema through code or the Supabase UI without a migration.
- **After schema changes:**

1. Regenerate types: `bunx supabase gen types typescript --project-id "$SUPABASE_PROJECT_REF" --schema public > types/database.ts`
2. Update `docs/database-architecture.md`
3. Update `db-tables` sheet using script `scripts/syncDbTables.ts`, which must first be updated with any new tables, columns, or relationships.

- **After changes to database fields, seeding, or Sheets sync code:** Run `bun syncsheets` (`scripts/sheets.ts`) before marking the phase complete. Keep `scripts/seed.ts` and `scripts/sheets.ts` up-to-date with the current schema.
- Preserve SSR and RLS assumptions when changing auth, data access, or database-facing code.

---

## Testing Conventions

| Category                 | Approach                                                                      |
| ------------------------ | ----------------------------------------------------------------------------- |
| DOM tests                | Testing Library with happy-dom. Shared mocks/utilities from `tests/utils.tsx` |
| Source-analysis tests    | Config, CSS, imports, and page structure validation                           |
| Logic / mock-heavy tests | `mock.module()` for business logic and API/data code                          |
