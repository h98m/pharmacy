import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Subject, debounceTime } from 'rxjs';
import { MedicinesService } from '../../../medicines/services/medicines.service';
import { Medicine } from '../../../medicines/models/medicine.model';
import { CustomersService } from '../../../customers/services/customers.service';
import { Customer } from '../../../customers/models/customer.model';
import { SalesService } from '../../services/sales.service';
import { Sale, SaleRequest } from '../../models/sale.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { FileUpload } from '../../../../shared/components/file-upload/file-upload';
import { environment } from '../../../../../environments/environment';

interface CartLine {
  medicine: Medicine;
  quantity: number;
}

@Component({
  selector: 'app-point-of-sale',
  standalone: true,
  imports: [FormsModule, FileUpload, CurrencyPipe],
  templateUrl: './point-of-sale.html',
  styleUrl: './point-of-sale.scss',
})
export class PointOfSale implements OnInit {
  private readonly medicinesService = inject(MedicinesService);
  private readonly customersService = inject(CustomersService);
  private readonly salesService = inject(SalesService);
  private readonly notificationService = inject(NotificationService);

  readonly fileUploadUrl = `${environment.apiUrl}/files`;

  searchTerm = '';
  readonly searchResults = signal<Medicine[]>([]);
  private readonly search$ = new Subject<void>();

  readonly cart = signal<CartLine[]>([]);
  readonly customers = signal<Customer[]>([]);

  customerId = '';
  discount = 0;
  taxRate = 0;
  paymentMethod: 'cash' | 'card' | 'insurance' = 'cash';
  prescriptionUrl: string | null = null;

  readonly loading = signal(false);
  readonly completedSale = signal<Sale | null>(null);

  readonly requiresPrescription = computed(() =>
    this.cart().some((line) => line.medicine.requiresPrescription),
  );

    subtotal(): number {
    return this.cart().reduce((sum, line) => sum + line.medicine.price * line.quantity, 0);
    }

    tax(): number {
    const taxableAmount = Math.max(0, this.subtotal() - this.discount);
    return (taxableAmount * this.taxRate) / 100;
    }

    total(): number {
    return this.subtotal() - this.discount + this.tax();
    }
  ngOnInit(): void {
    this.search$.pipe(debounceTime(300)).subscribe(() => this.runSearch());

    this.customersService.list({ pageSize: 100 }).subscribe({
      next: (result) => this.customers.set(result.items),
    });
  }

  onSearchChange(): void {
    this.search$.next();
  }

  private runSearch(): void {
    if (!this.searchTerm.trim()) {
      this.searchResults.set([]);
      return;
    }

    this.medicinesService.list({ q: this.searchTerm, pageSize: 10 }).subscribe({
      next: (result) => this.searchResults.set(result.items),
    });
  }

  addToCart(medicine: Medicine): void {
    this.cart.update((lines) => {
      const existing = lines.find((line) => line.medicine.id === medicine.id);
      if (existing) {
        return lines.map((line) =>
          line.medicine.id === medicine.id ? { ...line, quantity: line.quantity + 1 } : line,
        );
      }
      return [...lines, { medicine, quantity: 1 }];
    });
  }

  updateQuantity(medicineId: string, quantity: number): void {
    if (quantity < 1) return;
    this.cart.update((lines) =>
      lines.map((line) => (line.medicine.id === medicineId ? { ...line, quantity } : line)),
    );
  }

  removeFromCart(medicineId: string): void {
    this.cart.update((lines) => lines.filter((line) => line.medicine.id !== medicineId));
  }

  onPrescriptionUploaded(result: unknown): void {
    this.prescriptionUrl = (result as { url: string }).url;
    this.notificationService.success('Prescription uploaded.');
  }

  completeSale(): void {
    if (this.cart().length === 0) {
      this.notificationService.error('Add at least one item to the cart.');
      return;
    }

    if (this.requiresPrescription() && !this.prescriptionUrl) {
      this.notificationService.error('This sale requires a prescription upload.');
      return;
    }

    const payload: SaleRequest = {
      customerId: this.customerId || null,
      items: this.cart().map((line) => ({ medicineId: line.medicine.id, quantity: line.quantity })),
      discount: this.discount,
      taxRate: this.taxRate,
      paymentMethod: this.paymentMethod,
      prescriptionUrl: this.prescriptionUrl,
    };

    this.loading.set(true);

    this.salesService.create(payload).subscribe({
      next: (sale) => {
        this.loading.set(false);
        this.notificationService.success(`Sale completed. Invoice ${sale.invoiceNumber}.`);
        this.completedSale.set(sale);
        this.resetSale();
      },
      error: (err) => {
        this.loading.set(false);
        this.notificationService.error(err.error?.error?.message ?? 'Failed to complete sale.');
      },
    });
  }

  startNewSale(): void {
    this.completedSale.set(null);
  }

  private resetSale(): void {
    this.cart.set([]);
    this.customerId = '';
    this.discount = 0;
    this.taxRate = 0;
    this.paymentMethod = 'cash';
    this.prescriptionUrl = null;
    this.searchTerm = '';
    this.searchResults.set([]);
  }
}