Fix the following issues. The issues can be from different files or can overlap on same lines in one file.

- Verify each finding against the current code and only fix it if needed.

In @docs/database-architecture.md at line 551, Update the docs to clarify the semantics and relationship of triggered_by and actor_id: state that triggered_by (text, default 'system') records the source/type of the actor (examples: 'system', 'cron', 'sheets_sync', 'api', 'webhook') while actor_id is a nullable foreign key to profiles used when a human or identified user performed the action; explicitly call out that actor_id can be NULL for system/non-user triggers and show examples of combinations (e.g., triggered_by='system' with actor_id=NULL, triggered_by='api' with actor_id set), and mention any constraints or business rules linking the two in the audit/event table documentation.

- Verify each finding against the current code and only fix it if needed.

In @docs/database-architecture.md around lines 544 - 563, The docs lack recommended indexes for the growing admin_log audit table; update the Indexes section to document suggested indexes for admin_log including single-column indexes (admin_log(actor_id), admin_log(started_at), admin_log(action)) and a compound index for common lookups (admin_log(entity_type, entity_id) or admin_log(entity_type, entity_id, started_at)), and include a short rationale that these support queries by admin, entity, time-range, and action type.

- Verify each finding against the current code and only fix it if needed.

In @docs/database-architecture.md around lines 495 - 500, Update the table and add a short explanatory paragraph that defines subscription lifecycle semantics for the `subscribed` boolean and `subscribed_at` timestamp: state whether `subscribed_at` records the initial opt-in and remains immutable, or whether it should be updated on resubscribe; specify if `unsubscribed_at` should be added to the schema to capture opt-outs for auditing; and include the expected behavior for re-subscription (e.g., update `subscribed_at` vs. preserve original and set `unsubscribed_at` on opt-out) so implementers know how to handle `subscribed`, `subscribed_at`, and a possible `unsubscribed_at` field when writing subscription logic.

- Verify each finding against the current code and only fix it if needed.

In @docs/product-architecture.md around lines 411 - 420, The middleware in src/proxy.ts currently attaches a nonce-based CSP to every non-static request but the docs describe a hybrid policy; update the middleware to match the documented strategy: detect static routes (storefront, product pages, collections — i.e., routes that should be ISR/static cached) and do NOT generate or forward the nonce or set nonce-based script-src for those requests, while for dynamic routes (/checkout, /admin, /account, /auth, /api) generate the crypto.randomUUID() nonce, set x-csp-nonce, and apply the nonce-based CSP header (script-src 'self' 'nonce-{nonce}'), keeping the existing dev behavior that appends 'unsafe-eval'; ensure the headers-reading sub-layouts that use headers() still receive the x-csp-nonce for dynamic routes.

- Verify each finding against the current code and only fix it if needed.

In @package.json at line 40, The package.json currently lists the "typescript" dependency in dependencies (the entry `"typescript": "^6.0.2"`); move that entry into devDependencies (remove it from dependencies and add it under devDependencies) because TypeScript is normally a build-time tool, and verify the version string "^6.0.2" is correct and stable (confirm the 6.x release exists and update to a stable published version if not) before committing the change.

- Verify each finding against the current code and only fix it if needed.

In @src/app/api/admin/categories/[id]/route.ts at line 46, The call to logAdminEvent in the route handler is not awaited, so audit logging can fail silently or run after the response; update the handler to await logAdminEvent(user.id, 'update', 'category', id) and ensure this awaited call executes inside the existing try/catch (or add one) so any errors are caught and handled before sending the HTTP response; keep the function name logAdminEvent and the surrounding route handler logic intact while awaiting the promise.

- Verify each finding against the current code and only fix it if needed.

In @src/app/api/admin/categories/[id]/route.ts at line 74, The call to logAdminEvent in the DELETE handler is not awaited, causing potential race conditions in audit logging; update the invocation of logAdminEvent(user.id, 'delete', 'category', id) to be awaited so the delete route waits for the audit log to complete (ensure the enclosing handler remains async and propagate or handle errors as appropriate).

- Verify each finding against the current code and only fix it if needed.

In @src/app/api/admin/categories/route.ts around lines 80 - 81, The call to logAdminEvent after createCategory is currently fire-and-forget; update the handler around logAdminEvent(user.id, 'create', 'category', category.id as string) to either await the promise (await logAdminEvent(...)) so audit logging completes before responding, or explicitly attach a .catch(...) to surface and log any errors (and optionally handle retries) to avoid silent failures and unhandled rejections; apply this change where createCategory and logAdminEvent are used together to ensure audit integrity.

- Verify each finding against the current code and only fix it if needed.

In @src/app/api/admin/listings/[id]/route.ts around lines 61 - 67, Replace the generic error response when listingUpdateSchema.safeParse(filtered) fails so API callers get the validation details: when parsed.success is false, return NextResponse.json with the validation error payload (e.g., parsed.error or parsed.error.flatten()) and a 400 status instead of the fixed 'Invalid listing data' message; update the block around listingUpdateSchema.safeParse / parsed.success / NextResponse.json to include those parsed error details for easier debugging.

- Verify each finding against the current code and only fix it if needed.

In @src/app/api/admin/listings/[id]/route.ts at line 107, The audit logging call logAdminEvent(user.id, 'delete', 'listing', id) lacks error handling; wrap or replace this invocation with the same pattern used earlier (awaiting the promise and catching errors) so failures don't crash the request: call await logAdminEvent(...) and add a .catch or try/catch that logs the error via processLogger.error with a descriptive message and the caught error details (include user.id and id in the message for context) to mirror the fix applied around the earlier logging at line 71.

- Verify each finding against the current code and only fix it if needed.

In @src/app/api/admin/listings/[id]/route.ts at line 71, The call to logAdminEvent(user.id, 'update', 'listing', id) is fire-and-forget and can cause unhandled promise rejections; either await it inside a try/catch or attach a .catch(...) handler to swallow/log errors. Locate the logAdminEvent invocation and change it to one of two approaches: 1) await logAdminEvent(...) inside a try { ... } catch (err) { processLogger.error(...) } if audit logging should be awaited, or 2) keep it non-blocking but add logAdminEvent(...).catch(err => processLogger.warn(...)) to mirror the sheets sync error handling pattern.

- Verify each finding against the current code and only fix it if needed.

In @src/app/api/admin/listings/route.ts around lines 99 - 105, The handler currently returns a generic "Invalid listing data" when listingCreateSchema.safeParse(allowed) fails; update the error response to include Zod's validation details from parsed.error (e.g., parsed.error.flatten() or parsed.error.format()) so the admin UI can show field-specific messages; keep the 400 status but return a JSON body like { error: 'Invalid listing data', details: <zod-details> } using the existing parsed variable and NextResponse.json.

- Verify each finding against the current code and only fix it if needed.

In @src/app/api/admin/listings/route.ts at line 109, The unhandled async call to logAdminEvent(user.id, 'create', 'listing', listing.id as string) can produce an unhandled rejection; either await it or handle errors like the sheets sync block does. Fix by either awaiting the call (await logAdminEvent(...)) if the audit must complete before responding, or keep it fire-and-forget but append a .catch(err => processLogger.error('logAdminEvent failed', err)) (or similar logger) to swallow/log errors; update the same call site (logAdminEvent) to follow the sheets sync error-handling pattern.

