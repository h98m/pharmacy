import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private readonly auth = inject(AuthService);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private permission = '';

  @Input() set appHasPermission(permission: string) {
    this.permission = permission;
  }

  constructor() {
    effect(() => {
      const hasAccess = this.auth.can(this.permission);
      this.viewContainer.clear();
      if (hasAccess) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }
}