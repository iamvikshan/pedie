import { NextResponse } from 'next/server'
import { capturePayPalPayment } from '@lib/payments/paypal'
import { updateOrderStatus, getOrderById } from '@lib/data/orders'
import { sendPaymentConfirmation } from '@lib/email/send'
import { createAdminClient } from '@lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { paypalOrderId } = await request.json()

    if (!paypalOrderId) {
      return NextResponse.json(
        { error: 'paypalOrderId is required' },
        { status: 400 }
      )
    }

    const result = await capturePayPalPayment(paypalOrderId)
    const captureId = result.purchase_units?.[0]?.payments?.captures?.[0]?.id
    const orderId = result.purchase_units?.[0]?.reference_id

    if (result.status === 'COMPLETED' && orderId) {
      await updateOrderStatus(orderId, 'confirmed', captureId)

      // Fire-and-forget email notification
      void (async () => {
        try {
          const order = await getOrderById(orderId)
          if (order?.user_id) {
            const supabase = createAdminClient()
            const { data: userData } = await supabase.auth.admin.getUserById(
              order.user_id
            )
            const capturedAmount =
              result.purchase_units?.[0]?.payments?.captures?.[0]?.amount
            if (userData?.user?.email) {
              await sendPaymentConfirmation(userData.user.email, {
                userName: userData.user.user_metadata?.full_name || 'Customer',
                orderId,
                amount: Number(capturedAmount?.value ?? 0),
                paymentMethod: 'paypal',
                receiptNumber: captureId ?? result.id ?? 'N/A',
              })
            }
          }
        } catch (err) {
          console.error(
            'Failed to send PayPal payment confirmation email:',
            err
          )
        }
      })()
    }

    return NextResponse.json({
      status: result.status,
      captureId,
      amount: result.purchase_units?.[0]?.payments?.captures?.[0]?.amount,
    })
  } catch (error) {
    console.error('PayPal capture error:', error)
    return NextResponse.json(
      { error: 'Failed to capture payment' },
      { status: 500 }
    )
  }
}

/** Handle PayPal redirect after user approval (return_url) */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(
      new URL('/checkout?error=missing_token', request.url)
    )
  }

  try {
    const result = await capturePayPalPayment(token)

    if (!result) {
      return NextResponse.redirect(
        new URL('/checkout?error=invalid_response', request.url)
      )
    }

    const orderId = result.purchase_units?.[0]?.reference_id
    const captureId = result.purchase_units?.[0]?.payments?.captures?.[0]?.id

    if (result.status === 'COMPLETED') {
      if (orderId) {
        await updateOrderStatus(orderId, 'confirmed', captureId)

        // Fire-and-forget email notification
        void (async () => {
          try {
            const order = await getOrderById(orderId)
            if (order?.user_id) {
              const supabase = createAdminClient()
              const { data: userData } = await supabase.auth.admin.getUserById(
                order.user_id
              )
              const capturedAmount =
                result.purchase_units?.[0]?.payments?.captures?.[0]?.amount
              if (userData?.user?.email) {
                await sendPaymentConfirmation(userData.user.email, {
                  userName:
                    userData.user.user_metadata?.full_name || 'Customer',
                  orderId,
                  amount: Number(capturedAmount?.value ?? 0),
                  paymentMethod: 'paypal',
                  receiptNumber: captureId ?? result.id ?? 'N/A',
                })
              }
            }
          } catch (err) {
            console.error(
              'Failed to send PayPal redirect payment confirmation email:',
              err
            )
          }
        })()
      }

      const params = new URLSearchParams()
      if (orderId) params.set('orderId', orderId)
      if (result.id) params.set('paypalId', result.id)

      return NextResponse.redirect(
        new URL(`/checkout/confirmation?${params.toString()}`, request.url)
      )
    }

    const status = String(result?.status || 'unknown').toLowerCase()
    return NextResponse.redirect(
      new URL(`/checkout?error=payment_${status}`, request.url)
    )
  } catch (error) {
    console.error('PayPal capture redirect error:', error)
    return NextResponse.redirect(
      new URL('/checkout?error=capture_failed', request.url)
    )
  }
}
