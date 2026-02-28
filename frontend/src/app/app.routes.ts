
import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard';
import { AdminComponent } from './features/admin/admin/admin';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'admin', component: AdminComponent }
];