import type { Database } from './database'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/** Derived from the database enum — single source of truth */
export type ConditionGrade = Database['public']['Enums']['condition_grade']
/** Derived from the database enum — single source of truth */
export type ListingStatus = Database['public']['Enums']['listing_status']
/** Derived from the database enum — single source of truth */
export type ListingType = Database['public']['Enums']['listing_type']

export type Brand = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  website_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  icon: string | null
  is_active: boolean
  parent_id: string | null
  sort_order: number
  created_at: string | null
  updated_at: string | null
}

export type Product = {
  id: string
  name: string
  slug: string
  brand_id: string
  description: string | null
  specs: Json | null
  key_features: string[] | null
  images: string[] | null
  is_active: boolean
  created_at: string | null
  updated_at: string | null
  fts: unknown
}

export type Listing = {
  id: string
  sku: string
  product_id: string
  storage: string | null
  color: string | null
  condition: ConditionGrade
  battery_health: number | null
  price_kes: number
  sale_price_kes: number | null
  cost_kes: number | null
  source: string | null
  source_id: string | null
  source_url: string | null
  images: string[] | null
  is_featured: boolean
  listing_type: ListingType
  ram: string | null
  warranty_months: number | null
  attributes: Json | null
  includes: string[] | null
  admin_notes: string | null
  quantity: number
  status: ListingStatus
  notes: string[] | null
  created_at: string | null
  updated_at: string | null
}

export type Promotion = {
  id: string
  name: string
  type: string
  product_id: string | null
  listing_id: string | null
  discount_pct: number | null
  discount_amount_kes: number | null
  starts_at: string
  ends_at: string
  is_active: boolean
  sort_order: number
  created_at: string | null
  updated_at: string | null
}

export type CategoryWithChildren = Category & {
  children: Category[]
}

export type ProductCategory = {
  product_id: string
  category_id: string
  is_primary: boolean
}

export type ProductWithBrand = Product & {
  brand: Brand
}

/** A listing joined with its product and brand info */
export interface ListingWithProduct extends Listing {
  product: ProductWithBrand
}

/** A product with all its available listings grouped as a "family" */
export interface ProductFamily {
  product: ProductWithBrand
  listings: Listing[]
  representative: Listing
  variantCount: number
}
