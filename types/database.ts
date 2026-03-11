export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1'
  }
  public: {
    Tables: {
      admin_log: {
        Row: {
          action: string | null
          actor_id: string | null
          completed_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          errors: Json | null
          id: string
          rows_synced: number | null
          started_at: string
          status: string
          triggered_by: string
        }
        Insert: {
          action?: string | null
          actor_id?: string | null
          completed_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          errors?: Json | null
          id?: string
          rows_synced?: number | null
          started_at?: string
          status?: string
          triggered_by?: string
        }
        Update: {
          action?: string | null
          actor_id?: string | null
          completed_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          errors?: Json | null
          id?: string
          rows_synced?: number | null
          started_at?: string
          status?: string
          triggered_by?: string
        }
        Relationships: [
          {
            foreignKeyName: 'admin_log_actor_id_fkey'
            columns: ['actor_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      brands: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          slug: string
          sort_order: number
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string | null
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
      listings: {
        Row: {
          admin_notes: string | null
          attributes: Json | null
          battery_health: number | null
          color: string | null
          condition: Database['public']['Enums']['condition_grade']
          cost_kes: number | null
          created_at: string | null
          id: string
          images: string[] | null
          includes: string[] | null
          is_featured: boolean
          listing_type: Database['public']['Enums']['listing_type']
          notes: string[] | null
          price_kes: number
          product_id: string
          quantity: number
          ram: string | null
          sale_price_kes: number | null
          sku: string
          source: string | null
          source_id: string | null
          source_url: string | null
          status: Database['public']['Enums']['listing_status']
          storage: string | null
          updated_at: string | null
          warranty_months: number | null
        }
        Insert: {
          admin_notes?: string | null
          attributes?: Json | null
          battery_health?: number | null
          color?: string | null
          condition?: Database['public']['Enums']['condition_grade']
          cost_kes?: number | null
          created_at?: string | null
          id?: string
          images?: string[] | null
          includes?: string[] | null
          is_featured?: boolean
          listing_type?: Database['public']['Enums']['listing_type']
          notes?: string[] | null
          price_kes: number
          product_id: string
          quantity?: number
          ram?: string | null
          sale_price_kes?: number | null
          sku?: string
          source?: string | null
          source_id?: string | null
          source_url?: string | null
          status?: Database['public']['Enums']['listing_status']
          storage?: string | null
          updated_at?: string | null
          warranty_months?: number | null
        }
        Update: {
          admin_notes?: string | null
          attributes?: Json | null
          battery_health?: number | null
          color?: string | null
          condition?: Database['public']['Enums']['condition_grade']
          cost_kes?: number | null
          created_at?: string | null
          id?: string
          images?: string[] | null
          includes?: string[] | null
          is_featured?: boolean
          listing_type?: Database['public']['Enums']['listing_type']
          notes?: string[] | null
          price_kes?: number
          product_id?: string
          quantity?: number
          ram?: string | null
          sale_price_kes?: number | null
          sku?: string
          source?: string | null
          source_id?: string | null
          source_url?: string | null
          status?: Database['public']['Enums']['listing_status']
          storage?: string | null
          updated_at?: string | null
          warranty_months?: number | null
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
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          subscribed: boolean
          subscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          subscribed?: boolean
          subscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          subscribed?: boolean
          subscribed_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          deposit_kes: number | null
          id: string
          listing_id: string | null
          order_id: string
          product_name: string
          quantity: number
          unit_price_kes: number
          variant_summary: string | null
        }
        Insert: {
          created_at?: string | null
          deposit_kes?: number | null
          id?: string
          listing_id?: string | null
          order_id: string
          product_name: string
          quantity?: number
          unit_price_kes: number
          variant_summary?: string | null
        }
        Update: {
          created_at?: string | null
          deposit_kes?: number | null
          id?: string
          listing_id?: string | null
          order_id?: string
          product_name?: string
          quantity?: number
          unit_price_kes?: number
          variant_summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'order_items_listing_id_fkey'
            columns: ['listing_id']
            isOneToOne: false
            referencedRelation: 'listings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'order_items_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
        ]
      }
      orders: {
        Row: {
          balance_due_kes: number | null
          created_at: string | null
          deposit_amount_kes: number | null
          id: string
          notes: string | null
          payment_method: Database['public']['Enums']['payment_method'] | null
          payment_ref: string | null
          shipping_address: Json | null
          shipping_fee_kes: number | null
          status: Database['public']['Enums']['order_status']
          subtotal_kes: number
          total_kes: number
          tracking_info: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance_due_kes?: number | null
          created_at?: string | null
          deposit_amount_kes?: number | null
          id?: string
          notes?: string | null
          payment_method?: Database['public']['Enums']['payment_method'] | null
          payment_ref?: string | null
          shipping_address?: Json | null
          shipping_fee_kes?: number | null
          status?: Database['public']['Enums']['order_status']
          subtotal_kes: number
          total_kes: number
          tracking_info?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance_due_kes?: number | null
          created_at?: string | null
          deposit_amount_kes?: number | null
          id?: string
          notes?: string | null
          payment_method?: Database['public']['Enums']['payment_method'] | null
          payment_ref?: string | null
          shipping_address?: Json | null
          shipping_fee_kes?: number | null
          status?: Database['public']['Enums']['order_status']
          subtotal_kes?: number
          total_kes?: number
          tracking_info?: Json | null
          updated_at?: string | null
          user_id?: string
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
      price_comparisons: {
        Row: {
          competitor: string
          competitor_price_kes: number
          crawled_at: string | null
          id: string
          product_id: string
          url: string | null
        }
        Insert: {
          competitor: string
          competitor_price_kes: number
          crawled_at?: string | null
          id?: string
          product_id: string
          url?: string | null
        }
        Update: {
          competitor?: string
          competitor_price_kes?: number
          crawled_at?: string | null
          id?: string
          product_id?: string
          url?: string | null
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
      product_categories: {
        Row: {
          category_id: string
          is_primary: boolean
          product_id: string
        }
        Insert: {
          category_id: string
          is_primary?: boolean
          product_id: string
        }
        Update: {
          category_id?: string
          is_primary?: boolean
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'product_categories_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'product_categories_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      products: {
        Row: {
          brand_id: string
          created_at: string | null
          description: string | null
          fts: unknown
          id: string
          images: string[] | null
          is_active: boolean
          key_features: string[] | null
          name: string
          slug: string
          specs: Json | null
          updated_at: string | null
        }
        Insert: {
          brand_id: string
          created_at?: string | null
          description?: string | null
          fts?: unknown
          id?: string
          images?: string[] | null
          is_active?: boolean
          key_features?: string[] | null
          name: string
          slug: string
          specs?: Json | null
          updated_at?: string | null
        }
        Update: {
          brand_id?: string
          created_at?: string | null
          description?: string | null
          fts?: unknown
          id?: string
          images?: string[] | null
          is_active?: boolean
          key_features?: string[] | null
          name?: string
          slug?: string
          specs?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'products_brand_id_fkey'
            columns: ['brand_id']
            isOneToOne: false
            referencedRelation: 'brands'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          address: Json | null
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          is_active: boolean
          last_login_at: string | null
          phone: string | null
          role: Database['public']['Enums']['user_role']
          updated_at: string | null
          username: string | null
        }
        Insert: {
          address?: Json | null
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          last_login_at?: string | null
          phone?: string | null
          role?: Database['public']['Enums']['user_role']
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          address?: Json | null
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          phone?: string | null
          role?: Database['public']['Enums']['user_role']
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          created_at: string | null
          discount_amount_kes: number | null
          discount_pct: number | null
          ends_at: string
          id: string
          is_active: boolean
          listing_id: string | null
          name: string
          product_id: string | null
          sort_order: number
          starts_at: string
          type: Database['public']['Enums']['promotion_type']
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          discount_amount_kes?: number | null
          discount_pct?: number | null
          ends_at: string
          id?: string
          is_active?: boolean
          listing_id?: string | null
          name: string
          product_id?: string | null
          sort_order?: number
          starts_at: string
          type: Database['public']['Enums']['promotion_type']
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          discount_amount_kes?: number | null
          discount_pct?: number | null
          ends_at?: string
          id?: string
          is_active?: boolean
          listing_id?: string | null
          name?: string
          product_id?: string | null
          sort_order?: number
          starts_at?: string
          type?: Database['public']['Enums']['promotion_type']
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'promotions_listing_id_fkey'
            columns: ['listing_id']
            isOneToOne: false
            referencedRelation: 'listings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'promotions_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      reviews: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          product_id: string
          rating: number
          title: string | null
          updated_at: string | null
          user_id: string
          verified_purchase: boolean | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string | null
          user_id: string
          verified_purchase?: boolean | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string | null
          user_id?: string
          verified_purchase?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: 'reviews_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reviews_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      sku_sequences: {
        Row: {
          prefix: string
          seq: number
        }
        Insert: {
          prefix: string
          seq?: number
        }
        Update: {
          prefix?: string
          seq?: number
        }
        Relationships: []
      }
      sync_metadata: {
        Row: {
          created_at: string | null
          id: string
          last_synced_at: string | null
          listing_id: string | null
          product_id: string | null
          raw_data: Json | null
          sheet_row_id: string | null
          source: string
          source_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_synced_at?: string | null
          listing_id?: string | null
          product_id?: string | null
          raw_data?: Json | null
          sheet_row_id?: string | null
          source: string
          source_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_synced_at?: string | null
          listing_id?: string | null
          product_id?: string | null
          raw_data?: Json | null
          sheet_row_id?: string | null
          source?: string
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'sync_metadata_listing_id_fkey'
            columns: ['listing_id']
            isOneToOne: false
            referencedRelation: 'listings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'sync_metadata_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      wishlist: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'wishlist_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'wishlist_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      crawled_utc_date: { Args: { ts: string }; Returns: string }
      generate_sku: {
        Args: {
          p_brand_slug: string
          p_condition: Database['public']['Enums']['condition_grade']
          p_model_slug: string
          p_source: string
        }
        Returns: string
      }
      get_category_descendants: { Args: { root_id: string }; Returns: string[] }
      is_admin: { Args: never; Returns: boolean }
      resolve_username: { Args: { input_username: string }; Returns: string }
    }
    Enums: {
      condition_grade:
        | 'new'
        | 'premium'
        | 'excellent'
        | 'good'
        | 'acceptable'
        | 'for_parts'
      listing_status:
        | 'draft'
        | 'active'
        | 'reserved'
        | 'sold'
        | 'returned'
        | 'archived'
      listing_type: 'standard' | 'preorder' | 'affiliate' | 'referral'
      order_status:
        | 'pending'
        | 'confirmed'
        | 'processing'
        | 'shipped'
        | 'delivered'
        | 'cancelled'
        | 'refunded'
      payment_method: 'mpesa' | 'paypal'
      promotion_type:
        | 'flash_sale'
        | 'deal'
        | 'clearance'
        | 'featured'
        | 'seasonal'
      user_role: 'customer' | 'admin'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      condition_grade: [
        'new',
        'premium',
        'excellent',
        'good',
        'acceptable',
        'for_parts',
      ],
      listing_status: [
        'draft',
        'active',
        'reserved',
        'sold',
        'returned',
        'archived',
      ],
      listing_type: ['standard', 'preorder', 'affiliate', 'referral'],
      order_status: [
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
      ],
      payment_method: ['mpesa', 'paypal'],
      promotion_type: [
        'flash_sale',
        'deal',
        'clearance',
        'featured',
        'seasonal',
      ],
      user_role: ['customer', 'admin'],
    },
  },
} as const
