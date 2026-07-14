import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PropertyTenant } from '../applicants/schemas/property-tenant.schema';
import { Payment } from '../disbursements/schemas/payment.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(PropertyTenant.name) private readonly propertyTenantModel: Model<PropertyTenant>,
    @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
  ) {}

  async getDashboardStats(tenantId: string, propertyId?: string) {
    const now = new Date();

    const [
      totalApplicants,
      activeApplicants,
      totalSubmitted,
      totalCompletedPayments,
      totalPendingPayments,
      totalPaymentsAmount,
      totalPaymentsCount,
    ] = await Promise.all([
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

    // Monthly disbursement amount
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

  async getRevenueReport(tenantId: string, year: number, propertyId?: string) {
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

  async getOccupancyReport(tenantId: string) {
    return { total: 1, active: 1, inactive: 0, maintenance: 0 };
  }

  async getLeaseExpiryReport(tenantId: string, daysAhead = 90, propertyId?: string) {
    return {
      daysAhead,
      count: 0,
      leases: [],
    };
  }

  async getDamagesReport(tenantId: string, propertyId?: string) {
    return { total: 0, reported: 0, assessed: 0, inRepair: 0, repaired: 0, totalCost: 0 };
  }
}
