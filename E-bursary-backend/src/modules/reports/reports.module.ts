import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PropertyTenant, PropertyTenantSchema } from '../applicants/schemas/property-tenant.schema';
import { Payment, PaymentSchema } from '../disbursements/schemas/payment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PropertyTenant.name, schema: PropertyTenantSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
