import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';

import { PRODUCT_CATEGORIES, ProductCategory } from '../../../../core/constants/product.constants';
import { Product } from '../../../../core/models/product.model';
import { AuthService } from '../../../../core/services/auth.service';
import { CartService } from '../../../../core/services/cart.service';
import { ProductsService } from '../../../../core/services/products.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  selectedImage = '';
  isLoading = true;
  isSubmittingReview = false;
  errorMessage = '';

  readonly reviewForm = this.formBuilder.nonNullable.group({
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(600)]]
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly productsService: ProductsService,
    private readonly cartService: CartService,
    private readonly authService: AuthService,
    private readonly snackBar: MatSnackBar
  ) {}

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get canReview(): boolean {
    return !this.isAdmin;
  }

  get galleryImages(): string[] {
    return this.product?.imageUrls?.length ? this.product.imageUrls : (this.product?.imageUrl ? [this.product.imageUrl] : []);
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const productId = params.get('productId');

      if (!productId) {
        return;
      }

      this.loadProduct(productId);
    });
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

  formatDate(date?: string): string {
    if (!date) {
      return '';
    }

    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'medium'
    }).format(new Date(date));
  }

  selectImage(imageUrl: string): void {
    this.selectedImage = imageUrl;
  }

  addToCart(): void {
    if (!this.product || this.product.stock <= 0) {
      return;
    }

    this.cartService.addProduct(this.product);
    this.snackBar.open(`"${this.product.name}" se agregó a tu reserva.`, 'Cerrar', { duration: 2600 });
  }

  setRating(rating: number): void {
    this.reviewForm.controls.rating.setValue(rating);
  }

  submitReview(): void {
    if (!this.product || this.reviewForm.invalid || this.isSubmittingReview) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    this.isSubmittingReview = true;

    this.productsService
      .addReview(this.product.id, {
        rating: this.reviewForm.controls.rating.value,
        comment: this.reviewForm.controls.comment.value.trim()
      })
      .pipe(finalize(() => (this.isSubmittingReview = false)))
      .subscribe({
        next: (product) => {
          this.product = product;
          this.reviewForm.controls.comment.setValue('');
          this.reviewForm.controls.rating.setValue(5);
          this.snackBar.open('Tu reseña se guardó correctamente.', 'Cerrar', { duration: 3000 });
        },
        error: (error) => {
          this.snackBar.open(error?.error?.message ?? 'No se pudo guardar la reseña.', 'Cerrar', { duration: 4000 });
        }
      });
  }

  private loadProduct(productId: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productsService
      .getProduct(productId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (product) => {
          this.product = product;
          this.selectedImage = product.imageUrls?.[0] ?? product.imageUrl ?? '';
        },
        error: (error) => {
          this.errorMessage = error?.error?.message ?? 'No se pudo cargar el detalle del producto.';
        }
      });
  }
}
