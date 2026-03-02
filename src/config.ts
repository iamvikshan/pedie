/**
 * Pedie business configuration — non-secret values.
 *
 * Import from '@/config'.
 * For actual secrets use environment variables (.env).
 */

// ── Exchange & pricing ────────────────────────────────────────────
export const KES_USD_RATE = 130
export const DEPOSIT_THRESHOLD_KES = 70_000
export const DEPOSIT_RATE_LOW = 0.05 // 5% for items < KES 70k
export const DEPOSIT_RATE_HIGH = 0.1 // 10% for items >= KES 70k

// ── Shipping ──────────────────────────────────────────────────────
export const SHIPPING_DAYS_MIN = 7
export const SHIPPING_DAYS_MAX = 14

// ── Listing IDs ───────────────────────────────────────────────────
export const LISTING_ID_PREFIX = 'PD'
export const DEFAULT_COLLECTION_HREF = '/collections'

// ── Google Sheets sync ────────────────────────────────────────────
export const SHEETS_TAB_NAME = 'inv'

// ── Site metadata (non-secret) ────────────────────────────────────
export const SITE_NAME = 'Pedie'
export const SITE_DESCRIPTION =
  'Quality refurbished electronics in Kenya — phones, laptops & tablets with warranty.'
export const SITE_URL = 'https://pedie.tech'
export const SUPPORT_EMAIL = 'pedietech@gmail.com'
export const URGENCY_TEXT = 'Selling fast — limited stock!'

export const URLS = {
  social: {
    x: 'https://x.com/iamvikshan',
    youtube: 'https://youtube.com/@vikshan',
    instagram: 'https://instagram.com/iamvikshan',
    github: 'https://github.com/iamvikshan',
    tiktok: 'https://tiktok.com/@iamvikshan',
  },
} as const

export const FOOTER_LINKS = [
  {
    title: 'About Pedie',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Our Story', href: '/story' },
      { label: 'Blog', href: '/blog' },
      { label: 'Sustainability', href: '/sustainability' },
      { label: 'Careers', href: '/careers' },
    ],
  },
  {
    title: 'Shop',
    links: [
      { label: 'Smartphones', href: '/collections/smartphones' },
      { label: 'Laptops', href: '/collections/laptops' },
      { label: 'Tablets', href: '/collections/tablets' },
      { label: 'Accessories', href: '/collections/accessories' },
      { label: 'Deals', href: '/deals' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Shipping Info', href: '/shipping' },
      { label: 'Returns & Warranty', href: '/returns' },
      { label: 'Track Order', href: '/track' },
    ],
  },
  {
    title: 'Policies',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  },
] as const
