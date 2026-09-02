import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Layout
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { HeaderComponent } from './layout/header/header.component';

// Auth
import { LoginComponent } from './modules/auth/login/login.component';

// Dashboard
import { DashboardComponent } from './modules/dashboard/dashboard.component';

// Payments
import { PaymentsListComponent } from './modules/disbursements/payments-list/payments-list.component';
import { PaymentDetailComponent } from './modules/disbursements/payment-detail/payment-detail.component';

// Reports
import { ReportsComponent } from './modules/reports/reports.component';
// Bursary
import { ApplicantsListComponent } from './modules/bursary/applicants-list/applicants-list.component';
import { ApplicationsListComponent } from './modules/bursary/applications-list/applications-list.component';
import { ApplicationDetailComponent } from './modules/bursary/application-detail/application-detail.component';
import { ProgramsListComponent } from './modules/bursary/programs-list/programs-list.component';
import { AllocationsListComponent } from './modules/bursary/allocations-list/allocations-list.component';
import { DocumentsListComponent } from './modules/bursary/documents-list/documents-list.component';

// Users
import { UsersListComponent } from './modules/users/users-list/users-list.component';

// Settings
import { SettingsComponent } from './modules/settings/settings.component';

// System Tenants
import { SystemTenantsComponent } from './modules/system-tenants/system-tenants.component';

// Shared
import { ColorPickerComponent } from './shared/components/color-picker/color-picker.component';
import { StkPushComponent } from './shared/components/stk-push/stk-push.component';

// Interceptors
import { AuthInterceptor } from './shared/interceptors/auth.interceptor';
import { TenantPortalAuthInterceptor } from './modules/applicant-portal/shared/interceptors/tenant-portal-auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    MainLayoutComponent,
    SidebarComponent,
    HeaderComponent,
    LoginComponent,
    DashboardComponent,
    ApplicantsListComponent,
    ApplicationsListComponent,
    ApplicationDetailComponent,
    ProgramsListComponent,
    AllocationsListComponent,
    DocumentsListComponent,
    PaymentsListComponent,
    PaymentDetailComponent,
    ReportsComponent,
    UsersListComponent,
    SettingsComponent,
    SystemTenantsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ColorPickerComponent,
    StkPushComponent,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: TenantPortalAuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
