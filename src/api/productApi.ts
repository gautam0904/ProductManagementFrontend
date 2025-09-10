import httpClient from "./httpClient";
import type { Product, CreateProductRequest, UpdateProductRequest, ProductResponse } from "../types/products";

// Get all products
export const listProducts = async (): Promise<Product[]> => {
  const { data } = await httpClient.get<ProductResponse>("/products/get");
  return data.data as unknown as Product[] || [];
};

// Get product by ID
export const getProductById = async (id: string): Promise<Product> => {
  const { data } = await httpClient.get<ProductResponse>(`/products/get?id=${id}`);
  if (!data.data) throw new Error('Product not found');
  return data.data;
};

// Create new product
export const createProduct = async (productData: CreateProductRequest): Promise<Product> => {
  const formData = new FormData();
  formData.append('name', productData.name);
  formData.append('description', productData.description);
  formData.append('price', productData.price.toString());
  formData.append('stock', productData.stock.toString());
  formData.append('category', productData.category);
  
  if (productData.productimage) {
    formData.append('productimage', productData.productimage);
  }

  const { data } = await httpClient.post<ProductResponse>("/products/create", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  if (!data.data) throw new Error('Failed to create product');
  return data.data;
};

// Update product with picture
export const updateProductWithPicture = async (productData: UpdateProductRequest) => {
  const formData = new FormData();
  formData.append('id', productData.id);
  
  if (productData.name) formData.append('name', productData.name);
  if (productData.description) formData.append('description', productData.description);
  if (productData.price !== undefined) formData.append('price', productData.price.toString());
  if (productData.stock !== undefined) formData.append('stock', productData.stock.toString());
  if (productData.category) formData.append('category', productData.category);
  
  if (productData.productimage) {
    formData.append('productimage', productData.productimage);
  }

  const { data } = await httpClient.put<ProductResponse>("/products/update", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  if (!data) throw new Error('Failed to update product');
  return data;
};

// Update product without picture
export const updateProductWithoutPicture = async (productData: UpdateProductRequest): Promise<Product> => {
  const { data } = await httpClient.put<ProductResponse>("/products/updatewithoutpicture", {
    id: productData.id,
    name: productData.name,
    description: productData.description,
    price: productData.price,
    stock: productData.stock,
    category: productData.category,
  });
  
  if (!data.data) throw new Error('Failed to update product');
  return data.data;
};

// Delete product
export const deleteProduct = async (id: string): Promise<void> => {
  await httpClient.delete<ProductResponse>(`/products/delete?Id=${id}`);
};

// Helper function to normalize product data for display
export const normalizeProduct = (product: Product): Product => {
  return {
    ...product,
    // Map backend fields to frontend display fields
    title: product.name,
    image: product.productimage,
    currency: '₹', // Default currency
    id: product._id ? parseInt(product._id.slice(-6), 16) : product.id, // Generate numeric ID from ObjectId
  };
};
