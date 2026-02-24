export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'categories_parent_id_fkey'
            columns: ['parent_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
        ]
      }
      products: {
        Row: {
          id: string
          brand: string
          model: string
          category_id: string
          description: string | null
          specifications: Json | null
          image_urls: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand: string
          model: string
          category_id: string
          description?: string | null
          specifications?: Json | null
          image_urls?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand?: string
          model?: string
          category_id?: string
          description?: string | null
          specifications?: Json | null
          image_urls?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'products_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
        ]
      }
      listings: {
        Row: {
          id: string
          listing_id: string
          product_id: string
          condition_grade: Database['public']['Enums']['condition_grade']
          price_kes: number
          price_usd: number | null
          original_price_kes: number | null
          deposit_amount: number | null
          status: Database['public']['Enums']['listing_status']
          warranty_months: number | null
          notes: string | null
          source: string | null
          source_listing_id: string | null
          source_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          product_id: string
          condition_grade: Database['public']['Enums']['condition_grade']
          price_kes: number
          price_usd?: number | null
          original_price_kes?: number | null
          deposit_amount?: number | null
          status?: Database['public']['Enums']['listing_status']
          warranty_months?: number | null
          notes?: string | null
          source?: string | null
          source_listing_id?: string | null
          source_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          product_id?: string
          condition_grade?: Database['public']['Enums']['condition_grade']
          price_kes?: number
          price_usd?: number | null
          original_price_kes?: number | null
          deposit_amount?: number | null
          status?: Database['public']['Enums']['listing_status']
          warranty_months?: number | null
          notes?: string | null
          source?: string | null
          source_listing_id?: string | null
          source_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'listings_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          role: Database['public']['Enums']['user_role']
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role?: Database['public']['Enums']['user_role']
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          role?: Database['public']['Enums']['user_role']
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          user_id: string
          status: Database['public']['Enums']['order_status']
          total_kes: number
          deposit_paid: number | null
          payment_method: Database['public']['Enums']['payment_method'] | null
          shipping_address: Json | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: Database['public']['Enums']['order_status']
          total_kes: number
          deposit_paid?: number | null
          payment_method?: Database['public']['Enums']['payment_method'] | null
          shipping_address?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: Database['public']['Enums']['order_status']
          total_kes?: number
          deposit_paid?: number | null
          payment_method?: Database['public']['Enums']['payment_method'] | null
          shipping_address?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'orders_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          listing_id: string
          price_kes: number
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          listing_id: string
          price_kes: number
          quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          listing_id?: string
          price_kes?: number
          quantity?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'order_items_listing_id_fkey'
            columns: ['listing_id']
            isOneToOne: false
            referencedRelation: 'listings'
            referencedColumns: ['id']
          },
        ]
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          product_id: string
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reviews_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reviews_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      price_comparisons: {
        Row: {
          id: string
          product_id: string
          source: string
          price_usd: number
          price_kes: number
          condition: string | null
          url: string | null
          last_checked: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          source: string
          price_usd: number
          price_kes: number
          condition?: string | null
          url?: string | null
          last_checked?: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          source?: string
          price_usd?: number
          price_kes?: number
          condition?: string | null
          url?: string | null
          last_checked?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'price_comparisons_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      wishlist: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'wishlist_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'wishlist_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          subscribed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          subscribed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          subscribed?: boolean
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      condition_grade: 'excellent' | 'good' | 'fair' | 'acceptable'
      listing_status: 'available' | 'reserved' | 'sold' | 'unlisted'
      order_status:
        | 'pending'
        | 'deposit_paid'
        | 'confirmed'
        | 'shipped'
        | 'delivered'
        | 'cancelled'
      payment_method: 'mpesa' | 'paypal' | 'bank_transfer' | 'cash'
      user_role: 'customer' | 'admin'
    }
  }
}
