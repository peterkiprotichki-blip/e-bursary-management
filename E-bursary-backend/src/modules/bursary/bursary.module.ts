import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BursaryController } from './bursary.controller';
import { BursaryService } from './bursary.service';
import { PropertyTenant, PropertyTenantSchema } from '../applicants/schemas/property-tenant.schema';
import { Payment, PaymentSchema } from '../disbursements/schemas/payment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PropertyTenant.name, schema: PropertyTenantSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
  ],
  controllers: [BursaryController],
  providers: [BursaryService],
})
export class BursaryModule {}
