import { ProductCategory } from '../constants/product.constants';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  stock: number;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
