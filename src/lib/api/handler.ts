import { NextResponse } from 'next/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteHandler = (request: Request, context?: any) => Promise<NextResponse>

/**
 * Wraps an API route handler with standardized error handling.
 * Catches unhandled errors and returns a 500 JSON response instead of crashing.
 *
 * Usage:
 * ```ts
 * export const GET = withApiHandler(async (request) => {
 *   // ... your logic
 *   return NextResponse.json(data)
 * })
 * ```
 */
export function withApiHandler(
  handler: RouteHandler,
  label?: string
): RouteHandler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (request: Request, context?: any) => {
    try {
      return await handler(request, context)
    } catch (error) {
      const tag = label || new URL(request.url).pathname
      console.error(`API error [${tag}]:`, error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}
