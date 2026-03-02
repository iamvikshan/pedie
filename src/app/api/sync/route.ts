import { syncFromSheets } from '@lib/sheets/sync'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get('x-api-key')
    const expectedKey = process.env.SYNC_API_KEY

    if (!expectedKey || apiKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const report = await syncFromSheets()

    return NextResponse.json({
      success: true,
      report,
    })
  } catch (err) {
    console.error('Sync error:', err)
    return NextResponse.json(
      {
        success: false,
        error:
          process.env.NODE_ENV !== 'production' && err instanceof Error
            ? err.message
            : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
