import { Routes } from '@angular/router';
import { guestOnlyGuard } from './core/guards/guest-only.guard';
import { authGuard, homeRedirectGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', canActivate: [homeRedirectGuard], children: [] },
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
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard-home/dashboard-home').then((m) => m.DashboardHome),
    canActivate: [authGuard],
  },
  {
    path: 'forbidden',
    loadComponent: () =>
      import('./shared/components/forbidden-page/forbidden-page').then((m) => m.ForbiddenPage),
  },
];