import { NextResponse } from 'next/server'
import { getUser } from '@helpers/auth'
import { createOrder } from '@lib/data/orders'
import type { CreateOrderInput } from '@lib/data/orders'
import { sendOrderConfirmation } from '@lib/email/send'

// TODO (Phase 6): Validate listing prices server-side to prevent client-side tampering.
// Currently trusts client-supplied subtotal/depositTotal/shippingFee.
export async function POST(request: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const {
      items,
      subtotal,
      depositTotal,
      shippingFee,
      shippingAddress,
      paymentMethod,
      paymentRef,
      notes,
    } = body

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      subtotal == null ||
      !shippingAddress ||
      !paymentMethod
    ) {
      return NextResponse.json(
        {
          error:
            'items (non-empty array), subtotal, shippingAddress, and paymentMethod are required',
        },
        { status: 400 }
      )
    }

    const input: CreateOrderInput = {
      userId: user.id,
      items,
      subtotal,
      depositTotal: depositTotal || 0,
      shippingFee: shippingFee || 0,
      shippingAddress,
      paymentMethod,
      paymentRef,
      notes,
    }

    const order = await createOrder(input)

    // Fire-and-forget order confirmation email
    if (user.email) {
      sendOrderConfirmation(user.email, {
        userName:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          'Customer',
        orderId: order.id,
        items: items.map(
          (item: { listing_id: string; unit_price_kes: number }) => ({
            name: item.listing_id,
            price: item.unit_price_kes,
          })
        ),
        total: subtotal + (shippingFee || 0),
        depositAmount: depositTotal || 0,
        paymentMethod,
      }).catch(console.error)
    }

    return NextResponse.json(
      { orderId: order.id, status: order.status },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
