import { Routes } from '@angular/router';
import { guestOnlyGuard } from './core/guards/guest-only.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.Login),
    canActivate: [guestOnlyGuard],
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/pages/register/register').then((m) => m.Register),
    canActivate: [guestOnlyGuard],
  },
];