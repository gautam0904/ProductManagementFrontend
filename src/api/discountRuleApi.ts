import httpClient from "./httpClient";
import type { DiscountRule, CreateDiscountRuleRequest, UpdateDiscountRuleRequest, DiscountRuleResponse } from "../types/discountRule";

// Get all discount rules
export const getDiscountRules = async () => {
  const { data } = await httpClient.get<DiscountRuleResponse>("/rules");
  return data.data || [];
};

// Create new discount rule
export const createDiscountRule = async (ruleData: CreateDiscountRuleRequest): Promise<DiscountRule> => {
  const { data } = await httpClient.post<DiscountRuleResponse>("/rules", ruleData);
  if (!data.data) throw new Error('Failed to create discount rule');
  return data.data;
};

// Update discount rule
export const updateDiscountRule = async (id: string, ruleData: UpdateDiscountRuleRequest): Promise<DiscountRule> => {
  const { data } = await httpClient.put<DiscountRuleResponse>(`/rules/${id}`, ruleData);
  if (!data.data) throw new Error('Failed to update discount rule');
  return data.data;
};

// Delete discount rule
export const deleteDiscountRule = async (id: string): Promise<void> => {
  await httpClient.delete<DiscountRuleResponse>(`/rules/${id}`);
};

// Get discount type suggestions
export const getDiscountTypeSuggestions = async (): Promise<string[]> => {
  const { data } = await httpClient.get<{ data: Record<string, any> }>("/rules/utils/suggestions");
  return Object.keys(data.data || {});
};

// Get applicable discount rules for cart items
export const getApplicableRules = async (cartItems: any[], cartTotal: number) => {
  const { data } = await httpClient.post<{ data: any[] }>("/rules/applicable", {
    cartItems,
    cartTotal
  });
  return data.data || [];
};

// Calculate cart discounts
export const calculateCartDiscounts = async (cartItems: any[], userId: string) => {
  const { data } = await httpClient.post<{ data: any }>("/rules/calculate", {
    cartItems,
    userId
  });
  return data.data;
};

// Get discount suggestions for specific product
export const getDiscountSuggestions = async (productId: string, categoryId?: string, quantity: number = 1) => {
  try {
    // For now, we'll get all rules and filter them on the frontend
    // This is a temporary solution until the backend suggestions endpoint is fixed
    const { data } = await httpClient.get<{ data: any[] }>("/rules");
    const allRules = data.data || [];
    
    // Filter rules that apply to this product or category
    const applicableRules = allRules.filter(rule => {
      if (!rule.active) return false;
      
      // Check if rule applies to this specific product
      if (rule.product && rule.product._id === productId) {
        return true;
      }
      
      // Check if rule applies to this category
      if (rule.category && rule.category._id === categoryId) {
        return true;
      }
      
      return false;
    });
    
    // Convert rules to suggestions
    return applicableRules.map(rule => ({
      type: rule.type,
      message: getSuggestionMessage(rule, quantity),
      requiredQuantity: rule.minQuantity || 1,
      currentQuantity: quantity,
      discountAmount: calculateDiscountAmount(rule),
      ruleId: rule._id,
      rule: rule
    }));
  } catch (error) {
    console.error('Error fetching discount suggestions:', error);
    return [];
  }
};

// Helper function to generate suggestion message
const getSuggestionMessage = (rule: any, currentQuantity: number) => {
  const { type, minQuantity, percentage, fixedAmount, description } = rule;
  
  switch (type) {
    case 'BOGO':
      const needed = (minQuantity || 2) - currentQuantity;
      return `Buy ${minQuantity || 2} Get 1 Free! Add ${needed} more to unlock this offer.`;
    case 'TWO_FOR_ONE':
      const needed2 = (minQuantity || 2) - currentQuantity;
      return `2-for-1 Deal! Add ${needed2} more to get one free.`;
    case 'PERCENT_CATEGORY':
      return `Get ${percentage}% off! Add more items from this category to qualify.`;
    case 'FIXED_AMOUNT':
      return `Get ₹${fixedAmount} off! Add more items to qualify.`;
    default:
      return description || 'Special discount available!';
  }
};

// Helper function to calculate discount amount
const calculateDiscountAmount = (rule: any) => {
  const { type, percentage, fixedAmount } = rule;
  
  switch (type) {
    case 'PERCENT_CATEGORY':
      return percentage;
    case 'FIXED_AMOUNT':
      return fixedAmount;
    default:
      return 0;
  }
};

