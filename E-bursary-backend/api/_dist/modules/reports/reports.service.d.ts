import { Model } from 'mongoose';
import { PropertyTenant } from '../applicants/schemas/property-tenant.schema';
import { Payment } from '../disbursements/schemas/payment.schema';
export declare class ReportsService {
    private readonly propertyTenantModel;
    private readonly paymentModel;
    constructor(propertyTenantModel: Model<PropertyTenant>, paymentModel: Model<Payment>);
    getDashboardStats(tenantId: string, propertyId?: string): Promise<{
        properties: {
            total: number;
            available: number;
            occupied: number;
            occupancyRate: number;
        };
        tenants: {
            total: number;
            active: number;
        };
        leases: {
            total: number;
            active: number;
            expiringSoonCount: number;
        };
        payments: {
            total: number;
            completed: number;
            pending: number;
        };
        revenue: {
            monthly: any;
            total: any;
        };
        damages: {
            total: number;
            reported: number;
            assessed: number;
            inRepair: number;
            repaired: number;
        };
    }>;
    getRevenueReport(tenantId: string, year: number, propertyId?: string): Promise<{
        year: number;
        months: any[];
        totalAnnual: any;
    }>;
    getOccupancyReport(tenantId: string): Promise<{
        total: number;
        active: number;
        inactive: number;
        maintenance: number;
    }>;
    getLeaseExpiryReport(tenantId: string, daysAhead?: number, propertyId?: string): Promise<{
        daysAhead: number;
        count: number;
        leases: any[];
    }>;
    getDamagesReport(tenantId: string, propertyId?: string): Promise<{
        total: number;
        reported: number;
        assessed: number;
        inRepair: number;
        repaired: number;
        totalCost: number;
    }>;
}
