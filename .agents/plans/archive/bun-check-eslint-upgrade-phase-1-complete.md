## Phase 1 Complete: Unblock the lint toolchain

Recovered the lint stack for ESLint 10 and TypeScript 6 without downgrading packages. The repo now uses the official ESLint compat wrapper for the imported Next flat config and forces `eslint-config-next` onto a TypeScript-6-compatible `typescript-eslint` release.

**Details:** The phase added `@eslint/compat@2.0.5`, pinned and overrode `typescript-eslint@8.58.1`, restored the standalone `lint` script, and updated `check` to route through `bun lint`. `eslint.config.mjs` now wraps the imported `eslint-config-next` flat config arrays with `fixupConfigRules(...)` while keeping `globalIgnores(...)` unchanged. Validation confirmed that `bun lint` succeeds, `bun why typescript-eslint` resolves only `8.58.1` including under `eslint-config-next@16.2.3`, and `bun check` no longer crashes in ESLint or emits the old TypeScript peer warning.

**Deviations from plan:** Added a top-level Bun `overrides` entry for `typescript-eslint` after review showed `eslint-config-next` still resolved a stale `8.56.0` subtree. Restored the standalone `lint` script after review caught that the lint-only entrypoint had regressed.
**Files modified:**
- `package.json` -- lint scripts, direct dev dependencies, Bun override for `typescript-eslint`
- `bun.lock` -- resolved ESLint/TypeScript ESLint graph to the TS6-compatible version
- `eslint.config.mjs` -- official ESLint compat wrapper around imported Next flat configs
**Review Status:** APPROVED

**Git Commit Message:**

```text
fix: recover ESLint 10 toolchain

- add official ESLint compat wrapper for Next flat config
- force typescript-eslint to 8.58.1 for TS 6 support
- restore standalone bun lint entrypoint
```
