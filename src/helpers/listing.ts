/**
 * Listing ID generation helper.
 * Import from '@helpers' (barrel) or '@helpers/listing'.
 */

import { LISTING_ID_PREFIX } from '@/config'

export function generateListingId(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let id = ''
  for (let i = 0; i < 5; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return `${LISTING_ID_PREFIX}-${id}`
}
