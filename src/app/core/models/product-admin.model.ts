export interface ProductQueryParams {
  page: number;
  limit: number;
  name?: string;
  category?: string;
  sortBy?: string;
}

export interface CreateProductPayload {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  stock?: number;
}
