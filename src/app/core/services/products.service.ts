import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../models/api-response.model';
import { CreateProductPayload, ProductQueryParams, UpdateProductPayload } from '../models/product-admin.model';
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
    return this.http.post<Product>(`${environment.apiUrl}/products`, payload);
  }

  updateProduct(productId: string, payload: UpdateProductPayload): Observable<Product> {
    return this.http.patch<Product>(`${environment.apiUrl}/products/${productId}`, payload);
  }

  deleteProduct(productId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/products/${productId}`);
  }
}
