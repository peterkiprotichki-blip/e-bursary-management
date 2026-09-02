import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { LoginComponent } from './modules/auth/login/login.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { PaymentsListComponent } from './modules/disbursements/payments-list/payments-list.component';
import { PaymentDetailComponent } from './modules/disbursements/payment-detail/payment-detail.component';
import { ReportsComponent } from './modules/reports/reports.component';
import { ApplicantsListComponent } from './modules/bursary/applicants-list/applicants-list.component';
import { ApplicationsListComponent } from './modules/bursary/applications-list/applications-list.component';
import { ApplicationDetailComponent } from './modules/bursary/application-detail/application-detail.component';
import { ProgramsListComponent } from './modules/bursary/programs-list/programs-list.component';
import { AllocationsListComponent } from './modules/bursary/allocations-list/allocations-list.component';
import { DocumentsListComponent } from './modules/bursary/documents-list/documents-list.component';
import { UsersListComponent } from './modules/users/users-list/users-list.component';
import { SettingsComponent } from './modules/settings/settings.component';
import { SystemTenantsComponent } from './modules/system-tenants/system-tenants.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { RoleGuard } from './shared/guards/role.guard';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      // Bursary management routes
      { path: 'bursary/applicants', component: ApplicantsListComponent, canActivate: [RoleGuard], data: { roles: ['super_admin', 'admin', 'manager'] } },
      { path: 'bursary/applications', component: ApplicationsListComponent, canActivate: [RoleGuard], data: { roles: ['super_admin', 'admin', 'manager'] } },
      { path: 'bursary/applications/:id', component: ApplicationDetailComponent, canActivate: [RoleGuard], data: { roles: ['super_admin', 'admin', 'manager'] } },
      { path: 'bursary/programs', component: ProgramsListComponent, canActivate: [RoleGuard], data: { roles: ['super_admin', 'admin'] } },
      { path: 'bursary/allocations', component: AllocationsListComponent, canActivate: [RoleGuard], data: { roles: ['super_admin'] } },
      { path: 'bursary/documents', component: DocumentsListComponent, canActivate: [RoleGuard], data: { roles: ['super_admin', 'admin', 'manager'] } },
      { path: 'payments', component: PaymentsListComponent, canActivate: [RoleGuard], data: { roles: ['super_admin'] } },
      { path: 'payments/:id', component: PaymentDetailComponent, canActivate: [RoleGuard], data: { roles: ['super_admin'] } },
      { path: 'reports', component: ReportsComponent, canActivate: [RoleGuard], data: { roles: ['super_admin', 'admin', 'manager'] } },
      { path: 'settings', component: SettingsComponent, canActivate: [RoleGuard], data: { roles: ['super_admin', 'admin'] } },
      { path: 'system-tenants', component: SystemTenantsComponent, canActivate: [RoleGuard], data: { roles: ['super_admin'] } },
    ],
  },
  // Applicant Portal — lazy-loaded, separate auth
  {
    path: 'applicant-portal',
    loadChildren: () =>
      import('./modules/applicant-portal/tenant-portal.module').then(
        (m) => m.TenantPortalModule,
      ),
  },
  { path: '**', redirectTo: 'dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
