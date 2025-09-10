// hooks/useDiscounts.ts
import { useState, useEffect, useCallback } from 'react';
import { CartDiscountService, type CartItemLite, type DiscountCalculation, type DiscountRule } from '../services/cartDiscount.service';

export type UseDiscountsState = {
  discounts: DiscountCalculation;
  loading: boolean;
  error: string | null;
  availableDiscounts: DiscountRule[];
  calculateDiscounts: () => Promise<void>;
  checkAvailableDiscounts: () => Promise<void>;
  checkItemDiscounts: (productId?: string, categoryId?: string, quantity?: number) => Promise<(DiscountRule & { message: string })[]>;
  formatDiscountMessage: (rule: DiscountRule, context?: { quantity?: number; cartTotal?: number }) => string;
}

export const useDiscounts = (cartItems: CartItemLite[] = []): UseDiscountsState => {
  const [discounts, setDiscounts] = useState<DiscountCalculation>({
    originalTotal: 0,
    totalDiscount: 0,
    finalTotal: 0,
    appliedDiscounts: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableDiscounts, setAvailableDiscounts] = useState<DiscountRule[]>([]);

  const discountService = new CartDiscountService();

  const calculateDiscounts = useCallback(async () => {
    if (!cartItems || cartItems.length === 0) {
      setDiscounts({
        originalTotal: 0,
        totalDiscount: 0,
        finalTotal: 0,
        appliedDiscounts: []
      });
      return;
    }

    // Skip if already loading to prevent multiple simultaneous calculations
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await discountService.calculateDiscounts(cartItems);
      setDiscounts(result);
    } catch (err: any) {
      console.error('Error calculating discounts:', err);
      setError(err?.message || 'Failed to calculate discounts');
      const result = discountService.getFallbackCalculation(cartItems);
      setDiscounts(result);
    } finally {
      setLoading(false);
    }
  }, [cartItems, loading]);

  const checkAvailableDiscounts = useCallback(async () => {
    if (!cartItems || cartItems.length === 0) {
      setAvailableDiscounts([]);
      return;
    }

    try {
      const cartTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      const rules = await discountService.getApplicableRules(cartItems, cartTotal);
      setAvailableDiscounts(prevRules => {
        // Only update if rules have actually changed
        const rulesChanged = JSON.stringify(prevRules) !== JSON.stringify(rules);
        return rulesChanged ? rules : prevRules;
      });
    } catch (err) {
      console.error('Error checking available discounts:', err);
      setAvailableDiscounts([]);
    }
  }, [cartItems]);

  const checkItemDiscounts = useCallback(async (productId?: string, categoryId?: string, quantity: number = 1) => {
    try {
      const rules = await discountService.checkDiscountAvailability(productId, categoryId, quantity);
      return rules.map(rule => ({
        ...rule,
        message: discountService.formatDiscountMessage(rule, { quantity })
      }));
    } catch (err) {
      console.error('Error checking item discounts:', err);
      return [];
    }
  }, []);

  // Only run calculations when cartItems change
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateDiscounts();
      checkAvailableDiscounts();
    }, 100); // Small debounce to prevent rapid recalculations
    
    return () => clearTimeout(timer);
  }, [JSON.stringify(cartItems)]); // Stringify to prevent reference changes

  return {
    discounts,
    loading,
    error,
    availableDiscounts,
    calculateDiscounts,
    checkAvailableDiscounts,
    checkItemDiscounts,
    formatDiscountMessage: discountService.formatDiscountMessage.bind(discountService)
  };
};
