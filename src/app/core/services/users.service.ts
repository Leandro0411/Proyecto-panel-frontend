import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../models/api-response.model';
import { CreateUserPayload, UpdateUserPayload, UserQueryParams } from '../models/user-admin.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  constructor(private readonly http: HttpClient) {}

  getUsers(query: UserQueryParams): Observable<PaginatedResponse<User>> {
    let params = new HttpParams()
      .set('page', query.page)
      .set('limit', query.limit);

    if (query.name) {
      params = params.set('name', query.name);
    }

    if (query.role) {
      params = params.set('role', query.role);
    }

    if (query.sortBy) {
      params = params.set('sortBy', query.sortBy);
    }

    return this.http.get<PaginatedResponse<User>>(`${environment.apiUrl}/users`, { params });
  }

  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/${userId}`);
  }

  createUser(payload: CreateUserPayload): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users`, payload);
  }

  updateUser(userId: string, payload: UpdateUserPayload): Observable<User> {
    return this.http.patch<User>(`${environment.apiUrl}/users/${userId}`, payload);
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/users/${userId}`);
  }
}
