"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantPortalModule = void 0;
const tenant_schema_1 = require("../tenants/schemas/tenant.schema");
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const tenant_portal_controller_1 = require("./tenant-portal.controller");
const tenant_portal_service_1 = require("./tenant-portal.service");
const file_upload_service_1 = require("./services/file-upload.service");
const tenant_portal_jwt_strategy_1 = require("./strategies/tenant-portal-jwt.strategy");
const property_tenant_schema_1 = require("../applicants/schemas/property-tenant.schema");
let TenantPortalModule = class TenantPortalModule {
};
exports.TenantPortalModule = TenantPortalModule;
exports.TenantPortalModule = TenantPortalModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: property_tenant_schema_1.PropertyTenant.name, schema: property_tenant_schema_1.PropertyTenantSchema },
                { name: tenant_schema_1.Tenant.name, schema: tenant_schema_1.TenantSchema },
            ]),
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                useFactory: () => ({
                    secret: process.env.TENANT_PORTAL_JWT_SECRET || process.env.JWT_SECRET || 'e-bursary-portal-secret',
                    signOptions: { expiresIn: '7d' },
                }),
            }),
        ],
        controllers: [tenant_portal_controller_1.TenantPortalController],
        providers: [tenant_portal_service_1.TenantPortalService, tenant_portal_jwt_strategy_1.TenantPortalJwtStrategy, file_upload_service_1.FileUploadService],
        exports: [tenant_portal_service_1.TenantPortalService],
    })
], TenantPortalModule);
//# sourceMappingURL=tenant-portal.module.js.map