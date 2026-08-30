import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Customer } from '../models/customer.model';
import { PaginatedResult } from '../../../core/models/paginated-result.model';

export interface CustomerListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  q?: string;
}

export interface CustomerFormPayload {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

@Injectable({ providedIn: 'root' })
export class CustomersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/customers`;

  list(params: CustomerListParams): Observable<PaginatedResult<Customer>> {
    let httpParams = new HttpParams();

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }

    return this.http.get<PaginatedResult<Customer>>(this.baseUrl, { params: httpParams });
  }

  create(payload: CustomerFormPayload): Observable<Customer> {
    return this.http.post<Customer>(this.baseUrl, payload);
  }

  update(id: string, payload: CustomerFormPayload): Observable<Customer> {
    return this.http.put<Customer>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}