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

export interface MedicineFormPayload {
  name: string;
  genericName: string;
  barcode: string;
  categoryId: string;
  supplierId: string;
  description: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  expiryDate: string;
  batchNumber: string;
  requiresPrescription: boolean;
  isActive: boolean;
}
export interface StockAdjustPayload {
  change: number;
  reason: string;
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

  getOne(id: string): Observable<Medicine> {
    return this.http.get<Medicine>(`${this.baseUrl}/${id}`);
  }

  create(payload: MedicineFormPayload): Observable<Medicine> {
    return this.http.post<Medicine>(this.baseUrl, payload);
  }

  update(id: string, payload: MedicineFormPayload): Observable<Medicine> {
    return this.http.put<Medicine>(`${this.baseUrl}/${id}`, payload);
  }

  adjustStock(id: string, payload: StockAdjustPayload): Observable<Medicine> {
  return this.http.patch<Medicine>(`${this.baseUrl}/${id}/stock`, payload);
  }
  delete(id: string): Observable<void> {
  return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}