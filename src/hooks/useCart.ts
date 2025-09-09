import { useCallback, useState, useEffect } from "react";
import type { Cart } from "../types/cart";
import type { Product } from "../types/products";
import { 
  addToCart as addToCartService,
  updateCartItemQuantity,
  removeFromCart,
  clearCart as clearCartService,
  getCart as getCartService,
  getCartItemCount
} from "../services/cartService";
import { getOfferSuggestion } from "../services/offerService";

// Alias to match the Cart type from types/cart.ts
type CartState = Cart;

export const useCart = () => {
  const [cart, setCart] = useState<CartState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [offerPrompt, setOfferPrompt] = useState<null | { 
    title: string; 
    message: string; 
    onAccept: () => Promise<void> 
  }>(null);

  // Load cart on mount
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = getCartService();
        setCart(savedCart);
      } catch (error) {
        console.error('Failed to load cart:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCart();
  }, []);

  // Add item to cart
  const addToCart = useCallback(async (product: Product, quantity: number = 1) => {
    const productId = product.id?.toString();
    if (!productId) {
      console.error('Cannot add product to cart: Product ID is missing');
      return;
    }
    try {
      setLoading(true);
      const { cart: updatedCart, offerSuggestion } = addToCartService(product, quantity);
      setCart(updatedCart);

      // Handle offer suggestion if any
      if (offerSuggestion) {
        const { title, message, addQty } = offerSuggestion;
        setOfferPrompt({
          title,
          message,
          onAccept: async () => {
            const { cart: cartWithOffer } = addToCartService(product, addQty);
            setCart(cartWithOffer);
            setOfferPrompt(null);
          },
        });
      } else {
        // Suggest an upsell if applicable (based on *current* qty after add)
        const suggestion = getOfferSuggestion(product, quantity);
        if (suggestion) {
          const { title, message, addQty } = suggestion;
          setOfferPrompt({
            title,
            message,
            onAccept: async () => {
              const { cart: cartWithOffer } = addToCartService(product, addQty);
              setCart(cartWithOffer);
              setOfferPrompt(null);
            },
          });
        }
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update item quantity
  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (!productId) {
      console.error('Cannot update quantity: Product ID is missing');
      return;
    }
    try {
      setLoading(true);
      const updatedCart = updateCartItemQuantity(productId, quantity);
      setCart(updatedCart);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove item from cart
  const removeItem = useCallback(async (productId: string) => {
    if (!productId) {
      console.error('Cannot remove item: Product ID is missing');
      return;
    }
    try {
      setLoading(true);
      const updatedCart = removeFromCart(productId);
      setCart(updatedCart);
    } catch (error) {
      console.error('Failed to remove item:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    try {
      setLoading(true);
      const emptyCart = clearCartService();
      setCart(emptyCart);
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get current cart item count
  const itemCount = getCartItemCount();

  const clearOfferPrompt = () => setOfferPrompt(null);
  
  const acceptOffer = async () => {
    if (offerPrompt) {
      await offerPrompt.onAccept();
    }
  };

  return { 
    cart, 
    loading, 
    itemCount,
    addToCart, 
    updateQuantity, 
    removeItem, 
    clearCart,
    offerPrompt, 
    clearOfferPrompt, 
    acceptOffer 
  };
};
