"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PropertyTenantsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyTenantsService = void 0;
const common_1 = require("@nestjs/common");
const property_tenant_repository_1 = require("./repositories/property-tenant.repository");
const tenant_portal_service_1 = require("../applicant-portal/tenant-portal.service");
let PropertyTenantsService = PropertyTenantsService_1 = class PropertyTenantsService {
    constructor(propertyTenantRepository, tenantPortalService) {
        this.propertyTenantRepository = propertyTenantRepository;
        this.tenantPortalService = tenantPortalService;
        this.logger = new common_1.Logger(PropertyTenantsService_1.name);
    }
    async create(dto, tenantId) {
        const existing = await this.propertyTenantRepository.findByEmail(tenantId, dto.email);
        if (existing) {
            throw new common_1.ConflictException('A tenant with this email already exists');
        }
        const tenant = await this.propertyTenantRepository.create({ ...dto, tenantId });
        try {
            const { token } = await this.tenantPortalService.generateAndSaveInviteToken(tenant);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
            const link = `${frontendUrl}/applicant-portal/setup-password?token=${token}`;
            await this.tenantPortalService.sendPortalInviteEmail(tenant.email, tenant.name, link);
        }
        catch (err) {
            this.logger.error(`Failed to send portal invite to ${dto.email}`, err);
        }
        return tenant;
    }
    async findAll(tenantId, page = 1, limit = 20, search) {
        const filter = { tenantId };
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { idNumber: { $regex: search, $options: 'i' } },
            ];
        }
        return this.propertyTenantRepository.findPaginated({ page, limit, filter });
    }
    async findById(id, tenantId) {
        const tenant = await this.propertyTenantRepository.findById(id);
        if (!tenant || tenant.isDeleted || tenant.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        return tenant;
    }
    async findByProperty(tenantId, propertyId) {
        return this.propertyTenantRepository.findByProperty(tenantId, propertyId);
    }
    async update(id, tenantId, dto) {
        await this.findById(id, tenantId);
        const tenant = await this.propertyTenantRepository.update(id, dto);
        if (!tenant)
            throw new common_1.NotFoundException('Tenant not found');
        return tenant;
    }
    async remove(id, tenantId) {
        await this.findById(id, tenantId);
        return this.propertyTenantRepository.delete(id);
    }
    async getStats(tenantId) {
        const [total, active] = await Promise.all([
            this.propertyTenantRepository.countBySystemTenant(tenantId),
            this.propertyTenantRepository.countActive(tenantId),
        ]);
        return { total, active, inactive: total - active };
    }
};
exports.PropertyTenantsService = PropertyTenantsService;
exports.PropertyTenantsService = PropertyTenantsService = PropertyTenantsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => tenant_portal_service_1.TenantPortalService))),
    __metadata("design:paramtypes", [property_tenant_repository_1.PropertyTenantRepository,
        tenant_portal_service_1.TenantPortalService])
], PropertyTenantsService);
//# sourceMappingURL=property-tenants.service.js.map