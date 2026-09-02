import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';
import { PropertyTenant } from '../applicants/schemas/property-tenant.schema';
import { Tenant } from '../tenants/schemas/tenant.schema';
import { PortalLoginDto, PortalRegisterDto, PortalSetupPasswordDto, UpdatePortalProfileDto } from './dto/portal-auth.dto';
import { SaveApplicantApplicationDto } from './dto/portal-application.dto';

@Injectable()
export class TenantPortalService {
  private readonly logger = new Logger(TenantPortalService.name);

  constructor(
    @InjectModel(PropertyTenant.name) private propertyTenantModel: Model<PropertyTenant>,
    @InjectModel(Tenant.name) private tenantOrgModel: Model<Tenant>,
    private readonly jwtService: JwtService,
  ) {}

  // ──── Auth ──────────────────────────────────────────

  async register(dto: PortalRegisterDto) {
    const org = await this.resolveOrganizationByLocation(dto.location);
    if (!org) {
      throw new BadRequestException('No bursary office matched that location. Please check the location and try again.');
    }

    const bursaryOpen = (org as any)?.settings?.bursaryOpen !== false;
    if (!bursaryOpen) {
      throw new BadRequestException('Bursary applications are currently closed. Please check back later when applications reopen.');
    }

    const email = dto.email.trim().toLowerCase();
    const existing = await this.propertyTenantModel.findOne({ tenantId: (org as any)._id.toString(), email, isDeleted: false });
    if (existing) {
      throw new BadRequestException('An applicant account already exists with this email for that organization.');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const tenant = await this.propertyTenantModel.create({
      tenantId: (org as any)._id.toString(),
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

    const token = this.jwtService.sign(
      {
        sub: (tenant as any)._id.toString(),
        email: tenant.email,
        name: tenant.name,
        orgTenantId: tenant.tenantId,
        type: 'tenant-portal',
      },
      {
        secret: process.env.TENANT_PORTAL_JWT_SECRET || process.env.JWT_SECRET || 'e-bursary-portal-secret',
        expiresIn: '7d',
      },
    );

    return { token, profile: this.sanitize(tenant), message: 'Account created successfully.' };
  }

  private async resolveOrganizationByLocation(location: string) {
    const normalized = (location || '').trim().toLowerCase();

    const orgs = await this.tenantOrgModel.find({ isActive: true }).lean();
    if (!normalized) {
      return orgs.find((org: any) => org?.slug === 'county-bursary-fund') || orgs[0] || null;
    }
    if (orgs.length === 1) {
      return orgs[0];
    }

    const exactMatch = orgs.find((org: any) => {
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

  async setupPassword(dto: PortalSetupPasswordDto) {
    const tenant = await this.propertyTenantModel.findOne({
      portalInviteToken: dto.token,
      portalInviteTokenUsed: false,
      isDeleted: false,
    });
    if (!tenant) throw new BadRequestException('Invalid or expired invite link');

    if (tenant.portalInviteTokenExpiry && new Date() > tenant.portalInviteTokenExpiry) {
      throw new BadRequestException('Invite link has expired. Ask your bursary office to resend the invite.');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    tenant.portalPassword = hashed;
    tenant.portalPasswordSet = true;
    tenant.portalInviteTokenUsed = true;
    await tenant.save();

    return { message: 'Password set successfully. You can now log in.' };
  }

  async login(dto: PortalLoginDto) {
    const tenant = await this.propertyTenantModel.findOne({
      email: dto.email.toLowerCase(),
      isDeleted: false,
      isActive: true,
    });
    
    if (!tenant) {
      throw new UnauthorizedException('No applicant account found with this email. Please contact your bursary office.');
    }

    if (!tenant.portalPasswordSet) {
      throw new UnauthorizedException('Your account has not been activated yet. Please check your email for the setup link sent by your bursary office.');
    }

    const isValid = await bcrypt.compare(dto.password, tenant.portalPassword);
    if (!isValid) throw new UnauthorizedException('Incorrect password. Please try again.');

    const token = this.jwtService.sign(
      {
        sub: (tenant as any)._id.toString(),
        email: tenant.email,
        name: tenant.name,
        orgTenantId: tenant.tenantId,
        type: 'tenant-portal',
      },
      {
        secret: process.env.TENANT_PORTAL_JWT_SECRET || process.env.JWT_SECRET || 'e-bursary-portal-secret',
        expiresIn: '7d',
      },
    );

    const profile = this.sanitize(tenant);
    const org = await this.tenantOrgModel.findById(tenant.tenantId).lean();
    const bursaryOpen = (org as any)?.settings?.bursaryOpen !== false;
    const applicationDeadline = (org as any)?.settings?.applicationDeadline || '';
    return { token, profile, bursaryOpen, applicationDeadline };
  }

  // ──── Profile ────────────────────────────────────────

  async getProfile(propertyTenantId: string) {
    const tenant = await this.propertyTenantModel.findById(propertyTenantId);
    if (!tenant || tenant.isDeleted) throw new NotFoundException('Tenant not found');
    return this.sanitize(tenant);
  }

  async updateProfile(propertyTenantId: string, dto: UpdatePortalProfileDto) {
    const tenant = await this.propertyTenantModel.findById(propertyTenantId);
    if (!tenant || tenant.isDeleted) throw new NotFoundException('Tenant not found');
    tenant.phone = dto.phone;
    await tenant.save();
    return this.sanitize(tenant);
  }

  // ──── Application ────────────────────────────────────

  async getApplication(propertyTenantId: string) {
    const tenant = await this.propertyTenantModel.findById(propertyTenantId);
    if (!tenant || tenant.isDeleted) throw new NotFoundException('Applicant not found');
    return this.getApplicantPortalState(tenant);
  }

  async saveApplication(propertyTenantId: string, dto: SaveApplicantApplicationDto) {
    const tenant = await this.propertyTenantModel.findById(propertyTenantId);
    if (!tenant || tenant.isDeleted) throw new NotFoundException('Applicant not found');

    const portalState = this.getApplicantPortalState(tenant);
    const mergedDocuments = Array.isArray(dto.documents) && dto.documents.length > 0 ? dto.documents : portalState.documents;

    tenant.name = dto.fullName?.trim() || tenant.name;
    tenant.phone = dto.phone?.trim() || tenant.phone;
    tenant.email = dto.email?.trim().toLowerCase() || tenant.email;
    tenant.idNumber = dto.idNumber?.trim() || tenant.idNumber;
    tenant.kraPin = tenant.kraPin || '';
    tenant.documents = mergedDocuments.map((doc: any) => doc.dataUrl || doc.fileName || doc.name).filter(Boolean);
    const isUniversity = (dto.levelType || portalState.levelType || 'university') === 'university';
    const normalizedDto = isUniversity
      ? dto
      : { ...dto, course: '', yearOfStudy: '' };
    const progress = this.calculateApplicationProgress(
      { ...portalState, ...normalizedDto, documents: mergedDocuments },
      tenant,
    );
    tenant.metadata = {
      ...(tenant.metadata || {}),
      applicantPortal: {
        ...portalState,
        ...normalizedDto,
        documents: mergedDocuments,
        lastSavedAt: new Date().toISOString(),
        submitted: portalState.submitted || false,
        progress,
      },
    };
    await tenant.save();
    return this.getApplicantPortalState(tenant);
  }

  async submitApplication(propertyTenantId: string) {
    const tenant = await this.propertyTenantModel.findById(propertyTenantId);
    if (!tenant || tenant.isDeleted) throw new NotFoundException('Applicant not found');

    const current = this.getApplicantPortalState(tenant);
    const isSchoolLevel = current.levelType === 'high_school' || current.levelType === 'primary_school';
    const isUniversity = (current.levelType || 'university') === 'university';
    const idNumber = (current.idNumber || '').trim();
    const admissionNumber = (current.admissionNumber || '').trim();
    const course = String(current.course || '').trim();

    if (!isSchoolLevel && !idNumber) {
      throw new BadRequestException('National ID/Passport is required to submit your application.');
    }
    if (!admissionNumber) {
      throw new BadRequestException('Admission Number is required to submit your application.');
    }
    if (isUniversity && !course) {
      throw new BadRequestException('Course of Study is required to submit a university application.');
    }
    if (isSchoolLevel) {
      if (!String(current.parentEmail || '').trim()) {
        throw new BadRequestException('Parent Email is required to submit your application.');
      }
      if (!String(current.parentNationalId || '').trim()) {
        throw new BadRequestException('Parent National ID is required to submit your application.');
      }
    }

    const requiredDocumentKeys = isSchoolLevel
      ? ['passport-photo', 'fee-structure']
      : ['national-id', 'fee-structure', 'course-details', 'passport-photo'];
    const uploadedDocumentKeys = new Set(
      (current.documents || []).map((doc: any) => String(doc?.name || '').toLowerCase()),
    );
    if (requiredDocumentKeys.some((key) => !uploadedDocumentKeys.has(key))) {
      throw new BadRequestException('Please upload all required documents before submitting your application.');
    }

    // Verify duplicate checks: once National ID or School Admission Number is submitted, re-application is blocked
    const duplicateKeys: Record<string, string>[] = [
      { 'metadata.applicantPortal.admissionNumber': admissionNumber },
    ];
    if (idNumber) {
      duplicateKeys.unshift(
        { idNumber },
        { 'metadata.applicantPortal.idNumber': idNumber },
      );
    }

    const duplicate = await this.propertyTenantModel.findOne({
      tenantId: tenant.tenantId,
      _id: { $ne: tenant._id },
      isDeleted: false,
      $or: duplicateKeys,
      'metadata.applicantPortal.submitted': true,
    });

    if (duplicate) {
      throw new BadRequestException(
        'An application with this National ID/Passport or Admission Number has already been submitted in the system. Re-application is not allowed.'
      );
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

  async getChecklist(propertyTenantId: string) {
    const tenant = await this.propertyTenantModel.findById(propertyTenantId);
    if (!tenant || tenant.isDeleted) throw new NotFoundException('Applicant not found');
    const application = this.getApplicantPortalState(tenant);
    return this.buildChecklist(application);
  }

  async getTimeline(propertyTenantId: string) {
    const tenant = await this.propertyTenantModel.findById(propertyTenantId);
    if (!tenant || tenant.isDeleted) throw new NotFoundException('Applicant not found');
    const application = this.getApplicantPortalState(tenant);
    return this.buildTimeline(application);
  }

  // ──── Org Settings ───────────────────────────────────

  async getOrgSettings(orgTenantId?: string) {
    const org = orgTenantId
      ? await this.tenantOrgModel.findById(orgTenantId).lean()
      : await this.tenantOrgModel.findOne({ isActive: true }).lean();

    return {
      mpesaClientId: (org as any)?.mpesaClientId || '',
      orgName: (org as any)?.name || '',
      bursaryOpen: (org as any)?.settings?.bursaryOpen !== false,
      applicationDeadline: (org as any)?.settings?.applicationDeadline || '',
    };
  }

  // ──── Resend Invite ──────────────────────────────────

  async resendInvite(propertyTenantId: string, orgTenantId: string) {
    const tenant = await this.propertyTenantModel.findOne({
      _id: propertyTenantId,
      tenantId: orgTenantId,
      isDeleted: false,
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const { token } = await this.generateAndSaveInviteToken(tenant);
    if (process.env.OFFLINE_MODE === 'true') {
      return {
        message: 'Invite created locally. Email delivery is disabled while E-Bursary is running offline.',
        setupLink: `${process.env.FRONTEND_URL || 'http://localhost:4400'}/applicant-portal/setup-password?token=${token}`,
      };
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const link = `${frontendUrl}/applicant-portal/setup-password?token=${token}`;
    await this.sendPortalInviteEmail(tenant.email, tenant.name, link);
    return { message: 'Invite resent successfully' };
  }

  async generateAndSaveInviteToken(tenant: any): Promise<{ token: string }> {
    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    tenant.portalInviteToken = token;
    tenant.portalInviteTokenExpiry = expiry;
    tenant.portalInviteTokenUsed = false;
    await tenant.save();
    return { token };
  }

  // ──── Email Helpers ──────────────────────────────────

  private get mailer() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }

  async sendPortalInviteEmail(to: string, name: string, inviteLink: string) {
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

  // ──── Sanitisation & State Helpers ───────────────────

  private sanitize(tenant: any) {
    const obj = tenant.toObject ? tenant.toObject() : { ...tenant };
    delete obj.portalPassword;
    delete obj.portalInviteToken;
    delete obj.portalInviteTokenExpiry;
    delete obj.portalInviteTokenUsed;
    return obj;
  }

  private getApplicantPortalState(tenant: any) {
    const metadata = tenant?.metadata || {};
    const portal = metadata.applicantPortal || {};
    const submitted = Boolean(portal.submitted);
    
    const isHighSchool = portal.levelType === 'high_school' || portal.levelType === 'primary_school';
    const requiredDocuments = isHighSchool
      ? [
          { key: 'passport-photo', label: 'Passport photo', required: true },
          { key: 'fee-structure', label: 'School fee structure', required: true },
        ]
      : [
          { key: 'national-id', label: 'National ID / Passport', required: true },
          { key: 'fee-structure', label: 'Fee structure', required: true },
          { key: 'course-details', label: 'Course registration / details', required: true },
          { key: 'passport-photo', label: 'Passport photo', required: true },
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

  private calculateApplicationProgress(portal: any, tenant: any) {
    const isHighSchool = (portal.levelType || 'university') === 'high_school' || portal.levelType === 'primary_school';
    const fields = [
      portal.fullName || tenant.name,
      portal.phone || tenant.phone,
      portal.email || tenant.email,
      isHighSchool ? 'dummy-id' : (portal.idNumber || tenant.idNumber),
      isHighSchool ? portal.formOrLevel : portal.yearOfStudy,
      portal.institution,
      isHighSchool ? 'dummy-course' : portal.course,
      isHighSchool ? portal.parentName : 'dummy-parent-name',
      isHighSchool ? '' : 'dummy-parent-phone',
      isHighSchool ? portal.parentEmail : 'dummy-parent-email',
      isHighSchool ? portal.parentNationalId : 'dummy-parent-id',
      portal.bankName,
      portal.accountNumber,
    ];

    const filled = fields.filter(Boolean).length;
    const docs = Array.isArray(portal.documents) ? portal.documents.length : 0;
    const requiredDocCount = isHighSchool ? 2 : 4;
    const total = fields.length + requiredDocCount;
    return Math.min(100, Math.round(((filled + Math.min(docs, requiredDocCount)) / total) * 100));
  }

  private buildChecklist(application: any) {
    const docs = Array.isArray(application.documents) ? application.documents : [];
    const hasDoc = (label: string) =>
      docs.some((doc: any) => String(doc?.name || doc?.fileName || doc).toLowerCase().includes(label));
    const isHighSchool = (application.levelType || 'university') === 'high_school' || application.levelType === 'primary_school';

    return [
      { id: 'identity', label: 'Identity details', done: !!application.fullName && (isHighSchool ? true : !!application.idNumber) },
      { id: 'academic', label: 'Academic details', done: !!application.institution && (isHighSchool ? !!application.formOrLevel : (!!application.yearOfStudy && !!application.course)) },
      { id: 'guardian', label: 'Guardian details', done: (isHighSchool ? (!!application.parentName && !!application.parentEmail && !!application.parentNationalId) : true) },
      { id: 'bank', label: 'School bank details', done: !!application.bankName && !!application.accountNumber },
      { id: 'id-doc', label: 'National ID / Passport uploaded', done: hasDoc('national-id') || hasDoc('id') || hasDoc('passport') || hasDoc('birth') },
      { id: 'fee-doc', label: 'Fee structure uploaded', done: hasDoc('fee-structure') },
      ...(isHighSchool ? [] : [{ id: 'course-doc', label: 'Course details uploaded', done: hasDoc('course-details') }]),
      { id: 'photo-doc', label: 'Passport photo uploaded', done: hasDoc('passport-photo') },
    ];
  }

  private buildTimeline(application: any) {
    const base = [
      { label: 'Draft created', status: 'completed', date: application.lastSavedAt || new Date().toISOString(), note: 'Application started in the applicant portal.' },
      { label: 'Identity verified', status: application.fullName && (application.levelType === 'high_school' || application.levelType === 'primary_school' ? true : application.idNumber) ? 'completed' : 'pending', date: '', note: 'Your profile details should match your National ID and application records.' },
      { label: 'Documents uploaded', status: Array.isArray(application.documents) && application.documents.length >= (application.levelType === 'high_school' || application.levelType === 'primary_school' ? 2 : 4) ? 'completed' : 'pending', date: '', note: 'Upload the documents required for your education level.' },
      { label: 'Application submitted', status: application.submitted ? 'completed' : 'pending', date: application.submittedAt || '', note: 'Submit once all required details are complete.' },
      { label: 'County / institutional review', status: application.submitted ? 'in_review' : 'locked', date: '', note: 'Review is normally done by the bursary committee after submission.' },
      { label: 'Award / disbursement decision', status: application.stage === 'awarded' ? 'completed' : 'pending', date: '', note: 'Successful applicants receive award and funding updates in the portal.' },
    ];

    return base;
  }
}
