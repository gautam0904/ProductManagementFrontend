export interface DiscountRule {
  _id: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'bogo' | 'b2g1';
  value: number; // percentage (0-100) or fixed amount
  minQuantity?: number;
  maxQuantity?: number;
  applicableProducts?: string[]; // Product IDs
  applicableCategories?: string[]; // Category IDs
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDiscountRuleRequest {
  name: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'bogo' | 'b2g1';
  value: number;
  minQuantity?: number;
  maxQuantity?: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface UpdateDiscountRuleRequest {
  name?: string;
  description?: string;
  type?: 'percentage' | 'fixed' | 'bogo' | 'b2g1';
  value?: number;
  minQuantity?: number;
  maxQuantity?: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface DiscountRuleResponse {
  success: boolean;
  message: string;
  data?: DiscountRule;
  rules?: DiscountRule[];
}