- Verify each finding against the current code and only fix it if needed.

In @src/app/api/admin/orders/[id]/route.ts around lines 111 - 115, The audit log call logAdminEvent(user.id, 'update', 'order', id, { status, tracking_info, notes }) is a floating promise and should be marked fire-and-forget like sendStatusEmail; prefix the call with void to suppress the unused-promise and align with the existing pattern (i.e., change the invocation to use void logAdminEvent(...)) so any potential unhandled rejection warnings are avoided while preserving the existing behavior.

- Verify each finding against the current code and only fix it if needed.

In @src/app/api/admin/products/[id]/route.ts around lines 99 - 100, The call to logAdminEvent is currently fire-and-forget; make it awaited so errors propagate and the audit write completes before responding. Update the handler where you call updateProduct(id, parsed.data) and logAdminEvent(user.id, 'update', 'product', id) to await logAdminEvent (or explicitly handle its Promise rejection), ensuring any thrown errors are caught by the surrounding try/catch and the response is sent only after the audit log completes.

- Verify each finding against the current code and only fix it if needed.

In @src/app/api/admin/products/[id]/route.ts around lines 132 - 134, The delete audit log is being fire-and-forget; update the code after calling deleteProduct(id) to await logAdminEvent(user.id, 'delete', 'product', id) before returning the response so the audit entry is written reliably; ensure any surrounding function is async and handle or rethrow errors from logAdminEvent consistently (i.e., await logAdminEvent(...) and only then call NextResponse.json({ success: true })).

- Verify each finding against the current code and only fix it if needed.

In @src/app/api/admin/products/route.ts around lines 139 - 145, The response for invalid product data currently returns a generic message; update the error handling after productCreateSchema.safeParse(allowed) to include parsed.error (the Zod validation details) in the NextResponse.json payload so API consumers get the validation failures (keep the 400 status). Locate the safeParse usage and the branch that checks parsed.success and replace the generic error body with one that includes parsed.error (or parsed.error.flatten()/format as appropriate) while preserving the NextResponse.json call and status code.

- Verify each finding against the current code and only fix it if needed.

In @src/app/api/admin/products/route.ts around lines 151 - 152, The call to logAdminEvent(user.id, 'create', 'product', product.id as string) is not awaited which can lead to unhandled promise rejections or the audit log not being persisted before response; update the code to either await the async function (await logAdminEvent(...)) so errors propagate into the surrounding try/catch and ensure persistence, or if intentional fire-and-forget, append a .catch(...) handler to log/report errors (e.g., logAdminEvent(...).catch(err => /_ handle _/)) so rejections are handled; modify the invocation of logAdminEvent in the create-product flow accordingly.

- Verify each finding against the current code and only fix it if needed.

In @src/app/api/auth/resolve-username/route.ts around lines 12 - 15, The code assigns 'unknown' to ip when no x-forwarded-for/x-real-ip is present, causing shared rate-limit buckets; update the logic around the ip variable in route.ts: explicitly detect the fallback (the place where ip is set via request.headers.get('x-forwarded-for')/('x-real-ip')), and either (a) log the event with context (use processLogger.warn or console.warn mentioning the route and headers) before proceeding, or (b) for this sensitive auth endpoint, reject requests lacking a reliable IP by returning an error response (e.g., new Response with 400/429) so they don't share the 'unknown' bucket — implement one of these behaviors and ensure the log/rejection references the same ip-detection code path.

- Verify each finding against the current code and only fix it if needed.

In @src/app/api/auth/resolve-username/route.ts around lines 39 - 40, The catch block that currently swallows all exceptions and returns NextResponse.json({ status: 'received' }) should log the caught error before returning; update the catch in the route handling resolveUsername to capture the error (e) and call the server-side structured logger if available (or console.error as fallback) with a clear message (e.g., "resolveUsername error") and the error object, then return the same NextResponse.json({ status: 'received' }); ensure you reference the catch around the resolveUsername call and the NextResponse.json return so the change is applied in the correct handler.

- Verify each finding against the current code and only fix it if needed.

In @src/app/api/auth/signin/route.ts around lines 14 - 16, The 429 response currently returned by NextResponse.json when (!success) lacks a Retry-After header; update the response in route.ts to include a Retry-After header (either a seconds value or an HTTP-date) so clients know when to retry. Locate the block that checks the success variable and replace the NextResponse.json call to include headers: { 'Retry-After': '<seconds-or-http-date>' } (or compute the seconds from your rate limiter / reset time if available) while keeping the status: 429.

- Verify each finding against the current code and only fix it if needed.

In @src/app/api/auth/signin/route.ts around lines 32 - 35, The code trims the identifier into the variable email but doesn't lowercase it; update the sign-in handler so when isEmail(identifierTrim) is true you normalize to lowercase (e.g., set email = identifier.trim().toLowerCase()) before further processing or passing to Supabase. Adjust uses of the existing email variable (and any downstream calls that rely on it) to use the normalized value; reference the identifier variable, the isEmail(...) check, and the email variable in route.ts.

- Verify each finding against the current code and only fix it if needed.

In @src/app/api/email/send/route.ts around lines 62 - 65, The call to sanitize uses an unnecessary TypeScript cast ("as string") on subject even though subject has already been runtime-validated as a string; remove the redundant cast so replace sanitize(subject as string, ...) with sanitize(subject, ...). Ensure the surrounding validation that checks typeof subject === 'string' remains so subject is narrowed before calling sanitize (refer to the subject variable and sanitizedSubject assignment using sanitize).

- Verify each finding against the current code and only fix it if needed.

In @src/app/api/email/send/route.ts around lines 58 - 61, The code uses sanitize(to as string, ...) which only strips HTML rather than validating addresses; replace this by validating the incoming to variable (already checked typeof to === 'string') with a proper email check (e.g., validator.js isEmail or a well-tested regex) and remove the unnecessary "as string" cast and the sanitizedTo variable; if validation passes, pass the original to directly into sendEmail, otherwise return a 400 error — update the logic around the to/sanitizedTo usage and references to sanitizedTo/sendEmail in route.ts accordingly.

- Verify each finding against the current code and only fix it if needed.

In @src/app/api/newsletter/route.ts around lines 12 - 19, The current fallback 'unknown' for ip creates a shared rate-limit bucket; change the logic in route handler around the ip variable and rateLimiter.limit so requests without a trustworthy client IP are not collapsed: either return an error (e.g., respond with 400/500) when both request.headers.get('x-forwarded-for') and request.headers.get('x-real-ip') are absent, or build a more unique fallback fingerprint (e.g., combine user-agent, accept headers, and a short hash or request-specific nonce) before calling rateLimiter.limit(ip); also ensure upstream proxy behavior is assumed secure by adding a comment and verifying the proxy strips client-supplied x-forwarded-for to prevent header spoofing.

- Verify each finding against the current code and only fix it if needed.

In @src/app/api/orders/route.ts around lines 73 - 89, The current code awaits getOrderById and then awaits sendOrderConfirmation which can throw and cause a 500 after order creation; change this so the HTTP response uses the created order immediately and any email lookup/send logic is isolated: wrap getOrderById in a try/catch (reference getOrderById and fullOrder) and if it fails fall back to using the minimal order data (order and order.id) for email preparation, then call sendOrderConfirmation asynchronously without awaiting the result (or await in a try/catch but do not propagate errors) and log errors instead of letting them bubble up; ensure the route handler returns success based on the created order before any email errors.

