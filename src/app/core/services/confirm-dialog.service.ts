import { Injectable, signal } from '@angular/core';

interface ConfirmRequest {
  message: string;
  resolve: (result: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  readonly request = signal<ConfirmRequest | null>(null);

  confirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.request.set({ message, resolve });
    });
  }

  respond(result: boolean): void {
    this.request()?.resolve(result);
    this.request.set(null);
  }
}