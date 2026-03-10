/**
 * Standalone script to export listings from Supabase → Google Sheets.
 * Run directly via `bun scripts/sheets.ts [--mode full]`.
 *
 * Used by the GitHub Actions cron workflow (.github/workflows/sheets.yml)
 * to bypass Cloudflare and invoke syncToSheets() in-process.
 */

import type { ExportOptions } from '@lib/sheets/sync'
import { syncToSheets } from '@lib/sheets/sync'

const mode =
  process.argv.includes('--mode') &&
  process.argv[process.argv.indexOf('--mode') + 1] === 'full'
    ? 'full'
    : 'additive'

const options: ExportOptions = { mode, source: 'system' }

console.log(`Starting ${mode} sync…`)

try {
  const report = await syncToSheets(options)
  console.log('Sync complete:', JSON.stringify(report, null, 2))

  if (report.errors > 0) {
    console.error(`Finished with ${report.errors} error(s)`)
    process.exit(1)
  }
} catch (err) {
  console.error('Sync failed:', err instanceof Error ? err.message : err)
  process.exit(1)
}
