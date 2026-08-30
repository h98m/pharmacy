import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicinesService, MedicineFormPayload } from '../../services/medicines.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { FileUpload } from '../../../../shared/components/file-upload/file-upload';
import { environment } from '../../../../../environments/environment';
import { CategoriesService } from '../../../categories/services/categories.service';
import { SuppliersService } from '../../../suppliers/services/suppliers.service';
import { Category } from '../../../categories/models/category.model';
import { Supplier } from '../../../suppliers/models/supplier.model';
@Component({
  selector: 'app-medicine-form',
  standalone: true,
  imports: [ReactiveFormsModule, FileUpload],
  templateUrl: './medicine-form.html',
  styleUrl: './medicine-form.scss',
})
export class MedicineForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly medicinesService = inject(MedicinesService);
  private readonly notificationService = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly categoriesService = inject(CategoriesService);
  private readonly suppliersService = inject(SuppliersService);

  readonly categories = signal<Category[]>([]);
  readonly suppliers = signal<Supplier[]>([]);
  readonly medicineId = signal<string | null>(this.route.snapshot.paramMap.get('id'));
  readonly loading = signal(false);
  readonly imageUploadUrl = computed(() =>
    this.medicineId() ? `${environment.apiUrl}/medicines/${this.medicineId()}/image` : null,
  );

  readonly form = this.fb.group({
    name: ['', Validators.required],
    genericName: [''],
    barcode: [''],
    categoryId: ['', Validators.required],
    supplierId: ['', Validators.required],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    costPrice: [0, [Validators.required, Validators.min(0)]],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    reorderLevel: [0, [Validators.required, Validators.min(0)]],
    expiryDate: ['', Validators.required],
    batchNumber: [''],
    requiresPrescription: [false],
    isActive: [true],
  });

ngOnInit(): void {
  this.categoriesService.list({ pageSize: 100 }).subscribe({
    next: (result) => this.categories.set(result.items),
  });

  this.suppliersService.list({ pageSize: 100 }).subscribe({
    next: (result) => this.suppliers.set(result.items),
  });

  const id = this.medicineId();
  if (id) {
    this.medicinesService.getOne(id).subscribe({
      next: (medicine) => this.form.patchValue(medicine),
      error: (err) => {
        this.notificationService.error(err.error?.error?.message ?? 'Failed to load medicine.');
      },
    });
  }
}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const payload = this.form.getRawValue() as MedicineFormPayload;
    const id = this.medicineId();

    const request = id
      ? this.medicinesService.update(id, payload)
      : this.medicinesService.create(payload);

    request.subscribe({
      next: (medicine) => {
        this.loading.set(false);
        this.notificationService.success(id ? 'Medicine updated.' : 'Medicine created.');
        if (!id) {
          this.medicineId.set(medicine.id);
          this.router.navigate(['/medicines', medicine.id]);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.notificationService.error(err.error?.error?.message ?? 'Something went wrong.');
      },
    });
  }
}