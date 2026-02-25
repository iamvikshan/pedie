import { NextResponse } from 'next/server'
import { parseCallback } from '@lib/payments/mpesa'
import type { STKCallback } from '@lib/payments/mpesa'
import { getOrderByPaymentRef, updateOrderStatus } from '@lib/data/orders'
import { sendPaymentConfirmation } from '@lib/email/send'
import { createAdminClient } from '@lib/supabase/admin'

/** Terminal states that should not be overwritten */
const TERMINAL_STATES = new Set(['confirmed', 'delivered', 'cancelled'])

export async function POST(request: Request) {
  // Validate callback secret via header (not query param, to avoid logging)
  const expectedSecret = process.env.MPESA_CALLBACK_SECRET
  if (expectedSecret) {
    const providedSecret = request.headers.get('x-callback-secret')
    if (providedSecret !== expectedSecret) {
      console.warn('M-Pesa callback: invalid or missing secret')
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }
  }

  try {
    const body = (await request.json()) as STKCallback
    const result = parseCallback(body)

    const order = await getOrderByPaymentRef(result.checkoutRequestId)
    if (!order) {
      console.warn(
        'M-Pesa callback: no order found for CheckoutRequestID',
        result.checkoutRequestId
      )
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    // Idempotency: skip if order is already in a terminal state
    if (TERMINAL_STATES.has(order.status ?? '')) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    if (result.success) {
      await updateOrderStatus(
        order.id,
        'confirmed',
        result.mpesaReceiptNumber ?? 'N/A'
      )

      // Fire-and-forget email notification
      void (async () => {
        try {
          const supabase = createAdminClient()
          const { data: userData } = await supabase.auth.admin.getUserById(
            order.user_id
          )
          if (userData?.user?.email) {
            await sendPaymentConfirmation(userData.user.email, {
              userName: userData.user.user_metadata?.full_name || 'Customer',
              orderId: order.id,
              amount: order.deposit_amount_kes ?? 0,
              paymentMethod: 'mpesa',
              receiptNumber: result.mpesaReceiptNumber ?? 'N/A',
            })
          }
        } catch (err) {
          console.error(
            'Failed to send M-Pesa payment confirmation email:',
            err
          )
        }
      })()
    } else {
      // Only transition to cancelled if not already confirmed
      if (order.status !== 'confirmed') {
        await updateOrderStatus(order.id, 'cancelled')
      }
      console.warn('M-Pesa payment failed:', result.resultDesc)
    }

    // Always return 200 to Safaricom
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  }
}
