import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { MedicinesService, MedicineListParams } from '../../services/medicines.service';
import { Medicine } from '../../models/medicine.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { DataTable, DataTableColumn } from '../../../../shared/components/data-table/data-table';
import { RouterLink } from '@angular/router';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { HasPermissionDirective } from '../../../../core/directives/has-permission.directive';
import { StockAdjustDialog } from './stock-adjust-dialog';

@Component({
  selector: 'app-medicine-list',
  standalone: true,
  imports: [FormsModule, DataTable, RouterLink, HasPermissionDirective, StockAdjustDialog],
  templateUrl: './medicine-list.html',
  styleUrl: './medicine-list.scss',
})
export class MedicineList implements OnInit {
  private readonly medicinesService = inject(MedicinesService);
  private readonly notificationService = inject(NotificationService);
  private readonly confirmDialogService = inject(ConfirmDialogService);

  readonly stockAdjustTarget = signal<Medicine | null>(null);
  readonly medicines = signal<Medicine[]>([]);
  readonly loading = signal(true);
  readonly page = signal(1);
  readonly totalPages = signal(1);
  readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  private readonly pageSize = 10;

  searchTerm = '';
  lowStockOnly = false;

  private readonly search$ = new Subject<void>();

  readonly columns: DataTableColumn<Medicine>[] = [
    { key: 'name', label: 'Name' },
    { key: 'categoryName', label: 'Category' },
    { key: 'supplierName', label: 'Supplier' },
    { key: 'price', label: 'Price', format: 'currency' },
    { key: 'stockQuantity', label: 'Stock' },
  ];

  ngOnInit(): void {
    this.search$.pipe(debounceTime(300)).subscribe(() => {
      this.page.set(1);
      this.fetchMedicines();
    });

    this.fetchMedicines();
  }

  onSearchChange(): void {
    this.search$.next();
  }

  onFilterChange(): void {
    this.page.set(1);
    this.fetchMedicines();
  }

  goToPage(page: number): void {
    this.page.set(page);
    this.fetchMedicines();
  }

  private fetchMedicines(): void {
    this.loading.set(true);

    const params: MedicineListParams = {
      page: this.page(),
      pageSize: this.pageSize,
      q: this.searchTerm || undefined,
      lowStock: this.lowStockOnly || undefined,
    };

    this.medicinesService.list(params).subscribe({
      next: (result) => {
        this.medicines.set(result.items);
        this.totalPages.set(result.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.notificationService.error(err.error?.error?.message ?? 'Failed to load medicines.');
      },
    });
    
  }
  async deleteMedicine(medicine: Medicine): Promise<void> {
  const confirmed = await this.confirmDialogService.confirm(`Delete "${medicine.name}"? This cannot be undone.`);
  if (!confirmed) return;

  this.medicinesService.delete(medicine.id).subscribe({
    next: () => {
      this.notificationService.success('Medicine deleted.');
      this.fetchMedicines();
    },
    error: (err) => {
      this.notificationService.error(err.error?.error?.message ?? 'Failed to delete medicine.');
    },
  });
}

  openStockAdjust(medicine: Medicine): void {
    this.stockAdjustTarget.set(medicine);
  }

  onStockAdjusted(updated: Medicine): void {
    this.stockAdjustTarget.set(null);
    this.medicines.update((list) => list.map((m) => (m.id === updated.id ? updated : m)));
  }

  closeStockAdjust(): void {
    this.stockAdjustTarget.set(null);
  }
}