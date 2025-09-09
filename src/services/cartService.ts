import type { Cart, CartItem, AppliedOffer } from '../types/cart';
import type { Product } from '../types/products';
import { getOfferSuggestion } from './offerService';

export const CART_STORAGE_KEY = 'shopping_cart';

// Initialize cart from localStorage or create a new one
const getInitialCart = (): Cart => {
  if (typeof window === 'undefined') {
    return createNewCart();
  }
  
  const savedCart = localStorage.getItem(CART_STORAGE_KEY);
  return savedCart ? JSON.parse(savedCart) : createNewCart();
};

// Create a new empty cart
const createNewCart = (): Cart => ({
  items: [],
  subtotal: 0,
  discounts: 0,
  total: 0,
  currency: '₹'
});

// Save cart to localStorage
const saveCart = (cart: Cart): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }
};

// Calculate cart totals and apply offers
const calculateCart = (items: CartItem[]): Omit<Cart, 'items'> => {
  const subtotal = items.reduce((sum, item) => 
    sum + (item.product.price * item.quantity), 0);
  
  // Apply offers and calculate discounts
  const { total, discounts } = items.reduce((acc, item) => {
    const itemTotal = item.product.price * item.quantity;
    let itemDiscount = 0;
    
    // Apply offers if any
    if (item.appliedOffers?.length) {
      itemDiscount = item.appliedOffers.reduce((sum, offer) => sum + offer.discount, 0);
    }
    
    return {
      total: acc.total + (itemTotal - itemDiscount),
      discounts: acc.discounts + itemDiscount
    };
  }, { total: 0, discounts: 0 });
  
  return { subtotal, discounts, total, currency: '₹' };
};

// Find item in cart by product ID
const findCartItem = (cart: Cart, productId: string | number): CartItem | undefined => {
  const id = productId?.toString();
  return cart.items.find(item => 
    item.product.id?.toString() === id || 
    item.product._id?.toString() === id
  );
};

// Add item to cart
export const addToCart = (product: Product, quantity: number = 1): { cart: Cart; offerSuggestion?: any } => {
  const productId = product._id || product.id;
  if (!productId) {
    throw new Error('Product ID is required');
  }
  const cart = getInitialCart();
  const existingItem = findCartItem(cart, productId.toString());
  
  if (existingItem) {
    // Update quantity if item exists
    existingItem.quantity += quantity;
  } else {
    // Add new item
    const newItem: CartItem = {
      product,
      quantity,
      lineTotal: product.price * quantity,
      appliedOffers: []
    };
    cart.items.push(newItem);
  }
  
  // Calculate cart totals
  const calculatedCart = { ...calculateCart(cart.items), items: cart.items };
  
  // Check for offers
  const offerSuggestion = getOfferSuggestion(product, existingItem ? existingItem.quantity : 0);
  
  // Save to localStorage
  saveCart(calculatedCart);
  
  return { cart: calculatedCart, offerSuggestion };
};

// Update item quantity
export const updateCartItemQuantity = (productId: string | number, quantity: number): Cart => {
  const productIdStr = productId.toString();
  if (quantity < 1) {
    return removeFromCart(productId);
  }
  
  const cart = getInitialCart();
  const item = findCartItem(cart, productIdStr);
  
  if (item) {
    item.quantity = quantity;
    item.lineTotal = item.product.price * quantity;
    
    // Recalculate offers if needed
    if (item.quantity >= 2) {
      // Example: Apply BOGO offer if quantity is 2 or more
      item.appliedOffers = [{
        type: 'BOGO',
        label: 'Buy 1 Get 1 Free',
        discount: Math.floor(item.quantity / 2) * item.product.price
      }];
    } else {
      item.appliedOffers = [];
    }
  }
  
  const updatedCart = { ...calculateCart(cart.items), items: cart.items };
  saveCart(updatedCart);
  return updatedCart;
};

// Remove item from cart
export const removeFromCart = (productId: string | number): Cart => {
  const productIdStr = productId.toString();
  const cart = getInitialCart();
  cart.items = cart.items.filter(item => item.product.id?.toString() !== productIdStr);
  
  const updatedCart = { ...calculateCart(cart.items), items: cart.items };
  saveCart(updatedCart);
  return updatedCart;
};

// Clear the entire cart
export const clearCart = (): Cart => {
  const newCart = createNewCart();
  saveCart(newCart);
  return newCart;
};

// Get current cart
export const getCart = (): Cart => {
  return getInitialCart();
};

// Get cart item count
export const getCartItemCount = (): number => {
  const cart = getInitialCart();
  return cart.items.reduce((count, item) => count + item.quantity, 0);
};
