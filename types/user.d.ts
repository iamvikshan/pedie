import type { Database } from './database'

type Tables = Database['public']['Tables']
type Enums = Database['public']['Enums']

export type UserRole = Enums['user_role']

export type Profile = Tables['profiles']['Row']

export interface Address {
  street: string
  city: string
  county: string
  postal_code?: string
  country: string
}
