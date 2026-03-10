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

export async function POST(request: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await isUserAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let direction: 'pull' | 'push' | 'both' = 'pull'
    try {
      const body = await request.json()
      if (
        body.direction === 'push' ||
        body.direction === 'pull' ||
        body.direction === 'both'
      ) {
        direction = body.direction
      }
    } catch {
      // No body or invalid JSON — default to 'pull'
    }

    const { syncFromSheets, syncToSheets } = await import('@lib/sheets/sync')
    const startedAt = new Date().toISOString()

    try {
      let pullReport = null
      let pushReport = null

      if (direction === 'pull' || direction === 'both') {
        pullReport = await syncFromSheets('admin')
      }

      if (direction === 'push' || direction === 'both') {
        pushReport = await syncToSheets({ mode: 'additive', source: 'admin' })
      }

      const totalRows =
        (pullReport ? pullReport.created + pullReport.updated : 0) +
        (pushReport ? pushReport.rows : 0)
      const totalErrors = (pullReport?.errors ?? 0) + (pushReport?.errors ?? 0)

      try {
        await logSyncResult({
          triggered_by: user.id,
          status: totalErrors > 0 ? 'partial' : 'success',
          rows_synced: totalRows,
          errors:
            totalErrors > 0
              ? [
                  ...(pullReport?.details ?? []).filter(
                    (d): d is string => typeof d === 'string'
                  ),
                  ...(pushReport?.details ?? []).filter(
                    (d): d is string => typeof d === 'string'
                  ),
                ]
              : undefined,
          started_at: startedAt,
          completed_at: new Date().toISOString(),
        })
      } catch (logError) {
        console.error('Failed to log sync result:', logError)
      }

      return NextResponse.json({
        success: true,
        direction,
        report: pullReport,
        exportReport: pushReport,
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
