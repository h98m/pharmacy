import { Component, EventEmitter, Input, Output, inject, computed, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CustomersService, CustomerFormPayload } from '../../services/customers.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-customer-dialog',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './customer-dialog.html',
})
export class CustomerDialog {
  private readonly fb = inject(FormBuilder);
  private readonly customersService = inject(CustomersService);
  private readonly notificationService = inject(NotificationService);

  @Input({ required: true }) set target(value: Customer | 'new') {
    this.editingCustomer = value === 'new' ? null : value;
    if (value !== 'new') {
      this.form.patchValue({
        fullName: value.fullName,
        phone: value.phone,
        email: value.email,
        address: value.address,
        notes: value.notes,
      });
    }
  }
  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  private editingCustomer: Customer | null = null;
  readonly loading = signal(false);
  readonly isEditMode = computed(() => this.editingCustomer !== null);

  readonly form = this.fb.group({
    fullName: ['', Validators.required],
    phone: [''],
    email: ['', Validators.email],
    address: [''],
    notes: [''],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const payload = this.form.getRawValue() as CustomerFormPayload;

    const request = this.editingCustomer
      ? this.customersService.update(this.editingCustomer.id, payload)
      : this.customersService.create(payload);

    request.subscribe({
      next: () => {
        this.loading.set(false);
        this.notificationService.success(this.editingCustomer ? 'Customer updated.' : 'Customer created.');
        this.saved.emit();
      },
      error: (err) => {
        this.loading.set(false);
        this.notificationService.error(err.error?.error?.message ?? 'Something went wrong.');
      },
    });
  }

  cancel(): void {
    this.closed.emit();
  }
}