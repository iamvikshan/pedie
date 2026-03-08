import type { Category, ListingWithProduct } from '@app-types/product'
import { SITE_NAME, SITE_URL, URLS } from '@/config'

/**
 * Safely serialize a JSON-LD object for embedding in a <script> tag.
 * Escapes sequences that could break out of the script context.
 */
export function safeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

export function productJsonLd(listing: ListingWithProduct) {
  return {
    '@context': 'https://schema.org' as const,
    '@type': 'Product' as const,
    name: listing.product.name,
    description:
      listing.product.description ||
      `${listing.product.brand.name} ${listing.product.name} - ${listing.condition} condition`,
    image: listing.images?.[0] || listing.product.images?.[0] || undefined,
    sku: listing.sku,
    brand: {
      '@type': 'Brand' as const,
      name: listing.product.brand.name,
    },
    offers: {
      '@type': 'Offer' as const,
      url: `${SITE_URL}/listings/${listing.id}`,
      priceCurrency: 'KES',
      price: listing.sale_price_kes ?? listing.price_kes,
      availability:
        listing.status === 'active'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition:
        listing.condition === 'new'
          ? 'https://schema.org/NewCondition'
          : listing.condition === 'premium' || listing.condition === 'excellent'
            ? 'https://schema.org/RefurbishedCondition'
            : 'https://schema.org/UsedCondition',
    },
  }
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org' as const,
    '@type': 'Organization' as const,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      'Quality refurbished electronics in Kenya. Every device tested, graded, and backed by a 3-month warranty.',
    contactPoint: {
      '@type': 'ContactPoint' as const,
      contactType: 'customer service',
      availableLanguage: ['English', 'Swahili'],
    },
    sameAs: Object.values(URLS.social),
  }
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org' as const,
    '@type': 'BreadcrumbList' as const,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem' as const,
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function collectionJsonLd(category: Category, listingCount: number) {
  return {
    '@context': 'https://schema.org' as const,
    '@type': 'CollectionPage' as const,
    name: category.name,
    description:
      category.description || `Browse ${category.name} at ${SITE_NAME}`,
    url: `${SITE_URL}/collections/${category.slug}`,
    numberOfItems: listingCount,
    isPartOf: {
      '@type': 'WebSite' as const,
      name: SITE_NAME,
      url: SITE_URL,
    },
  }
}
