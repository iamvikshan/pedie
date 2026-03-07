# Pedie agent instructions

- Follow the active phase plan when one is provided. Treat files under `.zeus/plans` as the scope boundary unless the task explicitly expands it.
- Prefer little code that does more. Reach for mature packages instead of reinventing common solutions.
- Keep modules cohesive, reusable, and easy to share without creating needless file sprawl.
- Breaking changes are acceptable in this repo. Remove dead code instead of adding backward-compatibility or deprecation layers.

```yaml
tooling:
pm: bun
format: bun run f
lint: bun lint # to save time, this is substituted by `bun check` for a combined lint + typecheck pass
typecheck: bunx tsc --noEmit # see `bun check` above
test: bun test
build: bun run build
fileNaming: camelCase (files/modules/components) | PascalCase (component exports) | tests under tests/
iconLib: react-icons/tb

plan directory: .zeus/plans
```

## Stack

- Bun
- Next.js App Router (`src/app`)
- TypeScript
- Tailwind CSS
- Framer Motion
- `react-icons/tb`
- Supabase SSR + RLS
- Google Sheets sync

## Workflow rules

- Use the canonical commands from the `tooling` block above.
- Do not run `bun f:all`. Use `bun run f` instead because it formats only changed files.
- Prefer `bun check` when you want the repo's combined lint + typecheck pass.
- Use `bun run build` for production validation when a task requires a build check.
- Update `docs/DESIGN.md` and `docs/product-architecture.md` when architecture, UI patterns, or major data-flow assumptions change.
- temporary files and experiments can be placed in `.temp/`, but should be removed when the experiment is done or the temporary file is no longer needed. Do not add new long-term code to `.temp/`.
- For database schema changes, update the Supabase schema through MCP and add a SQL migration to `supabase/migrations/`. Do not change the schema through code or in the Supabase UI without a migration, as that will break the source-of-truth and cause issues for other developers.

## Naming, structure, and types

- File, module, and component filenames use camelCase. Component exports use PascalCase.
- Keep tests under `tests/`.
- Shared and app-wide types always live in `types/` and are imported through `@app-types/*`, not scattered through `src/`.
- Database types must be regenerated from Supabase after schema changes.
- Route code lives in the Next.js App Router under `src/app`, including route groups such as `(store)`, `(auth)`, `(admin)`, and `(account)`.
- useful styles from reebelo.com are stored in `.temp/reebelo/styles`, for reference.

## Path aliases

- `@/*` -> `src/*`
- `@components/*` -> `src/components/*`
- `@data/*` -> `src/lib/data/*`
- `@app-types/*` -> `types/*`
- `@helpers` -> `src/helpers`
- `@helpers/*` -> `src/helpers/*`
- `@lib/*` -> `src/lib/*`
- `@/config` resolves to `src/config` through the general `@/*` alias

## Data, schema, and sync safety

- Supabase is the source of truth for schema work. Schema changes must go through Supabase MCP and a checked-in SQL migration in `supabase/migrations/`.
- Preserve SSR and RLS assumptions when changing auth, data access, or database-facing code.
- If the database is seeded, fields are added, or DB-related code changes, the Google Sheets sync must still hold. Verify with `bun syncsheets` when the change touches that flow.

## Testing conventions

- DOM tests use Testing Library with happy-dom and shared mocks/utilities from `tests/utils.tsx`.
- Source-analysis tests are appropriate for config, CSS, imports, and page structure.
- Logic and mock-heavy tests should use `mock.module()` for business logic plus API/data code.