- Verify each finding against the current code and only fix it if needed.

In @src/app/api/payments/mpesa/stkpush/route.ts around lines 14 - 24, The code authenticates the user (getUser) but never verifies that the provided orderId belongs to that user; fetch the order using your order lookup (e.g., import getOrderById from @data/orders), call getOrderById(orderId) after parsing request.json, check that the order exists and that order.userId (or the correct owner field) === user.id, and if not return a 403/Unauthorized JSON response before proceeding with rateLimiter.limit or initiating the STK push; also handle a missing order with a 404 response.

- Verify each finding against the current code and only fix it if needed.

In @src/app/api/payments/paypal/capture/route.ts around lines 28 - 55, Duplicate security validation logic (order existence, status, and amount check) is present in both the POST capture handler and the GET handler; extract it into a shared async helper (e.g., validateOrderForCapture) that accepts orderId and capturedUsd and returns either { order } or { error, status }; inside the helper call getOrderById, check order.status !== 'pending', compute expectedUsd using kesToUsd(order.deposit_amount_kes ?? 0) and compare with capturedUsd using AMOUNT_TOLERANCE_USD, and replace the duplicated blocks in both handlers with calls to this helper and early-return NextResponse.json using the helper's error/status when present.

- Verify each finding against the current code and only fix it if needed.

In @src/app/api/payments/paypal/capture/route.ts around lines 44 - 55, The amount check currently compares expectedUsd and capturedUsd but doesn't validate currency; update the PayPal capture handling (where expectedUsd, capturedUsd, capturedAmount, AMOUNT_TOLERANCE_USD and orderId are used) to first assert capturedAmount?.currency_code === 'USD' (or reject if missing/different), log a clear security error including capturedAmount.currency_code and orderId, and return the same 400 JSON response when the currency is not USD before proceeding to the numeric tolerance comparison.

- Verify each finding against the current code and only fix it if needed.

In @src/app/api/payments/paypal/capture/route.ts around lines 147 - 157, Before comparing amounts in the redirect handler, verify the currency on capturedAmount: check capturedAmount?.currency_code === 'USD' and if not log a security message and return the same NextResponse.redirect to '/checkout?error=amount_mismatch' (use existing variables capturedAmount, capturedUsd, expectedUsd, AMOUNT_TOLERANCE_USD, orderId, request.url). Do this check immediately before the Math.abs comparison so any non-USD capture triggers the redirect and logging consistent with the POST handler behavior.

- Verify each finding against the current code and only fix it if needed.

In @src/app/api/payments/paypal/capture/route.ts at line 174, Replace the duplicate parseFloat call and use the already-computed capturedUsd value when building the amount object: locate the code that sets amount: parseFloat(capturedAmount?.value ?? '0') inside the capture route handler and change it to use capturedUsd so the amount uses the previously-parsed capturedUsd variable (ensuring types align or convert if necessary) to avoid duplicated parsing and keep logic consistent with the earlier parsing at line where capturedUsd is computed.

- Verify each finding against the current code and only fix it if needed.

In @src/components/auth/signinForm.tsx around lines 40 - 45, The response body from res.json() is used without validation, so destructuring access_token/refresh_token can yield undefined and cause supabase.auth.setSession to fail; update the sign-in logic to inspect the parsed JSON (from res.json()) for an expected shape and any error fields before calling createClient()/supabase.auth.setSession: verify access_token and refresh_token are present (and optionally non-empty strings), handle an error wrapper or missing fields by returning/throwing the intended generic error message, and only call supabase.auth.setSession when both tokens are valid.

- Verify each finding against the current code and only fix it if needed.

In @src/components/auth/signinForm.tsx around lines 53 - 58, The catch block currently calls setLoading(false) only on failure and swallows errors, so if router.push or router.refresh throws the loading state can remain true; update the sign-in flow (around router.push, router.refresh, setError, setLoading) to ensure setLoading(false) always runs on completion (use a finally-style path or call setLoading(false) after both push/refresh) and surface or log navigation errors instead of silently swallowing them (e.g., rethrow or log the caught error before setting setError).

- Verify each finding against the current code and only fix it if needed.

In @src/components/checkout/paypalPayment.tsx around lines 159 - 161, The UI in the PayPalPayment component (src/components/checkout/paypalPayment.tsx / PayPalPayment) does not display the deposit amount; update the component to fetch or accept the order amount (e.g., add an amount or order prop or read from the checkout context/order state used elsewhere) and render a display-only, formatted currency string next to the existing notice (the <p> with className 'text-sm text-pedie-text-muted'). Ensure the value is formatted using the app's locale/currency formatter (or a utility like formatCurrency) and does not affect payment logic — this is purely display-only so the PayPal call (e.g., createOrder or onApprove handlers) still uses the authoritative amount.

- Verify each finding against the current code and only fix it if needed.

