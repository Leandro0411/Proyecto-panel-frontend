import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map, of, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models/api-response.model';
import { LoginPayload, RegisterPayload } from '../models/auth.model';
import { AuthTokens } from '../models/token.model';
import { User } from '../models/user.model';

interface SessionData {
  user: User;
  tokens: AuthTokens;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly sessionStorageKey = 'authSession';
  private readonly currentUserSubject = new BehaviorSubject<User | null>(this.getStoredSession()?.user ?? null);

  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return this.getStoredSession()?.tokens.access.token ?? null;
  }

  get refreshToken(): string | null {
    return this.getStoredSession()?.tokens.refresh.token ?? null;
  }

  login(payload: LoginPayload): Observable<User> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload).pipe(
      tap((response) => this.setSession(response)),
      map((response) => response.user)
    );
  }

  register(payload: RegisterPayload): Observable<User> {
    const { confirmPassword, ...requestBody } = payload;

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, requestBody).pipe(
      tap((response) => this.setSession(response)),
      map((response) => response.user)
    );
  }

  logout(redirectToLogin = true): void {
    const refreshToken = this.refreshToken;

    this.clearSession();

    if (refreshToken) {
      this.http.post(`${environment.apiUrl}/auth/logout`, { refreshToken }).subscribe({
        error: () => undefined
      });
    } else {
      of(null).subscribe();
    }

    if (redirectToLogin) {
      void this.router.navigate(['/auth/login']);
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  hasRole(role: User['role']): Observable<boolean> {
    return this.currentUser$.pipe(map((user) => user?.role === role));
  }

  private setSession(response: AuthResponse): void {
    const session: SessionData = {
      user: response.user,
      tokens: response.tokens
    };

    localStorage.setItem(this.sessionStorageKey, JSON.stringify(session));
    this.currentUserSubject.next(response.user);
  }

  private clearSession(): void {
    localStorage.removeItem(this.sessionStorageKey);
    this.currentUserSubject.next(null);
  }

  private getStoredSession(): SessionData | null {
    const storedSession = localStorage.getItem(this.sessionStorageKey);

    if (!storedSession) {
      return null;
    }

    try {
      return JSON.parse(storedSession) as SessionData;
    } catch {
      localStorage.removeItem(this.sessionStorageKey);
      return null;
    }
  }
}
