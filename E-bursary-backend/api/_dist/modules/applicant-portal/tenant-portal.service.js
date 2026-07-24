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
var TenantPortalService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantPortalService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const property_tenant_schema_1 = require("../applicants/schemas/property-tenant.schema");
const tenant_schema_1 = require("../tenants/schemas/tenant.schema");
let TenantPortalService = TenantPortalService_1 = class TenantPortalService {
    constructor(propertyTenantModel, tenantOrgModel, jwtService) {
        this.propertyTenantModel = propertyTenantModel;
        this.tenantOrgModel = tenantOrgModel;
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(TenantPortalService_1.name);
    }
    async register(dto) {
        const org = await this.resolveOrganizationByLocation(dto.location);
        if (!org) {
            throw new common_1.BadRequestException('No bursary office matched that location. Please check the location and try again.');
        }
        const bursaryOpen = org?.settings?.bursaryOpen !== false;
        if (!bursaryOpen) {
            throw new common_1.BadRequestException('Bursary applications are currently closed. Please check back later when applications reopen.');
        }
        const email = dto.email.trim().toLowerCase();
        const existing = await this.propertyTenantModel.findOne({ tenantId: org._id.toString(), email, isDeleted: false });
        if (existing) {
            throw new common_1.BadRequestException('An applicant account already exists with this email for that organization.');
        }
        const hashed = await bcrypt.hash(dto.password, 10);
        const tenant = await this.propertyTenantModel.create({
            tenantId: org._id.toString(),
            name: dto.fullName.trim(),
            email,
            phone: dto.phone.trim(),
            portalPassword: hashed,
            portalPasswordSet: true,
            portalInviteToken: '',
            portalInviteTokenUsed: true,
            isActive: true,
            metadata: { applicantPortal: { stage: 'draft', submitted: false, createdVia: 'public-registration' } },
        });
        const token = this.jwtService.sign({
            sub: tenant._id.toString(),
            email: tenant.email,
            name: tenant.name,
            orgTenantId: tenant.tenantId,
            type: 'tenant-portal',
        }, {
            secret: process.env.TENANT_PORTAL_JWT_SECRET || process.env.JWT_SECRET || 'e-bursary-portal-secret',
            expiresIn: '7d',
        });
        return { token, profile: this.sanitize(tenant), message: 'Account created successfully.' };
    }
    async resolveOrganizationByLocation(location) {
        const normalized = (location || '').trim().toLowerCase();
        if (!normalized)
            return null;
        const orgs = await this.tenantOrgModel.find({ isActive: true }).lean();
        if (orgs.length === 1) {
            return orgs[0];
        }
        const exactMatch = orgs.find((org) => {
            const fields = [
                org?.name,
                org?.slug,
                org?.domain,
                org?.settings?.location,
                org?.settings?.officeLocation,
                org?.settings?.campus,
                org?.settings?.region,
                org?.settings?.town,
            ]
                .filter(Boolean)
                .map((value) => String(value).trim().toLowerCase());
            return fields.includes(normalized) || fields.some((value) => value.includes(normalized) || normalized.includes(value));
        });
        return exactMatch || null;
    }
    async setupPassword(dto) {
        const tenant = await this.propertyTenantModel.findOne({
            portalInviteToken: dto.token,
            portalInviteTokenUsed: false,
            isDeleted: false,
        });
        if (!tenant)
            throw new common_1.BadRequestException('Invalid or expired invite link');
        if (tenant.portalInviteTokenExpiry && new Date() > tenant.portalInviteTokenExpiry) {
            throw new common_1.BadRequestException('Invite link has expired. Ask your bursary office to resend the invite.');
        }
        const hashed = await bcrypt.hash(dto.password, 10);
        tenant.portalPassword = hashed;
        tenant.portalPasswordSet = true;
        tenant.portalInviteTokenUsed = true;
        await tenant.save();
        return { message: 'Password set successfully. You can now log in.' };
    }
    async login(dto) {
        const tenant = await this.propertyTenantModel.findOne({
            email: dto.email.toLowerCase(),
            isDeleted: false,
            isActive: true,
        });
        if (!tenant) {
            throw new common_1.UnauthorizedException('No applicant account found with this email. Please contact your bursary office.');
        }
        if (!tenant.portalPasswordSet) {
            throw new common_1.UnauthorizedException('Your account has not been activated yet. Please check your email for the setup link sent by your bursary office.');
        }
        const isValid = await bcrypt.compare(dto.password, tenant.portalPassword);
        if (!isValid)
            throw new common_1.UnauthorizedException('Incorrect password. Please try again.');
        const token = this.jwtService.sign({
            sub: tenant._id.toString(),
            email: tenant.email,
            name: tenant.name,
            orgTenantId: tenant.tenantId,
            type: 'tenant-portal',
        }, {
            secret: process.env.TENANT_PORTAL_JWT_SECRET || process.env.JWT_SECRET || 'e-bursary-portal-secret',
            expiresIn: '7d',
        });
        const profile = this.sanitize(tenant);
        const org = await this.tenantOrgModel.findById(tenant.tenantId).lean();
        const bursaryOpen = org?.settings?.bursaryOpen !== false;
        const applicationDeadline = org?.settings?.applicationDeadline || '';
        return { token, profile, bursaryOpen, applicationDeadline };
    }
    async getProfile(propertyTenantId) {
        const tenant = await this.propertyTenantModel.findById(propertyTenantId);
        if (!tenant || tenant.isDeleted)
            throw new common_1.NotFoundException('Tenant not found');
        return this.sanitize(tenant);
    }
    async updateProfile(propertyTenantId, dto) {
        const tenant = await this.propertyTenantModel.findById(propertyTenantId);
        if (!tenant || tenant.isDeleted)
            throw new common_1.NotFoundException('Tenant not found');
        tenant.phone = dto.phone;
        await tenant.save();
        return this.sanitize(tenant);
    }
    async getApplication(propertyTenantId) {
        const tenant = await this.propertyTenantModel.findById(propertyTenantId);
        if (!tenant || tenant.isDeleted)
            throw new common_1.NotFoundException('Applicant not found');
        return this.getApplicantPortalState(tenant);
    }
    async saveApplication(propertyTenantId, dto) {
        const tenant = await this.propertyTenantModel.findById(propertyTenantId);
        if (!tenant || tenant.isDeleted)
            throw new common_1.NotFoundException('Applicant not found');
        const portalState = this.getApplicantPortalState(tenant);
        const mergedDocuments = Array.isArray(dto.documents) && dto.documents.length > 0 ? dto.documents : portalState.documents;
        tenant.name = dto.fullName?.trim() || tenant.name;
        tenant.phone = dto.phone?.trim() || tenant.phone;
        tenant.email = dto.email?.trim().toLowerCase() || tenant.email;
        tenant.idNumber = dto.idNumber?.trim() || tenant.idNumber;
        tenant.kraPin = tenant.kraPin || '';
        tenant.documents = mergedDocuments.map((doc) => doc.dataUrl || doc.fileName || doc.name).filter(Boolean);
        const progress = this.calculateApplicationProgress({ ...portalState, ...dto, documents: mergedDocuments }, tenant);
        tenant.metadata = {
            ...(tenant.metadata || {}),
            applicantPortal: {
                ...portalState,
                ...dto,
                documents: mergedDocuments,
                lastSavedAt: new Date().toISOString(),
                submitted: portalState.submitted || false,
                progress,
            },
        };
        await tenant.save();
        return this.getApplicantPortalState(tenant);
    }
    async submitApplication(propertyTenantId) {
        const tenant = await this.propertyTenantModel.findById(propertyTenantId);
        if (!tenant || tenant.isDeleted)
            throw new common_1.NotFoundException('Applicant not found');
        const current = this.getApplicantPortalState(tenant);
        const isHighSchool = (current.levelType || 'university') === 'high_school';
        const idNumber = (current.idNumber || '').trim();
        const admissionNumber = (current.admissionNumber || '').trim();
        if (!isHighSchool && !idNumber) {
            throw new common_1.BadRequestException('National ID/Passport is required to submit your application.');
        }
        if (!admissionNumber) {
            throw new common_1.BadRequestException('Admission Number is required to submit your application.');
        }
        if (isHighSchool) {
            if (!String(current.parentEmail || '').trim()) {
                throw new common_1.BadRequestException('Parent Email is required to submit your application.');
            }
            if (!String(current.parentNationalId || '').trim()) {
                throw new common_1.BadRequestException('Parent National ID is required to submit your application.');
            }
        }
        const duplicate = await this.propertyTenantModel.findOne({
            tenantId: tenant.tenantId,
            _id: { $ne: tenant._id },
            isDeleted: false,
            $or: [
                { idNumber: idNumber },
                { 'metadata.applicantPortal.idNumber': idNumber },
                { 'metadata.applicantPortal.admissionNumber': admissionNumber }
            ],
            'metadata.applicantPortal.submitted': true,
        });
        if (duplicate) {
            throw new common_1.BadRequestException('An application with this National ID/Passport or Admission Number has already been submitted in the system. Re-application is not allowed.');
        }
        const submittedAt = new Date().toISOString();
        const progress = this.calculateApplicationProgress(current, tenant);
        tenant.metadata = {
            ...(tenant.metadata || {}),
            applicantPortal: {
                ...current,
                submitted: true,
                submittedAt,
                stage: 'submitted',
                progress,
            },
        };
        await tenant.save();
        return this.getApplicantPortalState(tenant);
    }
    async getChecklist(propertyTenantId) {
        const tenant = await this.propertyTenantModel.findById(propertyTenantId);
        if (!tenant || tenant.isDeleted)
            throw new common_1.NotFoundException('Applicant not found');
        const application = this.getApplicantPortalState(tenant);
        return this.buildChecklist(application);
    }
    async getTimeline(propertyTenantId) {
        const tenant = await this.propertyTenantModel.findById(propertyTenantId);
        if (!tenant || tenant.isDeleted)
            throw new common_1.NotFoundException('Applicant not found');
        const application = this.getApplicantPortalState(tenant);
        return this.buildTimeline(application);
    }
    async getOrgSettings(orgTenantId) {
        const org = await this.tenantOrgModel.findById(orgTenantId).lean();
        return {
            mpesaClientId: org?.mpesaClientId || '',
            orgName: org?.name || '',
            bursaryOpen: org?.settings?.bursaryOpen !== false,
            applicationDeadline: org?.settings?.applicationDeadline || '',
        };
    }
    async resendInvite(propertyTenantId, orgTenantId) {
        const tenant = await this.propertyTenantModel.findOne({
            _id: propertyTenantId,
            tenantId: orgTenantId,
            isDeleted: false,
        });
        if (!tenant)
            throw new common_1.NotFoundException('Tenant not found');
        const { token } = await this.generateAndSaveInviteToken(tenant);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
        const link = `${frontendUrl}/applicant-portal/setup-password?token=${token}`;
        await this.sendPortalInviteEmail(tenant.email, tenant.name, link);
        return { message: 'Invite resent successfully' };
    }
    async generateAndSaveInviteToken(tenant) {
        const crypto = await Promise.resolve().then(() => require('crypto'));
        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 7);
        tenant.portalInviteToken = token;
        tenant.portalInviteTokenExpiry = expiry;
        tenant.portalInviteTokenUsed = false;
        await tenant.save();
        return { token };
    }
    get mailer() {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: process.env.SMTP_SECURE === 'true',
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });
    }
    async sendPortalInviteEmail(to, name, inviteLink) {
        await this.mailer.sendMail({
            from: `"E-Bursary" <${process.env.SMTP_USER}>`,
            to,
            subject: 'You have been added — Access your Applicant Portal',
            html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;background:#f8fafc;border-radius:12px;">
          <div style="text-align:center;margin-bottom:24px;">
            <h1 style="color:#1e293b;margin-top:10px;font-size:22px;">E-Bursary Applicant Portal</h1>
          </div>
          <div style="background:white;border-radius:12px;padding:28px;border:1px solid #e2e8f0;">
            <h2 style="color:#1e293b;margin-top:0;">Welcome, ${name}!</h2>
            <p style="color:#475569;line-height:1.7;">Your bursary office has added you to the E-Bursary system. You can now access your Applicant Portal to complete your application.</p>
            <div style="text-align:center;margin:28px 0;">
              <a href="${inviteLink}" style="display:inline-block;padding:12px 32px;background:#059669;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">Set Up My Account</a>
            </div>
          </div>
          <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:20px;">&copy; ${new Date().getFullYear()} E-Bursary. All rights reserved.</p>
        </div>`,
        });
    }
    sanitize(tenant) {
        const obj = tenant.toObject ? tenant.toObject() : { ...tenant };
        delete obj.portalPassword;
        delete obj.portalInviteToken;
        delete obj.portalInviteTokenExpiry;
        delete obj.portalInviteTokenUsed;
        return obj;
    }
    getApplicantPortalState(tenant) {
        const metadata = tenant?.metadata || {};
        const portal = metadata.applicantPortal || {};
        const submitted = Boolean(portal.submitted);
        const requiredDocuments = [
            { key: 'national-id', label: 'National ID / Passport / Birth Certificate', required: true },
            { key: 'fee-statement', label: 'Fee Statement', required: true },
            { key: 'admission-letter', label: 'Admission Letter / Fee Structure', required: true },
        ];
        return {
            _id: tenant._id?.toString?.() || tenant._id,
            fullName: portal.fullName || tenant.name || '',
            phone: portal.phone || tenant.phone || '',
            email: portal.email || tenant.email || '',
            idNumber: portal.idNumber || tenant.idNumber || '',
            levelType: portal.levelType || '',
            formOrLevel: portal.formOrLevel || '',
            yearOfStudy: portal.yearOfStudy || '',
            institution: portal.institution || '',
            course: portal.course || '',
            admissionNumber: portal.admissionNumber || '',
            parentName: portal.parentName || '',
            parentPhone: portal.parentPhone || '',
            parentEmail: portal.parentEmail || '',
            parentNationalId: portal.parentNationalId || '',
            bankName: portal.bankName || '',
            accountNumber: portal.accountNumber || '',
            mpesaNumber: portal.mpesaNumber || '',
            householdIncome: portal.householdIncome || '',
            familyDependents: portal.familyDependents || '',
            specialCircumstances: portal.specialCircumstances || '',
            personalStatement: portal.personalStatement || '',
            guardianNotes: portal.guardianNotes || '',
            documents: portal.documents || tenant.documents || [],
            submitted,
            submittedAt: portal.submittedAt || '',
            stage: portal.stage || (submitted ? 'submitted' : 'draft'),
            lastSavedAt: portal.lastSavedAt || '',
            requiredDocuments,
            reviewNotes: portal.reviewNotes || '',
            awardAmount: Number(portal.awardAmount || 0),
            paymentDestination: portal.paymentDestination || '',
            progress: this.calculateApplicationProgress(portal, tenant),
            checklist: this.buildChecklist({ ...portal, submitted }),
            timeline: this.buildTimeline({ ...portal, submitted }),
        };
    }
    calculateApplicationProgress(portal, tenant) {
        const isHighSchool = (portal.levelType || 'university') === 'high_school';
        const fields = [
            portal.fullName || tenant.name,
            portal.phone || tenant.phone,
            portal.email || tenant.email,
            isHighSchool ? 'dummy-id' : (portal.idNumber || tenant.idNumber),
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
    buildChecklist(application) {
        const docs = Array.isArray(application.documents) ? application.documents : [];
        const hasDoc = (label) => docs.some((doc) => String(doc?.name || doc?.fileName || doc).toLowerCase().includes(label));
        const isHighSchool = (application.levelType || 'university') === 'high_school';
        return [
            { id: 'identity', label: 'Identity details', done: !!application.fullName && (isHighSchool ? true : !!application.idNumber) },
            { id: 'academic', label: 'Academic details', done: !!application.institution && (isHighSchool ? !!application.formOrLevel : (!!application.yearOfStudy && !!application.course)) },
            { id: 'household', label: 'Household and guardian details', done: (isHighSchool ? (!!application.parentName && !!application.parentPhone && !!application.parentEmail && !!application.parentNationalId) : true) },
            { id: 'statement', label: 'Personal statement', done: !!application.personalStatement },
            { id: 'id-doc', label: 'National ID / Passport uploaded', done: hasDoc('national-id') || hasDoc('id') || hasDoc('passport') || hasDoc('birth') },
            { id: 'fee-doc', label: 'Fee statement uploaded', done: hasDoc('fee-statement') || hasDoc('fee') || hasDoc('statement') },
            { id: 'admission-doc', label: 'Admission letter / Fee Structure uploaded', done: hasDoc('admission-letter') || hasDoc('admission') },
        ];
    }
    buildTimeline(application) {
        const base = [
            { label: 'Draft created', status: 'completed', date: application.lastSavedAt || new Date().toISOString(), note: 'Application started in the applicant portal.' },
            { label: 'Identity verified', status: application.fullName && (application.levelType === 'high_school' ? true : application.idNumber) ? 'completed' : 'pending', date: '', note: 'Your profile details should match your National ID and application records.' },
            { label: 'Documents uploaded', status: Array.isArray(application.documents) && application.documents.length >= 3 ? 'completed' : 'pending', date: '', note: 'Upload identity, fee statement, and admission documents.' },
            { label: 'Application submitted', status: application.submitted ? 'completed' : 'pending', date: application.submittedAt || '', note: 'Submit once all required details are complete.' },
            { label: 'County / institutional review', status: application.submitted ? 'in_review' : 'locked', date: '', note: 'Review is normally done by the bursary committee after submission.' },
            { label: 'Award / disbursement decision', status: application.stage === 'awarded' ? 'completed' : 'pending', date: '', note: 'Successful applicants receive award and funding updates in the portal.' },
        ];
        return base;
    }
};
exports.TenantPortalService = TenantPortalService;
exports.TenantPortalService = TenantPortalService = TenantPortalService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(property_tenant_schema_1.PropertyTenant.name)),
    __param(1, (0, mongoose_1.InjectModel)(tenant_schema_1.Tenant.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        jwt_1.JwtService])
], TenantPortalService);
//# sourceMappingURL=tenant-portal.service.js.map