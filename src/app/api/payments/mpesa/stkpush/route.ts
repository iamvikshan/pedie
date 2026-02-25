import { NextResponse } from 'next/server'
import { initiateSTKPush } from '@lib/payments/mpesa'
import { updateOrderStatus } from '@lib/data/orders'

export async function POST(request: Request) {
  try {
    const { phone, amount, orderId } = await request.json()

    if (!phone || amount == null || !orderId) {
      return NextResponse.json(
        { error: 'phone, amount, and orderId are required' },
        { status: 400 }
      )
    }

    const result = await initiateSTKPush({ phone, amount, orderId })

    // Validate that Safaricom returned a CheckoutRequestID before persisting
    if (!result.CheckoutRequestID) {
      console.error('STK Push response missing CheckoutRequestID', {
        orderId,
        responseCode: result.ResponseCode,
      })
      return NextResponse.json(
        { error: 'STK Push response incomplete' },
        { status: 502 }
      )
    }

    // Store CheckoutRequestID as payment_ref on the order so the callback
    // can look up the order later. Wrap in try/catch so STK push success
    // is not lost if persistence fails.
    try {
      await updateOrderStatus(orderId, 'pending', result.CheckoutRequestID)
    } catch (persistError) {
      // Sanitize error to avoid leaking DB/internal details in logs
      const errorName =
        persistError instanceof Error ? persistError.name : 'UnknownError'
      console.error('Order state persistence failed', {
        orderId,
        checkoutRequestId: result.CheckoutRequestID,
        errorType: errorName,
      })
      // Return success with a warning so the client knows the push was sent
      return NextResponse.json({
        ...result,
        _warning: 'Payment initiated but order state persistence failed',
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    // Sanitize: log error type only, not raw message (may contain sensitive API details)
    const errorName = error instanceof Error ? error.name : 'UnknownError'
    console.error('STK Push failed', { errorType: errorName })
    return NextResponse.json({ error: 'STK Push failed' }, { status: 500 })
  }
}
