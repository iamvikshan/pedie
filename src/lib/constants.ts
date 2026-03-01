/**
 * Legacy re-export — canonical sources are now src/config and src/helpers.
 * Prefer importing from '@config' or '@helpers' directly in new code.
 */
export {
  KES_USD_RATE,
  DEPOSIT_THRESHOLD_KES,
  DEPOSIT_RATE_LOW,
  DEPOSIT_RATE_HIGH,
  SHIPPING_DAYS_MIN,
  SHIPPING_DAYS_MAX,
  LISTING_ID_PREFIX,
  DEFAULT_COLLECTION_HREF,
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_URL,
  SUPPORT_EMAIL,
} from '../../src/config'

export {
  usdToKes,
  calculateDeposit,
  generateListingId,
  formatKes,
  calculateDiscount,
} from '../../src/helpers'
