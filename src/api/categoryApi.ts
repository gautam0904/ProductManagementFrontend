import httpClient from "./httpClient";
import type { Category, CreateCategoryRequest, UpdateCategoryRequest, CategoryResponse } from "../types/category";

// Get all categories
export const getCategories = async () => {
  const { data } = await httpClient.get<CategoryResponse>("/category");
  return data.data  || [];
};

// Create new category
export const createCategory = async (categoryData: CreateCategoryRequest): Promise<Category> => {
  const { data } = await httpClient.post<CategoryResponse>("/category", categoryData);
  if (!data.data) throw new Error('Failed to create category');
  return data.data;
};

// Update category
export const updateCategory = async (id: string, categoryData: UpdateCategoryRequest): Promise<Category> => {
  const { data } = await httpClient.put<CategoryResponse>(`/category/${id}`, categoryData);
  if (!data.data) throw new Error('Failed to update category');
  return data.data;
};

// Delete category
export const deleteCategory = async (id: string): Promise<void> => {
  await httpClient.delete<CategoryResponse>(`/category/${id}`);
};

