import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error';
}

const AUTO_DISMISS_MS = 4000;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _notification = signal<Notification | null>(null);
  readonly notification = this._notification.asReadonly();

  private nextId = 0;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  dismiss(): void {
    this._notification.set(null);
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private show(message: string, type: Notification['type']): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this._notification.set({ id: ++this.nextId, message, type });
    this.timeoutId = setTimeout(() => this.dismiss(), AUTO_DISMISS_MS);
  }
}