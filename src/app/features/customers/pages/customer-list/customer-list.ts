import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { CustomersService, CustomerListParams } from '../../services/customers.service';
import { Customer } from '../../models/customer.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { DataTable, DataTableColumn } from '../../../../shared/components/data-table/data-table';
import { HasPermissionDirective } from '../../../../core/directives/has-permission.directive';
import { CustomerDialog } from './customer-dialog';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [FormsModule, DataTable, HasPermissionDirective, CustomerDialog],
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.scss',
})
export class CustomerList implements OnInit {
  private readonly customersService = inject(CustomersService);
  private readonly notificationService = inject(NotificationService);
  private readonly confirmDialogService = inject(ConfirmDialogService);

  readonly customers = signal<Customer[]>([]);
  readonly loading = signal(true);
  readonly page = signal(1);
  readonly totalPages = signal(1);
  readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  readonly dialogTarget = signal<Customer | 'new' | null>(null);

  private readonly pageSize = 10;
  searchTerm = '';

  private readonly search$ = new Subject<void>();

  readonly columns: DataTableColumn<Customer>[] = [
    { key: 'fullName', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
  ];

  ngOnInit(): void {
    this.search$.pipe(debounceTime(300)).subscribe(() => {
      this.page.set(1);
      this.fetchCustomers();
    });

    this.fetchCustomers();
  }

  onSearchChange(): void {
    this.search$.next();
  }

  goToPage(page: number): void {
    this.page.set(page);
    this.fetchCustomers();
  }

  openCreate(): void {
    this.dialogTarget.set('new');
  }

  openEdit(customer: Customer): void {
    this.dialogTarget.set(customer);
  }

  closeDialog(): void {
    this.dialogTarget.set(null);
  }

  onSaved(): void {
    this.dialogTarget.set(null);
    this.fetchCustomers();
  }

  async deleteCustomer(customer: Customer): Promise<void> {
    const confirmed = await this.confirmDialogService.confirm(`Delete "${customer.fullName}"? This cannot be undone.`);
    if (!confirmed) return;

    this.customersService.delete(customer.id).subscribe({
      next: () => {
        this.notificationService.success('Customer deleted.');
        this.fetchCustomers();
      },
      error: (err) => {
        this.notificationService.error(err.error?.error?.message ?? 'Failed to delete customer.');
      },
    });
  }

  private fetchCustomers(): void {
    this.loading.set(true);

    const params: CustomerListParams = {
      page: this.page(),
      pageSize: this.pageSize,
      q: this.searchTerm || undefined,
    };

    this.customersService.list(params).subscribe({
      next: (result) => {
        this.customers.set(result.items);
        this.totalPages.set(result.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.notificationService.error(err.error?.error?.message ?? 'Failed to load customers.');
      },
    });
  }
}