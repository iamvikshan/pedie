import { getOrderById, updateOrderStatus } from '@data/orders'
import { sendPaymentConfirmation } from '@lib/email/send'
import { capturePayPalPayment } from '@lib/payments/paypal'
import { createAdminClient } from '@lib/supabase/admin'
import { kesToUsd } from '@utils/currency'
import { NextResponse } from 'next/server'

const AMOUNT_TOLERANCE_USD = 0.5

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
    const capturedAmount =
      result.purchase_units?.[0]?.payments?.captures?.[0]?.amount
    const orderId = result.purchase_units?.[0]?.reference_id

    if (result.status === 'COMPLETED' && orderId) {
      const order = await getOrderById(orderId)
      if (!order) {
        console.error(`[SECURITY] PayPal capture for unknown order: ${orderId}`)
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      if (order.status !== 'pending') {
        console.error(
          `[SECURITY] PayPal capture for non-pending order: ${orderId} (status: ${order.status})`
        )
        return NextResponse.json(
          { error: 'Order is not in pending status' },
          { status: 400 }
        )
      }

      const expectedUsd = parseFloat(kesToUsd(order.deposit_amount_kes ?? 0))
      const capturedUsd = parseFloat(capturedAmount?.value ?? '0')

      if (Math.abs(capturedUsd - expectedUsd) > AMOUNT_TOLERANCE_USD) {
        console.error(
          `[SECURITY] PayPal amount mismatch for order ${orderId}: captured $${capturedUsd}, expected $${expectedUsd}`
        )
        return NextResponse.json(
          { error: 'Payment amount mismatch' },
          { status: 400 }
        )
      }

      await updateOrderStatus(orderId, 'confirmed', captureId)

      // Fire-and-forget email notification
      void (async () => {
        try {
          if (order.user_id) {
            const supabase = createAdminClient()
            const { data: userData } = await supabase.auth.admin.getUserById(
              order.user_id
            )
            if (userData?.user?.email) {
              await sendPaymentConfirmation(userData.user.email, {
                userName: userData.user.user_metadata?.full_name || 'Customer',
                orderId,
                amount: capturedUsd,
                paymentMethod: 'paypal',
                receiptNumber: captureId ?? result.id ?? orderId,
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
      amount: capturedAmount,
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
    const capturedAmount =
      result.purchase_units?.[0]?.payments?.captures?.[0]?.amount

    if (result.status === 'COMPLETED') {
      if (orderId) {
        const order = await getOrderById(orderId)

        if (!order) {
          console.error(
            `[SECURITY] PayPal redirect capture for unknown order: ${orderId}`
          )
          return NextResponse.redirect(
            new URL('/checkout?error=order_not_found', request.url)
          )
        }

        if (order.status !== 'pending') {
          console.error(
            `[SECURITY] PayPal redirect capture for non-pending order: ${orderId} (status: ${order.status})`
          )
          return NextResponse.redirect(
            new URL('/checkout?error=order_not_pending', request.url)
          )
        }

        const expectedUsd = parseFloat(kesToUsd(order.deposit_amount_kes ?? 0))
        const capturedUsd = parseFloat(capturedAmount?.value ?? '0')

        if (Math.abs(capturedUsd - expectedUsd) > AMOUNT_TOLERANCE_USD) {
          console.error(
            `[SECURITY] PayPal redirect amount mismatch for order ${orderId}: captured $${capturedUsd}, expected $${expectedUsd}`
          )
          return NextResponse.redirect(
            new URL('/checkout?error=amount_mismatch', request.url)
          )
        }

        await updateOrderStatus(orderId, 'confirmed', captureId)

        // Fire-and-forget email notification
        void (async () => {
          try {
            if (order.user_id) {
              const supabase = createAdminClient()
              const { data: userData } = await supabase.auth.admin.getUserById(
                order.user_id
              )
              if (userData?.user?.email) {
                await sendPaymentConfirmation(userData.user.email, {
                  userName:
                    userData.user.user_metadata?.full_name || 'Customer',
                  orderId,
                  amount: parseFloat(capturedAmount?.value ?? '0'),
                  paymentMethod: 'paypal',
                  receiptNumber: captureId ?? result.id ?? orderId,
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
