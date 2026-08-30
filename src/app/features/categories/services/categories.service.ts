import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Category } from '../models/category.model';
import { PaginatedResult } from '../../../core/models/paginated-result.model';

export interface CategoryListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  q?: string;
}

export interface CategoryFormPayload {
  name: string;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/categories`;

  list(params: CategoryListParams): Observable<PaginatedResult<Category>> {
    let httpParams = new HttpParams();

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }

    return this.http.get<PaginatedResult<Category>>(this.baseUrl, { params: httpParams });
  }

  create(payload: CategoryFormPayload): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, payload);
  }

  update(id: string, payload: CategoryFormPayload): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}