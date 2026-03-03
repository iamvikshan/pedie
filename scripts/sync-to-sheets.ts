/**
 * Syncs current DB data to Google Sheets using the sync library.
 * Usage: bun scripts/sync-to-sheets.ts
 */

import { syncToSheets } from '@lib/sheets/sync'

async function main() {
  console.log('📊 Syncing database to Google Sheets...\n')

  // Use 'full' mode to overwrite the sheet with current data
  const report = await syncToSheets({ mode: 'full' })

  console.log(`\n✅ Sync complete!`)
  console.log(`   Rows written: ${report.rows}`)
  console.log(`   Skipped: ${report.skipped}`)
  console.log(`   Errors: ${report.errors}`)

  if (report.details.length > 0) {
    console.log(`\n📝 Details:`)
    for (const detail of report.details) {
      console.log(`   ${detail}`)
    }
  }
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
