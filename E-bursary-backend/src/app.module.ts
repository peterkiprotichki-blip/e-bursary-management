import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { PropertyTenantsModule } from './modules/applicants/property-tenants.module';
import { PaymentsModule } from './modules/disbursements/payments.module';
import { ReportsModule } from './modules/reports/reports.module';
import { TenantPortalModule } from './modules/applicant-portal/tenant-portal.module';
import { BursaryModule } from './modules/bursary/bursary.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    TenantsModule,
    PropertyTenantsModule,
    PaymentsModule,
    ReportsModule,
    TenantPortalModule,
    BursaryModule,
  ],
})
export class AppModule {}
