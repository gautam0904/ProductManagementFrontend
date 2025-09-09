export type OfferType = "BOGO" | "B2G1" | null;

export interface Product {
  _id?: string;
  id?: number; // For backward compatibility
  name: string;
  description: string;
  productimage: string;
  price: number;
  stock: number;
  category: string; // Category ObjectId
  owner: string; // User ObjectId
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields for backward compatibility
  title?: string;
  image?: string;
  currency?: string;
  offer?: OfferType;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  productimage?: File;
}

export interface UpdateProductRequest {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  productimage?: File;
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data?: Product;
  products?: Product[];
}
