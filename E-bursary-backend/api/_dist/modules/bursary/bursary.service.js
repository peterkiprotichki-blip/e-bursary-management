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
var BursaryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BursaryService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const nodemailer = require("nodemailer");
const property_tenant_schema_1 = require("../applicants/schemas/property-tenant.schema");
const payment_schema_1 = require("../disbursements/schemas/payment.schema");
let BursaryService = BursaryService_1 = class BursaryService {
    constructor(propertyTenantModel, paymentModel) {
        this.propertyTenantModel = propertyTenantModel;
        this.paymentModel = paymentModel;
        this.logger = new common_1.Logger(BursaryService_1.name);
    }
    get mailer() {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: process.env.SMTP_SECURE === 'true',
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });
    }
    async getDashboardSummary(tenantId) {
        const applicants = await this.propertyTenantModel
            .find({ ...(tenantId ? { tenantId } : {}), isDeleted: false })
            .select('name email metadata createdAt')
            .lean();
        const totalApplicants = applicants.length;
        const submitted = applicants.filter((a) => a?.metadata?.applicantPortal?.submitted).length;
        const inReview = applicants.filter((a) => a?.metadata?.applicantPortal?.stage === 'in_review').length;
        const awarded = applicants.filter((a) => a?.metadata?.applicantPortal?.stage === 'awarded').length;
        const rejected = applicants.filter((a) => a?.metadata?.applicantPortal?.stage === 'rejected').length;
        const payments = await this.paymentModel
            .find({ ...(tenantId ? { tenantId } : {}), isDeleted: false, status: 'completed' })
            .select('amount paymentDate')
            .lean();
        const totalDisbursed = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const monthlyDisbursed = this.currentMonthTotal(payments);
        return {
            applicants: {
                total: totalApplicants,
                submitted,
                inReview,
                awarded,
                rejected,
            },
            disbursements: {
                total: totalDisbursed,
                monthly: monthlyDisbursed,
                completedPayments: payments.length,
            },
        };
    }
    async listApplications(tenantId) {
        const applicants = await this.propertyTenantModel
            .find({ ...(tenantId ? { tenantId } : {}), isDeleted: false })
            .select('name email phone metadata createdAt updatedAt')
            .sort({ updatedAt: -1 })
            .lean();
        return applicants
            .map((applicant) => {
            const portal = applicant?.metadata?.applicantPortal || {};
            const submitted = Boolean(portal.submitted);
            if (!submitted)
                return null;
            const stage = portal.stage || 'submitted';
            const progress = Number(portal.progress || 0) || this.calcProgress(portal, applicant);
            return {
                _id: applicant._id,
                fullName: portal.fullName || applicant.name || '',
                email: portal.email || applicant.email || '',
                phone: portal.phone || applicant.phone || '',
                institution: portal.institution || '',
                course: portal.course || '',
                progress,
                stage,
                submittedAt: portal.submittedAt || '',
                reviewNotes: portal.reviewNotes || '',
                awardAmount: Number(portal.awardAmount || 0),
                paymentDestination: portal.paymentDestination || '',
                updatedAt: applicant.updatedAt,
            };
        })
            .filter(Boolean);
    }
    async updateApplicationStage(tenantId, applicantId, dto, reviewerId) {
        const applicant = await this.propertyTenantModel.findOne({
            _id: applicantId,
            tenantId,
            isDeleted: false,
        });
        if (!applicant) {
            throw new common_1.NotFoundException('Applicant not found');
        }
        const currentPortal = applicant.metadata?.applicantPortal || {};
        if (!currentPortal.submitted) {
            throw new common_1.NotFoundException('Submitted application not found for this applicant');
        }
        const nextPortal = {
            ...currentPortal,
            stage: dto.stage,
            reviewNotes: dto.reviewNotes ?? currentPortal.reviewNotes ?? '',
            awardAmount: dto.awardAmount ?? currentPortal.awardAmount ?? 0,
            paymentDestination: dto.paymentDestination ?? currentPortal.paymentDestination ?? '',
            reviewedAt: new Date().toISOString(),
            reviewedBy: reviewerId || '',
        };
        applicant.metadata = {
            ...(applicant.metadata || {}),
            applicantPortal: nextPortal,
        };
        await applicant.save();
        if (dto.stage === 'awarded' && (dto.awardAmount || 0) > 0) {
            const existingPayment = await this.paymentModel.findOne({
                tenantId,
                propertyTenantId: applicantId,
                isDeleted: false,
                status: 'completed',
                paymentType: 'other',
                notes: { $regex: /Bursary/i },
            });
            if (!existingPayment) {
                const receiptNumber = `DISB-${Date.now().toString(36).toUpperCase()}`;
                let paymentMethod = 'other';
                const destLower = (dto.paymentDestination || '').toLowerCase();
                if (destLower.includes('mpesa') || destLower.includes('phone') || destLower.includes('mobile')) {
                    paymentMethod = 'mpesa';
                }
                else if (destLower.includes('bank') || destLower.includes('account')) {
                    paymentMethod = 'bank_transfer';
                }
                await this.paymentModel.create({
                    tenantId,
                    leaseId: applicant.currentLeaseId || 'dummy-lease-id',
                    propertyTenantId: applicantId,
                    propertyId: applicant.currentPropertyId || 'dummy-property-id',
                    amount: dto.awardAmount,
                    currency: 'KES',
                    paymentDate: new Date(),
                    paymentMethod,
                    paymentType: 'other',
                    status: 'completed',
                    mpesaTransactionId: '',
                    mpesaPhoneNumber: applicant.phone || '',
                    receiptNumber,
                    paymentPeriod: new Date().getFullYear().toString(),
                    notes: `Bursary Allocation: ${dto.reviewNotes || 'Approved'} (Applicant: ${nextPortal.fullName || applicant.name})`,
                    propertyName: dto.paymentDestination || 'Direct to Institution',
                    propertyTenantName: nextPortal.fullName || applicant.name,
                    recordedBy: reviewerId,
                });
            }
        }
        const email = nextPortal.email || applicant.email || '';
        if (email) {
            const fullName = nextPortal.fullName || applicant.name || 'Applicant';
            this.sendStageNotificationEmail(email, fullName, {
                stage: nextPortal.stage,
                reviewNotes: nextPortal.reviewNotes,
                awardAmount: Number(nextPortal.awardAmount || 0),
            }).catch((err) => {
                this.logger.error(`Failed to send stage notification for applicant ${applicantId}`, err);
            });
        }
        return {
            _id: applicant._id,
            stage: nextPortal.stage,
            reviewNotes: nextPortal.reviewNotes,
            awardAmount: nextPortal.awardAmount,
            paymentDestination: nextPortal.paymentDestination,
            reviewedAt: nextPortal.reviewedAt,
        };
    }
    async updateApplication(tenantId, applicantId, dto) {
        const applicant = await this.propertyTenantModel.findOne({
            _id: applicantId,
            tenantId,
            isDeleted: false,
        });
        if (!applicant) {
            throw new common_1.NotFoundException('Applicant not found');
        }
        const currentPortal = applicant.metadata?.applicantPortal || {};
        const updatableFields = {};
        const keys = [
            'fullName', 'phone', 'email', 'idNumber', 'institution', 'course',
            'admissionNumber', 'formOrLevel', 'yearOfStudy', 'levelType',
            'parentName', 'parentPhone', 'parentEmail', 'parentNationalId', 'disabilityStatus',
            'bankName', 'accountNumber', 'mpesaNumber',
            'householdIncome', 'familyDependents', 'specialCircumstances',
            'personalStatement', 'guardianNotes',
        ];
        for (const key of keys) {
            if (dto[key] !== undefined) {
                updatableFields[key] = dto[key];
            }
        }
        const nextPortal = {
            ...currentPortal,
            ...updatableFields,
            lastSavedAt: new Date().toISOString(),
        };
        if (updatableFields.fullName)
            applicant.name = updatableFields.fullName;
        if (updatableFields.phone)
            applicant.phone = updatableFields.phone;
        if (updatableFields.email)
            applicant.email = updatableFields.email;
        if (updatableFields.idNumber)
            applicant.idNumber = updatableFields.idNumber;
        applicant.metadata = {
            ...(applicant.metadata || {}),
            applicantPortal: nextPortal,
        };
        await applicant.save();
        return nextPortal;
    }
    currentMonthTotal(payments) {
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        return payments.reduce((sum, payment) => {
            const date = new Date(payment.paymentDate);
            if (date.getMonth() === month && date.getFullYear() === year) {
                return sum + (payment.amount || 0);
            }
            return sum;
        }, 0);
    }
    stageCopy(stage) {
        if (stage === 'submitted') {
            return {
                label: 'Submitted',
                subject: 'Application Submitted Successfully',
                message: 'Your bursary application has been submitted and queued for committee review.',
            };
        }
        if (stage === 'in_review') {
            return {
                label: 'In Review',
                subject: 'Application Status Updated: In Review',
                message: 'Your bursary application is currently being reviewed by the bursary committee.',
            };
        }
        if (stage === 'awarded') {
            return {
                label: 'Awarded',
                subject: 'Application Outcome: Awarded',
                message: 'Congratulations. Your bursary application has been approved for funding.',
            };
        }
        return {
            label: 'Rejected',
            subject: 'Application Outcome: Not Approved',
            message: 'Your bursary application has been reviewed and was not approved in this cycle.',
        };
    }
    async sendStageNotificationEmail(to, fullName, data) {
        if (process.env.OFFLINE_MODE === 'true') {
            this.logger.log(`Email notification skipped in offline mode for ${to}`);
            return;
        }
        const copy = this.stageCopy(data.stage);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4400';
        const notes = data.reviewNotes?.trim();
        const hasAwardAmount = data.stage === 'awarded' && Number(data.awardAmount || 0) > 0;
        await this.mailer.sendMail({
            from: `"E-Bursary" <${process.env.SMTP_USER}>`,
            to,
            subject: copy.subject,
            html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;background:#f8fafc;border-radius:12px;">
          <div style="text-align:center;margin-bottom:24px;">
            <h1 style="color:#1e293b;margin:0;font-size:22px;">E-Bursary</h1>
            <p style="color:#64748b;font-size:13px;margin-top:8px;">Applicant Status Update</p>
          </div>
          <div style="background:white;border-radius:12px;padding:28px;border:1px solid #e2e8f0;">
            <h2 style="color:#1e293b;margin-top:0;">Hello ${fullName},</h2>
            <p style="color:#475569;line-height:1.7;">${copy.message}</p>
            <table style="width:100%;border-collapse:collapse;margin:18px 0;">
              <tr style="background:#f8fafc;"><td style="padding:10px 14px;color:#64748b;font-size:13px;width:45%;">Current Stage</td><td style="padding:10px 14px;color:#1e293b;font-weight:600;">${copy.label}</td></tr>
              ${hasAwardAmount ? `<tr><td style="padding:10px 14px;color:#64748b;font-size:13px;">Award Amount</td><td style="padding:10px 14px;color:#059669;font-weight:700;">KES ${Number(data.awardAmount || 0).toLocaleString()}</td></tr>` : ''}
              ${notes ? `<tr style="background:#f8fafc;"><td style="padding:10px 14px;color:#64748b;font-size:13px;">Review Notes</td><td style="padding:10px 14px;color:#1e293b;">${notes}</td></tr>` : ''}
            </table>
            <div style="text-align:center;margin-top:24px;">
              <a href="${frontendUrl}/applicant-portal/status" style="display:inline-block;padding:10px 28px;background:#059669;color:white;text-decoration:none;border-radius:8px;font-size:13px;">View Funding Status</a>
            </div>
          </div>
          <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:20px;">&copy; ${new Date().getFullYear()} E-Bursary. All rights reserved.</p>
        </div>
      `,
        });
    }
    calcProgress(portal, applicant) {
        const isHighSchool = (portal.levelType || 'university') === 'high_school';
        const fields = [
            portal.fullName || applicant.name,
            portal.phone || applicant.phone,
            portal.email || applicant.email,
            isHighSchool ? 'dummy-id' : (portal.idNumber || applicant.idNumber),
            isHighSchool ? portal.formOrLevel : portal.yearOfStudy,
            portal.institution,
            isHighSchool ? 'dummy-course' : portal.course,
            isHighSchool ? portal.parentName : 'dummy-parent-name',
            isHighSchool ? portal.parentPhone : 'dummy-parent-phone',
            isHighSchool ? portal.parentEmail : 'dummy-parent-email',
            isHighSchool ? portal.parentNationalId : 'dummy-parent-id',
            portal.personalStatement,
        ];
        const filled = fields.filter(Boolean).length;
        const docs = Array.isArray(portal.documents) ? portal.documents.length : 0;
        const total = fields.length + 3;
        return Math.min(100, Math.round(((filled + Math.min(docs, 3)) / total) * 100));
    }
};
exports.BursaryService = BursaryService;
exports.BursaryService = BursaryService = BursaryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(property_tenant_schema_1.PropertyTenant.name)),
    __param(1, (0, mongoose_1.InjectModel)(payment_schema_1.Payment.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], BursaryService);
//# sourceMappingURL=bursary.service.js.map