In @src/lib/data/admin.ts around lines 18 - 34, The three hardcoded constant arrays conditionGrades, listingStatuses, and listingTypes duplicate DB enum values and risk drifting; replace them with a single-source-of-truth by either (a) importing/generated types from your DB client (e.g., use Prisma's generated enum types or a DB-metadata fetch like getEnumValues('condition_grades')) and build these arrays from that source at module initialization, or (b) if you cannot derive them at runtime, add a clear TODO comment above each constant noting they must match the DB enums and add a runtime assertion/test that queries the DB enum values and fails CI if they differ (implement as assertEnumMatchesDb('condition_grades', conditionGrades), etc.) so conditionGrades, listingStatuses, and listingTypes remain consistent with the schema.

- Verify each finding against the current code and only fix it if needed.

In @src/lib/data/admin.ts around lines 36 - 82, The exported Zod schemas (productCreateSchema, listingCreateSchema, categoryCreateSchema, etc.) are not used to validate inputs in CRUD functions—createListing, createProduct, createCategory, and their update counterparts—so unvalidated Record<string, unknown> data is cast directly to Insert types; fix by either (A) performing runtime validation inside each function (e.g., const validated = listingCreateSchema.parse(data) / productCreateSchema.parse(data) / categoryCreateSchema.parse(data) before building the Insert payload) or (B) tighten the function signatures to accept z.infer<typeof listingCreateSchema> / z.infer<typeof productCreateSchema> / z.infer<typeof categoryCreateSchema> (and their .partial() variants for updates) so callers provide typed/validated input; apply this consistently for create*/update* functions mentioned.

- Verify each finding against the current code and only fix it if needed.

In @src/lib/data/audit.ts around lines 35 - 40, The catch block in src/lib/data/audit.ts uses a redundant cast "(err as Error)" after an "err instanceof Error" check; update the error logging in the catch handler to remove the unnecessary cast so it reads the narrowed property directly (e.g., use err.message when instanceof Error, otherwise log err) and keep the existing console.error call and message text intact to preserve behavior.

- Verify each finding against the current code and only fix it if needed.

In @src/lib/data/orders.ts around lines 40 - 53, The mapped construction for resolvedItems can produce a null unitPrice if both listing.sale_price_kes and listing.price_kes are null and it unsafely casts listing.product; update the input.items.map callback (resolve via resolvedItems/listingMap/unitPrice/calculateDeposit/productName) to validate unitPrice is present before using it (either throw a clear error or provide a safe fallback), and replace or annotate the unsafe cast of listing.product with a short comment explaining the Supabase join type mismatch or a proper runtime check that ensures product has a name string (e.g., guard for listing.product && typeof listing.product.name === 'string') so downstream calculations and product_name are always safe.

- Verify each finding against the current code and only fix it if needed.

In @src/lib/data/orders.ts around lines 20 - 36, The code in src/lib/data/orders.ts should handle empty input.items and duplicate listing_ids: before calling supabase.in, validate input.items and throw or return early if it's empty; build listingIdsUnique = Array.from(new Set(input.items.map(i => i.listing_id))) and use listingIdsUnique in the .in('id', listingIdsUnique) query; after fetching, compare listings.length to listingIdsUnique.length and compute missing by checking listingIdsUnique against the fetched ids (e.g., const found = new Set(listings?.map(l => l.id) ?? []) and const missing = listingIdsUnique.filter(id => !found.has(id))); keep the existing listingError handling unchanged.

- Verify each finding against the current code and only fix it if needed.

In @src/lib/email/templates.ts around lines 8 - 11, The sanitize function is using sanitizeHtml which strips tags (causing data loss like "John <Developer>" → "John "), so replace its implementation to perform HTML entity encoding instead (e.g., use a dedicated encoder such as the he library or an escapeHtml helper) and then restore all calls that used sanitize(...) to rely on this encoder; specifically update the sanitize(str: string) function to call he.encode(str, { useNamedReferences: true }) or an equivalent escapeHtml implementation so special characters are converted to entities rather than removed, keeping the function name sanitize and ensuring allowedTags/allowedAttributes logic is removed.

- Verify each finding against the current code and only fix it if needed.

In @src/lib/security/rateLimit.ts at line 9, Add a JSDoc block above the exported function createRateLimiter describing its purpose (to create a rate limiter instance), document the parameters (prefix: string and config: RateLimitConfig) including what fields of RateLimitConfig are expected/used, and state the return type/behavior (what type is returned and how it should be used). Make the JSDoc include @param entries for prefix and config, an @returns describing the returned limiter object or function, and any @throws or side‑effects notes if applicable so consumers and IDEs get proper docstrings for createRateLimiter and RateLimitConfig.

- Verify each finding against the current code and only fix it if needed.

In @src/lib/security/rateLimit.ts around lines 14 - 16, The current permissive fallback logs a console.warn using the `prefix` variable and allows all requests when Upstash is not configured; change this to fail loudly in production by checking `process.env.NODE_ENV === 'production'` and throw an Error (or call `process.exit(1)`) instead of the silent `console.warn` inside the rate limiter initialization (the block referencing `prefix`), while keeping the permissive warning only for non-production (development/test) environments so you still allow local workarounds.

- Verify each finding against the current code and only fix it if needed.

In @src/lib/security/rateLimit.ts around lines 13 - 26, The fallback returned when Upstash is unconfigured only implements limit(), causing runtime errors if callers expect other Ratelimit methods; update the fallback to match the expected shape by either declaring and returning a narrower explicit interface type used by callers (e.g., MyRateLimiter with only limit and any other actually-used helpers) or stub the additional Ratelimit methods (e.g., blockUntilReady, resetUsedTokens) alongside limit so consumers won't fail; locate the return in the url/token check around the limit: async (\_identifier: string) => ... and add the missing methods (or change the function's return type) to ensure the stub matches the symbols used by callers (limit, blockUntilReady, resetUsedTokens, etc.).

- Verify each finding against the current code and only fix it if needed.

In @src/proxy.ts around lines 38 - 42, The CSP string lacks a default-src fallback; update the baseCsp construction (and related CSP variables scriptSrc/imgSrc if you prefer consistency) to include "default-src 'self'" (e.g., prepend or append it to baseCsp) so any unspecified resource types inherit a safe default. Locate the variables nonce, isDev, supabaseUrl, scriptSrc, imgSrc and modify baseCsp to include default-src 'self' alongside the existing directives, ensuring the final CSP string still concatenates imgSrc and other directives correctly.

- Verify each finding against the current code and only fix it if needed.

In @supabase/migrations/20250801000000_security_hardening.sql around lines 31 - 34, The migration mixes unrelated changes: the ALTER TABLE public.newsletter_subscribers ADD COLUMN subscribed boolean NOT NULL DEFAULT true belongs in its own migration rather than the security hardening migration; split the changes so keep the trigger/security-related statements in the existing 20250801000000_security_hardening.sql and move the ADD COLUMN subscribed statement into a new migration file (e.g., 20250801000001_newsletter_subscribed.sql), preserving the NOT NULL DEFAULT true clause and adding appropriate up/down (apply/revert) logic for the new migration so rollbacks can target the column change independently.

- Verify each finding against the current code and only fix it if needed.

In @supabase/migrations/20250801000000_security_hardening.sql around lines 26 - 29, The trigger declaration uses an unqualified function reference; update the trigger and the function creation to explicitly qualify the function with the schema (e.g., use public.enforce_role_immutability() in the EXECUTE FUNCTION clause) and ensure the function definition itself is created as public.enforce_role_immutability to match the public.profiles table and avoid search_path ambiguity; locate the CREATE TRIGGER enforce_role_immutability and the CREATE FUNCTION enforce_role_immutability definitions and add the public. schema prefix to both.

- Verify each finding against the current code and only fix it if needed.

In @supabase/migrations/20250802000000_admin_log.sql at line 6, The admin_log migration adds actor_id as "actor_id uuid REFERENCES public.profiles(id)" which uses default NO ACTION; change the FK to allow deleting profiles without blocking audit rows by updating the column/constraint to include ON DELETE SET NULL (e.g., alter the actor_id definition or add a named FOREIGN KEY constraint on admin_log(actor_id) referencing public.profiles(id) ON DELETE SET NULL) so actor_id becomes NULL when the referenced profile is removed.

- Verify each finding against the current code and only fix it if needed.

In @tests/api/newsletter.test.ts around lines 59 - 67, The tests 'should reject missing email' and 'should reject invalid email format' currently only assert HTTP 400; update each test to parse the response body from POST(jsonBody(...)) (using the existing POST helper) and assert the error structure is present and consistent — e.g., expect(data.error).toBeDefined() or expect(data.errors).toContainEqual(expect.objectContaining({ message: expect.any(String) })) depending on the API shape — so the tests validate both status code and error message shape for missing/invalid email.

- Verify each finding against the current code and only fix it if needed.

In @tests/api/newsletter.test.ts around lines 32 - 41, Add an assertion that the upsert call receives the expected payload to ensure the email and any required fields are passed correctly: after invoking POST(jsonBody({ email: 'user@example.com' })) and before checking mockFrom, assert mockUpsert was called with an object containing the email 'user@example.com' (and other expected fields if any) and the appropriate table/context; reference the mockUpsert spy used in this test and the POST/jsonBody helpers so you validate the actual argument shape sent to the upsert.

- Verify each finding against the current code and only fix it if needed.

