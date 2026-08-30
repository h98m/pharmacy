import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { CategoriesService, CategoryListParams } from '../../services/categories.service';
import { Category } from '../../models/category.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { DataTable, DataTableColumn } from '../../../../shared/components/data-table/data-table';
import { HasPermissionDirective } from '../../../../core/directives/has-permission.directive';
import { CategoryDialog } from './category-dialog';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [FormsModule, DataTable, HasPermissionDirective, CategoryDialog],
  templateUrl: './category-list.html',
  styleUrl: './category-list.scss',
})
export class CategoryList implements OnInit {
  private readonly categoriesService = inject(CategoriesService);
  private readonly notificationService = inject(NotificationService);
  private readonly confirmDialogService = inject(ConfirmDialogService);

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly page = signal(1);
  readonly totalPages = signal(1);
  readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  readonly dialogTarget = signal<Category | 'new' | null>(null);

  private readonly pageSize = 10;
  searchTerm = '';

  private readonly search$ = new Subject<void>();

  readonly columns: DataTableColumn<Category>[] = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'medicineCount', label: 'Medicines' },
  ];

  ngOnInit(): void {
    this.search$.pipe(debounceTime(300)).subscribe(() => {
      this.page.set(1);
      this.fetchCategories();
    });

    this.fetchCategories();
  }

  onSearchChange(): void {
    this.search$.next();
  }

  goToPage(page: number): void {
    this.page.set(page);
    this.fetchCategories();
  }

  openCreate(): void {
    this.dialogTarget.set('new');
  }

  openEdit(category: Category): void {
    this.dialogTarget.set(category);
  }

  closeDialog(): void {
    this.dialogTarget.set(null);
  }

  onSaved(): void {
    this.dialogTarget.set(null);
    this.fetchCategories();
  }

  async deleteCategory(category: Category): Promise<void> {
    const confirmed = await this.confirmDialogService.confirm(`Delete "${category.name}"? This cannot be undone.`);
    if (!confirmed) return;

    this.categoriesService.delete(category.id).subscribe({
      next: () => {
        this.notificationService.success('Category deleted.');
        this.fetchCategories();
      },
      error: (err) => {
        this.notificationService.error(err.error?.error?.message ?? 'Failed to delete category.');
      },
    });
  }

  private fetchCategories(): void {
    this.loading.set(true);

    const params: CategoryListParams = {
      page: this.page(),
      pageSize: this.pageSize,
      q: this.searchTerm || undefined,
    };

    this.categoriesService.list(params).subscribe({
      next: (result) => {
        this.categories.set(result.items);
        this.totalPages.set(result.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.notificationService.error(err.error?.error?.message ?? 'Failed to load categories.');
      },
    });
  }
}