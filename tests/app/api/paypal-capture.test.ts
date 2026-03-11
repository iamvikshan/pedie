import { beforeEach, describe, expect, mock, test } from 'bun:test'

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockGetOrderById = mock(() => Promise.resolve(null as any))
const mockUpdateOrderStatus = mock(() => Promise.resolve())
mock.module('@data/orders', () => ({
  getOrderById: mockGetOrderById,
  updateOrderStatus: mockUpdateOrderStatus,
  createOrder: mock(),
  getOrdersByUser: mock(() => Promise.resolve([])),
  getOrderByPaymentRef: mock(() => Promise.resolve(null)),
}))

const mockCapturePayPalPayment = mock(() => Promise.resolve({} as any))
mock.module('@lib/payments/paypal', () => ({
  capturePayPalPayment: mockCapturePayPalPayment,
  createPayPalOrder: mock(),
  getApprovalUrl: mock(),
  getPayPalAccessToken: mock(),
  getPayPalOrderStatus: mock(),
  kesToUsd: (kes: number) => (kes / 130).toFixed(2),
}))

mock.module('@lib/email/send', () => ({
  sendWelcomeEmail: mock(() => Promise.resolve()),
  sendOrderConfirmation: mock(() => Promise.resolve()),
  sendPaymentConfirmation: mock(() => Promise.resolve()),
  sendShippingUpdate: mock(() => Promise.resolve()),
  sendDeliveryConfirmation: mock(() => Promise.resolve()),
  sendOrderCancelled: mock(() => Promise.resolve()),
}))

const mockCreateAdminClient = mock(() => ({
  auth: { admin: { getUserById: mock(() => Promise.resolve({ data: null })) } },
}))
mock.module('@lib/supabase/admin', () => ({
  createAdminClient: mockCreateAdminClient,
}))

const { POST, GET } = await import('@/app/api/payments/paypal/capture/route')

// ── Helpers ────────────────────────────────────────────────────────────────

