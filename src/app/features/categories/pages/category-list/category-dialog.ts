import { Component, EventEmitter, Input, Output, inject, computed, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CategoriesService, CategoryFormPayload } from '../../services/categories.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-category-dialog',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './category-dialog.html',
})
export class CategoryDialog {
  private readonly fb = inject(FormBuilder);
  private readonly categoriesService = inject(CategoriesService);
  private readonly notificationService = inject(NotificationService);

  @Input({ required: true }) set target(value: Category | 'new') {
    this.editingCategory = value === 'new' ? null : value;
    if (value !== 'new') {
      this.form.patchValue({ name: value.name, description: value.description });
    }
  }
  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  private editingCategory: Category | null = null;
  readonly loading = signal(false);
  readonly isEditMode = computed(() => this.editingCategory !== null);

  readonly form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const payload = this.form.getRawValue() as CategoryFormPayload;

    const request = this.editingCategory
      ? this.categoriesService.update(this.editingCategory.id, payload)
      : this.categoriesService.create(payload);

    request.subscribe({
      next: () => {
        this.loading.set(false);
        this.notificationService.success(this.editingCategory ? 'Category updated.' : 'Category created.');
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