import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Sale, SaleRequest } from '../models/sale.model';
import { PaginatedResult } from '../../../core/models/paginated-result.model';

export interface SaleListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  q?: string;
  customerId?: string;
  paymentMethod?: 'cash' | 'card' | 'insurance';
  status?: 'completed' | 'refunded';
  from?: string;
  to?: string;
}

@Injectable({ providedIn: 'root' })
export class SalesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/sales`;

  create(payload: SaleRequest): Observable<Sale> {
    return this.http.post<Sale>(this.baseUrl, payload);
  }

  list(params: SaleListParams): Observable<PaginatedResult<Sale>> {
    let httpParams = new HttpParams();

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }

    return this.http.get<PaginatedResult<Sale>>(this.baseUrl, { params: httpParams });
  }

  getOne(id: string): Observable<Sale> {
    return this.http.get<Sale>(`${this.baseUrl}/${id}`);
  }

  refund(id: string): Observable<Sale> {
    return this.http.post<Sale>(`${this.baseUrl}/${id}/refund`, {});
  }
}