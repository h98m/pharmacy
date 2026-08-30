import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthTokens, LoginResponse, User } from '../models/user.model';

const ACCESS_TOKEN_KEY = 'pharmacy_access_token';
const REFRESH_TOKEN_KEY = 'pharmacy_refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  private readonly _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);

  constructor(private readonly http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, { email, password })
      .pipe(tap((res) => this.storeSession(res)));
  }

    register(fullName: string, email: string, password: string, phone?: string): Observable<LoginResponse> {
    return this.http
        .post<LoginResponse>(`${this.baseUrl}/register`, { fullName, email, password, phone: phone ?? '' })
        .pipe(tap((res) => this.storeSession(res)));
    }

    logout(): void {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      this._user.set(null);
    }
    refresh(): Observable<AuthTokens> {
      return this.http
        .post<AuthTokens>(`${this.baseUrl}/refresh`, { refreshToken: this.refreshToken })
        .pipe(tap((tokens) => this.storeTokens(tokens)));
    }

    updateProfile(fullName: string, phone: string): Observable<User> {
      return this.http
        .patch<User>(`${this.baseUrl}/me`, { fullName, phone })
        .pipe(tap((user) => this._user.set(user)));
    }

    uploadAvatar(file: File): Observable<User> {
      const formData = new FormData();
      formData.append('file', file);

      return this.http
        .post<User>(`${this.baseUrl}/me/avatar`, formData)
        .pipe(tap((user) => this._user.set(user)));
    }

    changePassword(currentPassword: string, newPassword: string): Observable<void> {
      return this.http.post<void>(`${this.baseUrl}/change-password`, { currentPassword, newPassword });
    }

    get refreshToken(): string | null {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }

    private storeTokens(tokens: AuthTokens): void {
      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
    me(): Observable<User> {
      return this.http
        .get<User>(`${this.baseUrl}/me`)
        .pipe(tap((user) => this._user.set(user)));
    }
    ensureSession(): Observable<boolean> {
      if (this.isLoggedIn()) {
        return of(true);
      }
      if (!this.accessToken) {
        return of(false);
      }
      return this.me().pipe(
        map(() => true),
        catchError(() => of(false)),
      );
    }
    can(permission: string): boolean {
      return this.user()?.permissions?.includes(permission) ?? false;
    }
    get accessToken(): string | null {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    }

  private storeSession(res: LoginResponse): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, res.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
    this._user.set(res.user);
  }
}