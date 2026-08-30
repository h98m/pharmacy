import { Component, inject } from '@angular/core';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
  private readonly dialogService = inject(ConfirmDialogService);
  readonly request = this.dialogService.request;

  respond(result: boolean): void {
    this.dialogService.respond(result);
  }
}