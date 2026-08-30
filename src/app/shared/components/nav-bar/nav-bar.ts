import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RouterLink } from '@angular/router';
import { HasPermissionDirective } from '../../../core/directives/has-permission.directive';

@Component({
  selector: 'app-nav-bar',
  
  standalone: true,
  imports: [RouterLink, HasPermissionDirective],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss',
})
export class NavBar {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.authService.user;

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}