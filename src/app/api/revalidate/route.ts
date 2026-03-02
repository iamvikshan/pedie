import { revalidatePath, revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  if (!process.env.REVALIDATION_SECRET) {
    return NextResponse.json(
      { error: 'Revalidation secret not configured' },
      { status: 500 }
    )
  }

  const secret = request.headers.get('x-revalidation-secret')

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { path, tag, type = 'page' } = body

    if (tag) {
      revalidateTag(tag, { expire: 0 })
      return NextResponse.json({ revalidated: true, tag })
    }

    if (path) {
      revalidatePath(path, type)
      return NextResponse.json({ revalidated: true, path })
    }

    return NextResponse.json({ error: 'Provide path or tag' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
