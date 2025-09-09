// services/cartDiscount.service.ts

export type DiscountRule = {
  _id?: string;
  name?: string;
  type:
    | 'BOGO'
    | 'TWO_FOR_ONE'
    | 'PERCENT_CATEGORY'
    | 'PERCENT_PRODUCT'
    | 'FIXED_AMOUNT'
    | 'BUY_X_GET_Y';
  product?: any;
  category?: any;
  percentage?: number;
  fixedAmount?: number;
  minCartValue?: number;
  buyQuantity?: number;
  getQuantity?: number;
  active?: boolean;
  description?: string;
};

export type CartItemLite = {
  product: {
    id: string | number;
    name: string;
    price: number;
    category?: string | { _id: string } | null;
  };
  quantity: number;
};

export type DiscountCalculation = {
  originalTotal: number;
  totalDiscount: number;
  finalTotal: number;
  appliedDiscounts: Array<{
    ruleId?: string;
    name?: string;
    amount: number;
    description?: string;
  }>;
};

export class CartDiscountService {
  baseURL: string;

  constructor() {
    this.baseURL = '/api/discount-rules';
  }

  async calculateDiscounts(cartItems: CartItemLite[]): Promise<DiscountCalculation> {
    try {
      const response = await fetch(`${this.baseURL}/utils/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cartItems })
      });

      if (!response.ok) {
        throw new Error('Failed to calculate discounts');
      }

      const data = await response.json();
      return data.data as DiscountCalculation;
    } catch (error) {
      console.error('Error calculating discounts:', error);
      return this.getFallbackCalculation(cartItems);
    }
  }

  getFallbackCalculation(cartItems: CartItemLite[]): DiscountCalculation {
    const originalTotal = cartItems.reduce((sum, item) =>
      sum + (item.product.price * item.quantity), 0
    );
    
    return {
      originalTotal,
      totalDiscount: 0,
      finalTotal: originalTotal,
      appliedDiscounts: []
    };
  }

  async getApplicableRules(cartItems: CartItemLite[], cartTotal: number): Promise<DiscountRule[]> {
    try {
      const response = await fetch(`${this.baseURL}/utils/applicable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cartItems, cartTotal })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applicable rules');
      }

      const data = await response.json();
      return data.data as DiscountRule[];
    } catch (error) {
      console.error('Error fetching applicable rules:', error);
      return [];
    }
  }

  async checkDiscountAvailability(productId?: string, categoryId?: string, _quantity: number = 1): Promise<DiscountRule[]> {
    try {
      const params = new URLSearchParams();
      if (productId) params.append('product', productId);
      if (categoryId) params.append('category', categoryId);
      params.append('active', 'true');

      const response = await fetch(`${this.baseURL}?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to check discount availability');
      }

      const data = await response.json();
      
      const applicableRules = (data.data as DiscountRule[]).filter(rule => {
        if (rule.product && (rule as any).product?._id === productId) return true;
        if (rule.category && (rule as any).category?._id === categoryId) return true;
        if (rule.type === 'FIXED_AMOUNT') return true;
        return false;
      });

      return applicableRules;
    } catch (error) {
      console.error('Error checking discount availability:', error);
      return [];
    }
  }

  formatDiscountMessage(rule: DiscountRule, context: { quantity?: number; cartTotal?: number } = {}) {
    const { quantity = 1, cartTotal = 0 } = context;

    switch (rule.type) {
      case 'BOGO':
        return `Buy one ${rule.product?.name || rule.category?.name}, get one FREE!`;
      case 'TWO_FOR_ONE':
        return `Buy 2 ${rule.product?.name || rule.category?.name}, pay for just 1!`;
      case 'PERCENT_CATEGORY':
        return `${rule.percentage}% OFF all ${rule.category?.name}!`;
      case 'PERCENT_PRODUCT':
        return `${rule.percentage}% OFF ${rule.product?.name}!`;
      case 'FIXED_AMOUNT':
        if (rule.minCartValue && cartTotal < rule.minCartValue) {
          const needed = rule.minCartValue - cartTotal;
          return `Add $${needed.toFixed(2)} more to get $${rule.fixedAmount} off!`;
        }
        return `$${rule.fixedAmount} OFF your order!`;
      case 'BUY_X_GET_Y':
        const productName = rule.product?.name || rule.category?.name;
        if (quantity < (rule.buyQuantity || 0)) {
          const needed = (rule.buyQuantity || 0) - quantity;
          return `Add ${needed} more ${productName} to get ${rule.getQuantity} FREE!`;
        }
        return `Buy ${rule.buyQuantity} ${productName}, get ${rule.getQuantity} FREE!`;
      default:
        return rule.name || 'Special discount available!';
    }
  }
}
