import type { Product, OfferType } from "./products";

export type AppliedOffer = {
  type: OfferType;
  label: string;       // e.g., "BOGO: 1 free"
  discount: number;    // in product currency
};

export interface CartItem {
  product: Product;
  quantity: number;
  lineTotal: number;        // after discounts for this item
  appliedOffers?: AppliedOffer[];
}

export interface Cart {
  items: CartItem[];
  subtotal: number;    // sum of qty * unit price (pre-discount)
  discounts: number;   // total discount
  total: number;       // subtotal - discounts
  currency: string;    // e.g., "₹" or "$"
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
  userId?: string;
}

export interface CartResponse {
  success: boolean;
  message: string;
  data?: Cart;
}
