import { useState, useEffect, useCallback } from 'react';
import { 
  getDiscountRules, 
  createDiscountRule, 
  updateDiscountRule, 
  deleteDiscountRule,
  getDiscountTypeSuggestions 
} from '../api/discountRuleApi';
import type { DiscountRule, CreateDiscountRuleRequest, UpdateDiscountRuleRequest } from '../types/discountRule';
import toast from 'react-hot-toast';

export const useDiscountRules = () => {
  const [rules, setRules] = useState<DiscountRule[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const rulesData = await getDiscountRules();
      setRules(rulesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load discount rules');
      console.error('Failed to load discount rules:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSuggestions = useCallback(async () => {
    try {
      const suggestionsData = await getDiscountTypeSuggestions();
      setSuggestions(suggestionsData);
    } catch (err: any) {
      console.error('Failed to load suggestions:', err);
    }
  }, []);

  const addRule = useCallback(async (ruleData: CreateDiscountRuleRequest) => {
    try {
      setLoading(true);
      const newRule = await createDiscountRule(ruleData);
      setRules(prev => [...prev, newRule]);
      toast.success('Discount rule created successfully');
      return newRule;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create discount rule';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const editRule = useCallback(async (id: string, ruleData: UpdateDiscountRuleRequest) => {
    try {
      setLoading(true);
      const updatedRule = await updateDiscountRule(id, ruleData);
      setRules(prev => prev.map(rule => rule._id === id ? updatedRule : rule));
      toast.success('Discount rule updated successfully');
      return updatedRule;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update discount rule';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeRule = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await deleteDiscountRule(id);
      setRules(prev => prev.filter(rule => rule._id !== id));
      toast.success('Discount rule deleted successfully');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete discount rule';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getActiveRules = useCallback(() => {
    return rules.filter(rule => rule.active);
  }, [rules]);

  const getRulesByType = useCallback((type: string) => {
    return rules.filter(rule => rule.type === type);
  }, [rules]);

  const getRulesForProduct = useCallback((productId: string) => {
    return rules.filter(rule => 
      rule.active && 
      (rule.product?._id === productId || 
       rule.type === 'FIXED_AMOUNT' || 
       rule.type === 'PERCENT_CATEGORY')
    );
  }, [rules]);

  const getRulesForCategory = useCallback((categoryId: string) => {
    return rules.filter(rule => 
      rule.active && 
      (rule.category?._id === categoryId || 
       rule.type === 'FIXED_AMOUNT')
    );
  }, [rules]);

  useEffect(() => {
    loadRules();
    loadSuggestions();
  }, [loadRules, loadSuggestions]);

  return {
    rules,
    suggestions,
    loading,
    error,
    loadRules,
    loadSuggestions,
    addRule,
    editRule,
    removeRule,
    getActiveRules,
    getRulesByType,
    getRulesForProduct,
    getRulesForCategory
  };
};
