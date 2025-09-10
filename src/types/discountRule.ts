export interface DiscountRule {
  _id: string;
  name: string;
  description?: string;
  type: 'BOGO' | 'TWO_FOR_ONE' | 'PERCENT_CATEGORY' | 'PERCENT_PRODUCT' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y';
  product?: {
    _id: string;
    name: string;
  };
  category?: {
    _id: string;
    name: string;
  };
  percentage?: number;
  fixedAmount?: number;
  buyQuantity?: number;
  getQuantity?: number;
  minCartValue?: number;
  minQuantity?: number;
  maxDiscount?: number;
  maxUses?: number;
  currentUses?: number;
  startDate?: string;
  endDate?: string;
  priority?: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDiscountRuleRequest {
  name: string;
  description?: string;
  type: 'BOGO' | 'TWO_FOR_ONE' | 'PERCENT_CATEGORY' | 'PERCENT_PRODUCT' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y';
  product?: string; // Product ID
  category?: string; // Category ID
  percentage?: number;
  fixedAmount?: number;
  buyQuantity?: number;
  getQuantity?: number;
  minCartValue?: number;
  minQuantity?: number;
  maxDiscount?: number;
  maxUses?: number;
  startDate?: string;
  endDate?: string;
  priority?: number;
  active?: boolean;
}

export interface UpdateDiscountRuleRequest {
  name?: string;
  description?: string;
  type?: 'BOGO' | 'TWO_FOR_ONE' | 'PERCENT_CATEGORY' | 'PERCENT_PRODUCT' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y';
  product?: string; // Product ID
  category?: string; // Category ID
  percentage?: number;
  fixedAmount?: number;
  buyQuantity?: number;
  getQuantity?: number;
  minCartValue?: number;
  minQuantity?: number;
  maxDiscount?: number;
  maxUses?: number;
  startDate?: string;
  endDate?: string;
  priority?: number;
  active?: boolean;
}

export interface DiscountRuleResponse {
  success: boolean;
  message: string;
  data?: DiscountRule;
  rules?: DiscountRule[];
}

