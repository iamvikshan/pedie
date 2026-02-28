import type { Metadata } from 'next'
import { CartPageClient } from './client'

export const metadata: Metadata = {
  title: 'Cart | Pedie Tech',
}

export default function CartPage() {
  return <CartPageClient />
}
