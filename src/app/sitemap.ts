import { createAdminClient } from '@lib/supabase/admin'
import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]

  // Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, updated_at')
  const categoryPages: MetadataRoute.Sitemap = (categories ?? []).map(c => ({
    url: `${SITE_URL}/collections/${c.slug}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  // Available listings
  const { data: listings } = await supabase
    .from('listings')
    .select('id, updated_at')
    .eq('status', 'active')
  const listingPages: MetadataRoute.Sitemap = (listings ?? []).map(l => ({
    url: `${SITE_URL}/listings/${l.id}`,
    lastModified: l.updated_at ? new Date(l.updated_at) : new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...categoryPages, ...listingPages]
}
