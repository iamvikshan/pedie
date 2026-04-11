## Phase 4 Complete: Auth & User Management

Wired frontend auth forms to use the existing username DB infrastructure. Signup collects username instead of full_name. Signin accepts username or email with server-side resolution. Admin customers page enhanced with username column and search.

**Details:**

- signupForm.tsx: replaced fullName field with username (regex-validated, 3-20 chars, lowercase). Passes username in raw_user_meta_data to trigger handle_new_user which creates the profile.
- signinForm.tsx: "Email" field replaced with "Username or email" identifier. Detects @ to choose flow: if username, calls resolve-username API to get email, then signInWithPassword.
- resolve-username API route: POST /api/auth/resolve-username validates format, calls resolve_username RPC via admin client, returns email or 404.
- username.ts lib: isValidUsername, isEmail, resolveUsername utilities.
- Admin customers: username column added with @prefix display. Search filter extended to include username.
- Design system compliance: validation text uses text-pedie-error token instead of hardcoded text-red-400.

**Deviations from plan:**
- No separate /admin/users/ page created -- existing /admin/customers/ infrastructure already handles user management (list, search, role switching, detail view). Enhanced in-place instead.
- Reserved word blocking is enforced at DB level (CHECK constraint), not duplicated in client validation.

**Files modified:**
- src/components/auth/signupForm.tsx -- username field replaces fullName
- src/components/auth/signinForm.tsx -- username-or-email login flow
- src/lib/auth/username.ts -- created (isValidUsername, isEmail, resolveUsername)
- src/app/api/auth/resolve-username/route.ts -- created (POST endpoint)
- src/app/(admin)/admin/customers/columns.tsx -- username column added
- src/lib/data/admin.ts -- username added to customer search filter
- tests/lib/auth/username.test.ts -- created (8 tests)
- tests/api/auth/resolve-username.test.ts -- created (5 tests)
- tests/components/auth/signup-form.test.tsx -- updated for username
- tests/components/auth/signin-form.test.tsx -- updated for identifier
- tests/app/admin/customers.test.tsx -- column count updated

**Test Results:** 1237 pass, 0 fail (13 new tests)

**Review Status:** APPROVED (design system compliance fixed, all tests green)

**Git Commit Message:**
```text
feat: wire username auth support into frontend forms and admin UI

- Replace fullName with username on signup form (regex validated, 3-20 chars)
- Add username-or-email login flow to signin form via resolve-username API
- Create resolve-username API route using admin client + resolve_username RPC
- Add username column to admin customers table with search support
- Use pedie design tokens for validation text (text-pedie-error)
```
