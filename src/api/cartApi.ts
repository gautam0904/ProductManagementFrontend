import httpClient from "./httpClient";
import type { Cart, AddToCartRequest, CartResponse } from "../types/cart";

// Get cart by user ID
export const getCart = async (userId: string = ""): Promise<Cart> => {
  const { data } = await httpClient.get<CartResponse>(`/cart/${userId}`);
  if (!data.data) throw new Error('Cart not found');
  return data.data;
};

// Add item to cart
export const addToCart = async (cartData: AddToCartRequest): Promise<Cart> => {
  const { data } = await httpClient.post<CartResponse>("/cart/add", cartData);
  if (!data.data) throw new Error('Failed to add item to cart');
  return data.data;
};

// Legacy functions for backward compatibility
export const addItem = async (productId: string, quantity: number, userId: string = ""): Promise<Cart> => {
  return addToCart({ productId, quantity, userId });
};

export const updateItemQty = async (productId: string, quantity: number, userId: string): Promise<Cart> => {
  // This would need to be implemented in the backend
  // For now, we'll use the existing cart logic
  const cart = await getCart(userId);
  return cart;
};

export const removeItem = async (productId: string, userId: string): Promise<Cart> => {
  // This would need to be implemented in the backend
  // For now, we'll use the existing cart logic
  const cart = await getCart(userId);
  return cart;
};

export const clearCart = async (userId: string): Promise<Cart> => {
  // This would need to be implemented in the backend
  // For now, we'll return an empty cart
  return {
    items: [],
    subtotal: 0,
    discounts: 0,
    total: 0,
    currency: '₹'
  };
};
