import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MedicinesService } from '../../services/medicines.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Medicine } from '../../models/medicine.model';

@Component({
  selector: 'app-stock-adjust-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './stock-adjust-dialog.html',
})
export class StockAdjustDialog {
  private readonly medicinesService = inject(MedicinesService);
  private readonly notificationService = inject(NotificationService);

  @Input({ required: true }) medicine!: Medicine;
  @Output() adjusted = new EventEmitter<Medicine>();
  @Output() closed = new EventEmitter<void>();

  change = 0;
  reason = '';
  readonly loading = signal(false);

  submit(): void {
    this.loading.set(true);

    this.medicinesService.adjustStock(this.medicine.id, { change: this.change, reason: this.reason }).subscribe({
      next: (updated) => {
        this.loading.set(false);
        this.notificationService.success('Stock updated.');
        this.adjusted.emit(updated);
      },
      error: (err) => {
        this.loading.set(false);
        this.notificationService.error(err.error?.error?.message ?? 'Failed to adjust stock.');
      },
    });
  }

  cancel(): void {
    this.closed.emit();
  }
}