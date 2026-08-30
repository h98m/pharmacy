import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Medicine } from '../models/medicine.model';
import { PaginatedResult } from '../../../core/models/paginated-result.model';

export interface MedicineListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  q?: string;
  categoryId?: string;
  supplierId?: string;
  minPrice?: number;
  maxPrice?: number;
  requiresPrescription?: boolean;
  isActive?: boolean;
  lowStock?: boolean;
  expiringInDays?: number;
}

@Injectable({ providedIn: 'root' })
export class MedicinesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/medicines`;

  list(params: MedicineListParams): Observable<PaginatedResult<Medicine>> {
    let httpParams = new HttpParams();

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }

    return this.http.get<PaginatedResult<Medicine>>(this.baseUrl, { params: httpParams });
  }
}