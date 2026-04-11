## Plan Complete: bun check ESLint 10 compatibility repair

Recovered the repository's `bun check` workflow after the ESLint and TypeScript upgrades without downgrading any packages. The repair used ESLint's official compatibility wrapper for the imported Next.js flat config, aligned the TypeScript ESLint toolchain on a TypeScript-6-compatible release, then cleaned the small set of real diagnostics that surfaced afterward.

**Phases Completed:** 2 of 2

1. [x] Phase 1: Unblock the lint toolchain
2. [x] Phase 2: Triage and fix surfaced repo diagnostics

**Key Files Added:**
- `eslint.config.mjs` -- wraps imported Next flat configs with ESLint's official compat helpers
- `package.json` -- adds compatibility dependencies, Bun override, and restores a standalone `lint` entrypoint
- `tsconfig.json` -- restores Bun ambient typings for TypeScript 6
- `src/lib/data/orders.ts` -- narrows order status updates to generated database types

**Test Coverage:**
- Total tests: 1302 | Passing: Yes

_(Master plan and phase files archived to `.agents/plans/archive/`.)_
