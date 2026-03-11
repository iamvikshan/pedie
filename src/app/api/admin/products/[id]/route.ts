import { getUser } from '@helpers/auth'
import { isUserAdmin } from '@lib/auth/admin'
import { deleteProduct, updateProduct } from '@data/admin'
import { createAdminClient } from '@lib/supabase/admin'
import { NextResponse } from 'next/server'

async function syncPrimaryCategory(
  productId: string,
  categoryId?: string | null
) {
  const supabase = createAdminClient()

  if (!categoryId) {
    return
  }

  const { error: clearPrimaryError } = await supabase
    .from('product_categories')
    .update({ is_primary: false })
    .eq('product_id', productId)
    .eq('is_primary', true)

  if (clearPrimaryError) {
    throw new Error(
      `Failed to clear primary product category: ${clearPrimaryError.message}`
    )
  }

  const { error: upsertError } = await supabase
    .from('product_categories')
    .upsert(
      {
        product_id: productId,
        category_id: categoryId,
        is_primary: true,
      },
      { onConflict: 'product_id,category_id' }
    )

  if (upsertError) {
    throw new Error(
      `Failed to link primary product category: ${upsertError.message}`
    )
  }
}

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
    const categoryId =
      typeof body.category_id === 'string' && body.category_id.trim()
        ? body.category_id
        : null

    // Allowlist body fields to prevent injection of unexpected properties
    const allowed = {
      brand_id: body.brand_id,
      name: body.name,
      slug: body.slug,
      description: body.description,
      images: body.images,
      key_features: body.key_features,
      specs: body.specs,
    }
    const filtered = Object.fromEntries(
      Object.entries(allowed).filter(([, v]) => v !== undefined)
    )

    if (Object.keys(filtered).length === 0) {
      return NextResponse.json(
        { error: 'No updatable fields provided' },
        { status: 400 }
      )
    }

    const product = await updateProduct(id, filtered)

    if (body.category_id !== undefined) {
      await syncPrimaryCategory(id, categoryId)
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Failed to update product:', error)
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
    await deleteProduct(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
