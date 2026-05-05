import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';

import { PRODUCT_CATEGORIES, ProductCategory } from '../../../../core/constants/product.constants';
import { PaginatedResponse } from '../../../../core/models/api-response.model';
import { CartItem } from '../../../../core/models/cart.model';
import { Product } from '../../../../core/models/product.model';
import { Reservation } from '../../../../core/models/reservation.model';
import { CartService } from '../../../../core/services/cart.service';
import { ProductsService } from '../../../../core/services/products.service';
import { ReservationsService } from '../../../../core/services/reservations.service';

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.scss']
})
export class ReservationsComponent implements OnInit {
  cartItems: CartItem[] = [];
  reservations: Reservation[] = [];
  isSubmittingReservation = false;
  isLoadingReservations = false;

  constructor(
    private readonly cartService: CartService,
    private readonly reservationsService: ReservationsService,
    private readonly productsService: ProductsService,
    private readonly snackBar: MatSnackBar
  ) {
    this.cartService.cartItems$.subscribe((items) => {
      this.cartItems = [...items].sort((left, right) => left.product.name.localeCompare(right.product.name));
    });
  }

  get cartItemsCount(): number {
    return this.cartItems.reduce((accumulator, item) => accumulator + item.quantity, 0);
  }

  get cartSubtotal(): number {
    return this.cartItems.reduce((accumulator, item) => accumulator + item.product.price * item.quantity, 0);
  }

  ngOnInit(): void {
    this.loadReservations();
    this.syncCartWithCatalog();
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

  increaseQuantity(product: Product): void {
    this.cartService.setQuantity(product, this.getCartQuantity(product) + 1);
  }

  decreaseQuantity(product: Product): void {
    this.cartService.setQuantity(product, this.getCartQuantity(product) - 1);
  }

  updateQuantity(product: Product, value: string): void {
    const nextQuantity = Number(value);

    if (Number.isNaN(nextQuantity)) {
      return;
    }

    this.cartService.setQuantity(product, nextQuantity);
  }

  getCartQuantity(product: Product): number {
    return this.cartService.getQuantity(product.id);
  }

  removeFromCart(productId: string): void {
    this.cartService.removeProduct(productId);
  }

  clearCart(): void {
    if (!this.cartItems.length) {
      return;
    }

    this.cartService.clear();
    this.snackBar.open('La reserva activa se vació.', 'Cerrar', { duration: 2400 });
  }

  confirmReservation(): void {
    if (!this.cartItems.length || this.isSubmittingReservation) {
      return;
    }

    this.isSubmittingReservation = true;

    this.reservationsService
      .createReservation({
        items: this.cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }))
      })
      .pipe(finalize(() => (this.isSubmittingReservation = false)))
      .subscribe({
        next: (reservation) => {
          this.cartService.clear();
          this.reservations = [reservation, ...this.reservations].slice(0, 5);
          this.snackBar.open('Reserva confirmada. El stock ya fue descontado.', 'Cerrar', { duration: 4000 });
        },
        error: (error) => {
          this.snackBar.open(
            error?.error?.message ?? 'No se pudo confirmar la reserva. Revisá el stock disponible.',
            'Cerrar',
            { duration: 4500 }
          );
          this.syncCartWithCatalog();
          this.loadReservations();
        }
      });
  }

  trackByCartProductId(_: number, item: CartItem): string {
    return item.productId;
  }

  trackByReservationId(_: number, reservation: Reservation): string {
    return reservation.id;
  }

  private loadReservations(): void {
    this.isLoadingReservations = true;

    this.reservationsService
      .getMyReservations()
      .pipe(finalize(() => (this.isLoadingReservations = false)))
      .subscribe({
        next: (response: PaginatedResponse<Reservation>) => {
          this.reservations = response.results;
        },
        error: () => {
          this.reservations = [];
        }
      });
  }

  private syncCartWithCatalog(): void {
    this.productsService.getProducts({ page: 1, limit: 100, sortBy: 'name:asc' }).subscribe({
      next: (response: PaginatedResponse<Product>) => {
        this.cartService.syncProducts(response.results);
      },
      error: () => undefined
    });
  }
}
