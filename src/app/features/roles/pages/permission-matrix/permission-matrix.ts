import { Component, OnInit, inject, signal } from '@angular/core';
import { RolesService } from '../../services/roles.service';
import { Role } from '../../models/role.model';
import { PermissionCatalogue } from '../../models/permission.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-permission-matrix',
  standalone: true,
  templateUrl: './permission-matrix.html',
  styleUrl: './permission-matrix.scss',
})
export class PermissionMatrix implements OnInit {
  private readonly rolesService = inject(RolesService);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);

  readonly catalogue = signal<PermissionCatalogue | null>(null);
  readonly roles = signal<Role[]>([]);
  readonly loading = signal(true);
  readonly savingRole = signal<string | null>(null);

  private workingPermissions: Record<string, Set<string>> = {};

  readonly canManage = this.authService.can('roles.manage');

  ngOnInit(): void {
    this.rolesService.getPermissionCatalogue().subscribe({
      next: (catalogue) => this.catalogue.set(catalogue),
      error: (err) => {
        this.notificationService.error(err.error?.error?.message ?? 'Failed to load permissions.');
      },
    });

    this.rolesService.getRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles);
        for (const role of roles) {
          this.workingPermissions[role.name] = new Set(role.permissions);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.notificationService.error(err.error?.error?.message ?? 'Failed to load roles.');
      },
    });
  }

  permissionsInGroup(group: string) {
    return this.catalogue()?.permissions.filter((p) => p.group === group) ?? [];
  }

  isChecked(roleName: string, permissionKey: string): boolean {
    return this.workingPermissions[roleName]?.has(permissionKey) ?? false;
  }
  displayedRoles(): Role[] {
    return this.roles().filter((r) => r.editable);
  }
  toggle(role: Role, permissionKey: string): void {
    if (!role.editable) return;

    const set = this.workingPermissions[role.name];
    if (set.has(permissionKey)) {
      set.delete(permissionKey);
    } else {
      set.add(permissionKey);
    }
  }

  hasChanges(role: Role): boolean {
    const working = this.workingPermissions[role.name];
    if (!working) return false;
    if (working.size !== role.permissions.length) return true;
    return role.permissions.some((p) => !working.has(p));
  }

  save(role: Role): void {
    this.savingRole.set(role.name);
    const permissions = Array.from(this.workingPermissions[role.name]);

    this.rolesService.updatePermissions(role.name, permissions).subscribe({
      next: (updated) => this.applyUpdatedRole(updated),
      error: (err) => {
        this.savingRole.set(null);
        this.notificationService.error(err.error?.error?.message ?? 'Failed to save permissions.');
      },
    });
  }

  resetToDefaults(role: Role): void {
    this.savingRole.set(role.name);

    this.rolesService.updatePermissions(role.name, role.defaultPermissions).subscribe({
      next: (updated) => this.applyUpdatedRole(updated),
      error: (err) => {
        this.savingRole.set(null);
        this.notificationService.error(err.error?.error?.message ?? 'Failed to reset permissions.');
      },
    });
  }

  private applyUpdatedRole(updated: Role): void {
    this.savingRole.set(null);
    this.workingPermissions[updated.name] = new Set(updated.permissions);
    this.roles.update((list) => list.map((r) => (r.name === updated.name ? updated : r)));
    this.notificationService.success(`Permissions for "${updated.name}" saved.`);
  }
}