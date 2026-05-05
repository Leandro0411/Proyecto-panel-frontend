import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../models/api-response.model';
import { CreateReservationPayload, Reservation } from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationsService {
  constructor(private readonly http: HttpClient) {}

  createReservation(payload: CreateReservationPayload): Observable<Reservation> {
    return this.http.post<Reservation>(`${environment.apiUrl}/reservations`, payload);
  }

  getMyReservations(page = 1, limit = 5): Observable<PaginatedResponse<Reservation>> {
    const params = new HttpParams().set('page', page).set('limit', limit).set('sortBy', 'createdAt:desc');
    return this.http.get<PaginatedResponse<Reservation>>(`${environment.apiUrl}/reservations/my`, { params });
  }
}
