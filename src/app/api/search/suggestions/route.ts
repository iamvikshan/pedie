import { getSearchSuggestions } from '@lib/data/search'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) {
    return NextResponse.json([])
  }

  try {
    const suggestions = await getSearchSuggestions(q)
    return NextResponse.json(suggestions)
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
