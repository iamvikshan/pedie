import type { Database } from './database'

type Tables = Database['public']['Tables']
type Enums = Database['public']['Enums']

export type OrderStatus = Enums['order_status']
export type PaymentMethod = Enums['payment_method']

export type Order = Tables['orders']['Row']
export type OrderItem = Tables['order_items']['Row']

export interface OrderWithItems extends Order {
  items: OrderItem[]
}

export interface ShippingAddress {
  full_name: string
  phone: string
  street: string
  city: string
  county: string
  postal_code?: string
  country: string
  notes?: string
}
