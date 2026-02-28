/**
 * Slug generation utilities — shared across admin API routes and forms.
 *
 * Import from '@utils/slug'.
 */

/** Generate a URL-safe slug from a single string (e.g. category name) */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim()
}

/** Generate a product slug from brand + model */
export function productSlug(brand: string, model: string): string {
  return slugify(`${brand}-${model}`)
}
