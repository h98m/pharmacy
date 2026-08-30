import { Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { NgTemplateOutlet, CurrencyPipe } from '@angular/common';

export interface DataTableColumn<T> {
  key: keyof T;
  label: string;
  format?: 'currency';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [NgTemplateOutlet, CurrencyPipe],
  templateUrl: './data-table.html',
})
export class DataTable<T extends { id: string }> {
  @Input({ required: true }) columns: DataTableColumn<T>[] = [];
  @Input({ required: true }) rows: T[] = [];
  @Input() loading = false;

  @ContentChild('actions') actionsTemplate?: TemplateRef<{ $implicit: T }>;
}