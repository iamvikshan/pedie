## Phase 2 Complete: Surfaced Diagnostics Cleanup

Cleared the real repository diagnostics that appeared once ESLint could run again. The fix stayed intentionally small: restore Bun's TypeScript 6 globals in `tsconfig.json`, then tighten the remaining order-update typing in `src/lib/data/orders.ts`.

**Details:** Restored Bun ambient types by setting `compilerOptions.types` to `[`bun`]`, which resolved the `bun:test`, `Bun`, and `import.meta.dir` failures exposed by TypeScript 6. After that, only `src/lib/data/orders.ts` still failed typecheck, so `updateOrderStatus()` was narrowed to generated Supabase types (`OrderStatus` and `OrderUpdate`) instead of a loose record payload.

**Deviations from plan:** The suspected follow-up edits in test files were not needed after the Bun typings fix. The phase remained limited to the two files that still failed after re-running `bun check`.

**Files modified:**
- `tsconfig.json` -- switched explicit Bun typings to `"bun"` for TypeScript 6 compatibility
- `src/lib/data/orders.ts` -- typed order status and update payload against generated database types

**Review Status:** APPROVED

**Git Commit Message:**

```text
fix: finish bun check TypeScript 6 cleanup

- restore Bun ambient typings with compilerOptions.types=["bun"]
- type order status updates against generated Supabase types
- confirm bun check and bun test pass on the upgraded toolchain
```
