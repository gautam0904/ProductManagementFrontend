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

