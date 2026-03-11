import { getOrderById } from '@data/orders'
import { getUser } from '@helpers/auth'
import { createPayPalOrder, getApprovalUrl } from '@lib/payments/paypal'
import { createRateLimiter } from '@lib/security/rateLimit'
import { NextResponse } from 'next/server'

const rateLimiter = createRateLimiter('paypal-create', {
  requests: 5,
  window: '1 m',
})

export async function POST(request: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { success } = await rateLimiter.limit(user.id)
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      )
    }

    const order = await getOrderById(orderId)
    if (!order || order.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Order not available' },
        { status: 400 }
      )
    }

    if (order.status !== 'pending') {
      return NextResponse.json(
        { error: 'Order is not in pending status' },
        { status: 400 }
      )
    }

    const amountKes = order.deposit_amount_kes ?? 0

    if (amountKes <= 0) {
      return NextResponse.json(
        { error: 'Order deposit amount must be positive' },
        { status: 400 }
      )
    }

    const paypalOrder = await createPayPalOrder({ amountKes, orderId })
    const approvalUrl = getApprovalUrl(paypalOrder)

    if (!approvalUrl) {
      return NextResponse.json(
        { error: 'Failed to get PayPal approval URL' },
        { status: 502 }
      )
    }

    return NextResponse.json({
      paypalOrderId: paypalOrder.id,
      approvalUrl,
      status: paypalOrder.status,
    })
  } catch (error) {
    const errorName = error instanceof Error ? error.name : 'UnknownError'
    console.error('PayPal create error:', { errorType: errorName })
    return NextResponse.json(
      { error: 'Failed to create PayPal order' },
      { status: 500 }
    )
  }
}
