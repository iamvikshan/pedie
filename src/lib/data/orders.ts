import type { Database, Json } from '@app-types/database'
import type { ShippingAddress } from '@app-types/order'
import { calculateDeposit } from '@helpers/pricing'
import { createAdminClient } from '@lib/supabase/admin'

const SHIPPING_FEE_KES = 0

type OrderStatus = Database['public']['Enums']['order_status']
type OrderUpdate = Database['public']['Tables']['orders']['Update']

export interface CreateOrderInput {
  userId: string
  items: Array<{ listing_id: string; quantity: number }>
  shippingAddress: ShippingAddress
  paymentMethod: 'mpesa' | 'paypal'
  paymentRef?: string
  notes?: string
}

export async function createOrder(input: CreateOrderInput) {
  const supabase = createAdminClient()

  const listingIds = input.items.map(i => i.listing_id)
  const { data: listings, error: listingError } = await supabase
    .from('listings')
    .select(
      'id, price_kes, sale_price_kes, listing_type, product:products!inner(name)'
    )
    .in('id', listingIds)

  if (listingError) {
    throw new Error(`Failed to fetch listings: ${listingError.message}`)
  }

  if (!listings || listings.length !== listingIds.length) {
    const found = new Set(listings?.map(l => l.id) ?? [])
    const missing = listingIds.filter(id => !found.has(id))
    throw new Error(`Listings not found: ${missing.join(', ')}`)
  }

  const listingMap = new Map(listings.map(l => [l.id, l]))

  const resolvedItems = input.items.map(item => {
    const listing = listingMap.get(item.listing_id)!
    const unitPrice = listing.sale_price_kes ?? listing.price_kes
    const deposit =
      listing.listing_type === 'preorder' ? calculateDeposit(unitPrice) : 0
    const productName = (listing.product as unknown as { name: string }).name
    return {
      listing_id: item.listing_id,
      quantity: item.quantity,
      unit_price_kes: unitPrice,
      deposit_kes: deposit,
      product_name: productName,
    }
  })

  const subtotal = resolvedItems.reduce(
    (sum, i) => sum + i.unit_price_kes * i.quantity,
    0
  )
  const depositTotal = resolvedItems.reduce(
    (sum, i) => sum + i.deposit_kes * i.quantity,
    0
  )
  const total = subtotal + SHIPPING_FEE_KES
  const balanceDue = total - depositTotal

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: input.userId,
      subtotal_kes: subtotal,
      total_kes: total,
      deposit_amount_kes: depositTotal,
      balance_due_kes: balanceDue,
      shipping_fee_kes: SHIPPING_FEE_KES,
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

  const itemsToInsert = resolvedItems.map(item => ({
    order_id: order.id,
    listing_id: item.listing_id,
    product_name: item.product_name,
    quantity: item.quantity,
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
  status: OrderStatus,
  paymentRef?: string
) {
  const supabase = createAdminClient()

  const updates: OrderUpdate = {
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
