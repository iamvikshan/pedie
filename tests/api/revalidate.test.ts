import { describe, test, expect, mock, beforeEach } from 'bun:test'

// Mock next/cache
const mockRevalidatePath = mock(() => {})
const mockRevalidateTag = mock(() => {})

mock.module('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
  revalidateTag: mockRevalidateTag,
}))

// Mock env
process.env.REVALIDATION_SECRET = 'test-secret'

import { POST } from '@/app/api/revalidate/route'
import type { NextRequest } from 'next/server'

function makeRequest(body: object, secret?: string) {
  return new Request('http://localhost/api/revalidate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(secret ? { 'x-revalidation-secret': secret } : {}),
    },
    body: JSON.stringify(body),
  }) as unknown as NextRequest
}

describe('Revalidation API', () => {
  beforeEach(() => {
    mockRevalidatePath.mockClear()
    mockRevalidateTag.mockClear()
    process.env.REVALIDATION_SECRET = 'test-secret'
  })

  test('returns 500 when REVALIDATION_SECRET is not configured', async () => {
    delete process.env.REVALIDATION_SECRET
    const res = await POST(makeRequest({ path: '/' }, 'test-secret'))
    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.error).toBe('Revalidation secret not configured')
  })

  test('rejects missing secret', async () => {
    const res = await POST(makeRequest({ path: '/' }))
    expect(res.status).toBe(401)
  })

  test('rejects invalid secret', async () => {
    const res = await POST(makeRequest({ path: '/' }, 'wrong'))
    expect(res.status).toBe(401)
  })

  test('revalidates by path', async () => {
    const res = await POST(makeRequest({ path: '/listings' }, 'test-secret'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.revalidated).toBe(true)
    expect(data.path).toBe('/listings')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/listings', 'page')
  })

  test('revalidates by tag', async () => {
    const res = await POST(makeRequest({ tag: 'products' }, 'test-secret'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.revalidated).toBe(true)
    expect(data.tag).toBe('products')
    expect(mockRevalidateTag).toHaveBeenCalledWith('products', { expire: 0 })
  })

  test('returns 400 when no path or tag given', async () => {
    const res = await POST(makeRequest({}, 'test-secret'))
    expect(res.status).toBe(400)
  })

  test('returns 400 for invalid JSON', async () => {
    const req = new Request('http://localhost/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidation-secret': 'test-secret',
      },
      body: 'not json',
    }) as unknown as NextRequest
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
