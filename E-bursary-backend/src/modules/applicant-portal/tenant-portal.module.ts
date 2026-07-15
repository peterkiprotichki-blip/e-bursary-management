import { Tenant, TenantSchema } from '../tenants/schemas/tenant.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TenantPortalController } from './tenant-portal.controller';
import { TenantPortalService } from './tenant-portal.service';
import { FileUploadService } from './services/file-upload.service';
import { TenantPortalJwtStrategy } from './strategies/tenant-portal-jwt.strategy';
import { PropertyTenant, PropertyTenantSchema } from '../applicants/schemas/property-tenant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PropertyTenant.name, schema: PropertyTenantSchema },
      { name: Tenant.name, schema: TenantSchema },
    ]),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.TENANT_PORTAL_JWT_SECRET || process.env.JWT_SECRET || 'e-bursary-portal-secret',
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [TenantPortalController],
  providers: [TenantPortalService, TenantPortalJwtStrategy, FileUploadService],
  exports: [TenantPortalService],
})
export class TenantPortalModule {}
