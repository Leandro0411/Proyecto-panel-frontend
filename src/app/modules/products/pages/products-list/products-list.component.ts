import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';

import { Product } from '../../../../core/models/product.model';
import { ProductsService } from '../../../../core/services/products.service';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit {
  isLoading = true;
  errorMessage = '';
  products: Product[] = [];

  constructor(private readonly productsService: ProductsService) {}

  get totalProducts(): number {
    return this.products.length;
  }

  get totalStock(): number {
    return this.products.reduce((accumulator, product) => accumulator + product.stock, 0);
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 2
    }).format(price);
  }

  private loadProducts(): void {
    this.productsService
      .getProducts()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          this.products = response.results;
        },
        error: (error) => {
          this.errorMessage = error?.error?.message ?? 'No se pudieron cargar los productos.';
        }
      });
  }
}
