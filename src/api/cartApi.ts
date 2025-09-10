import httpClient from "./httpClient";
import type { Cart, AddToCartRequest, CartResponse } from "../types/cart";

// Get cart by user ID
export const getCart = async (userId: string = "507f1f77bcf86cd799439011"): Promise<Cart> => {
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

// Update item quantity in cart
export const updateCartItem = async (userId: string, productId: string, quantity: number): Promise<Cart> => {
  const { data } = await httpClient.put<CartResponse>(`/cart/${userId}/items/${productId}`, { quantity });
  if (!data.data) throw new Error('Failed to update cart item');
  return data.data;
};

// Remove item from cart
export const removeCartItem = async (userId: string, productId: string): Promise<Cart> => {
  const { data } = await httpClient.delete<CartResponse>(`/cart/${userId}/items/${productId}`);
  if (!data.data) throw new Error('Failed to remove cart item');
  return data.data;
};

// Clear entire cart
export const clearCart = async (userId: string = "507f1f77bcf86cd799439011"): Promise<Cart> => {
  const { data } = await httpClient.delete<CartResponse>(`/cart/${userId}/clear`);
  if (!data.data) throw new Error('Failed to clear cart');
  return data.data;
};

// Legacy functions for backward compatibility
export const addItem = async (productId: string, quantity: number, userId: string = "507f1f77bcf86cd799439011"): Promise<Cart> => {
  return addToCart({ productId, quantity, userId });
};

export const updateItemQty = async (productId: string, quantity: number, userId: string = "507f1f77bcf86cd799439011"): Promise<Cart> => {
  return updateCartItem(userId, productId, quantity);
};

export const removeItem = async (productId: string, userId: string = "507f1f77bcf86cd799439011"): Promise<Cart> => {
  return removeCartItem(userId, productId);
};