In @tests/app/api/admin/categories.test.ts around lines 18 - 20, The audit mock for logAdminEvent is created inline and never reset, causing state to leak between tests; update the mock setup so the mock function is assigned to a reusable identifier (e.g., mockLogAdminEvent or a typed jest.Mock reference for logAdminEvent created by mock.module) and add a beforeEach hook that calls mockReset/mockClear on that identifier (call mockLogAdminEvent.mockReset() or (logAdminEvent as jest.Mock).mockReset()) to ensure call counts/args are cleared before each test.

- Verify each finding against the current code and only fix it if needed.

In @tests/app/api/admin/listings.test.ts around lines 18 - 20, The inline mock for logAdminEvent should be captured so tests can assert calls: change the mock.module call that currently returns { logAdminEvent: mock() } to create a named mock (e.g., const mockLogAdminEvent = mock() and return { logAdminEvent: mockLogAdminEvent }) and export or capture that variable in the test scope; then replace assertions that rely on side effects with explicit expectations like expect(mockLogAdminEvent).toHaveBeenCalledWith(expect.objectContaining({ action: 'listing.create' })) for create/update/delete flows using the logAdminEvent symbol to locate the mock.

- Verify each finding against the current code and only fix it if needed.

In @tests/app/api/admin/products.test.ts around lines 18 - 20, The inline mock for logAdminEvent inside the mock.module call makes it hard to assert calls later; extract the mock into a named variable (e.g., mockLogAdminEvent) above the mock.module invocation and return that variable from the mock.module factory so tests can import or reference mockLogAdminEvent and assert on its calls; update the mock.module('@lib/data/audit', ...) to use the extracted mock variable and replace any inline references to logAdminEvent with the named mock when writing assertions.

- Verify each finding against the current code and only fix it if needed.

In @tests/app/api/admin/validation.test.ts around lines 85 - 96, Update the test to assert that the mocked createProduct was called with the expected payload: after calling productsPost (using jsonReq), add an expectation that mockCreateProduct was invoked once and with an object containing brand_id: 'brand-1', name: 'iPhone 15', description: 'Great phone' (and any other required fields), so the test not only checks res.status but also verifies that productsPost actually forwarded the correct data to createProduct.

- Verify each finding against the current code and only fix it if needed.

In @tests/app/api/admin/validation.test.ts around lines 75 - 83, The test duplicates a dynamic import for listingCreateSchema even though listingCreateSchema is already in scope (from line 23); remove the line "const { listingCreateSchema } = await import('@data/admin')" from the test and use the existing listingCreateSchema variable directly in the safeParse call so the test relies on the in-scope mock export rather than re-importing.

- Verify each finding against the current code and only fix it if needed.

In @tests/app/api/auth/signin.test.ts around lines 43 - 139, Add edge-case tests to the existing POST /api/auth/signin suite: create new tests that call POST(jsonBody(...)) using the same helpers to assert behavior when (1) identifier is missing (send { password: '...' }) and when (2) password is missing (send { identifier: '...' }) asserting the handler returns a 400 and a clear error message, (3) simulate resolveUsername failing by setting mockResolve.mockResolvedValueOnce(null) for a username input and assert the handler returns the expected error (e.g., 400 and "Invalid credentials" or a specific message your handler uses), and (4) send an invalid identifier format (neither email nor username) and assert a 400 and relevant error; use the existing symbols POST, jsonBody, mockResolve, mockSignIn and mirror the style of the other tests so they run inside the same describe block and beforeEach setup.

- Verify each finding against the current code and only fix it if needed.

In @tests/app/api/auth/signin.test.ts around lines 72 - 92, Add an assertion that the username resolution function was invoked in the "authenticates with username" test: after calling POST(jsonBody({ identifier: 'johndoe', password: 'pass123' })) and before/after the token assertions, add an expectation that mockResolve was called (e.g., expect(mockResolve).toHaveBeenCalledWith('johndoe') or expect(mockResolve).toHaveBeenCalledTimes(1)) so the username-to-email resolution path (mockResolve) is actually exercised.

- Verify each finding against the current code and only fix it if needed.

In @tests/app/api/email-send.test.ts around lines 1 - 92, Replace the brittle source-text assertions in the current tests with behavioral tests that import and call the POST handler (POST from '@/app/api/email/send/route') and use mock.module() to stub dependencies: mock getUser and isAdmin from '@helpers/auth', isEmailConfigured and sendEmail from '@lib/email/gmail', and createRateLimiter (and its limiter.limit) from '@lib/security/rateLimit'; then write focused cases that assert HTTP responses (401 for unauthenticated, 403 for non-admin, 400 for invalid body, 503 when email not configured, 429 when rate-limited) and that sendEmail is invoked with sanitized to/subject and the raw html (e.g., expect(mockSendEmail).toHaveBeenCalledWith(sanitizedTo, sanitizedSubject, html)). Ensure mocks are reset in beforeEach and tests construct real Request objects to call POST.

- Verify each finding against the current code and only fix it if needed.

In @tests/app/api/orders-route.test.ts around lines 94 - 171, Add a test in tests/app/api/orders-route.test.ts that ensures unauthenticated requests are rejected: set mockGetUser.mockResolvedValue(null), call POST(makeRequest(validBody)) and assert the response status is 401 (or 403 if your app uses that). Place this alongside the other tests in the same describe block and reference the existing helpers (mockGetUser, POST, makeRequest, validBody) so the test mirrors the authenticated cases but expects an unauthorized response.

- Verify each finding against the current code and only fix it if needed.

In @tests/app/api/orders-route.test.ts around lines 126 - 170, Update the listed validation tests (the ones using POST(makeRequest(body)) such as "rejects items without listing_id", "rejects items with non-positive quantity", "rejects empty items array", "rejects missing shippingAddress", and "rejects missing paymentMethod") to also assert the error response body instead of only status; after calling POST(makeRequest(body)) and asserting res.status === 400, add an assertion that res.body (or the response JSON returned by POST) contains an error payload (e.g., hasOwnProperty('error') and the expected message or key) so the tests verify the exact error shape/content produced by the validation logic invoked via mockGetUser, POST, and makeRequest.

- Verify each finding against the current code and only fix it if needed.

In @tests/app/api/orders-route.test.ts around lines 27 - 34, Remove the unused mocks to reduce noise: delete the mock declaration mockGetOrderById and remove the keys getOrderById, getOrdersByUser, updateOrderStatus, and getOrderByPaymentRef from the mock.module call (or keep a short inline comment if they are intentionally reserved for future tests), and also remove any corresponding cleanup in beforeEach that references those mocks so only mocks used by the tests (e.g., createOrder) remain.

- Verify each finding against the current code and only fix it if needed.

In @tests/app/api/paypal-capture.test.ts around lines 82 - 88, Add tests to cover error/edge cases around the PayPal flows: in the existing describe('POST /api/payments/paypal/capture (amount verification)') suite add tests that call the POST handler with a missing paypalOrderId and with invalid paypalOrderId and assert the handler returns the expected 4xx validation response; add a test that simulates mockCapturePayPalPayment rejecting (use mockCapturePayPalPayment.mockRejectedValueOnce(...)) and assert the endpoint responds with a 5xx or propagated error response and that mockUpdateOrderStatus is not called; also add a separate test for the GET path that omits the token query parameter and assert the handler returns the expected 4xx error. Use the existing mocks mockGetOrderById, mockUpdateOrderStatus, mockCapturePayPalPayment and reset them in beforeEach as already done.

