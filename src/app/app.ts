import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { Toast } from './shared/components/toast/toast';
import { NavBar } from './shared/components/nav-bar/nav-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, NavBar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly router = inject(Router);
  readonly isAuthPage = signal(this.router.url.startsWith('/auth'));

  constructor() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.isAuthPage.set(this.router.url.startsWith('/auth')));
  }
}