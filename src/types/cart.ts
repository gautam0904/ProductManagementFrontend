export interface CartItem {
  product: string; // ObjectId as string
  name: string;
  qty: number;
  unitPrice: number;
  discount: number;
  finalPrice: number;
  paidQty: number;
  breakdown?: string[];
  stock?: number;
  image?: string;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  payable: number;
  savings?: number;
}

export interface Cart {
  items: CartItem[];
  totals: CartTotals;
  discountApplied: boolean;
  cartId?: string;
  updatedAt?: Date;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
  userId?: string;
}

export interface UpdateCartItemRequest {
  productId: string;
  quantity: number;
  userId?: string;
}

export interface CartResponse {
  success: boolean;
  message: string;
  data?: Cart;
}

// Legacy types for backward compatibility
export type AppliedOffer = {
  type: string;
  label: string;
  discount: number;
};

export interface LegacyCartItem {
  product: any;
  quantity: number;
  lineTotal: number;
  appliedOffers?: AppliedOffer[];
}

export interface LegacyCart {
  items: LegacyCartItem[];
  subtotal: number;
  discounts: number;
  total: number;
  currency: string;
}
