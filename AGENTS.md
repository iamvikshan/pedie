# AGENTS.md — Pedie Storefront

## Environment

- **Stage**: Development — breaking changes are welcome. No backward compatibility required; dead code will be removed.
- **Runtime**: Bun ≥ 1.3 — **NEVER** use `node`, `npm`, or `npx`. Always use `bun` / `bunx`.
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5.9 (strict)
- **Styling**: Tailwind CSS 4.2 with `@theme` tokens in `src/app/globals.css`
- **DB**: Supabase (SSR + RLS). Schema changes via Supabase MCP migrations.

## Tooling

```yaml
tooling:
  pm: bun
  install: bun install
  dev: bun dev
  build: bun run build
  check: bun check # eslint + tsc --noEmit (runs BOTH — never run lint/typecheck separately)
  format: bun run f:changed # prettier on git-changed files only (fast); use `bun f` for full repo
  test: bun test # bun's built-in test runner
  seed: bun seed # scripts/seed.ts
  syncsheets: bun syncsheets # scripts/sheets.ts — Google Sheets ↔ DB sync
  crawl: bun crawl # scripts/crawlers/index.ts
```

## Quality Gate Workflow

Run these in order after every change:

1. **Format changed files**: `bun run f:changed`
2. **Lint + Typecheck**: `bun check`
3. **Tests**: `bun test`

Do **not** run `bun f` (formats entire repo — slow and noisy). Use `bun run f:changed` instead. That script only formats files with uncommitted changes via `git diff`.

## Conventions

- **Testing pattern**: Source-analysis (NO jsdom). Tests read source files and assert on exports/string patterns. Test runner: `bun test`.
- **DB schema changes**: Always apply via Supabase MCP migrations. After any schema change, verify the sync system still works (`bun syncsheets`).
- **Docs**: Keep `docs/DESIGN.md` and `docs/product-architecture.md` up to date when changes affect architecture or UI patterns.
- **Path aliases**: `@components/*`, `@data/*`, `@app-types/*`, `@helpers`, `@lib/*`, `@/config` — defined in `tsconfig.json`.
- **Design tokens**: Use `pedie-*` tokens from `globals.css`. Key tokens: `pedie-green`, `pedie-bg`, `pedie-card`, `pedie-surface`, `pedie-border`, `pedie-text`, `pedie-text-muted`. Note: `pedie-muted` does NOT exist.
- **Breaking changes**: Welcome. This is a dev environment. Do not add backward-compat shims or deprecation layers — remove dead code directly.

## Plan Directory

All agent plans go in `plans/`.
