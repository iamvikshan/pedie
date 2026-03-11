'use client'

import type { ListingWithProduct } from '@app-types/product'
import { WHATSAPP_NUMBER } from '@/config'
import { TbBrandWhatsapp } from 'react-icons/tb'

interface ReferralCtaProps {
  listing: ListingWithProduct
}

export function ReferralCta({ listing }: ReferralCtaProps) {
  const { product } = listing
  const brand = product?.brand?.name || ''
  const name = product?.name || ''
  const message = encodeURIComponent(
    `Hi, I'm interested in ${brand} ${name} (${listing.sku})`.trim()
  )
  // Strip the + from the number for wa.me URL
  const phoneNumber = (WHATSAPP_NUMBER || '').replace('+', '')
  const url = phoneNumber ? `https://wa.me/${phoneNumber}?text=${message}` : '#'

  return (
    <a
      href={url}
      target='_blank'
      rel='noopener noreferrer'
      className='inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pedie-accent bg-pedie-green text-white hover:bg-pedie-green-dark h-11 px-8 text-lg w-full'
      aria-label={`Ask about ${brand} ${name} on WhatsApp`}
    >
      <TbBrandWhatsapp className='w-5 h-5' aria-hidden='true' />
      WhatsApp
    </a>
  )
}
