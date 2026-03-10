import { getUser } from '@helpers/auth'
import { isUserAdmin } from '@lib/auth/admin'
import { deleteListing, updateListing } from '@data/admin'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await isUserAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    const allowed = {
      product_id: body.product_id,
      storage: body.storage,
      color: body.color,
      carrier: body.carrier,
      condition: body.condition,
      battery_health: body.battery_health,
      price_kes: body.price_kes,
      original_price_usd: body.original_price_usd,
      landed_cost_kes: body.landed_cost_kes,
      images: body.images,
      is_featured: body.is_featured,
      status: body.status,
      source: body.source,
      source_url: body.source_url,
      source_listing_id: body.source_listing_id,
      sheets_row_id: body.sheets_row_id,
      notes: body.notes,
    }

    // Filter out undefined values so only explicitly provided fields are updated
    const filtered = Object.fromEntries(
      Object.entries(allowed).filter(([, v]) => v !== undefined)
    )

    if (Object.keys(filtered).length === 0) {
      return NextResponse.json(
        { error: 'No updatable fields provided' },
        { status: 400 }
      )
    }

    const listing = await updateListing(id, filtered)

    // Fire-and-forget: sync to sheets
    import('@lib/sheets/sync')
      .then(({ syncToSheets }) =>
        syncToSheets({ mode: 'additive', source: 'admin' })
      )
      .catch(err => console.error('Post-mutation sheets sync failed:', err))

    return NextResponse.json(listing)
  } catch (error) {
    console.error('Failed to update listing:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await isUserAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    await deleteListing(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete listing:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
