/**
 * Test preload — runs before any test file imports.
 *
 * 1. Registers happy-dom globals (window, document, HTMLElement, etc.)
 * 2. Extends Bun's expect with jest-dom matchers
 * 3. Cleans up DOM after each test
 * 4. Sets environment variables for Supabase / Google Sheets
 */
import { GlobalRegistrator } from '@happy-dom/global-registrator'
import { afterEach, expect } from 'bun:test'

// Register happy-dom FIRST so document/window are available before RTL loads
GlobalRegistrator.register()

// Now safe to import RTL (it checks for document.body at import time)
const jestDomMatchers = await import('@testing-library/jest-dom/matchers')
const { cleanup } = await import('@testing-library/react')

// Strip the 'default' key from the ESM namespace to get a clean matchers object
const { default: _defaultExport, ...matchers } = jestDomMatchers
void _defaultExport

// Extend Bun's expect with jest-dom matchers (toBeInTheDocument, etc.)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
expect.extend(matchers as any)

afterEach(() => {
  cleanup()
})

// ── Environment variables ──────────────────────────────────────────────────
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.SYNC_API_KEY = 'test-sync-api-key'
process.env.GS_SPREADSHEET_ID = 'test-spreadsheet-id'
// Minimal base64-encoded JSON credentials so getGoogleSheetsClient() can parse without throwing
process.env.GCP_SERVICE_ACC = Buffer.from(
  JSON.stringify({
    type: 'service_account',
    project_id: 'test-project',
    private_key_id: 'test-key-id',
    private_key: 'test-private-key',
    client_email: 'test@test-project.iam.gserviceaccount.com',
    client_id: '123456789',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
  })
).toString('base64')
