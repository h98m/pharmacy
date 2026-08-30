import { Component, EventEmitter, Input, Output, inject, computed, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SuppliersService, SupplierFormPayload } from '../../services/suppliers.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Supplier } from '../../models/supplier.model';

@Component({
  selector: 'app-supplier-dialog',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './supplier-dialog.html',
})
export class SupplierDialog {
  private readonly fb = inject(FormBuilder);
  private readonly suppliersService = inject(SuppliersService);
  private readonly notificationService = inject(NotificationService);

  @Input({ required: true }) set target(value: Supplier | 'new') {
    this.editingSupplier = value === 'new' ? null : value;
    if (value !== 'new') {
      this.form.patchValue({
        name: value.name,
        contactPerson: value.contactPerson,
        phone: value.phone,
        email: value.email,
        address: value.address,
        isActive: value.isActive,
      });
    }
  }
  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  private editingSupplier: Supplier | null = null;
  readonly loading = signal(false);
  readonly isEditMode = computed(() => this.editingSupplier !== null);

  readonly form = this.fb.group({
    name: ['', Validators.required],
    contactPerson: [''],
    phone: [''],
    email: ['', Validators.email],
    address: [''],
    isActive: [true],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const payload = this.form.getRawValue() as SupplierFormPayload;

    const request = this.editingSupplier
      ? this.suppliersService.update(this.editingSupplier.id, payload)
      : this.suppliersService.create(payload);

    request.subscribe({
      next: () => {
        this.loading.set(false);
        this.notificationService.success(this.editingSupplier ? 'Supplier updated.' : 'Supplier created.');
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