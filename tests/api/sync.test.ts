import { beforeEach, describe, expect, mock, test } from 'bun:test'

// Mock the sync module
const mockSyncFromSheets = mock(() =>
  Promise.resolve({
    created: 5,
    updated: 2,
    errors: 0,
    details: ['Row 2: Created PD-ABC12'],
  })
)

mock.module('@lib/sheets/sync', () => ({
  syncFromSheets: mockSyncFromSheets,
}))

// Import route handler after mocking
const { POST } = await import('@/app/api/sync/route')

describe('POST /api/sync', () => {
  beforeEach(() => {
    mockSyncFromSheets.mockClear()
  })

  test('returns sync report with valid API key', async () => {
    const request = new Request('http://localhost:3000/api/sync', {
      method: 'POST',
      headers: { 'x-api-key': 'test-sync-api-key' },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.report.created).toBe(5)
    expect(data.report.updated).toBe(2)
    expect(data.report.errors).toBe(0)
  })

  test('returns 401 without API key', async () => {
    const request = new Request('http://localhost:3000/api/sync', {
      method: 'POST',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  test('returns 401 with invalid API key', async () => {
    const request = new Request('http://localhost:3000/api/sync', {
      method: 'POST',
      headers: { 'x-api-key': 'wrong-key' },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  test('returns 500 on sync error', async () => {
    mockSyncFromSheets.mockImplementationOnce(() =>
      Promise.reject(new Error('Sheets API error'))
    )

    const request = new Request('http://localhost:3000/api/sync', {
      method: 'POST',
      headers: { 'x-api-key': 'test-sync-api-key' },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    // In non-production NODE_ENV, the route exposes the error message
    // In production, it returns 'Internal server error'
    expect(typeof data.error).toBe('string')
  })
})
