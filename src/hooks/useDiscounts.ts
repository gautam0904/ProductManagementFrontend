// hooks/useDiscounts.ts
import { useState, useEffect, useCallback } from 'react';
import { getDiscountSuggestions, getApplicableRules, calculateCartDiscounts } from '../api/discountRuleApi';
import type { CartItem } from '../types/cart';

export type DiscountSuggestion = {
  type: string;
  message: string;
  requiredQuantity?: number;
  currentQuantity: number;
  discountAmount?: number;
  ruleId: string;
};

export type DiscountCalculation = {
  originalTotal: number;
  totalDiscount: number;
  finalTotal: number;
  appliedDiscounts: Array<{
    ruleId: string;
    type: string;
    description: string;
    discountAmount: number;
  }>;
};

export type UseDiscountsState = {
  discounts: DiscountCalculation;
  loading: boolean;
  error: string | null;
  availableDiscounts: any[];
  calculateDiscounts: () => Promise<void>;
  checkAvailableDiscounts: () => Promise<void>;
  checkItemDiscounts: (productId?: string, categoryId?: string, quantity?: number) => Promise<DiscountSuggestion[]>;
  formatDiscountMessage: (rule: any, context?: { quantity?: number; cartTotal?: number }) => string;
}

export const useDiscounts = (cartItems: CartItem[] = []): UseDiscountsState => {
  const [discounts, setDiscounts] = useState<DiscountCalculation>({
    originalTotal: 0,
    totalDiscount: 0,
    finalTotal: 0,
    appliedDiscounts: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableDiscounts, setAvailableDiscounts] = useState<any[]>([]);

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
      const result = await calculateCartDiscounts(cartItems, "507f1f77bcf86cd799439011");
      setDiscounts({
        originalTotal: result.originalTotal || 0,
        totalDiscount: result.totalDiscount || 0,
        finalTotal: result.finalTotal || 0,
        appliedDiscounts: result.appliedDiscounts || []
      });
    } catch (err: any) {
      console.error('Error calculating discounts:', err);
      setError(err?.message || 'Failed to calculate discounts');
      setDiscounts({
        originalTotal: cartItems.reduce((sum, item) => sum + (item.unitPrice * item.qty), 0),
        totalDiscount: 0,
        finalTotal: cartItems.reduce((sum, item) => sum + (item.unitPrice * item.qty), 0),
        appliedDiscounts: []
      });
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
      const cartTotal = cartItems.reduce((sum, item) => sum + (item.unitPrice * item.qty), 0);
      const rules = await getApplicableRules(cartItems, cartTotal);
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

  const checkItemDiscounts = useCallback(async (productId?: string, categoryId?: string, quantity: number = 1): Promise<DiscountSuggestion[]> => {
    try {
      if (!productId) return [];
      const suggestions = await getDiscountSuggestions(productId, categoryId, quantity);
      return suggestions.map(suggestion => ({
        type: suggestion.type || 'discount',
        message: suggestion.message || 'Special discount available!',
        requiredQuantity: suggestion.requiredQuantity,
        currentQuantity: quantity,
        discountAmount: suggestion.discountAmount,
        ruleId: suggestion.ruleId || suggestion._id || ''
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

  const formatDiscountMessage = (rule: any, context?: { quantity?: number; cartTotal?: number }) => {
    if (!rule) return 'Discount available';
    
    const { type, discountPercentage, discountAmount, minQuantity, minAmount } = rule;
    const quantity = context?.quantity || 1;
    const cartTotal = context?.cartTotal || 0;
    
    switch (type) {
      case 'BOGO':
        return `Buy ${minQuantity || 2} Get 1 Free! Add ${(minQuantity || 2) - quantity} more to unlock this offer.`;
      case 'PERCENTAGE':
        return `Get ${discountPercentage}% off! ${minAmount ? `Spend ₹${minAmount} more to qualify.` : ''}`;
      case 'FIXED_AMOUNT':
        return `Get ₹${discountAmount} off! ${minAmount ? `Spend ₹${minAmount} more to qualify.` : ''}`;
      case 'CATEGORY_DISCOUNT':
        return `Special category discount available! ${minAmount ? `Spend ₹${minAmount} more to qualify.` : ''}`;
      default:
        return 'Special discount available!';
    }
  };

  return {
    discounts,
    loading,
    error,
    availableDiscounts,
    calculateDiscounts,
    checkAvailableDiscounts,
    checkItemDiscounts,
    formatDiscountMessage
  };
};
