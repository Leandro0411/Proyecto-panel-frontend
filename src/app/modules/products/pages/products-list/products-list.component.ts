import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { Sort, SortDirection } from '@angular/material/sort';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { PRODUCT_CATEGORIES, ProductCategory } from '../../../../core/constants/product.constants';
import { PaginatedResponse } from '../../../../core/models/api-response.model';
import { CartItem } from '../../../../core/models/cart.model';
import { CreateProductPayload, ProductQueryParams, UpdateProductPayload } from '../../../../core/models/product-admin.model';
import { Product } from '../../../../core/models/product.model';
import { AuthService } from '../../../../core/services/auth.service';
import { CartService } from '../../../../core/services/cart.service';
import { ProductsService } from '../../../../core/services/products.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ProductFormDialogComponent, ProductFormDialogResult } from '../../components/product-form-dialog/product-form-dialog.component';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit {
  readonly categoryOptions: Array<{ value: '' | ProductCategory; label: string }> = [
    { value: '', label: 'Todas las categorías' },
    ...PRODUCT_CATEGORIES
  ];

  isInitialLoading = true;
  isGridLoading = false;
  errorMessage = '';
  products: Product[] = [];
  cartItems: CartItem[] = [];
  totalResults = 0;
  pageSize = 9;
  pageIndex = 0;
  nameFilter = '';
  categoryFilter: '' | ProductCategory = '';
  sortActive = 'name';
  sortDirection: SortDirection = 'asc';

  constructor(
    private readonly productsService: ProductsService,
    private readonly authService: AuthService,
    private readonly cartService: CartService,
    private readonly router: Router,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar
  ) {
    this.cartService.cartItems$.subscribe((items) => {
      this.cartItems = [...items].sort((left, right) => left.product.name.localeCompare(right.product.name));
    });
  }

  get totalProducts(): number {
    return this.totalResults;
  }

  get cartItemsCount(): number {
    return this.cartItems.reduce((accumulator, item) => accumulator + item.quantity, 0);
  }

  get totalStock(): number {
    return this.products.reduce((accumulator, product) => accumulator + product.stock, 0);
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get isUserView(): boolean {
    return !this.isAdmin;
  }

  ngOnInit(): void {
    this.loadProducts(true);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  formatCategory(category: ProductCategory): string {
    return PRODUCT_CATEGORIES.find((item) => item.value === category)?.label ?? category;
  }

  onNameFilterChange(value: string): void {
    this.nameFilter = value.trim();
    this.pageIndex = 0;
    this.loadProducts();
  }

  onCategoryFilterChange(value: '' | ProductCategory): void {
    this.categoryFilter = value;
    this.pageIndex = 0;
    this.loadProducts();
  }

  onSortChange(sort: Sort): void {
    this.sortActive = sort.active || 'name';
    this.sortDirection = sort.direction || 'asc';
    this.loadProducts();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }

  addToCart(product: Product): void {
    if (product.stock <= 0) {
      return;
    }

    this.cartService.addProduct(product);
    this.snackBar.open(`"${product.name}" se agregó a tu reserva.`, 'Cerrar', { duration: 2600 });
  }

  getCartQuantity(product: Product): number {
    return this.cartService.getQuantity(product.id);
  }

  isInCart(product: Product): boolean {
    return this.getCartQuantity(product) > 0;
  }

  openProductDetail(product: Product): void {
    void this.router.navigate(['/products', product.id]);
  }

  trackByProductId(_: number, product: Product): string {
    return product.id;
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open<ProductFormDialogComponent, unknown, ProductFormDialogResult>(ProductFormDialogComponent, {
      width: '600px',
      data: {
        mode: 'create'
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result || result.mode !== 'create') {
        return;
      }

      this.productsService.createProduct(result.payload as CreateProductPayload).subscribe({
        next: () => {
          this.snackBar.open('Producto creado correctamente.', 'Cerrar', { duration: 3500 });
          this.loadProducts();
        },
        error: (error) => {
          this.snackBar.open(error?.error?.message ?? 'No se pudo crear el producto.', 'Cerrar', { duration: 4000 });
        }
      });
    });
  }

  openEditDialog(product: Product): void {
    const dialogRef = this.dialog.open<ProductFormDialogComponent, unknown, ProductFormDialogResult>(ProductFormDialogComponent, {
      width: '600px',
      data: {
        mode: 'edit',
        product
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result || result.mode !== 'edit') {
        return;
      }

      this.productsService.updateProduct(product.id, result.payload as UpdateProductPayload).subscribe({
        next: () => {
          this.snackBar.open('Producto actualizado correctamente.', 'Cerrar', { duration: 3500 });
          this.loadProducts();
        },
        error: (error) => {
          this.snackBar.open(error?.error?.message ?? 'No se pudo actualizar el producto.', 'Cerrar', { duration: 4000 });
        }
      });
    });
  }

  confirmDelete(product: Product): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Eliminar producto',
        message: `¿Estás seguro que deseás eliminar "${product.name}"?`,
        confirmText: 'Eliminar'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }

      this.productsService.deleteProduct(product.id).subscribe({
        next: () => {
          this.snackBar.open('Producto eliminado correctamente.', 'Cerrar', { duration: 3500 });
          if (this.products.length === 1 && this.pageIndex > 0) {
            this.pageIndex -= 1;
          }
          this.loadProducts();
        },
        error: (error) => {
          this.snackBar.open(error?.error?.message ?? 'No se pudo eliminar el producto.', 'Cerrar', { duration: 4000 });
        }
      });
    });
  }

  private loadProducts(showInitialLoader = false): void {
    this.errorMessage = '';
    this.isInitialLoading = showInitialLoader;
    this.isGridLoading = !showInitialLoader;

    this.productsService
      .getProducts(this.buildQuery())
      .pipe(
        finalize(() => {
          this.isInitialLoading = false;
          this.isGridLoading = false;
        })
      )
      .subscribe({
        next: (response: PaginatedResponse<Product>) => {
          this.products = response.results;
          this.cartService.syncProducts(this.products);
          this.totalResults = response.totalResults;
          this.pageIndex = response.page - 1;
          this.pageSize = response.limit;
        },
        error: (error) => {
          this.errorMessage = error?.error?.message ?? 'No se pudieron cargar los productos.';
        }
      });
  }

  private buildQuery(): ProductQueryParams {
    return {
      page: this.pageIndex + 1,
      limit: this.pageSize,
      name: this.nameFilter || undefined,
      category: this.categoryFilter || undefined,
      sortBy: `${this.sortActive}:${this.sortDirection || 'asc'}`
    };
  }
}
