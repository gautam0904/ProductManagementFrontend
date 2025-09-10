import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCart } from '../api/cartApi';
import type { Cart } from '../types/cart';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  refreshCart: () => Promise<void>;
  updateCartItem: (productId: string, quantity: number) => Promise<void>;
  removeCartItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshCart = async () => {
    try {
      setLoading(true);
      const cartData = await getCart("507f1f77bcf86cd799439011");
      setCart(cartData);
    } catch (error) {
      console.error('Failed to load cart:', error);
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (productId: string, quantity: number) => {
    try {
      const { updateCartItem: updateCartItemApi } = await import('../api/cartApi');
      const updatedCart = await updateCartItemApi("507f1f77bcf86cd799439011", productId, quantity);
      setCart(updatedCart);
    } catch (error) {
      console.error('Failed to update cart item:', error);
      throw error;
    }
  };

  const removeCartItem = async (productId: string) => {
    try {
      const { removeCartItem: removeCartItemApi } = await import('../api/cartApi');
      const updatedCart = await removeCartItemApi("507f1f77bcf86cd799439011", productId);
      setCart(updatedCart);
    } catch (error) {
      console.error('Failed to remove cart item:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      const { clearCart: clearCartApi } = await import('../api/cartApi');
      const clearedCart = await clearCartApi("507f1f77bcf86cd799439011");
      setCart(clearedCart);
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  };

  const addToCart = async (productId: string, quantity: number) => {
    try {
      const { addToCart: addToCartApi } = await import('../api/cartApi');
      const updatedCart = await addToCartApi({
        productId,
        quantity,
        userId: "507f1f77bcf86cd799439011"
      });
      setCart(updatedCart);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const value: CartContextType = {
    cart,
    loading,
    refreshCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    addToCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
