import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Sale, SaleRequest } from '../models/sale.model';

@Injectable({ providedIn: 'root' })
export class SalesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/sales`;

  create(payload: SaleRequest): Observable<Sale> {
    return this.http.post<Sale>(this.baseUrl, payload);
  }
}