import { getUser } from '@helpers/auth'
import { isUserAdmin } from '@lib/auth/admin'
import { deleteListing, updateListing, listingUpdateSchema } from '@data/admin'
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
      condition: body.condition,
      battery_health: body.battery_health,
      price_kes: body.price_kes,
      sale_price_kes: body.sale_price_kes,
      cost_kes: body.cost_kes,
      images: body.images,
      is_featured: body.is_featured,
      status: body.status,
      listing_type: body.listing_type,
      source: body.source,
      source_id: body.source_id,
      source_url: body.source_url,
      warranty_months: body.warranty_months,
      attributes: body.attributes,
      includes: body.includes,
      admin_notes: body.admin_notes,
      quantity: body.quantity,
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

    const parsed = listingUpdateSchema.safeParse(filtered)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid listing data' },
        { status: 400 }
      )
    }

    const listing = await updateListing(id, parsed.data)

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
