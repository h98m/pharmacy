import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Role } from '../models/role.model';
import { PermissionCatalogue } from '../models/permission.model';
import { PaginatedResult } from '../../../core/models/paginated-result.model';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly http = inject(HttpClient);
  private readonly rolesUrl = `${environment.apiUrl}/roles`;
  private readonly permissionsUrl = `${environment.apiUrl}/permissions`;

  getPermissionCatalogue(): Observable<PermissionCatalogue> {
    return this.http.get<PermissionCatalogue>(this.permissionsUrl);
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<PaginatedResult<Role>>(this.rolesUrl).pipe(map((result) => result.items));
  }
  
  updatePermissions(roleName: string, permissions: string[]): Observable<Role> {
    return this.http.put<Role>(`${this.rolesUrl}/${roleName}/permissions`, { permissions });
  }
}