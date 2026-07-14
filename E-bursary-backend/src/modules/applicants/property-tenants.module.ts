import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PropertyTenantsService } from './property-tenants.service';
import { PropertyTenantsController } from './property-tenants.controller';
import { PropertyTenant, PropertyTenantSchema } from './schemas/property-tenant.schema';
import { PropertyTenantRepository } from './repositories/property-tenant.repository';
import { TenantPortalModule } from '../applicant-portal/tenant-portal.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PropertyTenant.name, schema: PropertyTenantSchema },
    ]),
    forwardRef(() => TenantPortalModule),
  ],
  controllers: [PropertyTenantsController],
  providers: [PropertyTenantsService, PropertyTenantRepository],
  exports: [PropertyTenantsService, PropertyTenantRepository],
})
export class PropertyTenantsModule {}
