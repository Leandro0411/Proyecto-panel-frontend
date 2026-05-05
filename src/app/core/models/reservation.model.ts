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

export interface AdminReservationUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface AdminReservationRecord {
  id: string;
  user: AdminReservationUser;
  items: ReservationItem[];
  total: number;
  totalItems: number;
  status: 'confirmed';
  createdAt: string;
}

export interface ReservationSummary {
  totalRevenue: number;
  totalReservations: number;
  totalItemsSold: number;
  averageTicket: number;
}

export interface ReservationMonthlySale {
  month: string;
  revenue: number;
  reservations: number;
  itemsSold: number;
}

export interface ReservationCategoryBreakdown {
  category: ProductCategory;
  revenue: number;
  itemsSold: number;
}

export interface AdminReservationOverview {
  summary: ReservationSummary;
  monthlySales: ReservationMonthlySale[];
  categoryBreakdown: ReservationCategoryBreakdown[];
  recentReservations: {
    results: AdminReservationRecord[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
  };
}

export interface CreateReservationPayload {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}
