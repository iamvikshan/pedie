## Phase 1 Complete: Infrastructure Setup + Doc Updates

Installed happy-dom + React Testing Library, created DOM preload and shared test utilities, wrote 8 smoke tests validating the full stack, updated AGENTS.md and storefront-overhaul-plan.md to reflect the new DOM testing approach.

**Files created/changed:**
- `tests/setup.ts` (updated: added happy-dom preload, jest-dom matchers, RTL cleanup)
- `tests/utils.tsx` (new)
- `tests/dom-smoke.test.tsx` (new)
- `types/testing.d.ts` (new)
- `bunfig.toml` (updated preload)
- `tsconfig.json` (updated include)
- `package.json` (new devDependencies)
- `AGENTS.md` (updated testing conventions)
- `plans/storefront-overhaul-plan.md` (added DOM testing notes)
- `plans/dom-testing-plan.md` (new plan file)

**Functions created/changed:**
- `GlobalRegistrator.register()` preload in `tests/setup.ts`
- `mockNextNavigation()`, `mockNextLink()`, `mockNextImage()`, `mockFramerMotion()`, `mockNextModules()` in `tests/utils.tsx`
- Bun expect extended with jest-dom matchers (toBeInTheDocument, toHaveAttribute, etc.)

**Tests created/changed:**
- `tests/dom-smoke.test.tsx`: 8 tests — document global, window global, RTL render, JSX render, queryByText null, getByRole, event handling, cleanup between tests

**Review Status:** APPROVED (self-verified: 1185 tests pass, 0 failures, bun check clean)

**Git Commit Message:**
```
feat: add happy-dom + RTL DOM testing infrastructure

- Install @happy-dom/global-registrator, @testing-library/react, @testing-library/dom, @testing-library/jest-dom
- Create tests/setup.ts preload with happy-dom registration + jest-dom matchers
- Create tests/utils.tsx with shared Next.js/framer-motion mocks and RTL re-exports
- Add 8 smoke tests validating DOM environment + RTL queries + event handling
- Add types/testing.d.ts for Bun expect type augmentation with jest-dom matchers
- Update AGENTS.md testing conventions: DOM tests, source-analysis, logic/mock
- Update bunfig.toml preload and tsconfig.json include
```
