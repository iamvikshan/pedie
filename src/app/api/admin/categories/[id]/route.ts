import { getUser } from '@helpers/auth'
import { isUserAdmin } from '@lib/auth/admin'
import {
  deleteCategory,
  updateCategory,
  categoryUpdateSchema,
} from '@data/admin'
import { logAdminEvent } from '@lib/data/audit'
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
      name: body.name,
      slug: body.slug,
      image_url: body.image_url,
      parent_id: body.parent_id,
      sort_order: body.sort_order,
    }

    const parsed = categoryUpdateSchema.safeParse(allowed)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid category data' },
        { status: 400 }
      )
    }

    const category = await updateCategory(id, parsed.data)
    logAdminEvent(user.id, 'update', 'category', id)
    return NextResponse.json(category)
  } catch (error) {
    console.error('Failed to update category:', error)
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
    await deleteCategory(id)
    logAdminEvent(user.id, 'delete', 'category', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
