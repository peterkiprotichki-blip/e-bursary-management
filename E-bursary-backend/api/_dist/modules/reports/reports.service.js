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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const property_tenant_schema_1 = require("../applicants/schemas/property-tenant.schema");
const payment_schema_1 = require("../disbursements/schemas/payment.schema");
let ReportsService = class ReportsService {
    constructor(propertyTenantModel, paymentModel) {
        this.propertyTenantModel = propertyTenantModel;
        this.paymentModel = paymentModel;
    }
    async getDashboardStats(tenantId, propertyId) {
        const now = new Date();
        const [totalApplicants, activeApplicants, totalSubmitted, totalCompletedPayments, totalPendingPayments, totalPaymentsAmount, totalPaymentsCount,] = await Promise.all([
            this.propertyTenantModel.countDocuments({ tenantId, isDeleted: false }),
            this.propertyTenantModel.countDocuments({ tenantId, isActive: true, isDeleted: false }),
            this.propertyTenantModel.countDocuments({ tenantId, 'metadata.applicantPortal.submitted': true, isDeleted: false }),
            this.paymentModel.countDocuments({ tenantId, status: 'completed', isDeleted: false }),
            this.paymentModel.countDocuments({ tenantId, status: 'pending', isDeleted: false }),
            this.paymentModel.aggregate([
                { $match: { tenantId, status: 'completed', isDeleted: false } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            this.paymentModel.countDocuments({ tenantId, isDeleted: false }),
        ]);
        const totalRevenue = totalPaymentsAmount[0]?.total || 0;
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
        const monthlyDisbursedRes = await this.paymentModel.aggregate([
            {
                $match: {
                    tenantId,
                    status: 'completed',
                    isDeleted: false,
                    paymentDate: { $gte: startOfMonth, $lte: endOfMonth },
                },
            },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const monthlyRevenue = monthlyDisbursedRes[0]?.total || 0;
        return {
            properties: { total: 1, available: 0, occupied: 1, occupancyRate: 100 },
            tenants: { total: totalApplicants, active: activeApplicants },
            leases: { total: totalSubmitted, active: totalSubmitted, expiringSoonCount: 0 },
            payments: { total: totalPaymentsCount, completed: totalCompletedPayments, pending: totalPendingPayments },
            revenue: { monthly: monthlyRevenue, total: totalRevenue },
            damages: { total: 0, reported: 0, assessed: 0, inRepair: 0, repaired: 0 },
        };
    }
    async getRevenueReport(tenantId, year, propertyId) {
        const months = [];
        for (let m = 1; m <= 12; m++) {
            const startOfMonth = new Date(year, m - 1, 1);
            const endOfMonth = new Date(year, m, 0, 23, 59, 59, 999);
            const res = await this.paymentModel.aggregate([
                {
                    $match: {
                        tenantId,
                        status: 'completed',
                        isDeleted: false,
                        paymentDate: { $gte: startOfMonth, $lte: endOfMonth },
                    },
                },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]);
            months.push({ month: m, revenue: res[0]?.total || 0 });
        }
        const totalAnnual = months.reduce((sum, m) => sum + m.revenue, 0);
        return { year, months, totalAnnual };
    }
    async getOccupancyReport(tenantId) {
        return { total: 1, active: 1, inactive: 0, maintenance: 0 };
    }
    async getLeaseExpiryReport(tenantId, daysAhead = 90, propertyId) {
        return {
            daysAhead,
            count: 0,
            leases: [],
        };
    }
    async getDamagesReport(tenantId, propertyId) {
        return { total: 0, reported: 0, assessed: 0, inRepair: 0, repaired: 0, totalCost: 0 };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(property_tenant_schema_1.PropertyTenant.name)),
    __param(1, (0, mongoose_1.InjectModel)(payment_schema_1.Payment.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], ReportsService);
//# sourceMappingURL=reports.service.js.map