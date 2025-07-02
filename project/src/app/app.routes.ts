import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./components/products/product-list.component').then(m => m.ProductListComponent)
      },
      {
        path: 'products/new',
        loadComponent: () => import('./components/products/product-form.component').then(m => m.ProductFormComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'MANAGER'] }
      },
      {
        path: 'products/:id/edit',
        loadComponent: () => import('./components/products/product-form.component').then(m => m.ProductFormComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'MANAGER'] }
      },
      {
        path: 'inventory',
        loadComponent: () => import('./components/inventory/inventory.component').then(m => m.InventoryComponent)
      },
      {
        path: 'movements',
        loadComponent: () => import('./components/movements/movement-list.component').then(m => m.MovementListComponent)
      },
      {
        path: 'suppliers',
        loadComponent: () => import('./components/suppliers/supplier-list.component').then(m => m.SupplierListComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'MANAGER'] }
      },
      {
        path: 'reports',
        loadComponent: () => import('./components/reports/reports.component').then(m => m.ReportsComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'MANAGER'] }
      },
      {
        path: 'users',
        loadComponent: () => import('./components/users/user-list.component').then(m => m.UserListComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      }
    ]
  }
];