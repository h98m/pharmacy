import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { SuppliersService, SupplierListParams } from '../../services/suppliers.service';
import { Supplier } from '../../models/supplier.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { DataTable, DataTableColumn } from '../../../../shared/components/data-table/data-table';
import { HasPermissionDirective } from '../../../../core/directives/has-permission.directive';
import { SupplierDialog } from './supplier-dialog';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [FormsModule, DataTable, HasPermissionDirective, SupplierDialog],
  templateUrl: './supplier-list.html',
  styleUrl: './supplier-list.scss',
})
export class SupplierList implements OnInit {
  private readonly suppliersService = inject(SuppliersService);
  private readonly notificationService = inject(NotificationService);
  private readonly confirmDialogService = inject(ConfirmDialogService);

  readonly suppliers = signal<Supplier[]>([]);
  readonly loading = signal(true);
  readonly page = signal(1);
  readonly totalPages = signal(1);
  readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  readonly dialogTarget = signal<Supplier | 'new' | null>(null);

  private readonly pageSize = 10;
  searchTerm = '';

  private readonly search$ = new Subject<void>();

  readonly columns: DataTableColumn<Supplier>[] = [
    { key: 'name', label: 'Name' },
    { key: 'contactPerson', label: 'Contact' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
  ];

  ngOnInit(): void {
    this.search$.pipe(debounceTime(300)).subscribe(() => {
      this.page.set(1);
      this.fetchSuppliers();
    });

    this.fetchSuppliers();
  }

  onSearchChange(): void {
    this.search$.next();
  }

  goToPage(page: number): void {
    this.page.set(page);
    this.fetchSuppliers();
  }

  openCreate(): void {
    this.dialogTarget.set('new');
  }

  openEdit(supplier: Supplier): void {
    this.dialogTarget.set(supplier);
  }

  closeDialog(): void {
    this.dialogTarget.set(null);
  }

  onSaved(): void {
    this.dialogTarget.set(null);
    this.fetchSuppliers();
  }

  async deleteSupplier(supplier: Supplier): Promise<void> {
    const confirmed = await this.confirmDialogService.confirm(`Delete "${supplier.name}"? This cannot be undone.`);
    if (!confirmed) return;

    this.suppliersService.delete(supplier.id).subscribe({
      next: () => {
        this.notificationService.success('Supplier deleted.');
        this.fetchSuppliers();
      },
      error: (err) => {
        this.notificationService.error(err.error?.error?.message ?? 'Failed to delete supplier.');
      },
    });
  }

  private fetchSuppliers(): void {
    this.loading.set(true);

    const params: SupplierListParams = {
      page: this.page(),
      pageSize: this.pageSize,
      q: this.searchTerm || undefined,
    };

    this.suppliersService.list(params).subscribe({
      next: (result) => {
        this.suppliers.set(result.items);
        this.totalPages.set(result.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.notificationService.error(err.error?.error?.message ?? 'Failed to load suppliers.');
      },
    });
  }
}