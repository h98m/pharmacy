import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast.html',
})
export class Toast {
  private readonly notificationService = inject(NotificationService);
  readonly notification = this.notificationService.notification;

  dismiss(): void {
    this.notificationService.dismiss();
  }
}