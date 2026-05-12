import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { PRODUCT_CATEGORIES, ProductCategory } from '../../../../core/constants/product.constants';
import { CreateProductPayload, UpdateProductPayload } from '../../../../core/models/product-admin.model';
import { Product } from '../../../../core/models/product.model';

export interface ProductFormDialogData {
  mode: 'create' | 'edit';
  product?: Product;
}

export interface ProductFormDialogResult {
  mode: 'create' | 'edit';
  payload: CreateProductPayload | UpdateProductPayload;
}

@Component({
  selector: 'app-product-form-dialog',
  templateUrl: './product-form-dialog.component.html',
  styleUrls: ['./product-form-dialog.component.scss']
})
export class ProductFormDialogComponent {
  readonly isEditMode = this.data.mode === 'edit';
  readonly categories = PRODUCT_CATEGORIES;
  selectedFiles: File[] = [];
  imagePreviews: string[] = this.data.product?.imageUrls?.length
    ? [...this.data.product.imageUrls]
    : (this.data.product?.imageUrl ? [this.data.product.imageUrl] : []);

  readonly form = this.formBuilder.nonNullable.group({
    name: [this.data.product?.name ?? '', [Validators.required, Validators.minLength(3)]],
    description: [this.data.product?.description ?? '', [Validators.required, Validators.minLength(10)]],
    category: [this.data.product?.category ?? 'indumentaria', [Validators.required]],
    price: [this.data.product?.price ?? 0, [Validators.required, Validators.min(0)]],
    stock: [this.data.product?.stock ?? 0, [Validators.required, Validators.min(0)]]
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialogRef: MatDialogRef<ProductFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public readonly data: ProductFormDialogData
  ) {}

  get title(): string {
    return this.isEditMode ? 'Editar producto' : 'Crear producto';
  }

  get submitLabel(): string {
    return this.isEditMode ? 'Guardar cambios' : 'Crear producto';
  }

  hasError(controlName: 'name' | 'description' | 'category' | 'price' | 'stock', errorName: string): boolean {
    const control = this.form.get(controlName);
    return !!control?.touched && !!control.errors?.[errorName];
  }

  close(): void {
    this.dialogRef.close();
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.selectedFiles = files.slice(0, 4);
    this.imagePreviews = this.selectedFiles.map((file) => URL.createObjectURL(file));
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rawValue = this.form.getRawValue();
    const payload = {
      name: rawValue.name.trim(),
      description: rawValue.description.trim(),
      category: rawValue.category as ProductCategory,
      price: Number(rawValue.price),
      stock: Number(rawValue.stock),
      imageFiles: this.selectedFiles
    };

    this.dialogRef.close({
      mode: this.isEditMode ? 'edit' : 'create',
      payload
    } as ProductFormDialogResult);
  }
}
