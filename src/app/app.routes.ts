import { Routes } from '@angular/router';
import { guestOnlyGuard } from './core/guards/guest-only.guard';
import { homeRedirectGuard } from './core/guards/auth.guard';
import { hasPermission } from './core/guards/permission.guard';

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
      canActivate: [hasPermission('dashboard.read')],
    },
    {
      path: 'medicines',
      loadComponent: () =>
        import('./features/medicines/pages/medicine-list/medicine-list').then((m) => m.MedicineList),
      canActivate: [hasPermission('medicines.read')],
    },
    {
      path: 'medicines/new',
      loadComponent: () =>
        import('./features/medicines/pages/medicine-form/medicine-form').then((m) => m.MedicineForm),
      canActivate: [hasPermission('medicines.create')],
    },
    {
      path: 'medicines/:id',
      loadComponent: () =>
        import('./features/medicines/pages/medicine-form/medicine-form').then((m) => m.MedicineForm),
      canActivate: [hasPermission('medicines.update')],
    },
    {
  path: 'categories',
  loadComponent: () =>
    import('./features/categories/pages/category-list/category-list').then((m) => m.CategoryList),
  canActivate: [hasPermission('categories.read')],
  },
  {
    path: 'suppliers',
    loadComponent: () =>
      import('./features/suppliers/pages/supplier-list/supplier-list').then((m) => m.SupplierList),
    canActivate: [hasPermission('suppliers.read')],
  },
  {
    path: 'customers',
    loadComponent: () =>
      import('./features/customers/pages/customer-list/customer-list').then((m) => m.CustomerList),
    canActivate: [hasPermission('customers.read')],
  },
  {
  path: 'pos',
  loadComponent: () =>
    import('./features/sales/pages/point-of-sale/point-of-sale').then((m) => m.PointOfSale),
  canActivate: [hasPermission('sales.create')],
},
{
  path: 'sales',
  loadComponent: () =>
    import('./features/sales/pages/sales-history/sales-history').then((m) => m.SalesHistory),
  canActivate: [hasPermission('sales.read')],
},
  {
    path: 'roles',
    loadComponent: () =>
      import('./features/roles/pages/permission-matrix/permission-matrix').then((m) => m.PermissionMatrix),
    canActivate: [hasPermission('roles.read')],
  },
  {
    path: 'forbidden',
    loadComponent: () =>
      import('./shared/components/forbidden-page/forbidden-page').then((m) => m.ForbiddenPage),
  },
];