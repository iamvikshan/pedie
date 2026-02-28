/**
 * PayPal REST API v2 client (sandbox)
 * Server-side only — uses client secret
 */

import { kesToUsd } from '@utils/currency'

// Re-export for callers that need the conversion
export { kesToUsd }

const PAYPAL_BASE =
  process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com'

const PAYPAL_ORDER_ID_PATTERN = /^[A-Za-z0-9_-]+$/

/** Get PayPal OAuth access token */
export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('PayPal client ID/secret not configured')
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`PayPal OAuth failed: ${res.status} ${error}`)
  }

  const data = await res.json()
  return data.access_token
}

export interface CreateOrderRequest {
  amountKes: number
  orderId: string
  description?: string
}

export interface PayPalOrder {
  id: string
  status: string
  links: Array<{ href: string; rel: string; method: string }>
}

/** Create a PayPal checkout order */
export async function createPayPalOrder(
  req: CreateOrderRequest
): Promise<PayPalOrder> {
  const token = await getPayPalAccessToken()
  const amountUsd = kesToUsd(req.amountKes)

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: req.orderId,
          description: req.description || `Pedie Tech Order ${req.orderId}`,
          amount: {
            currency_code: 'USD',
            value: amountUsd,
          },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: 'Pedie Tech',
            landing_page: 'NO_PREFERENCE',
            user_action: 'PAY_NOW',
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payments/paypal/capture`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout?cancelled=true`,
          },
        },
      },
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`PayPal create order failed: ${res.status} ${error}`)
  }

  return res.json()
}

export interface CaptureResult {
  id: string
  status: string
  purchase_units: Array<{
    reference_id: string
    payments: {
      captures: Array<{
        id: string
        status: string
        amount: { currency_code: string; value: string }
      }>
    }
  }>
}

/** Capture a PayPal order after user approval */
export async function capturePayPalPayment(
  paypalOrderId: string
): Promise<CaptureResult> {
  if (!PAYPAL_ORDER_ID_PATTERN.test(paypalOrderId)) {
    throw new Error('Invalid PayPal order ID format')
  }

  const token = await getPayPalAccessToken()

  const res = await fetch(
    `${PAYPAL_BASE}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`PayPal capture failed: ${res.status} ${error}`)
  }

  return res.json()
}

/** Get PayPal order status without capturing */
export async function getPayPalOrderStatus(
  paypalOrderId: string
): Promise<{ id: string; status: string }> {
  if (!PAYPAL_ORDER_ID_PATTERN.test(paypalOrderId)) {
    throw new Error('Invalid PayPal order ID format')
  }

  const token = await getPayPalAccessToken()

  const res = await fetch(
    `${PAYPAL_BASE}/v2/checkout/orders/${paypalOrderId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!res.ok) {
    throw new Error(`PayPal status check failed: ${res.status}`)
  }

  return res.json()
}

/** Get the approval URL from a PayPal order */
export function getApprovalUrl(order: PayPalOrder): string | null {
  const approveLink = order.links.find(l => l.rel === 'approve')
  return approveLink?.href ?? null
}