- Verify each finding against the current code and only fix it if needed.

In @tests/app/api/paypal-capture.test.ts around lines 159 - 176, The mock capture object in the test "does not update status for non-COMPLETED captures" is missing the amount.currency_code field, causing inconsistency with other tests; update the mock returned by mockCapturePayPalPayment in that test to include currency_code (or replace the inline object with the shared helper makeCaptureResult) so the structure matches other tests and the handler sees the expected shape; ensure the test still asserts status 'PENDING' and that mockUpdateOrderStatus was not called.

- Verify each finding against the current code and only fix it if needed.

In @tests/app/api/paypal-capture.test.ts around lines 159 - 176, The test "does not update status for non-COMPLETED captures" is missing an explicit mockGetOrderById setup, which can make the test fragile if the handler validates order existence first; update the test to stub mockGetOrderById (the same mock used elsewhere in this suite) to return a representative order object (e.g., with id/order number and current status) before calling POST(makeRequest(...)) so the handler proceeds to the capture-status logic and you can reliably assert that mockUpdateOrderStatus is not called when mockCapturePayPalPayment returns status 'PENDING'.

- Verify each finding against the current code and only fix it if needed.

In @tests/app/api/paypal-create.test.ts around lines 158 - 171, Add a new test that mirrors the zero-deposit case but uses a negative deposit_amount_kes to ensure the route rejects negative amounts: create a test named like 'rejects negative deposit amount' that calls mockGetOrderById.mockResolvedValue with deposit_amount_kes: -100 (and same id/status/user_id/items), then invoke POST(makeRequest({ orderId: 'order-123' })), assert res.status is 400 and that the parsed JSON error equals 'Order deposit amount must be positive'; use the same helpers (mockGetOrderById, POST, makeRequest) as in the existing zero-deposit test so it runs alongside it.

- Verify each finding against the current code and only fix it if needed.

In @tests/app/api/paypal-create.test.ts around lines 58 - 172, Add tests that cover PayPal API failure paths by mocking mockCreatePayPalOrder to (1) reject (mockRejectedValue(new Error('PayPal error'))) and (2) resolve to a non-successful PayPal response (e.g., status !== 'CREATED' or missing approval link). Use the existing POST helper and makeRequest to call the route, then assert the response is not 200 and that res.json() contains an error field (and appropriate status code like 5xx or mapped client error), referencing mockCreatePayPalOrder, POST, and makeRequest so the new tests mirror the style of the other cases in this file.

- Verify each finding against the current code and only fix it if needed.

In @tests/app/api/paypal-create.test.ts around lines 116 - 132, The tests "rejects if order is not pending" and "rejects if orderId is missing" only assert status 400; update each test to also assert the response error message/body for the specific failure so they fail if a different 400 reason is returned — e.g., after calling POST(makeRequest(...)) inspect res.json() or res.body and assert the expected error string or error code for the "order not pending" case (where mockGetOrderById returns status 'confirmed') and for the "missing orderId" case; use the existing helpers POST() and makeRequest() and the mocked mockGetOrderById to locate and modify the two tests.

- Verify each finding against the current code and only fix it if needed.

In @tests/app/proxy.test.ts around lines 23 - 46, The tests under tests/app/proxy.test.ts rely on brittle string-inspection of src/proxy.ts; add a behavioral test that calls the exported proxy middleware/function (proxy) with a mocked Request/Response or a minimal Next.js-like req/res mock to assert actual response headers (Content-Security-Policy, Strict-Transport-Security, and absence of X-XSS-Protection) are set and that a nonce header (x-csp-nonce) is present; update or replace one of the existing string-based tests to use this runtime assertion against proxy() so the test validates header behavior rather than source text.

- Verify each finding against the current code and only fix it if needed.

In @tests/app/proxy.test.ts around lines 48 - 52, The test "should add unsafe-eval only in development" currently only checks for two independent strings; update it to assert their conditional relationship by reading src/proxy.ts (as done via readFileSync) and verifying that "'unsafe-eval'" appears inside the same development-guarded block—for example assert that the source contains a conditional that checks for development (e.g. an if or ternary using process.env.NODE_ENV or the literal "development") and that "'unsafe-eval'" occurs within that conditional body or block; adjust the test assertion to use a targeted regex or substring check that ensures "'unsafe-eval'" is nested inside the development conditional rather than merely present anywhere.

- Verify each finding against the current code and only fix it if needed.

In @tests/lib/data/audit.test.ts around lines 13 - 28, Update the tests for logAdminEvent to assert that the mocked insert function is called with the correct arguments: spy or mock the insert method used by logAdminEvent, call logAdminEvent in each test case (the create, fire-and-forget, and sync cases) and add expectations that insert was invoked with the expected payload shape (including userId, action, resource, resourceId, metadata/timestamp/any defaults) or not invoked when appropriate; reference the logAdminEvent call sites in the tests and the mocked insert function name used in the test harness to locate where to add expect(insertMock).toHaveBeenCalledWith(...) assertions.

- Verify each finding against the current code and only fix it if needed.

In @tests/lib/data/audit.test.ts around lines 20 - 22, The test "should not throw on insertion failure (fire-and-forget)" currently uses the global mock that returns { error: null }, so it doesn't simulate failure; update this test to simulate an insertion error by replacing or overriding the global mock for this case (e.g., restore and re-mock or use a test-specific mock) so the underlying storage call (the mocked function used by logAdminEvent) returns an error object/throw, then assert that calling logAdminEvent('user-1','create','product') does not throw; reference the function under test logAdminEvent and the mocked storage/fetch function used in the tests to locate and change the mock behavior.

- Verify each finding against the current code and only fix it if needed.

In @tests/lib/data/orders.test.ts around lines 28 - 54, The current unit test 'does not include client-supplied pricing fields' is tautological because it constructs a CreateOrderInput without pricing keys then asserts they are absent; replace it with a meaningful check: either delete this runtime test, or convert it into a type-level assertion that ensures CreateOrderInput's item type disallows pricing fields (create a test named like 'CreateOrderInput items do not accept pricing fields' that attempts to assign an object containing unit_price_kes/deposit_kes/product_name to CreateOrderInput['items'][number] and use a TypeScript compile-time assertion (e.g., // @ts-expect-error) so the build fails if those fields become allowed). Ensure to reference the existing test name and the CreateOrderInput type when making the change.

- Verify each finding against the current code and only fix it if needed.

In @tests/lib/email/send.test.ts around lines 66 - 68, The current test only checks string order of isEmailConfigured() vs sendEmail() which doesn't verify control flow; update the test to mock/spyon the isEmailConfigured function to return false and assert that sendEmail is not invoked (and add a complementary case where isEmailConfigured returns true to assert sendEmail is called). Locate the assertions around isEmailConfigured and sendEmail in send.test.ts, replace the string index comparison with a behavioral test that uses your test framework's mocking/spying utilities (e.g., jest.spyOn or jest.mock) to stub isEmailConfigured and assert call counts on sendEmail.

- Verify each finding against the current code and only fix it if needed.

