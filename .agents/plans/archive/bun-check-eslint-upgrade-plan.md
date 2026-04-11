## Plan: bun check ESLint 10 compatibility repair

Unblock `bun check` without downgrading packages by applying ESLint's official compatibility utilities to the imported Next.js flat config, and align the TypeScript ESLint toolchain to the latest published TypeScript-6-compatible release. Once ESLint boots, fix only the concrete repo diagnostics that surface and rerun the repo quality gates.

**Phase Rationale:** Separate lint-toolchain recovery from any real repo diagnostics so the root cause fix stays small and reviewable.
**Resolved Tooling:** pm: `bun` | format: `bun run f` | lint: `bun check` | test: `bun test`

---

### Phases

1. **[x] Phase 1: Unblock the lint toolchain**
   - **Summary:** Added `@eslint/compat`, wrapped the imported Next flat configs with `fixupConfigRules(...)`, pinned and overrode `typescript-eslint@8.58.1`, and restored the standalone `lint` script. `bun lint` now succeeds, `bun why typescript-eslint` resolves only `8.58.1` including under `eslint-config-next@16.2.3`, and `bun check` advances into real repo diagnostics instead of crashing in ESLint or warning about unsupported TypeScript.
   - **Changes from plan:** Added a Bun `overrides` entry for `typescript-eslint` after review showed `eslint-config-next` still resolved a stale `8.56.0` subtree. Restored the standalone `lint` script after review flagged the lint-only entrypoint regression.
   - **[Phase 1 Details](bun-check-eslint-upgrade-phase-1-complete.md)**

2. **[x] Phase 2: Triage and fix surfaced repo diagnostics**
   - **Summary:** Updated `tsconfig.json` to use TypeScript 6's Bun typing entrypoint (`"types": ["bun"]`) so `bun:test`, `Bun`, and `import.meta.dir` resolve correctly again, then narrowed the last remaining error in `src/lib/data/orders.ts` by typing the order status/update payload against generated Supabase types. Final validation passed with `bun check` and `bun test` (`1302` pass, `0` fail).
   - **Changes from plan:** The suspected test-file follow-up work was unnecessary once the Bun typings were configured correctly, so the phase stayed intentionally limited to `tsconfig.json` and `src/lib/data/orders.ts`.
   - **[Phase 2 Details](bun-check-eslint-upgrade-phase-2-complete.md)**
