import { getPayPalOrderStatus } from '@lib/payments/paypal'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const paypalOrderId = searchParams.get('paypalOrderId')

  if (!paypalOrderId) {
    return NextResponse.json(
      { error: 'paypalOrderId is required' },
      { status: 400 }
    )
  }

  try {
    const result = await getPayPalOrderStatus(paypalOrderId)
    return NextResponse.json({
      status: result.status,
      paypalOrderId: result.id,
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    )
  }
}
