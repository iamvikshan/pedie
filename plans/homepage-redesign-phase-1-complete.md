## Phase 1 Complete: Design Foundation — Deps, Tokens, Light/Dark Mode, Branding & Assets

Installed `framer-motion` and `next-themes`, overhauled the full color palette around `#22c55e` with light/dark mode support via `next-themes` class strategy, rebranded from "Pedie Tech" → "Pedie" across all components/SEO/metadata, added social URL config, updated Button and ConditionBadge primitives, created hero JSON config, and downloaded stock device images.

**Files created/changed:**
- package.json (added framer-motion, next-themes)
- src/app/globals.css (full palette overhaul, light/dark tokens, glass utilities)
- src/config.ts (SITE_NAME → "Pedie", added URLS.social)
- src/app/layout.tsx (ThemeProvider wrap, metadata rebrand, suppressHydrationWarning)
- src/components/ui/button.tsx (rounded-xl, outline variant)
- src/components/ui/conditionBadge.tsx (rounded-full pill)
- src/components/ui/themeToggle.tsx (NEW)
- src/data/hero.json (NEW)
- src/lib/seo/structuredData.ts (sameAs social links)
- src/components/layout/header.tsx (rebrand + ThemeToggle)
- src/components/layout/footer.tsx (rebrand + Tabler social icons from config)
- src/components/layout/mobileNav.tsx (rebrand)
- public/images/hero/ (3 stock hero images)
- public/images/categories/ (6 stock category images)
- tests/config.test.ts (NEW)
- tests/data/hero-json.test.ts (NEW)
- tests/components/ui/theme-toggle.test.tsx (NEW)
- Updated existing header/footer/seo test files

**Functions created/changed:**
- ThemeToggle (new component using resolvedTheme)
- Button (added outline variant)
- ConditionBadge (rounded-full)
- organizationJsonLd (added sameAs social links)
- URLS config constant (new)

**Tests created/changed:**
- tests/config.test.ts — SITE_NAME, URLS.social validation
- tests/data/hero-json.test.ts — hero.json schema validation
- tests/components/ui/theme-toggle.test.tsx — export check
- Updated header/footer/seo tests for Pedie branding

**Review Status:** APPROVED (after revision — fixed resolvedTheme, added ThemeToggle to header, defaultTheme='system')

**Git Commit Message:**
```
feat: design foundation with light/dark mode and Pedie rebrand

- Install framer-motion and next-themes
- Overhaul color palette around #22c55e with light/dark CSS tokens
- Add ThemeProvider with system-default theme toggle
- Rebrand from "Pedie Tech" to "Pedie" across all components and SEO
- Add URLS.social config with social media links
- Update Button (rounded-xl, outline variant) and ConditionBadge (pill)
- Create hero.json config for carousel slides
- Download stock device images for hero and categories
- Add sameAs social links to organization JSON-LD
```
