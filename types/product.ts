export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type ConditionGrade = "acceptable" | "good" | "excellent" | "premium";
export type ListingStatus = "available" | "reserved" | "sold" | "unlisted";

export type Category = {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	image_url: string | null;
	parent_id: string | null;
	sort_order: number;
	created_at: string;
	updated_at: string;
};
export type Product = {
	id: string;
	brand: string;
	model: string;
	slug: string;
	category_id: string;
	description: string | null;
	specs: Json | null;
	key_features: string[] | null;
	images: string[] | null;
	original_price_kes: number;
	created_at: string;
	updated_at: string;
	fts: unknown;
	category?: Category;
};
export type Listing = {
	id: string;
	listing_id: string;
	product_id: string;
	storage: string | null;
	color: string | null;
	carrier: string | null;
	condition: ConditionGrade;
	battery_health: number | null;
	price_kes: number;
	final_price_kes: number;
	original_price_usd: number;
	landed_cost_kes: number;
	source: string | null;
	source_listing_id: string | null;
	source_url: string | null;
	images: string[] | null;
	is_preorder: boolean;
	is_sold: boolean;
	is_featured: boolean;
	is_on_sale: boolean;
	status: ListingStatus;
	sheets_row_id: string | null;
	notes: string | null;
	created_at: string;
	updated_at: string;
};

export interface ListingWithProduct extends Listing {
	product: Product;
	category?: Category;
}