In @tests/lib/email/send.test.ts around lines 1 - 5, Replace the source-text assertions in tests/lib/email/send.test.ts with behavioral tests using Bun's mocking utilities: use mock.module() to stub the '@lib/email/gmail' exports (mock sendEmail and isEmailConfigured), import sendWelcomeEmail from '@lib/email/send' after setting up the mock, and write tests that assert runtime behavior (e.g., when isEmailConfigured returns true sendEmail is called, when it returns false sendEmail is not called, and failures from sendEmail do not throw). Also add beforeEach to call mockClear on the mock functions between tests so state is reset; reference the symbols sendWelcomeEmail, sendEmail, isEmailConfigured, mock.module, mock, beforeEach, and mockClear to locate where to change the test.

- Verify each finding against the current code and only fix it if needed.

In @tests/lib/email/send.test.ts around lines 44 - 54, The regex in the tests (used against sendSource and assigned to fnMatch) incorrectly uses a non-greedy [\\s\\S]\*? up to `\\n\\}` which stops at the first inner `}` and yields partial function bodies; replace this approach by locating the function start (match `export async function ${fn}`) then programmatically scan from the opening `{` to find the corresponding closing `}` by counting braces so nested blocks are handled, and use that full slice for the assertions (update the tests named "is wrapped in try/catch" and the similar assertions covering the other ranges to use this brace-counting extraction instead of the non-greedy regex).

- Verify each finding against the current code and only fix it if needed.

In @tests/lib/email/templates.test.ts around lines 88 - 96, The test for deliveryConfirmationEmail only asserts the subject; update the test for deliveryConfirmationEmail to also assert returned HTML/body contains expected user/order details (e.g., userName 'Eve' and orderId 'ORD-400') and add XSS-safety assertions by passing a malicious input string (e.g., with <script> or angle brackets) for userName/orderId and asserting those characters are properly escaped or not executed in the HTML output; target the deliveryConfirmationEmail function and its returned properties (subject, html or body) when adding these assertions.

- Verify each finding against the current code and only fix it if needed.

In @tests/lib/email/templates.test.ts around lines 98 - 106, The orderCancelledEmail test only asserts the subject; update tests for orderCancelledEmail to also assert that the rendered HTML contains the provided userName (e.g., "Frank") and add an XSS protection test that supplies a malicious userName (e.g., containing <script> or HTML) and asserts the output HTML safely escapes/does not include raw script; locate and update the describe('orderCancelledEmail') block and the orderCancelledEmail call to add these two assertions so coverage and XSS checks mirror other template tests.

- Verify each finding against the current code and only fix it if needed.

In @tests/lib/email/templates.test.ts around lines 63 - 67, The test for paymentConfirmationEmail is missing assertions for userName and amount; update the test that calls paymentConfirmationEmail(data) to also assert that result.html contains the expected userName and the amount (or the formatted amount used by the template). Specifically, in the same test that checks result.subject and receiptNumber, add checks like asserting result.html includes data.userName and data.amount (or the template's formatted string) so paymentConfirmationEmail and its rendering of userName/amount are covered.

- Verify each finding against the current code and only fix it if needed.

In @tests/lib/email/templates.test.ts around lines 78 - 86, Add assertions to the shippingUpdateEmail test to check that the returned HTML contains the supplied userName (e.g., verify result.html includes 'Dan') and add an XSS sanitization case for shippingUpdateEmail where you pass a malicious userName containing script tags and assert the output HTML does not include raw "<script>" content (or that the script is escaped/removed) similar to other template tests; update the test block for shippingUpdateEmail and use the shippingUpdateEmail(...) call and result.subject/result.html properties to perform these checks.

- Verify each finding against the current code and only fix it if needed.

In @tests/lib/security/rate-limit.test.ts around lines 39 - 59, The test currently uses the global mock.module() so deleting UPSTASH env vars doesn't exercise the real fallback in createRateLimiter; update the test to actually import and exercise the production factory instead of the mock: either move this case into a new integration test file (e.g., tests/lib/security/rate-limit.integration.test.ts) that deletes UPSTASH_REDIS_REST_URL/TOKEN in beforeAll, does a fresh dynamic import of the real module to call createRateLimiter('fallback-test', {...}) and asserts limiter.limit('any-id') returns success, or refactor the production code to expose an internal factory that you can import directly and test without the env-check wrapper; also restore env vars in afterAll.

- Verify each finding against the current code and only fix it if needed.

In @tests/lib/security/rls-role-protection.test.ts around lines 16 - 36, Consolidate the repeated assertions into a single structural test and remove duplicates from the other tests: create one test (e.g., "should contain trigger structure") that asserts the common fragments ('NEW.role IS DISTINCT FROM OLD.role', 'NOT public.is_admin()', 'RETURN NEW', 'enforce_role_immutability', 'SECURITY DEFINER', "SET search_path = ''") and keep the existing tests 'should reject role change when user is not admin', 'should allow role change when user is admin', and 'should allow non-role field updates for regular users' focused only on their unique expectations (e.g., role-rejection message and admin-path behavior), removing the repeated expect(...) lines from those tests so shared checks live in the single structural test.

- Verify each finding against the current code and only fix it if needed.

In @tests/lib/security/rls-role-protection.test.ts around lines 5 - 9, The migration file is read at module import via migrationPath and migration (using join and readFileSync), which will abort the whole test suite if the file is missing; move the join/readFileSync logic into a beforeAll test setup so file read errors surface as test failures instead of import errors—declare migrationPath and migration as let/const placeholders at module scope, then in beforeAll compute migrationPath with join(import.meta.dir, '...20250801000000_security_hardening.sql') and assign migration = readFileSync(migrationPath, 'utf-8'), handling any read errors there.

- Verify each finding against the current code and only fix it if needed.

In @tests/lib/sheets/sync.test.ts around lines 7 - 8, HEADER_MAP is imported but unused in tests/lib/sheets/sync.test.ts; remove the unused import instead of suppressing the lint rule. Edit the import list to delete the HEADER_MAP entry (or alternatively update the test that calls parseSheetRow to derive humanHeaders from HEADER_MAP or assert against HEADER_MAP), ensuring no eslint-disable comment is needed; reference the HEADER_MAP symbol and the parseSheetRow usage in the test to locate and update the code.

- Verify each finding against the current code and only fix it if needed.

In @scripts/author.sh at line 543, The NORMALIZED_SIGNING_KEY is computed too early from SIGNING_KEY_PUB and will be empty for newly created keys; move the normalization step that sets NORMALIZED_SIGNING_KEY=$(awk '{print $1 " " $2}' "$SIGNING_KEY_PUB" ...) to run after the signing key generation block (the code that creates the signing key/file later in the script) so that the subsequent upload logic that relies on NORMALIZED_SIGNING_KEY uses the freshly generated public key; ensure the upload branch that checks/uses NORMALIZED_SIGNING_KEY runs after this relocated normalization.

- Verify each finding against the current code and only fix it if needed.

In @scripts/dvcntnr.sh around lines 1 - 44, The setup script scripts/dvcntnr.sh omits the previously-run dependency installation step (bun install) so container users must run it manually; add a bun install invocation (e.g., run bun install in the project root) before the final "Setup complete!" echo when dependencies should be auto-installed, or if omission was intentional append a clear message in the final output indicating that developers must run "bun install" themselves; update the script around the end of the file where the final echo occurs to either perform bun install or print the new instruction.

- Verify each finding against the current code and only fix it if needed.

In @scripts/hooks/comment-checker.sh around lines 102 - 106, The HTML/XML comment counting only checks for a leading "<!--" in the html|xml|svg|vue) case and misses multi-line comments; modify the comment-checking logic to track an IN_HTML_COMMENT boolean (similar to existing block comment handling), set IN_HTML_COMMENT=true when a line contains "<!--" (and increment COMMENT_LINES), keep IN_HTML_COMMENT=true across subsequent lines (incrementing COMMENT_LINES for each line while true), and set IN_HTML_COMMENT=false when a line contains "-->" (also incrementing that line); update references to trimmed, COMMENT_LINES, and the html|xml|svg|vue) branch to support this state so multi-line HTML comments are fully counted.

