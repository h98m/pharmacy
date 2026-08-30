import { Component, inject, OnInit, signal } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardStats } from '../../../../core/models/dashboard-stats.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.scss',
})
export class DashboardHome implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly notificationService = inject(NotificationService);

  readonly stats = signal<DashboardStats | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.notificationService.error(err.error?.error?.message ?? 'Failed to load dashboard.');
      },
    });
  }
}