import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Supplier } from '../models/supplier.model';
import { PaginatedResult } from '../../../core/models/paginated-result.model';

export interface SupplierListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  q?: string;
}

export interface SupplierFormPayload {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class SuppliersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/suppliers`;

  list(params: SupplierListParams): Observable<PaginatedResult<Supplier>> {
    let httpParams = new HttpParams();

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }

    return this.http.get<PaginatedResult<Supplier>>(this.baseUrl, { params: httpParams });
  }

  create(payload: SupplierFormPayload): Observable<Supplier> {
    return this.http.post<Supplier>(this.baseUrl, payload);
  }

  update(id: string, payload: SupplierFormPayload): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}