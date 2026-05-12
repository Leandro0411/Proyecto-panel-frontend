import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../models/api-response.model';
import {
  CreateProductPayload,
  CreateProductReviewPayload,
  ProductQueryParams,
  UpdateProductPayload,
} from '../models/product-admin.model';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  constructor(private readonly http: HttpClient) {}

  getProducts(query: ProductQueryParams): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams().set('page', query.page).set('limit', query.limit);

    if (query.name) {
      params = params.set('name', query.name);
    }

    if (query.category) {
      params = params.set('category', query.category);
    }

    if (query.sortBy) {
      params = params.set('sortBy', query.sortBy);
    }

    return this.http.get<PaginatedResponse<Product>>(`${environment.apiUrl}/products`, { params });
  }

  createProduct(payload: CreateProductPayload): Observable<Product> {
    return this.http.post<Product>(`${environment.apiUrl}/products`, this.toProductFormData(payload));
  }

  updateProduct(productId: string, payload: UpdateProductPayload): Observable<Product> {
    return this.http.patch<Product>(`${environment.apiUrl}/products/${productId}`, this.toProductFormData(payload));
  }

  deleteProduct(productId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/products/${productId}`);
  }

  getProduct(productId: string): Observable<Product> {
    return this.http.get<Product>(`${environment.apiUrl}/products/${productId}`);
  }

  addReview(productId: string, payload: CreateProductReviewPayload): Observable<Product> {
    return this.http.post<Product>(`${environment.apiUrl}/products/${productId}/reviews`, payload);
  }

  private toProductFormData(payload: CreateProductPayload | UpdateProductPayload): FormData {
    const formData = new FormData();

    if (payload.name !== undefined) {
      formData.append('name', payload.name);
    }

    if (payload.description !== undefined) {
      formData.append('description', payload.description);
    }

    if (payload.category !== undefined) {
      formData.append('category', payload.category);
    }

    if (payload.price !== undefined) {
      formData.append('price', String(payload.price));
    }

    if (payload.stock !== undefined) {
      formData.append('stock', String(payload.stock));
    }

    payload.imageFiles?.forEach((file) => formData.append('images', file));
    return formData;
  }
}
