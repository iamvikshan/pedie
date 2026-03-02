import { getUser } from '@helpers/auth'
import { isUserAdmin } from '@lib/auth/admin'
import { createProduct, getAdminProducts } from '@lib/data/admin'
import { productSlug } from '@utils/slug'
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

    const result = await getAdminProducts(filters)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch products:', error)
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

    const body = await request.json().catch(() => null)

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Invalid or malformed JSON body' },
        { status: 400 }
      )
    }

    const { brand, model } = body

    if (!brand || !model) {
      return NextResponse.json(
        { error: 'brand and model are required' },
        { status: 400 }
      )
    }

    // Auto-generate slug if not provided
    const slug = body.slug || productSlug(brand, model)

    const allowed = {
      brand: body.brand,
      model: body.model,
      slug,
      category_id: body.category_id,
      description: body.description,
      images: body.images,
      key_features: body.key_features,
      original_price_kes: body.original_price_kes,
      specs: body.specs,
    }

    const product = await createProduct(allowed)
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Failed to create product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
