import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Sale } from '../../models/sale.model';

@Component({
  selector: 'app-sale-detail-dialog',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './sale-detail-dialog.html',
})
export class SaleDetailDialog {
  @Input({ required: true }) sale!: Sale;
  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
  }
}