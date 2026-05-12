import { ProductCategory } from '../constants/product.constants';

export interface ProductReview {
  user: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  stock: number;
  imageUrl?: string;
  imageUrls: string[];
  ratingAverage: number;
  reviewsCount: number;
  reviews: ProductReview[];
  createdAt?: string;
  updatedAt?: string;
}
