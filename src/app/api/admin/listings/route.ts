import { NextResponse } from 'next/server'
import { getUser } from '@helpers/auth'
import { isUserAdmin } from '@lib/auth/admin'
import { getAdminListings, createListing } from '@lib/data/admin'
import { generateListingId } from '@helpers'

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

    const { product_id, price_kes, condition } = body

    if (!product_id || price_kes == null || !condition) {
      return NextResponse.json(
        { error: 'product_id, price_kes, and condition are required' },
        { status: 400 }
      )
    }

    // Auto-generate listing_id if not provided
    const listing_id = body.listing_id || generateListingId()

    const allowed = {
      listing_id,
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
      is_preorder: body.is_preorder,
      is_sold: body.is_sold,
      is_featured: body.is_featured,
      status: body.status,
      source: body.source,
      source_url: body.source_url,
      source_listing_id: body.source_listing_id,
      sheets_row_id: body.sheets_row_id,
      notes: body.notes,
    }

    const listing = await createListing(allowed)
    return NextResponse.json(listing, { status: 201 })
  } catch (error) {
    console.error('Failed to create listing:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
