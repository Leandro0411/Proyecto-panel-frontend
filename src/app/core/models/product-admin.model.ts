import { ProductCategory } from '../constants/product.constants';

export interface ProductQueryParams {
  page: number;
  limit: number;
  name?: string;
  category?: ProductCategory;
  sortBy?: string;
}

export interface CreateProductPayload {
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  stock: number;
  imageFiles?: File[];
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  price?: number;
  category?: ProductCategory;
  stock?: number;
  imageFiles?: File[];
}

export interface CreateProductReviewPayload {
  rating: number;
  comment: string;
}
