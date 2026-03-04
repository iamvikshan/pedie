import { getUser } from '@helpers/auth'
import { isUserAdmin } from '@lib/auth/admin'
import { deleteProduct, updateProduct } from '@data/admin'
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

    // Allowlist body fields to prevent injection of unexpected properties
    const allowed = {
      brand: body.brand,
      model: body.model,
      slug: body.slug,
      category_id: body.category_id,
      description: body.description,
      images: body.images,
      key_features: body.key_features,
      original_price_kes: body.original_price_kes,
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
