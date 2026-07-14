import { PropertyTenantRepository } from './repositories/property-tenant.repository';
import { CreatePropertyTenantDto, UpdatePropertyTenantDto } from './dto/property-tenant.dto';
import { TenantPortalService } from '../applicant-portal/tenant-portal.service';
export declare class PropertyTenantsService {
    private readonly propertyTenantRepository;
    private readonly tenantPortalService;
    private readonly logger;
    constructor(propertyTenantRepository: PropertyTenantRepository, tenantPortalService: TenantPortalService);
    create(dto: CreatePropertyTenantDto, tenantId: string): Promise<import("./schemas/property-tenant.schema").PropertyTenant>;
    findAll(tenantId: string, page?: number, limit?: number, search?: string): Promise<import("../database/interfaces/paginated-response.interface").PaginatedResponse<import("./schemas/property-tenant.schema").PropertyTenant>>;
    findById(id: string, tenantId: string): Promise<import("./schemas/property-tenant.schema").PropertyTenant>;
    findByProperty(tenantId: string, propertyId: string): Promise<import("./schemas/property-tenant.schema").PropertyTenant[]>;
    update(id: string, tenantId: string, dto: UpdatePropertyTenantDto): Promise<import("./schemas/property-tenant.schema").PropertyTenant>;
    remove(id: string, tenantId: string): Promise<boolean>;
    getStats(tenantId: string): Promise<{
        total: number;
        active: number;
        inactive: number;
    }>;
}
