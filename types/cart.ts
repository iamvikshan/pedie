import type { Listing } from "./product";

export interface CartItem {
	listing: Listing;
	quantity: number;
}

export interface Cart {
	items: CartItem[];
	total_kes: number;
	deposit_total: number;
}
