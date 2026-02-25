import { createAdminClient } from '@lib/supabase/admin'
import type { ShippingAddress } from '@app-types/order'
import type { Json } from '@app-types/database'

export interface CreateOrderInput {
  userId: string
  items: Array<{
    listing_id: string
    unit_price_kes: number
    deposit_kes: number
  }>
  subtotal: number
  depositTotal: number
  shippingFee: number
  shippingAddress: ShippingAddress
  paymentMethod: 'mpesa' | 'paypal'
  paymentRef?: string
  notes?: string
}

export async function createOrder(input: CreateOrderInput) {
  const supabase = createAdminClient()
  const total = input.subtotal + input.shippingFee
  const balanceDue = total - input.depositTotal

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: input.userId,
      subtotal_kes: input.subtotal,
      total_kes: total,
      deposit_amount_kes: input.depositTotal,
      balance_due_kes: balanceDue,
      shipping_fee_kes: input.shippingFee,
      shipping_address: input.shippingAddress as unknown as Json,
      payment_method: input.paymentMethod,
      payment_ref: input.paymentRef ?? null,
      notes: input.notes ?? null,
      status: 'pending',
    })
    .select()
    .single()

  if (orderError || !order) {
    throw new Error(`Failed to create order: ${orderError?.message}`)
  }

  const itemsToInsert = input.items.map(item => ({
    order_id: order.id,
    listing_id: item.listing_id,
    unit_price_kes: item.unit_price_kes,
    deposit_kes: item.deposit_kes,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsToInsert)

  if (itemsError) {
    // Clean up the orphaned order
    console.error('Items insert failed, cleaning up order:', itemsError)
    await supabase.from('orders').delete().eq('id', order.id)
    throw new Error(`Failed to create order items: ${itemsError.message}`)
  }

  return order
}

export async function getOrderById(orderId: string) {
  const supabase = createAdminClient()

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (error || !order) return null

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)

  if (itemsError) {
    console.error('Error fetching order items:', itemsError)
  }

  return { ...order, items: items || [] }
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  paymentRef?: string
) {
  const supabase = createAdminClient()

  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }
  if (paymentRef) updates.payment_ref = paymentRef

  const { error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)

  if (error) throw new Error(`Failed to update order: ${error.message}`)
}

export async function getOrderByPaymentRef(paymentRef: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('payment_ref', paymentRef)
    .single()

  if (error || !data) return null
  return data
}

export async function getOrdersByUser(userId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch orders: ${error.message}`)
  return data || []
}
