import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private readonly auth = inject(AuthService);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly templateRef = inject(TemplateRef<unknown>);

  @Input() set appHasPermission(permission: string) {
    this.viewContainer.clear();
    if (this.auth.can(permission)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}