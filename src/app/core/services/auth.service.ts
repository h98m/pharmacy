import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginResponse, User } from '../models/user.model';

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
  private storeSession(res: LoginResponse): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, res.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
    this._user.set(res.user);
  }
}