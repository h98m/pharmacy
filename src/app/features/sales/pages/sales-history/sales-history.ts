import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SalesService, SaleListParams } from '../../services/sales.service';
import { Sale } from '../../models/sale.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { DataTable, DataTableColumn } from '../../../../shared/components/data-table/data-table';
import { HasPermissionDirective } from '../../../../core/directives/has-permission.directive';
import { SaleDetailDialog } from './sale-detail-dialog';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [FormsModule, DataTable, HasPermissionDirective, SaleDetailDialog],
  templateUrl: './sales-history.html',
  styleUrl: './sales-history.scss',
})
export class SalesHistory implements OnInit {
  private readonly salesService = inject(SalesService);
  private readonly notificationService = inject(NotificationService);
  private readonly confirmDialogService = inject(ConfirmDialogService);

  readonly sales = signal<Sale[]>([]);
  readonly loading = signal(true);
  readonly page = signal(1);
  readonly totalPages = signal(1);
  readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  readonly selectedSale = signal<Sale | null>(null);

  private readonly pageSize = 10;
  from = '';
  to = '';

  readonly columns: DataTableColumn<Sale>[] = [
    { key: 'invoiceNumber', label: 'Invoice' },
    { key: 'customerName', label: 'Customer' },
    { key: 'total', label: 'Total', format: 'currency' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Date' },
  ];

  ngOnInit(): void {
    this.fetchSales();
  }

  applyFilters(): void {
    this.page.set(1);
    this.fetchSales();
  }

  goToPage(page: number): void {
    this.page.set(page);
    this.fetchSales();
  }

  viewDetails(sale: Sale): void {
    this.selectedSale.set(sale);
  }

  closeDetails(): void {
    this.selectedSale.set(null);
  }

  async refundSale(sale: Sale): Promise<void> {
    const confirmed = await this.confirmDialogService.confirm(
      `Refund invoice ${sale.invoiceNumber}? Stock will be returned.`,
    );
    if (!confirmed) return;

    this.salesService.refund(sale.id).subscribe({
      next: (updated) => {
        this.notificationService.success('Sale refunded.');
        this.sales.update((list) => list.map((s) => (s.id === updated.id ? updated : s)));
      },
      error: (err) => {
        this.notificationService.error(err.error?.error?.message ?? 'Failed to refund sale.');
      },
    });
  }

  private fetchSales(): void {
    this.loading.set(true);

    const params: SaleListParams = {
      page: this.page(),
      pageSize: this.pageSize,
      from: this.from || undefined,
      to: this.to || undefined,
    };

    this.salesService.list(params).subscribe({
      next: (result) => {
        this.sales.set(result.items);
        this.totalPages.set(result.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.notificationService.error(err.error?.error?.message ?? 'Failed to load sales.');
      },
    });
  }
}