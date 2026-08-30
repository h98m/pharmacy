import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { Toast } from './shared/components/toast/toast';
import { NavBar } from './shared/components/nav-bar/nav-bar';
import { ConfirmDialog } from './shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, NavBar, ConfirmDialog],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
private readonly router = inject(Router);
readonly isAuthPage = signal(this.isLoginOrRegisterPage(this.router.url));

constructor() {
  this.router.events
    .pipe(filter((e) => e instanceof NavigationEnd))
    .subscribe(() => this.isAuthPage.set(this.isLoginOrRegisterPage(this.router.url)));
}

private isLoginOrRegisterPage(url: string): boolean {
  return url.startsWith('/auth/login') || url.startsWith('/auth/register');
}
}