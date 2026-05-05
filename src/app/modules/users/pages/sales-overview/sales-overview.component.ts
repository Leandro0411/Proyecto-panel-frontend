import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { finalize } from 'rxjs';

import { PRODUCT_CATEGORIES, ProductCategory } from '../../../../core/constants/product.constants';
import {
  AdminReservationOverview,
  AdminReservationRecord,
  ReservationCategoryBreakdown,
  ReservationMonthlySale,
} from '../../../../core/models/reservation.model';
import { ReservationsService } from '../../../../core/services/reservations.service';

interface SalesChartPoint {
  x: number;
  y: number;
  month: string;
  revenue: number;
}

@Component({
  selector: 'app-sales-overview',
  templateUrl: './sales-overview.component.html',
  styleUrls: ['./sales-overview.component.scss']
})
export class SalesOverviewComponent implements OnInit {
  readonly chartWidth = 720;
  readonly chartHeight = 260;
  readonly chartPadding = 24;

  isInitialLoading = true;
  isPanelLoading = false;
  errorMessage = '';
  overview: AdminReservationOverview | null = null;
  pageSize = 6;
  pageIndex = 0;

  constructor(private readonly reservationsService: ReservationsService) {}

  get recentReservations(): AdminReservationRecord[] {
    return this.overview?.recentReservations.results ?? [];
  }

  get totalResults(): number {
    return this.overview?.recentReservations.totalResults ?? 0;
  }

  get totalRevenue(): number {
    return this.overview?.summary.totalRevenue ?? 0;
  }

  get totalReservations(): number {
    return this.overview?.summary.totalReservations ?? 0;
  }

  get totalItemsSold(): number {
    return this.overview?.summary.totalItemsSold ?? 0;
  }

  get averageTicket(): number {
    return this.overview?.summary.averageTicket ?? 0;
  }

  get monthlySales(): ReservationMonthlySale[] {
    return this.overview?.monthlySales ?? [];
  }

  get categoryBreakdown(): ReservationCategoryBreakdown[] {
    return this.overview?.categoryBreakdown ?? [];
  }

  get chartPoints(): SalesChartPoint[] {
    const sales = this.monthlySales;
    const maxRevenue = this.maxMonthlyRevenue;

    if (!sales.length) {
      return [];
    }

    return sales.map((item, index) => {
      const x = this.chartPadding + (index * (this.chartWidth - this.chartPadding * 2)) / Math.max(sales.length - 1, 1);
      const normalized = maxRevenue ? item.revenue / maxRevenue : 0;
      const y = this.chartHeight - this.chartPadding - normalized * (this.chartHeight - this.chartPadding * 2);

      return {
        x,
        y,
        month: item.month,
        revenue: item.revenue,
      };
    });
  }

  get chartPolyline(): string {
    return this.chartPoints.map((point) => `${point.x},${point.y}`).join(' ');
  }

  get maxMonthlyRevenue(): number {
    return Math.max(...this.monthlySales.map((item) => item.revenue), 0);
  }

  get maxCategoryRevenue(): number {
    return Math.max(...this.categoryBreakdown.map((item) => item.revenue), 0);
  }

  ngOnInit(): void {
    this.loadOverview(true);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadOverview();
  }

  trackByReservationId(_: number, reservation: AdminReservationRecord): string {
    return reservation.id;
  }

  trackByMonth(_: number, sale: ReservationMonthlySale): string {
    return sale.month;
  }

  trackByCategory(_: number, item: ReservationCategoryBreakdown): string {
    return item.category;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  formatMonthLabel(monthKey: string): string {
    const [year, month] = monthKey.split('-').map(Number);
    return new Intl.DateTimeFormat('es-AR', {
      month: 'short',
      year: '2-digit'
    }).format(new Date(year, month - 1, 1));
  }

  formatFullDate(date: string): string {
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(date));
  }

  formatCategory(category: ProductCategory): string {
    return PRODUCT_CATEGORIES.find((item) => item.value === category)?.label ?? category;
  }

  categoryBarWidth(item: ReservationCategoryBreakdown): string {
    if (!this.maxCategoryRevenue) {
      return '0%';
    }

    return `${(item.revenue / this.maxCategoryRevenue) * 100}%`;
  }

  private loadOverview(showInitialLoader = false): void {
    this.errorMessage = '';
    this.isInitialLoading = showInitialLoader;
    this.isPanelLoading = !showInitialLoader;

    this.reservationsService
      .getAdminOverview(this.pageIndex + 1, this.pageSize)
      .pipe(
        finalize(() => {
          this.isInitialLoading = false;
          this.isPanelLoading = false;
        })
      )
      .subscribe({
        next: (overview) => {
          this.overview = overview;
          this.pageIndex = overview.recentReservations.page - 1;
          this.pageSize = overview.recentReservations.limit;
        },
        error: (error) => {
          this.errorMessage = error?.error?.message ?? 'No se pudieron cargar las métricas de ventas.';
        }
      });
  }
}
