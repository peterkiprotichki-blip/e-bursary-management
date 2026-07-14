import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getDashboard(req: any, propertyId?: string): Promise<{
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
    getRevenue(req: any, year?: number, propertyId?: string): Promise<{
        year: number;
        months: any[];
        totalAnnual: any;
    }>;
    getOccupancy(req: any): Promise<{
        total: number;
        active: number;
        inactive: number;
        maintenance: number;
    }>;
    getLeaseExpiry(req: any, days?: number, propertyId?: string): Promise<{
        daysAhead: number;
        count: number;
        leases: any[];
    }>;
    getDamages(req: any, propertyId?: string): Promise<{
        total: number;
        reported: number;
        assessed: number;
        inRepair: number;
        repaired: number;
        totalCost: number;
    }>;
}
