/**
 * Pedie Tech — Google Sheets Inventory Sync (Apps Script)
 *
 * This script runs inside your Google Sheets spreadsheet and triggers
 * on-demand revalidation of the Pedie Tech store whenever inventory data
 * is edited. Changes are reflected on the site within seconds — no GitHub
 * Actions delay, no cron polling.
 *
 * ─── Setup ───────────────────────────────────────────────────────────────
 *
 * 1. Open your inventory spreadsheet in Google Sheets.
 * 2. Go to Extensions → Apps Script.
 * 3. Replace the default Code.gs with this file's contents.
 * 4. Set Script Properties (Project Settings → Script Properties):
 *      SITE_URL             → https://pedie.tech  (no trailing slash)
 *      REVALIDATION_SECRET  → same secret as your REVALIDATION_SECRET env var
 *      SYNC_API_KEY         → same key as your SYNC_API_KEY env var
 * 5. Save and run `testRevalidation()` once to authorize the script.
 * 6. Add a trigger: Triggers (clock icon) → Add Trigger →
 *      Function:   onSheetEdit
 *      Event type: On edit
 *      Source:     From spreadsheet
 *
 * ─── How it works ────────────────────────────────────────────────────────
 *
 * When a cell is edited in the inventory sheet:
 *   1. A debounced trigger fires (≤30 s after the last edit).
 *   2. The script calls POST /api/sync to push sheet data to Supabase.
 *   3. The script calls POST /api/revalidate to bust the ISR cache.
 *   4. The updated products appear on the live site within seconds.
 */

// ── Configuration ──────────────────────────────────────────────────────────

/**
 * Returns config from Script Properties.
 * Set these in Project Settings → Script Properties.
 */
function getConfig() {
  const props = PropertiesService.getScriptProperties()
  return {
    siteUrl: props.getProperty('SITE_URL') || '',
    revalidationSecret: props.getProperty('REVALIDATION_SECRET') || '',
    syncApiKey: props.getProperty('SYNC_API_KEY') || '',
  }
}

// ── Debounced Edit Handler ─────────────────────────────────────────────────

/**
 * Installable "On edit" trigger entry point.
 * Debounces rapid edits by scheduling `executeSync` 30 seconds out and
 * cancelling any previously scheduled run.
 *
 * @param {GoogleAppsScript.Events.SheetsOnEdit} e  The edit event object.
 */
function onSheetEdit(e) {
  // Only react to edits on the inventory sheet
  const sheetName = e.range.getSheet().getName()
  if (sheetName !== 'Inventory') return

  // Cancel any previously scheduled trigger
  const triggers = ScriptApp.getProjectTriggers()
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'executeSync') {
      ScriptApp.deleteTrigger(trigger)
    }
  }

  // Schedule a new sync 30 seconds from now (debounce)
  ScriptApp.newTrigger('executeSync')
    .timeBased()
    .after(30 * 1000) // 30 seconds
    .create()
}

// ── Sync Execution ─────────────────────────────────────────────────────────

/**
 * Pushes current sheet data to the sync endpoint, then revalidates the cache.
 * Called by the debounced time-based trigger — not directly by `onSheetEdit`.
 */
function executeSync() {
  const config = getConfig()

  if (!config.siteUrl || !config.revalidationSecret) {
    Logger.log(
      'ERROR: SITE_URL or REVALIDATION_SECRET not set in Script Properties.'
    )
    return
  }

  try {
    // Step 1: Trigger sync endpoint to pull latest sheet data into Supabase
    if (config.syncApiKey) {
      const syncResponse = UrlFetchApp.fetch(config.siteUrl + '/api/sync', {
        method: 'post',
        contentType: 'application/json',
        headers: {
          'x-api-key': config.syncApiKey,
        },
        payload: JSON.stringify({ source: 'sheets-apps-script' }),
        muteHttpExceptions: true,
      })
      Logger.log('Sync response: ' + syncResponse.getContentText())
    }

    // Step 2: Revalidate the ISR cache so pages reflect updated data
    const revalidateResponse = UrlFetchApp.fetch(
      config.siteUrl + '/api/revalidate',
      {
        method: 'post',
        contentType: 'application/json',
        headers: {
          'x-revalidation-secret': config.revalidationSecret,
        },
        payload: JSON.stringify({ path: '/', type: 'layout' }),
        muteHttpExceptions: true,
      }
    )
    Logger.log('Revalidation response: ' + revalidateResponse.getContentText())
  } catch (error) {
    Logger.log('Sync error: ' + error.toString())
  }
}

// ── Manual / Test Helpers ──────────────────────────────────────────────────

/**
 * Run this manually from the Apps Script editor to test connectivity.
 * Also triggers the OAuth consent flow on first run.
 */
function testRevalidation() {
  const config = getConfig()
  Logger.log('SITE_URL = ' + config.siteUrl)
  Logger.log(
    'REVALIDATION_SECRET is ' + (config.revalidationSecret ? 'SET' : 'NOT SET')
  )
  Logger.log('SYNC_API_KEY is ' + (config.syncApiKey ? 'SET' : 'NOT SET'))

  if (!config.siteUrl || !config.revalidationSecret) {
    Logger.log(
      '⚠️  Set SITE_URL and REVALIDATION_SECRET in Script Properties first.'
    )
    return
  }

  executeSync()
  Logger.log('✅ Test complete — check logs above for response details.')
}
