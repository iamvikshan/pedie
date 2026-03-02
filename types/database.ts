export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	// Allows to automatically instantiate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: "14.1";
	};
	public: {
		Tables: {
			categories: {
				Row: {
					created_at: string | null;
					id: string;
					image_url: string | null;
					name: string;
					parent_id: string | null;
					slug: string;
					sort_order: number | null;
					updated_at: string | null;
				};
				Insert: {
					created_at?: string | null;
					id?: string;
					image_url?: string | null;
					name: string;
					parent_id?: string | null;
					slug: string;
					sort_order?: number | null;
					updated_at?: string | null;
				};
				Update: {
					created_at?: string | null;
					id?: string;
					image_url?: string | null;
					name?: string;
					parent_id?: string | null;
					slug?: string;
					sort_order?: number | null;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "categories_parent_id_fkey";
						columns: ["parent_id"];
						isOneToOne: false;
						referencedRelation: "categories";
						referencedColumns: ["id"];
					},
				];
			};
			listings: {
				Row: {
					battery_health: number | null;
					carrier: string | null;
					color: string | null;
					condition: Database["public"]["Enums"]["condition_grade"];
					created_at: string | null;
					final_price_kes: number;
					id: string;
					images: string[] | null;
					is_featured: boolean | null;
					is_on_sale: boolean;
					is_preorder: boolean | null;
					is_sold: boolean | null;
					landed_cost_kes: number | null;
					listing_id: string;
					notes: string | null;
					original_price_usd: number | null;
					price_kes: number;
					product_id: string;
					sheets_row_id: string | null;
					source: string | null;
					source_listing_id: string | null;
					source_url: string | null;
					status: Database["public"]["Enums"]["listing_status"] | null;
					storage: string | null;
					updated_at: string | null;
				};
				Insert: {
					battery_health?: number | null;
					carrier?: string | null;
					color?: string | null;
					condition?: Database["public"]["Enums"]["condition_grade"];
					created_at?: string | null;
					final_price_kes: number;
					id?: string;
					images?: string[] | null;
					is_featured?: boolean | null;
					is_on_sale?: boolean;
					is_preorder?: boolean | null;
					is_sold?: boolean | null;
					landed_cost_kes?: number | null;
					listing_id: string;
					notes?: string | null;
					original_price_usd?: number | null;
					price_kes: number;
					product_id: string;
					sheets_row_id?: string | null;
					source?: string | null;
					source_listing_id?: string | null;
					source_url?: string | null;
					status?: Database["public"]["Enums"]["listing_status"] | null;
					storage?: string | null;
					updated_at?: string | null;
				};
				Update: {
					battery_health?: number | null;
					carrier?: string | null;
					color?: string | null;
					condition?: Database["public"]["Enums"]["condition_grade"];
					created_at?: string | null;
					final_price_kes?: number;
					id?: string;
					images?: string[] | null;
					is_featured?: boolean | null;
					is_on_sale?: boolean;
					is_preorder?: boolean | null;
					is_sold?: boolean | null;
					landed_cost_kes?: number | null;
					listing_id?: string;
					notes?: string | null;
					original_price_usd?: number | null;
					price_kes?: number;
					product_id?: string;
					sheets_row_id?: string | null;
					source?: string | null;
					source_listing_id?: string | null;
					source_url?: string | null;
					status?: Database["public"]["Enums"]["listing_status"] | null;
					storage?: string | null;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "listings_product_id_fkey";
						columns: ["product_id"];
						isOneToOne: false;
						referencedRelation: "products";
						referencedColumns: ["id"];
					},
				];
			};
			newsletter_subscribers: {
				Row: {
					email: string;
					id: string;
					subscribed_at: string | null;
				};
				Insert: {
					email: string;
					id?: string;
					subscribed_at?: string | null;
				};
				Update: {
					email?: string;
					id?: string;
					subscribed_at?: string | null;
				};
				Relationships: [];
			};
			order_items: {
				Row: {
					created_at: string | null;
					deposit_kes: number | null;
					id: string;
					listing_id: string;
					order_id: string;
					unit_price_kes: number;
				};
				Insert: {
					created_at?: string | null;
					deposit_kes?: number | null;
					id?: string;
					listing_id: string;
					order_id: string;
					unit_price_kes: number;
				};
				Update: {
					created_at?: string | null;
					deposit_kes?: number | null;
					id?: string;
					listing_id?: string;
					order_id?: string;
					unit_price_kes?: number;
				};
				Relationships: [
					{
						foreignKeyName: "order_items_listing_id_fkey";
						columns: ["listing_id"];
						isOneToOne: false;
						referencedRelation: "listings";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "order_items_order_id_fkey";
						columns: ["order_id"];
						isOneToOne: false;
						referencedRelation: "orders";
						referencedColumns: ["id"];
					},
				];
			};
			orders: {
				Row: {
					balance_due_kes: number | null;
					created_at: string | null;
					deposit_amount_kes: number | null;
					id: string;
					notes: string | null;
					payment_method: Database["public"]["Enums"]["payment_method"] | null;
					payment_ref: string | null;
					shipping_address: Json | null;
					shipping_fee_kes: number | null;
					status: Database["public"]["Enums"]["order_status"] | null;
					subtotal_kes: number;
					total_kes: number;
					tracking_info: Json | null;
					updated_at: string | null;
					user_id: string;
				};
				Insert: {
					balance_due_kes?: number | null;
					created_at?: string | null;
					deposit_amount_kes?: number | null;
					id?: string;
					notes?: string | null;
					payment_method?: Database["public"]["Enums"]["payment_method"] | null;
					payment_ref?: string | null;
					shipping_address?: Json | null;
					shipping_fee_kes?: number | null;
					status?: Database["public"]["Enums"]["order_status"] | null;
					subtotal_kes: number;
					total_kes: number;
					tracking_info?: Json | null;
					updated_at?: string | null;
					user_id: string;
				};
				Update: {
					balance_due_kes?: number | null;
					created_at?: string | null;
					deposit_amount_kes?: number | null;
					id?: string;
					notes?: string | null;
					payment_method?: Database["public"]["Enums"]["payment_method"] | null;
					payment_ref?: string | null;
					shipping_address?: Json | null;
					shipping_fee_kes?: number | null;
					status?: Database["public"]["Enums"]["order_status"] | null;
					subtotal_kes?: number;
					total_kes?: number;
					tracking_info?: Json | null;
					updated_at?: string | null;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "orders_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "profiles";
						referencedColumns: ["id"];
					},
				];
			};
			price_comparisons: {
				Row: {
					competitor: string;
					competitor_price_kes: number;
					crawled_at: string | null;
					id: string;
					product_id: string;
					url: string | null;
				};
				Insert: {
					competitor: string;
					competitor_price_kes: number;
					crawled_at?: string | null;
					id?: string;
					product_id: string;
					url?: string | null;
				};
				Update: {
					competitor?: string;
					competitor_price_kes?: number;
					crawled_at?: string | null;
					id?: string;
					product_id?: string;
					url?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "price_comparisons_product_id_fkey";
						columns: ["product_id"];
						isOneToOne: false;
						referencedRelation: "products";
						referencedColumns: ["id"];
					},
				];
			};
			products: {
				Row: {
					brand: string;
					category_id: string | null;
					created_at: string | null;
					description: string | null;
					fts: unknown;
					id: string;
					images: string[] | null;
					key_features: string[] | null;
					model: string;
					original_price_kes: number | null;
					slug: string;
					specs: Json | null;
					updated_at: string | null;
				};
				Insert: {
					brand: string;
					category_id?: string | null;
					created_at?: string | null;
					description?: string | null;
					fts?: unknown;
					id?: string;
					images?: string[] | null;
					key_features?: string[] | null;
					model: string;
					original_price_kes?: number | null;
					slug: string;
					specs?: Json | null;
					updated_at?: string | null;
				};
				Update: {
					brand?: string;
					category_id?: string | null;
					created_at?: string | null;
					description?: string | null;
					fts?: unknown;
					id?: string;
					images?: string[] | null;
					key_features?: string[] | null;
					model?: string;
					original_price_kes?: number | null;
					slug?: string;
					specs?: Json | null;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "products_category_id_fkey";
						columns: ["category_id"];
						isOneToOne: false;
						referencedRelation: "categories";
						referencedColumns: ["id"];
					},
				];
			};
			profiles: {
				Row: {
					address: Json | null;
					avatar_url: string | null;
					created_at: string | null;
					full_name: string | null;
					id: string;
					phone: string | null;
					role: Database["public"]["Enums"]["user_role"] | null;
					updated_at: string | null;
				};
				Insert: {
					address?: Json | null;
					avatar_url?: string | null;
					created_at?: string | null;
					full_name?: string | null;
					id: string;
					phone?: string | null;
					role?: Database["public"]["Enums"]["user_role"] | null;
					updated_at?: string | null;
				};
				Update: {
					address?: Json | null;
					avatar_url?: string | null;
					created_at?: string | null;
					full_name?: string | null;
					id?: string;
					phone?: string | null;
					role?: Database["public"]["Enums"]["user_role"] | null;
					updated_at?: string | null;
				};
				Relationships: [];
			};
			reviews: {
				Row: {
					body: string | null;
					created_at: string | null;
					id: string;
					product_id: string;
					rating: number;
					title: string | null;
					user_id: string;
					verified_purchase: boolean | null;
				};
				Insert: {
					body?: string | null;
					created_at?: string | null;
					id?: string;
					product_id: string;
					rating: number;
					title?: string | null;
					user_id: string;
					verified_purchase?: boolean | null;
				};
				Update: {
					body?: string | null;
					created_at?: string | null;
					id?: string;
					product_id?: string;
					rating?: number;
					title?: string | null;
					user_id?: string;
					verified_purchase?: boolean | null;
				};
				Relationships: [
					{
						foreignKeyName: "reviews_product_id_fkey";
						columns: ["product_id"];
						isOneToOne: false;
						referencedRelation: "products";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "reviews_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "profiles";
						referencedColumns: ["id"];
					},
				];
			};
			sync_log: {
				Row: {
					id: string;
					triggered_by: string;
					status: string;
					rows_synced: number | null;
					errors: Json | null;
					started_at: string;
					completed_at: string | null;
				};
				Insert: {
					id?: string;
					triggered_by?: string;
					status?: string;
					rows_synced?: number | null;
					errors?: Json | null;
					started_at?: string;
					completed_at?: string | null;
				};
				Update: {
					id?: string;
					triggered_by?: string;
					status?: string;
					rows_synced?: number | null;
					errors?: Json | null;
					started_at?: string;
					completed_at?: string | null;
				};
				Relationships: [];
			};
			wishlist: {
				Row: {
					created_at: string | null;
					id: string;
					product_id: string;
					user_id: string;
				};
				Insert: {
					created_at?: string | null;
					id?: string;
					product_id: string;
					user_id: string;
				};
				Update: {
					created_at?: string | null;
					id?: string;
					product_id?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "wishlist_product_id_fkey";
						columns: ["product_id"];
						isOneToOne: false;
						referencedRelation: "products";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "wishlist_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "profiles";
						referencedColumns: ["id"];
					},
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			condition_grade: "acceptable" | "good" | "excellent" | "premium";
			listing_status: "available" | "sold" | "preorder" | "reserved";
			order_status:
				| "pending"
				| "confirmed"
				| "processing"
				| "shipped"
				| "delivered"
				| "cancelled";
			payment_method: "mpesa" | "paypal";
			user_role: "customer" | "admin";
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
	keyof Database,
	"public"
>];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
				DefaultSchema["Views"])
		? (DefaultSchema["Tables"] &
				DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema["Enums"]
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
		? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema["CompositeTypes"]
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never,
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
		? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
		: never;

export const Constants = {
	public: {
		Enums: {
			condition_grade: ["acceptable", "good", "excellent", "premium"],
			listing_status: ["available", "sold", "preorder", "reserved"],
			order_status: [
				"pending",
				"confirmed",
				"processing",
				"shipped",
				"delivered",
				"cancelled",
			],
			payment_method: ["mpesa", "paypal"],
			user_role: ["customer", "admin"],
		},
	},
} as const;
