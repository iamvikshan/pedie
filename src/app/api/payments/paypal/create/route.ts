import { createPayPalOrder, getApprovalUrl } from '@lib/payments/paypal'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { amountKes, orderId, description } = await request.json()

    const parsedAmount = Number(amountKes)
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: 'amountKes must be a positive number' },
        { status: 400 }
      )
    }

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      )
    }

    const order = await createPayPalOrder({
      amountKes: parsedAmount,
      orderId,
      description,
    })
    const approvalUrl = getApprovalUrl(order)

    if (!approvalUrl) {
      return NextResponse.json(
        { error: 'Failed to get PayPal approval URL' },
        { status: 502 }
      )
    }

    return NextResponse.json({
      paypalOrderId: order.id,
      approvalUrl,
      status: order.status,
    })
  } catch (error) {
    console.error('PayPal create error:', error)
    return NextResponse.json(
      { error: 'Failed to create PayPal order' },
      { status: 500 }
    )
  }
}
