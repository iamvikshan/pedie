import { getUser } from '@helpers/auth'
import { isUserAdmin } from '@lib/auth/admin'
import {
  createCategory,
  getAdminCategories,
  categoryCreateSchema,
} from '@data/admin'
import { logAdminEvent } from '@lib/data/audit'
import { slugify } from '@utils/slug'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await isUserAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const categories = await getAdminCategories()
    return NextResponse.json(categories)
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

    const { name } = body

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    // Normalize caller-supplied slug or auto-generate from name
    const slug = slugify(body.slug || name)

    if (!slug) {
      return NextResponse.json(
        { error: 'Could not generate a valid slug from the provided name' },
        { status: 400 }
      )
    }

    const allowed = {
      name: body.name,
      slug,
      image_url: body.image_url,
      parent_id: body.parent_id,
      sort_order: body.sort_order,
    }

    const parsed = categoryCreateSchema.safeParse(allowed)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid category data' },
        { status: 400 }
      )
    }

    const category = await createCategory(parsed.data)
    logAdminEvent(user.id, 'create', 'category', category.id as string)
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Failed to create category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