function makeRequest(body: Record<string, unknown>) {
  return new Request('http://localhost:3000/api/payments/paypal/capture', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function makeCaptureResult(opts: {
  status: string
  orderId: string
  capturedUsd: string
  captureId?: string
}) {
  return {
    id: 'PAYPAL-ORDER-ID',
    status: opts.status,
    purchase_units: [
      {
        reference_id: opts.orderId,
        payments: {
          captures: [
            {
              id: opts.captureId ?? 'CAPTURE-123',
              amount: { value: opts.capturedUsd, currency_code: 'USD' },
            },
          ],
        },
      },
    ],
  }
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('POST /api/payments/paypal/capture (amount verification)', () => {
  beforeEach(() => {
    mockGetOrderById.mockReset()
    mockUpdateOrderStatus.mockReset()
    mockCapturePayPalPayment.mockReset()
  })

  test('confirms order when captured amount matches expected', async () => {
    // deposit_amount_kes = 6500, at rate 130 = $50.00
    mockCapturePayPalPayment.mockResolvedValue(
      makeCaptureResult({
        status: 'COMPLETED',
        orderId: 'order-123',
        capturedUsd: '50.00',
      })
    )
    mockGetOrderById.mockResolvedValue({
      id: 'order-123',
      status: 'pending',
      deposit_amount_kes: 6500,
      user_id: 'user-123',
      items: [],
    })

    const res = await POST(makeRequest({ paypalOrderId: 'PP-123' }))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.status).toBe('COMPLETED')
    expect(mockUpdateOrderStatus).toHaveBeenCalledTimes(1)
  })

  test('rejects order when captured amount mismatches', async () => {
    // deposit_amount_kes = 6500, at rate 130 = $50.00 expected, but captured $10.00
    mockCapturePayPalPayment.mockResolvedValue(
      makeCaptureResult({
        status: 'COMPLETED',
        orderId: 'order-123',
        capturedUsd: '10.00',
      })
    )
    mockGetOrderById.mockResolvedValue({
      id: 'order-123',
      status: 'pending',
      deposit_amount_kes: 6500,
      user_id: 'user-123',
      items: [],
    })

    const res = await POST(makeRequest({ paypalOrderId: 'PP-123' }))

    expect(res.status).toBe(400)
    expect(mockUpdateOrderStatus).not.toHaveBeenCalled()
  })

  test('allows small rounding differences within tolerance', async () => {
    // deposit_amount_kes = 6500 -> $50.00 expected; captured $50.30 (within $0.50)
    mockCapturePayPalPayment.mockResolvedValue(
      makeCaptureResult({
        status: 'COMPLETED',
        orderId: 'order-123',
        capturedUsd: '50.30',
      })
    )
    mockGetOrderById.mockResolvedValue({
      id: 'order-123',
      status: 'pending',
      deposit_amount_kes: 6500,
      user_id: 'user-123',
      items: [],
    })

    const res = await POST(makeRequest({ paypalOrderId: 'PP-123' }))
    expect(res.status).toBe(200)
    expect(mockUpdateOrderStatus).toHaveBeenCalledTimes(1)
  })

  test('does not update status for non-COMPLETED captures', async () => {
    mockCapturePayPalPayment.mockResolvedValue({
      id: 'PAYPAL-ORDER',
      status: 'PENDING',
      purchase_units: [
        {
          reference_id: 'order-123',
          payments: { captures: [{ id: 'C-1', amount: { value: '50.00' } }] },
        },
      ],
    })

    const res = await POST(makeRequest({ paypalOrderId: 'PP-123' }))
    const data = await res.json()

    expect(data.status).toBe('PENDING')
    expect(mockUpdateOrderStatus).not.toHaveBeenCalled()
  })

  test('rejects non-pending orders', async () => {
    mockCapturePayPalPayment.mockResolvedValue(
      makeCaptureResult({
        status: 'COMPLETED',
        orderId: 'order-123',
        capturedUsd: '50.00',
      })
    )
    mockGetOrderById.mockResolvedValue({
      id: 'order-123',
      status: 'confirmed',
      deposit_amount_kes: 6500,
      user_id: 'user-123',
      items: [],
    })

    const res = await POST(makeRequest({ paypalOrderId: 'PP-123' }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Order is not in pending status')
    expect(mockUpdateOrderStatus).not.toHaveBeenCalled()
  })
})

// ── GET Handler Tests ──────────────────────────────────────────────────────

function makeGetRequest(params: Record<string, string>) {
  const url = new URL('http://localhost:3000/api/payments/paypal/capture')
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  return new Request(url.toString(), { method: 'GET' })
}

describe('GET /api/payments/paypal/capture (redirect handler)', () => {
  beforeEach(() => {
    mockGetOrderById.mockReset()
    mockUpdateOrderStatus.mockReset()
    mockCapturePayPalPayment.mockReset()
  })

  test('should verify amount before confirming order', async () => {
    mockCapturePayPalPayment.mockResolvedValue(
      makeCaptureResult({
        status: 'COMPLETED',
        orderId: 'order-123',
        capturedUsd: '50.00',
      })
    )
    mockGetOrderById.mockResolvedValue({
      id: 'order-123',
      status: 'pending',
      deposit_amount_kes: 6500,
      user_id: 'user-123',
      items: [],
    })

    const res = await GET(makeGetRequest({ token: 'PP-TOKEN' }))

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/checkout/confirmation')
    expect(mockUpdateOrderStatus).toHaveBeenCalledTimes(1)
  })

  test('should reject if order not found', async () => {
    mockCapturePayPalPayment.mockResolvedValue(
      makeCaptureResult({
        status: 'COMPLETED',
        orderId: 'order-123',
        capturedUsd: '50.00',
      })
    )
    mockGetOrderById.mockResolvedValue(null)

    const res = await GET(makeGetRequest({ token: 'PP-TOKEN' }))

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('error=order_not_found')
    expect(mockUpdateOrderStatus).not.toHaveBeenCalled()
  })

  test('should reject non-pending orders', async () => {
    mockCapturePayPalPayment.mockResolvedValue(
      makeCaptureResult({
        status: 'COMPLETED',
        orderId: 'order-123',
        capturedUsd: '50.00',
      })
    )
    mockGetOrderById.mockResolvedValue({
      id: 'order-123',
      status: 'confirmed',
      deposit_amount_kes: 6500,
      user_id: 'user-123',
      items: [],
    })

    const res = await GET(makeGetRequest({ token: 'PP-TOKEN' }))

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('error=order_not_pending')
    expect(mockUpdateOrderStatus).not.toHaveBeenCalled()
  })

  test('should redirect to error page on amount mismatch', async () => {
    mockCapturePayPalPayment.mockResolvedValue(
      makeCaptureResult({
        status: 'COMPLETED',
        orderId: 'order-123',
        capturedUsd: '10.00',
      })
    )
    mockGetOrderById.mockResolvedValue({
      id: 'order-123',
      status: 'pending',
      deposit_amount_kes: 6500,
      user_id: 'user-123',
      items: [],
    })

    const res = await GET(makeGetRequest({ token: 'PP-TOKEN' }))

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('error=amount_mismatch')
    expect(mockUpdateOrderStatus).not.toHaveBeenCalled()
  })
})
