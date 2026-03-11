import { getUser } from '@helpers/auth'
import { isUserAdmin } from '@lib/auth/admin'
import {
  createProduct,
  getAdminProducts,
  productCreateSchema,
} from '@data/admin'
import { createAdminClient } from '@lib/supabase/admin'
import { logAdminEvent } from '@lib/data/audit'
import { productSlug } from '@utils/slug'
import { NextResponse } from 'next/server'

async function getBrandName(brandId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('brands')
    .select('name')
    .eq('id', brandId)
    .single()

  if (error || !data) {
    throw new Error('Invalid brand_id')
  }

  return data.name
}

async function syncPrimaryCategory(
  productId: string,
  categoryId?: string | null
) {
  const supabase = createAdminClient()

  if (!categoryId) {
    return
  }

  const { error } = await supabase.from('product_categories').insert({
    product_id: productId,
    category_id: categoryId,
    is_primary: true,
  })

  if (error) {
    throw new Error(`Failed to link product category: ${error.message}`)
  }
}

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

    const brandId =
      typeof body.brand_id === 'string' ? body.brand_id.trim() : ''
    const name = typeof body.name === 'string' ? body.name.trim() : ''

    if (!brandId || !name) {
      return NextResponse.json(
        { error: 'brand_id and name are required' },
        { status: 400 }
      )
    }

    const brandName = await getBrandName(brandId)

    // Auto-generate slug if not provided
    const slug = body.slug || productSlug(brandName, name)
    const categoryId =
      typeof body.category_id === 'string' && body.category_id.trim()
        ? body.category_id
        : null

    const allowed = {
      brand_id: brandId,
      name,
      slug,
      description: body.description,
      images: body.images,
      key_features: body.key_features,
      specs: body.specs,
    }

    const parsed = productCreateSchema.safeParse(allowed)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid product data' },
        { status: 400 }
      )
    }

    const product = await createProduct(parsed.data)

    await syncPrimaryCategory(product.id as string, categoryId)

    logAdminEvent(user.id, 'create', 'product', product.id as string)

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Failed to create product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
