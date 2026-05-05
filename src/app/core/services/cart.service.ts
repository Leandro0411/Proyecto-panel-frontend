import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { CartItem } from '../models/cart.model';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly storageKey = 'productsCart';
  private readonly cartItemsSubject = new BehaviorSubject<CartItem[]>(this.readStoredItems());

  readonly cartItems$ = this.cartItemsSubject.asObservable();

  get items(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  addProduct(product: Product, quantity = 1): void {
    const existingItem = this.items.find((item) => item.productId === product.id);
    const nextQuantity = Math.min((existingItem?.quantity ?? 0) + quantity, product.stock);

    this.upsertProduct(product, nextQuantity);
  }

  setQuantity(product: Product, quantity: number): void {
    const normalizedQuantity = Math.max(0, Math.min(quantity, product.stock));
    this.upsertProduct(product, normalizedQuantity);
  }

  removeProduct(productId: string): void {
    this.updateItems(this.items.filter((item) => item.productId !== productId));
  }

  clear(): void {
    this.updateItems([]);
  }

  syncProducts(products: Product[]): void {
    const productMap = new Map(products.map((product) => [product.id, product]));
    const syncedItems = this.items
      .map((item) => {
        const currentProduct = productMap.get(item.productId);

        if (!currentProduct) {
          return item;
        }

        if (currentProduct.stock <= 0) {
          return null;
        }

        return {
          ...item,
          product: currentProduct,
          quantity: Math.min(item.quantity, currentProduct.stock),
        };
      })
      .filter((item): item is CartItem => !!item && item.quantity > 0);

    this.updateItems(syncedItems);
  }

  getQuantity(productId: string): number {
    return this.items.find((item) => item.productId === productId)?.quantity ?? 0;
  }

  private upsertProduct(product: Product, quantity: number): void {
    const remainingItems = this.items.filter((item) => item.productId !== product.id);

    if (quantity <= 0) {
      this.updateItems(remainingItems);
      return;
    }

    this.updateItems([
      ...remainingItems,
      {
        productId: product.id,
        quantity,
        product,
      }
    ]);
  }

  private updateItems(items: CartItem[]): void {
    this.cartItemsSubject.next(items);
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  private readStoredItems(): CartItem[] {
    const storedItems = localStorage.getItem(this.storageKey);

    if (!storedItems) {
      return [];
    }

    try {
      return JSON.parse(storedItems) as CartItem[];
    } catch {
      localStorage.removeItem(this.storageKey);
      return [];
    }
  }
}
