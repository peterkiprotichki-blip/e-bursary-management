"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const database_module_1 = require("./modules/database/database.module");
const auth_module_1 = require("./modules/auth/auth.module");
const tenants_module_1 = require("./modules/tenants/tenants.module");
const property_tenants_module_1 = require("./modules/applicants/property-tenants.module");
const payments_module_1 = require("./modules/disbursements/payments.module");
const reports_module_1 = require("./modules/reports/reports.module");
const tenant_portal_module_1 = require("./modules/applicant-portal/tenant-portal.module");
const bursary_module_1 = require("./modules/bursary/bursary.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            tenants_module_1.TenantsModule,
            property_tenants_module_1.PropertyTenantsModule,
            payments_module_1.PaymentsModule,
            reports_module_1.ReportsModule,
            tenant_portal_module_1.TenantPortalModule,
            bursary_module_1.BursaryModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map