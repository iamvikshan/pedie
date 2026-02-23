import type { Database } from './database'

type Tables = Database['public']['Tables']
type Enums = Database['public']['Enums']

export type ConditionGrade = Enums['condition_grade']
export type ListingStatus = Enums['listing_status']

export type Category = Tables['categories']['Row']

export type Product = Tables['products']['Row']

export type Listing = Tables['listings']['Row']

export interface ListingWithProduct extends Listing {
  product: Product
  category?: Category
}
