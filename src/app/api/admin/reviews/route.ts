import { NextResponse } from 'next/server'
import { getUser } from '@lib/auth/helpers'
import { isUserAdmin } from '@lib/auth/admin'
import { getAdminReviews, deleteReview } from '@lib/data/admin'

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

    const url = new URL(request.url)
    const ratingParam = url.searchParams.get('rating')
    const rawRating = ratingParam ? Number(ratingParam) : undefined
    const rating =
      rawRating !== undefined &&
      Number.isFinite(rawRating) &&
      rawRating >= 1 &&
      rawRating <= 5
        ? rawRating
        : undefined
    const rawPage = Number(url.searchParams.get('page')) || 1
    const page = Math.max(1, Math.floor(rawPage))
    const rawLimit = Number(url.searchParams.get('limit')) || 10
    const limit = Math.min(Math.max(rawLimit, 1), 100)

    const result = await getAdminReviews({ rating, page, limit })
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await isUserAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      )
    }

    await deleteReview(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
