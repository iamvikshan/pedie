## [1.2.0](https://github.com/iamvikshan/pedie/compare/v1.1.0...v1.2.0) (2026-04-11)

### Features

* add /shop page, fix collections descendant bug, rework breadcrumbs ([17213c4](https://github.com/iamvikshan/pedie/commit/17213c44452f872ebf210ce50907d183dca0ced0))
* add category hierarchy with subcategories and M2M junction ([d1d3eef](https://github.com/iamvikshan/pedie/commit/d1d3eeff5d182f61308968a747f1031476c9fadf))
* add final_price_kes field and redesign product cards ([37e790b](https://github.com/iamvikshan/pedie/commit/37e790b622849148882efea694349c5cf3425595))
* add is_on_sale column with bidirectional sync ([b61ab02](https://github.com/iamvikshan/pedie/commit/b61ab02b5d31a0131ff24fcb6ffc83e17630a4b1))
* add pedie-container system and reduce card sizes ([b89b810](https://github.com/iamvikshan/pedie/commit/b89b8107221f07640a233b2dd3044169f787aa28))
* add referral WhatsApp CTA and cart validation ([5858e95](https://github.com/iamvikshan/pedie/commit/5858e95c59f3f09506cafc74d3381bec6ff0430a))
* add shared UI primitives for design system ([7a9edc7](https://github.com/iamvikshan/pedie/commit/7a9edc752f03968df96ae77aba50e8afe41e02b2))
* add skeleton loading states and homepage Suspense streaming ([456e15e](https://github.com/iamvikshan/pedie/commit/456e15ec1030aac09b78d6a6970ec91af8d4ec73))
* align cart, checkout, and pricing with new database schema ([7797ecf](https://github.com/iamvikshan/pedie/commit/7797ecf4275851beeb0ad7f9c7e136ad6a66825e))
* carousel nav, hot deals page, footer redesign ([7942874](https://github.com/iamvikshan/pedie/commit/794287453b6dafb00d83e379aafe030a7fd531b5))
* centralize animations and fix accessibility ([82db222](https://github.com/iamvikshan/pedie/commit/82db2226857c9ddca23cafdd89be2801cbd6a258))
* DB-driven mega-menu, Deals/Repairs links, breadcrumbs ([745175a](https://github.com/iamvikshan/pedie/commit/745175ae926148f66c863d547509f4835de846e1))
* design foundation with light/dark mode and Pedie rebrand ([f10126a](https://github.com/iamvikshan/pedie/commit/f10126afab272e3688ca213cb475e1eada8695d2)), closes [#22c55e](https://github.com/iamvikshan/pedie/issues/22c55e)
* evolve listing types and status enums ([2df09a7](https://github.com/iamvikshan/pedie/commit/2df09a768a9b300df999358caa0aa5f105409091))
* fix and enhance Google Sheets bidirectional sync ([10c2ae1](https://github.com/iamvikshan/pedie/commit/10c2ae1f26761c84298ca9a36642a13599e22e22))
* glass-morphism product cards, animated sections & ErrorBoundary ([e6e1078](https://github.com/iamvikshan/pedie/commit/e6e10782c34779110be3cd0abd2dc14f4baeebcb))
* header responsive overhaul + unified sidebar + placeholder pages ([b29ffed](https://github.com/iamvikshan/pedie/commit/b29ffed4dc3c29f17de3438b27b9c738fae5a34d))
* implement footer accordion for mobile with collapsible link groups ([618ba77](https://github.com/iamvikshan/pedie/commit/618ba77801fc78fd17633bf004b3b7f63fb9aeb4))
* implement username-based authentication and user management ([c192c6d](https://github.com/iamvikshan/pedie/commit/c192c6d8e28c3eb955cf2c58b196f11c17a9c6e1))
* mobile nav UX, newsletter redesign & all items panel ([e4c34f4](https://github.com/iamvikshan/pedie/commit/e4c34f4b8721698054e059fc5f0be2edaae16e61))
* multi-level glass header, nav panels & error boundary ([7e971fa](https://github.com/iamvikshan/pedie/commit/7e971fab9150c291dce7894506cd7e65b7b0e61d))
* product family cards and homepage refresh ([4143db2](https://github.com/iamvikshan/pedie/commit/4143db2ceb2b440c26e176f1d798a45695b82e9e))
* product family data layer and detail page ([4ee92d0](https://github.com/iamvikshan/pedie/commit/4ee92d0042f09872fd0dc4b4f8ec3826876ef51d))
* rate limiting, Zod validation, and signin anti-enumeration ([3a93100](https://github.com/iamvikshan/pedie/commit/3a93100bdea23fee1bdcfcba5ab90c550c995820))
* redesign homepage sections with streaming and dynamic content ([5bfe530](https://github.com/iamvikshan/pedie/commit/5bfe53004e506956d509b1b5c793d7c578232752))
* redesign product cards with 3-tier glassmorphed badges ([46ee440](https://github.com/iamvikshan/pedie/commit/46ee44054268dd45e44b2116d5f6170489695d0a))
* refine affiliate cards, add skeleton loading & visual polish ([ed47188](https://github.com/iamvikshan/pedie/commit/ed4718801aaad7b49d676a0d66e7e837181bca5a))
* rewrite data access layer for new schema ([c94f47e](https://github.com/iamvikshan/pedie/commit/c94f47e61132244a16724c4b41f8a509168799f9))
* rewrite sync pipeline and promotions for new schema ([d5b2efb](https://github.com/iamvikshan/pedie/commit/d5b2efbcef8f33a9662b483167d7a4bb864860d3))
* scroll-aware header and navigation polish ([d9da3a8](https://github.com/iamvikshan/pedie/commit/d9da3a8abec27b1271f6a131e9bdbb9e2f76db6a))
* security headers, admin audit logging, and Phase 3 docs ([b53b5d2](https://github.com/iamvikshan/pedie/commit/b53b5d2aedb161a78e3a188c8d5aba0b078414bd))
* sync engine hardening with multi-tab support ([746e585](https://github.com/iamvikshan/pedie/commit/746e5859d1bd30f57d27d653a1cbbbd35b46dd91))
* unified database schema migration ([aa32990](https://github.com/iamvikshan/pedie/commit/aa329900efd20e01f9b3e8763fc2add72603225e))
* update catalog, admin, account components for new schema ([bb6a89e](https://github.com/iamvikshan/pedie/commit/bb6a89e90f7185b755105b77f2d2d36668ead8ec))
* update listing components and detail pages for new schema ([9ef84ae](https://github.com/iamvikshan/pedie/commit/9ef84ae344f4c8d1f110eb2734613155d6c21e8c))

### Bug Fixes

* carousel direction animation and brands redesign ([b93a646](https://github.com/iamvikshan/pedie/commit/b93a646824942ddb7ba87c138689f82e77e39e57))
* Phase 1 security hardening + sanitize-html adoption ([ed4a2c4](https://github.com/iamvikshan/pedie/commit/ed4a2c457685c5ed962d6bc666124b5afcbdc266))
* replace broken admin tokens and add semantic color tokens ([5a41376](https://github.com/iamvikshan/pedie/commit/5a413762a4782fdfd73099eab6eba766405f3008))
* resolve RLS infinite recursion on profiles table ([9989730](https://github.com/iamvikshan/pedie/commit/9989730f923148ddd261ebbb90562f52440aeea3))
* server-side pricing trust for orders and PayPal ([fcb0324](https://github.com/iamvikshan/pedie/commit/fcb0324c3a320a579f08a914d61f3642959b91cf))

## [1.2.0](https://github.com/iamvikshan/pedie/compare/v1.1.0...v1.2.0) (2026-03-11)

### Features

* add /shop page, fix collections descendant bug, rework breadcrumbs ([17213c4](https://github.com/iamvikshan/pedie/commit/17213c44452f872ebf210ce50907d183dca0ced0))
* add category hierarchy with subcategories and M2M junction ([d1d3eef](https://github.com/iamvikshan/pedie/commit/d1d3eeff5d182f61308968a747f1031476c9fadf))
* add final_price_kes field and redesign product cards ([37e790b](https://github.com/iamvikshan/pedie/commit/37e790b622849148882efea694349c5cf3425595))
* add is_on_sale column with bidirectional sync ([b61ab02](https://github.com/iamvikshan/pedie/commit/b61ab02b5d31a0131ff24fcb6ffc83e17630a4b1))
* add pedie-container system and reduce card sizes ([b89b810](https://github.com/iamvikshan/pedie/commit/b89b8107221f07640a233b2dd3044169f787aa28))
* add referral WhatsApp CTA and cart validation ([5858e95](https://github.com/iamvikshan/pedie/commit/5858e95c59f3f09506cafc74d3381bec6ff0430a))
* add shared UI primitives for design system ([7a9edc7](https://github.com/iamvikshan/pedie/commit/7a9edc752f03968df96ae77aba50e8afe41e02b2))
* add skeleton loading states and homepage Suspense streaming ([456e15e](https://github.com/iamvikshan/pedie/commit/456e15ec1030aac09b78d6a6970ec91af8d4ec73))
* align cart, checkout, and pricing with new database schema ([7797ecf](https://github.com/iamvikshan/pedie/commit/7797ecf4275851beeb0ad7f9c7e136ad6a66825e))
* carousel nav, hot deals page, footer redesign ([7942874](https://github.com/iamvikshan/pedie/commit/794287453b6dafb00d83e379aafe030a7fd531b5))
* centralize animations and fix accessibility ([82db222](https://github.com/iamvikshan/pedie/commit/82db2226857c9ddca23cafdd89be2801cbd6a258))
* DB-driven mega-menu, Deals/Repairs links, breadcrumbs ([745175a](https://github.com/iamvikshan/pedie/commit/745175ae926148f66c863d547509f4835de846e1))
* design foundation with light/dark mode and Pedie rebrand ([f10126a](https://github.com/iamvikshan/pedie/commit/f10126afab272e3688ca213cb475e1eada8695d2)), closes [#22c55e](https://github.com/iamvikshan/pedie/issues/22c55e)
* evolve listing types and status enums ([2df09a7](https://github.com/iamvikshan/pedie/commit/2df09a768a9b300df999358caa0aa5f105409091))
* fix and enhance Google Sheets bidirectional sync ([10c2ae1](https://github.com/iamvikshan/pedie/commit/10c2ae1f26761c84298ca9a36642a13599e22e22))
* glass-morphism product cards, animated sections & ErrorBoundary ([e6e1078](https://github.com/iamvikshan/pedie/commit/e6e10782c34779110be3cd0abd2dc14f4baeebcb))
* header responsive overhaul + unified sidebar + placeholder pages ([b29ffed](https://github.com/iamvikshan/pedie/commit/b29ffed4dc3c29f17de3438b27b9c738fae5a34d))
* implement footer accordion for mobile with collapsible link groups ([618ba77](https://github.com/iamvikshan/pedie/commit/618ba77801fc78fd17633bf004b3b7f63fb9aeb4))
* implement username-based authentication and user management ([c192c6d](https://github.com/iamvikshan/pedie/commit/c192c6d8e28c3eb955cf2c58b196f11c17a9c6e1))
* mobile nav UX, newsletter redesign & all items panel ([e4c34f4](https://github.com/iamvikshan/pedie/commit/e4c34f4b8721698054e059fc5f0be2edaae16e61))
* multi-level glass header, nav panels & error boundary ([7e971fa](https://github.com/iamvikshan/pedie/commit/7e971fab9150c291dce7894506cd7e65b7b0e61d))
* product family cards and homepage refresh ([4143db2](https://github.com/iamvikshan/pedie/commit/4143db2ceb2b440c26e176f1d798a45695b82e9e))
* product family data layer and detail page ([4ee92d0](https://github.com/iamvikshan/pedie/commit/4ee92d0042f09872fd0dc4b4f8ec3826876ef51d))
* redesign homepage sections with streaming and dynamic content ([5bfe530](https://github.com/iamvikshan/pedie/commit/5bfe53004e506956d509b1b5c793d7c578232752))
* redesign product cards with 3-tier glassmorphed badges ([46ee440](https://github.com/iamvikshan/pedie/commit/46ee44054268dd45e44b2116d5f6170489695d0a))
* refine affiliate cards, add skeleton loading & visual polish ([ed47188](https://github.com/iamvikshan/pedie/commit/ed4718801aaad7b49d676a0d66e7e837181bca5a))
* rewrite data access layer for new schema ([c94f47e](https://github.com/iamvikshan/pedie/commit/c94f47e61132244a16724c4b41f8a509168799f9))
* rewrite sync pipeline and promotions for new schema ([d5b2efb](https://github.com/iamvikshan/pedie/commit/d5b2efbcef8f33a9662b483167d7a4bb864860d3))
* scroll-aware header and navigation polish ([d9da3a8](https://github.com/iamvikshan/pedie/commit/d9da3a8abec27b1271f6a131e9bdbb9e2f76db6a))
* sync engine hardening with multi-tab support ([746e585](https://github.com/iamvikshan/pedie/commit/746e5859d1bd30f57d27d653a1cbbbd35b46dd91))
* unified database schema migration ([aa32990](https://github.com/iamvikshan/pedie/commit/aa329900efd20e01f9b3e8763fc2add72603225e))
* update catalog, admin, account components for new schema ([bb6a89e](https://github.com/iamvikshan/pedie/commit/bb6a89e90f7185b755105b77f2d2d36668ead8ec))
* update listing components and detail pages for new schema ([9ef84ae](https://github.com/iamvikshan/pedie/commit/9ef84ae344f4c8d1f110eb2734613155d6c21e8c))

### Bug Fixes

* carousel direction animation and brands redesign ([b93a646](https://github.com/iamvikshan/pedie/commit/b93a646824942ddb7ba87c138689f82e77e39e57))
* replace broken admin tokens and add semantic color tokens ([5a41376](https://github.com/iamvikshan/pedie/commit/5a413762a4782fdfd73099eab6eba766405f3008))
* resolve RLS infinite recursion on profiles table ([9989730](https://github.com/iamvikshan/pedie/commit/9989730f923148ddd261ebbb90562f52440aeea3))

## [1.2.0](https://github.com/iamvikshan/pedie/compare/v1.1.0...v1.2.0) (2026-03-07)

### Features

* add /shop page, fix collections descendant bug, rework breadcrumbs ([17213c4](https://github.com/iamvikshan/pedie/commit/17213c44452f872ebf210ce50907d183dca0ced0))
* add category hierarchy with subcategories and M2M junction ([d1d3eef](https://github.com/iamvikshan/pedie/commit/d1d3eeff5d182f61308968a747f1031476c9fadf))
* add final_price_kes field and redesign product cards ([37e790b](https://github.com/iamvikshan/pedie/commit/37e790b622849148882efea694349c5cf3425595))
* add is_on_sale column with bidirectional sync ([b61ab02](https://github.com/iamvikshan/pedie/commit/b61ab02b5d31a0131ff24fcb6ffc83e17630a4b1))
* add pedie-container system and reduce card sizes ([b89b810](https://github.com/iamvikshan/pedie/commit/b89b8107221f07640a233b2dd3044169f787aa28))
* add referral WhatsApp CTA and cart validation ([5858e95](https://github.com/iamvikshan/pedie/commit/5858e95c59f3f09506cafc74d3381bec6ff0430a))
* add skeleton loading states and homepage Suspense streaming ([456e15e](https://github.com/iamvikshan/pedie/commit/456e15ec1030aac09b78d6a6970ec91af8d4ec73))
* carousel nav, hot deals page, footer redesign ([7942874](https://github.com/iamvikshan/pedie/commit/794287453b6dafb00d83e379aafe030a7fd531b5))
* DB-driven mega-menu, Deals/Repairs links, breadcrumbs ([745175a](https://github.com/iamvikshan/pedie/commit/745175ae926148f66c863d547509f4835de846e1))
* design foundation with light/dark mode and Pedie rebrand ([f10126a](https://github.com/iamvikshan/pedie/commit/f10126afab272e3688ca213cb475e1eada8695d2)), closes [#22c55e](https://github.com/iamvikshan/pedie/issues/22c55e)
* evolve listing types and status enums ([2df09a7](https://github.com/iamvikshan/pedie/commit/2df09a768a9b300df999358caa0aa5f105409091))
* fix and enhance Google Sheets bidirectional sync ([10c2ae1](https://github.com/iamvikshan/pedie/commit/10c2ae1f26761c84298ca9a36642a13599e22e22))
* glass-morphism product cards, animated sections & ErrorBoundary ([e6e1078](https://github.com/iamvikshan/pedie/commit/e6e10782c34779110be3cd0abd2dc14f4baeebcb))
* header responsive overhaul + unified sidebar + placeholder pages ([b29ffed](https://github.com/iamvikshan/pedie/commit/b29ffed4dc3c29f17de3438b27b9c738fae5a34d))
* implement footer accordion for mobile with collapsible link groups ([618ba77](https://github.com/iamvikshan/pedie/commit/618ba77801fc78fd17633bf004b3b7f63fb9aeb4))
* mobile nav UX, newsletter redesign & all items panel ([e4c34f4](https://github.com/iamvikshan/pedie/commit/e4c34f4b8721698054e059fc5f0be2edaae16e61))
* multi-level glass header, nav panels & error boundary ([7e971fa](https://github.com/iamvikshan/pedie/commit/7e971fab9150c291dce7894506cd7e65b7b0e61d))
* product family cards and homepage refresh ([4143db2](https://github.com/iamvikshan/pedie/commit/4143db2ceb2b440c26e176f1d798a45695b82e9e))
* product family data layer and detail page ([4ee92d0](https://github.com/iamvikshan/pedie/commit/4ee92d0042f09872fd0dc4b4f8ec3826876ef51d))
* redesign homepage sections with streaming and dynamic content ([5bfe530](https://github.com/iamvikshan/pedie/commit/5bfe53004e506956d509b1b5c793d7c578232752))
* redesign product cards with 3-tier glassmorphed badges ([46ee440](https://github.com/iamvikshan/pedie/commit/46ee44054268dd45e44b2116d5f6170489695d0a))
* refine affiliate cards, add skeleton loading & visual polish ([ed47188](https://github.com/iamvikshan/pedie/commit/ed4718801aaad7b49d676a0d66e7e837181bca5a))
* scroll-aware header and navigation polish ([d9da3a8](https://github.com/iamvikshan/pedie/commit/d9da3a8abec27b1271f6a131e9bdbb9e2f76db6a))

### Bug Fixes

* carousel direction animation and brands redesign ([b93a646](https://github.com/iamvikshan/pedie/commit/b93a646824942ddb7ba87c138689f82e77e39e57))
* resolve RLS infinite recursion on profiles table ([9989730](https://github.com/iamvikshan/pedie/commit/9989730f923148ddd261ebbb90562f52440aeea3))

## [1.2.0](https://github.com/iamvikshan/pedie/compare/v1.1.0...v1.2.0) (2026-03-04)

### Features

- add category hierarchy with subcategories and M2M junction ([d1d3eef](https://github.com/iamvikshan/pedie/commit/d1d3eeff5d182f61308968a747f1031476c9fadf))
- add final_price_kes field and redesign product cards ([37e790b](https://github.com/iamvikshan/pedie/commit/37e790b622849148882efea694349c5cf3425595))
- add is_on_sale column with bidirectional sync ([b61ab02](https://github.com/iamvikshan/pedie/commit/b61ab02b5d31a0131ff24fcb6ffc83e17630a4b1))
- add referral WhatsApp CTA and cart validation ([5858e95](https://github.com/iamvikshan/pedie/commit/5858e95c59f3f09506cafc74d3381bec6ff0430a))
- add skeleton loading states and homepage Suspense streaming ([456e15e](https://github.com/iamvikshan/pedie/commit/456e15ec1030aac09b78d6a6970ec91af8d4ec73))
- carousel nav, hot deals page, footer redesign ([7942874](https://github.com/iamvikshan/pedie/commit/794287453b6dafb00d83e379aafe030a7fd531b5))
- design foundation with light/dark mode and Pedie rebrand ([f10126a](https://github.com/iamvikshan/pedie/commit/f10126afab272e3688ca213cb475e1eada8695d2)), closes [#22c55e](https://github.com/iamvikshan/pedie/issues/22c55e)
- evolve listing types and status enums ([2df09a7](https://github.com/iamvikshan/pedie/commit/2df09a768a9b300df999358caa0aa5f105409091))
- fix and enhance Google Sheets bidirectional sync ([10c2ae1](https://github.com/iamvikshan/pedie/commit/10c2ae1f26761c84298ca9a36642a13599e22e22))
- glass-morphism product cards, animated sections & ErrorBoundary ([e6e1078](https://github.com/iamvikshan/pedie/commit/e6e10782c34779110be3cd0abd2dc14f4baeebcb))
- implement footer accordion for mobile with collapsible link groups ([618ba77](https://github.com/iamvikshan/pedie/commit/618ba77801fc78fd17633bf004b3b7f63fb9aeb4))
- mobile nav UX, newsletter redesign & all items panel ([e4c34f4](https://github.com/iamvikshan/pedie/commit/e4c34f4b8721698054e059fc5f0be2edaae16e61))
- multi-level glass header, nav panels & error boundary ([7e971fa](https://github.com/iamvikshan/pedie/commit/7e971fab9150c291dce7894506cd7e65b7b0e61d))
- product family cards and homepage refresh ([4143db2](https://github.com/iamvikshan/pedie/commit/4143db2ceb2b440c26e176f1d798a45695b82e9e))
- product family data layer and detail page ([4ee92d0](https://github.com/iamvikshan/pedie/commit/4ee92d0042f09872fd0dc4b4f8ec3826876ef51d))
- redesign product cards with 3-tier glassmorphed badges ([46ee440](https://github.com/iamvikshan/pedie/commit/46ee44054268dd45e44b2116d5f6170489695d0a))
- refine affiliate cards, add skeleton loading & visual polish ([ed47188](https://github.com/iamvikshan/pedie/commit/ed4718801aaad7b49d676a0d66e7e837181bca5a))
- scroll-aware header and navigation polish ([d9da3a8](https://github.com/iamvikshan/pedie/commit/d9da3a8abec27b1271f6a131e9bdbb9e2f76db6a))

### Bug Fixes

- carousel direction animation and brands redesign ([b93a646](https://github.com/iamvikshan/pedie/commit/b93a646824942ddb7ba87c138689f82e77e39e57))
- resolve RLS infinite recursion on profiles table ([9989730](https://github.com/iamvikshan/pedie/commit/9989730f923148ddd261ebbb90562f52440aeea3))

## [1.1.0](https://github.com/iamvikshan/pedie/compare/v1.0.0...v1.1.0) (2026-02-26)

### Features

- add admin dashboard and price crawlers ([8dd7dc6](https://github.com/iamvikshan/pedie/commit/8dd7dc64433188ab854b1cbb5be07b6ca70760c2))
- complete Phase 7 - security, CI/CD, and deployment ([26bd576](https://github.com/iamvikshan/pedie/commit/26bd576444199a56c2acda2d3ca324e112f19119))

### Bug Fixes

- resolve CodeRabbit findings across admin dashboard ([01437b5](https://github.com/iamvikshan/pedie/commit/01437b5ab38004f51fb599b70a996043c0359c43))

## [1.1.0](https://github.com/iamvikshan/pedie/compare/v1.0.0...v1.1.0) (2026-02-25)

### Features

- add admin dashboard and price crawlers ([8dd7dc6](https://github.com/iamvikshan/pedie/commit/8dd7dc64433188ab854b1cbb5be07b6ca70760c2))

### Bug Fixes

- resolve CodeRabbit findings across admin dashboard ([01437b5](https://github.com/iamvikshan/pedie/commit/01437b5ab38004f51fb599b70a996043c0359c43))

## 1.0.0 (2026-02-25)

### Features

- add Renovate configuration and setup script for GitHub CLI ([f058d33](https://github.com/iamvikshan/pedie/commit/f058d334ff2a77d08dc06fcec1ac7c8d6c8d0252))
- add storefront layout, homepage sections, and UI components ([384ff43](https://github.com/iamvikshan/pedie/commit/384ff4302151f17f6acc1a34cab7e7f257b1827a))
- bootstrap store with Next.js 16.1.6, Supabase, and Sheets sync ([9c52072](https://github.com/iamvikshan/pedie/commit/9c5207234d699f37eb109f380140f82e1e6be86e))

### Bug Fixes

- address CodeRabbit review findings for Phase 3 ([3c146ba](https://github.com/iamvikshan/pedie/commit/3c146bae5ab03b032890531ead652fa1189ce6ac))
- address phase 2 known issues before phase 3 ([9ed0580](https://github.com/iamvikshan/pedie/commit/9ed0580835f54b260c685bb39e8914b4c284301f))
