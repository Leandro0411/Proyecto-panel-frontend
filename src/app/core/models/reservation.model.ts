import { ProductCategory } from '../constants/product.constants';

export interface ReservationItem {
  product: string;
  name: string;
  category: ProductCategory;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Reservation {
  id: string;
  user: string;
  items: ReservationItem[];
  total: number;
  totalItems: number;
  status: 'confirmed';
}

export interface CreateReservationPayload {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}