- Verify each finding against the current code and only fix it if needed.

In @scripts/hooks/pre-compact.sh around lines 24 - 27, The current FILE_PATHS assignment uses a costly recursive jq '.. | strings' on $TRANSCRIPT_PATH; replace it with a targeted jq query when schema is known (e.g., extract .messages[].content or other specific fields) or, if schema is unknown, add a file-size guard around the existing pipeline so you only run the deep recursion when $TRANSCRIPT_PATH is below a threshold (e.g., 1MB); update the command that sets FILE_PATHS (and keep the subsequent grep/sort/head pipeline) to use the targeted jq path or to be skipped when the size check fails.

- Verify each finding against the current code and only fix it if needed.

In @scripts/hooks/prompt-submit.sh around lines 14 - 16, The script uses echo to feed $INPUT into jq which can misinterpret leading dashes; change the PROMPT assignment to avoid echo by either using a herestring (e.g., pass "$INPUT" directly into jq with <<<) or use printf to safely emit $INPUT (replace PROMPT=$(echo "$INPUT" | jq -r '.prompt // empty') with a safe form that uses printf or a herestring so INPUT is not treated as options when computing PROMPT).

- Verify each finding against the current code and only fix it if needed.

In @scripts/hooks/prompt-submit.sh around lines 26 - 28, The if-block uses echo "$PROMPT" piped to grep (if echo "$PROMPT" | grep -iqE '\b(ULW|YOLO)\b'; then) which can mis-handle arbitrary input; replace the echo pipeline with a safe input method (e.g., use a herestring or printf) so grep reads the PROMPT reliably and securely, and keep the rest of the logic that sets MESSAGE unchanged (ensure you update the test that references PROMPT and preserve the -iqE and pattern '\b(ULW|YOLO)\b').

- Verify each finding against the current code and only fix it if needed.

In @scripts/hooks/prompt-submit.sh around lines 30 - 37, The current anti-pattern check on PROMPT_LOWER is too broad because the phrase "just do it" can cause false positives; update the if-condition (the pattern list used when evaluating PROMPT_LOWER) to either remove "just do it" or make it more specific by matching word/sentence boundaries (e.g., require start/end or surrounding whitespace/punctuation) so it doesn't match embedded phrases; also replace the use of echo when building PROMPT_LOWER with a safer printf '%s' "$PROMPT" to avoid echo pitfalls (change PROMPT_LOWER=$(echo "$PROMPT" | tr ...) to PROMPT_LOWER=$(printf '%s' "$PROMPT" | tr ...)), and keep the rest of the checks the same.

- Verify each finding against the current code and only fix it if needed.

In @scripts/hooks/session-start.sh around lines 27 - 28, The for-loop iterating over "$MEMORIES_DIR"/*.json can yield the literal glob when no matches exist; enable the bash nullglob option before the loop (shopt -s nullglob) so unmatched globs expand to zero words and the loop simply skips, then optionally restore the previous shopt state after the loop; apply this change around the loop that uses the variable MEMORIES_DIR and the iteration "for f in \"$MEMORIES_DIR\"/\*.json; do" to remove the need to rely on the [[-f "$f"]] check.

- Verify each finding against the current code and only fix it if needed.

In @scripts/hooks/session-stop.sh around lines 38 - 46, The temp artifact scan is currently picking up files in the project's .temp/ directory; update the find invocation in session-stop.sh (the TEMP*FILES population logic that uses find with patterns and the TEMP_FILES/TEMP_COUNT variables) to exclude the .temp directory by adding an additional -not -path '*/.temp/\_' (or similar) to the existing -not -path checks so files under .temp/ are ignored and not counted towards WARNINGS.

- Verify each finding against the current code and only fix it if needed.

In @scripts/hooks/session-stop.sh around lines 17 - 22, The script uses echo to extract fields from the JSON in INPUT which can misinterpret values starting with hyphens; update occurrences that read INPUT (the lines assigning STOP_HOOK_ACTIVE and CWD) to use printf '%s' "$INPUT" (or equivalent) instead of echo and ensure variables are quoted (e.g., STOP_HOOK_ACTIVE=$(printf '%s' "$INPUT" | jq -r '.stop_hook_active // "false"')). Keep the jq expressions unchanged and only replace the echo invocations that reference INPUT.

- Verify each finding against the current code and only fix it if needed.

In @scripts/hooks/subagent-start.sh around lines 25 - 27, The current substring check using AGENT*TYPE_LOWER risks false positives; change the condition to perform exact matching against the known set of valid types by comparing AGENT_TYPE_LOWER to the allowed values (e.g., use a case statement or explicit equality checks) and only proceed when it exactly equals "ekko", "aurora", or "forge" (refer to AGENT_TYPE_LOWER and the conditional that currently uses == *"ekko"\_ etc.); ensure comparisons remain lowercase-safe by leaving the existing AGENT_TYPE_LOWER assignment in place.

- Verify each finding against the current code and only fix it if needed.

In @scripts/hooks/write-guard.sh around lines 44 - 48, The current basename check (using BASENAME, FILE_PATH and TRANSCRIPT_PATH with grep -qF) can yield false positives for common filenames; update the check to only treat a basename match as valid when it clearly refers to the same file (e.g., require a path separator or line-boundary around the BASENAME in the transcript, or prefer matching the full FILE_PATH first), so replace the loose grep on BASENAME with a stricter match that verifies the basename is preceded by a path separator or is a whole-line entry in TRANSCRIPT_PATH (and keep the existing full-path check using FILE_PATH).

- Verify each finding against the current code and only fix it if needed.

In @scripts/hooks/write-guard.sh around lines 50 - 57, The current here-doc constructs JSON with unescaped ${BASENAME}, which can break output if BASENAME contains quotes or backslashes; update the write-guard.sh block that emits hookSpecificOutput for "PreToolUse" to build the JSON via jq so BASENAME is safely encoded (e.g., use jq -n --arg BASENAME "$BASENAME" to construct the object and print it), replacing the cat <<EOF ... EOF section that directly interpolates ${BASENAME} so the additionalContext string is produced by jq with the filename properly escaped.

- Verify each finding against the current code and only fix it if needed.

In @src/app/(store)/products/[slug]/page.tsx at line 64, Verify whether a parent layout (e.g., the layout that renders {children} in your app) already provides a <main> landmark; if it does not, change the page's top-level element back from <section className='pedie-container py-8'> to a <main> with the same classes so the Products page (the JSX in page.tsx that renders the product content) exposes the primary content landmark for accessibility.
