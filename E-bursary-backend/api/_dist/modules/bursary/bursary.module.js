"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BursaryModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const bursary_controller_1 = require("./bursary.controller");
const bursary_service_1 = require("./bursary.service");
const property_tenant_schema_1 = require("../applicants/schemas/property-tenant.schema");
const payment_schema_1 = require("../disbursements/schemas/payment.schema");
let BursaryModule = class BursaryModule {
};
exports.BursaryModule = BursaryModule;
exports.BursaryModule = BursaryModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: property_tenant_schema_1.PropertyTenant.name, schema: property_tenant_schema_1.PropertyTenantSchema },
                { name: payment_schema_1.Payment.name, schema: payment_schema_1.PaymentSchema },
            ]),
        ],
        controllers: [bursary_controller_1.BursaryController],
        providers: [bursary_service_1.BursaryService],
    })
], BursaryModule);
//# sourceMappingURL=bursary.module.js.map