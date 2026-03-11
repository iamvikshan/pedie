import { getUser } from '@helpers/auth'
import type { CreateOrderInput } from '@data/orders'
import { createOrder, getOrderById } from '@data/orders'
import { sendOrderConfirmation } from '@lib/email/send'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { items, shippingAddress, paymentMethod, paymentRef, notes } = body

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      !shippingAddress ||
      !paymentMethod
    ) {
      return NextResponse.json(
        {
          error:
            'items (non-empty array), shippingAddress, and paymentMethod are required',
        },
        { status: 400 }
      )
    }

    const validItems = items.every(
      (i: unknown) =>
        typeof i === 'object' &&
        i !== null &&
        typeof (i as Record<string, unknown>).listing_id === 'string' &&
        Number.isInteger((i as Record<string, unknown>).quantity) &&
        ((i as Record<string, unknown>).quantity as number) > 0
    )
    if (!validItems) {
      return NextResponse.json(
        {
          error:
            'Each item must have a listing_id (string) and quantity (positive integer)',
        },
        { status: 400 }
      )
    }

    const input: CreateOrderInput = {
      userId: user.id,
      items: items.map((i: { listing_id: string; quantity: number }) => ({
        listing_id: i.listing_id,
        quantity: i.quantity,
      })),
      shippingAddress,
      paymentMethod,
      paymentRef,
      notes,
    }

    const order = await createOrder(input)

    if (user.email) {
      const fullOrder = await getOrderById(order.id)
      sendOrderConfirmation(user.email, {
        userName:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          'Customer',
        orderId: order.id,
        items: (fullOrder?.items ?? []).map(
          (item: { product_name: string; unit_price_kes: number }) => ({
            name: item.product_name,
            price: item.unit_price_kes,
          })
        ),
        total: order.total_kes ?? 0,
        depositAmount: order.deposit_amount_kes ?? 0,
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
