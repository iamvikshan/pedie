# Project Agent Instructions

- Follow the active phase plan when one is provided. Treat files under `.zeus/plans` as the scope boundary unless the task explicitly expands it.
- Prefer little code that does more. Reach for mature packages instead of reinventing common solutions.
- Keep modules cohesive, reusable, and easy to share without creating needless file sprawl.
- Breaking changes are acceptable in this repo. Remove dead code instead of adding backward-compatibility or deprecation layers.

## Plan Directory

`.zeus/plans`

## Tooling

```yaml
pm: bun
format: bun run f # formats only changed files — NEVER use bun f:all
lint: bun check # combined lint + typecheck pass via bun check
typecheck: bun check # covered by lint above — run bunx tsc --noEmit for standalone check
test: bun test
build: bun run build
fileNaming: camelCase (file/module/component filenames) | PascalCase (exported classes/types) | camelCase (runtime/exported variables) | UPPER_SNAKE_CASE (.env & config.ts constants) | tests under tests/
iconLib: react-icons/tb
```

## Stack

- Bun + Next.js 14+ App Router (`src/app`) — no Pages Router patterns
- TypeScript
- Tailwind CSS + Framer Motion
- `react-icons/tb`
- Supabase SSR + RLS
- Google Sheets sync

## Workflow Rules

- Use canonical commands from the tooling block above.
- Use `bun check` for combined lint + typecheck. Use `bunx tsc --noEmit` for a standalone typecheck only.
- Use `bun run build` for production validation when a task requires a build check.
- Update `docs/DESIGN.md` and `docs/product-architecture.md` when architecture, UI patterns, or major data-flow assumptions change.
- Temporary files and experiments go in `.temp/` and must be removed when done. Do not add long-term code to `.temp/`.

## Database & Schema

- Supabase is the source of truth. All schema changes must go through Supabase MCP and include a tested SQL migration in `supabase/migrations/`. Never change schema through code or the Supabase UI without a migration.
- After schema changes: regenerate database types with `bunx supabase gen types typescript --project-id "$SUPABASE_PROJECT_REF" --schema public > types/database.ts`, then update `/docs/database-architecture.md`, AND `db-tables` (gid=327299327) sheet in the Google Sheet specified by `GS_SPREADSHEET_ID` in `.env`.
- After any change to database fields, seeding `bun seed` (scripts/seed.ts), or Google Sheets sync code: run `bun syncsheets` (scripts/sheets.ts) before marking the phase complete. Keep these scripts up-to-date with the current schema and sync requirements at all times.
- Preserve SSR and RLS assumptions when changing auth, data access, or database-facing code.

## Naming, Structure & Types

- File/module/component filenames: `camelCase`. Exported classes/types: `PascalCase`. Runtime/exported variables: `camelCase`. Constants (.env & config.ts): `UPPER_SNAKE_CASE`. MANDATORY: inconsistencies exist, fix on encounter.
- Tests live under `tests/`.
- Shared types live in `types/` and are imported via `@app-types/*` only — never scattered through `src/`.
- Route code lives under `src/app` using App Router conventions including route groups `(store)`, `(auth)`, `(admin)`, `(account)`.

## Path Aliases

- `@/*` -> `src/*`
- `@components/*` -> `src/components/*`
- `@data/*` -> `src/lib/data/*`
- `@app-types/*` -> `types/*`
- `@helpers` / `@helpers/*` -> `src/helpers` / `src/helpers/*`
- `@lib/*` -> `src/lib/*`

## Testing Conventions

- DOM tests: Testing Library with happy-dom. Shared mocks/utilities from `tests/utils.tsx`.
- Source-analysis tests: appropriate for config, CSS, imports, and page structure.
- Logic and mock-heavy tests: use `mock.module()` for business logic plus API/data code.
