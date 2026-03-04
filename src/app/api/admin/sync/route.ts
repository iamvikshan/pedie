import { getUser } from '@helpers/auth'
import { isUserAdmin } from '@lib/auth/admin'
import { getSyncHistory, logSyncResult } from '@data/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await isUserAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const history = await getSyncHistory()
    return NextResponse.json(history)
  } catch (error) {
    console.error('Failed to fetch sync history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await isUserAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Dynamic import to avoid cold-start issues
    const { syncFromSheets } = await import('@lib/sheets/sync')
    const startedAt = new Date().toISOString()

    try {
      const report = await syncFromSheets()

      try {
        await logSyncResult({
          triggered_by: user.id,
          status: report.errors > 0 ? 'partial' : 'success',
          rows_synced: report.created + report.updated,
          errors:
            report.errors > 0 && Array.isArray(report.details)
              ? (report.details as unknown[]).filter(
                  (d): d is string => typeof d === 'string'
                )
              : undefined,
          started_at: startedAt,
          completed_at: new Date().toISOString(),
        })
      } catch (logError) {
        console.error('Failed to log sync result:', logError)
      }

      return NextResponse.json({
        success: true,
        report,
        started_at: startedAt,
      })
    } catch (syncError) {
      const errorMessage =
        syncError instanceof Error ? syncError.message : String(syncError)

      try {
        await logSyncResult({
          triggered_by: user.id,
          status: 'error',
          rows_synced: 0,
          errors: [errorMessage] as string[],
          started_at: startedAt,
          completed_at: new Date().toISOString(),
        })
      } catch (logError) {
        console.error('Failed to log sync error:', logError)
      }

      return NextResponse.json(
        { error: 'Sync failed', details: errorMessage },
        { status: 500 }
      )
    }
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
