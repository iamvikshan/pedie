import { getUser } from '@helpers/auth'
import { isUserAdmin } from '@lib/auth/admin'
import {
  createListing,
  getAdminListings,
  listingCreateSchema,
} from '@data/admin'
import { logAdminEvent } from '@lib/data/audit'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await isUserAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const rawPage = searchParams.get('page')
      ? Number(searchParams.get('page'))
      : undefined
    const filters = {
      status: searchParams.get('status') ?? undefined,
      condition: searchParams.get('condition') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      categoryId: searchParams.get('categoryId') ?? undefined,
      page:
        rawPage !== undefined && Number.isFinite(rawPage)
          ? Math.max(1, Math.floor(rawPage))
          : undefined,
      limit: searchParams.get('limit')
        ? Math.min(Number(searchParams.get('limit')) || 20, 100)
        : undefined,
    }

    const result = await getAdminListings(filters)
    return NextResponse.json(result)
  } catch {
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

    // Convert notes from scalar string to string[] for DB
    if (typeof allowed.notes === 'string' && allowed.notes.trim()) {
      allowed.notes = allowed.notes
        .split('\n')
        .map((n: string) => n.trim())
        .filter(Boolean)
    } else if (!Array.isArray(allowed.notes)) {
      allowed.notes = null
    }

    const parsed = listingCreateSchema.safeParse(allowed)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid listing data' },
        { status: 400 }
      )
    }

    const listing = await createListing(parsed.data)

    logAdminEvent(user.id, 'create', 'listing', listing.id as string)

    // Fire-and-forget: sync to sheets
    import('@lib/sheets/sync')
      .then(({ syncToSheets }) =>
        syncToSheets({ mode: 'additive', source: 'admin' })
      )
      .catch(err => console.error('Post-mutation sheets sync failed:', err))

    return NextResponse.json(listing, { status: 201 })
  } catch (error) {
    console.error('Failed to create listing:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
