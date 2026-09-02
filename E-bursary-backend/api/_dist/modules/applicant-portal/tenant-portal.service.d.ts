import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { PropertyTenant } from '../applicants/schemas/property-tenant.schema';
import { Tenant } from '../tenants/schemas/tenant.schema';
import { PortalLoginDto, PortalRegisterDto, PortalSetupPasswordDto, UpdatePortalProfileDto } from './dto/portal-auth.dto';
import { SaveApplicantApplicationDto } from './dto/portal-application.dto';
export declare class TenantPortalService {
    private propertyTenantModel;
    private tenantOrgModel;
    private readonly jwtService;
    private readonly logger;
    constructor(propertyTenantModel: Model<PropertyTenant>, tenantOrgModel: Model<Tenant>, jwtService: JwtService);
    register(dto: PortalRegisterDto): Promise<{
        token: string;
        profile: any;
        message: string;
    }>;
    private resolveOrganizationByLocation;
    setupPassword(dto: PortalSetupPasswordDto): Promise<{
        message: string;
    }>;
    login(dto: PortalLoginDto): Promise<{
        token: string;
        profile: any;
        bursaryOpen: boolean;
        applicationDeadline: any;
    }>;
    getProfile(propertyTenantId: string): Promise<any>;
    updateProfile(propertyTenantId: string, dto: UpdatePortalProfileDto): Promise<any>;
    getApplication(propertyTenantId: string): Promise<{
        _id: any;
        fullName: any;
        phone: any;
        email: any;
        idNumber: any;
        levelType: any;
        formOrLevel: any;
        yearOfStudy: any;
        institution: any;
        course: any;
        admissionNumber: any;
        parentName: any;
        parentPhone: any;
        parentEmail: any;
        parentNationalId: any;
        bankName: any;
        accountNumber: any;
        householdIncome: any;
        familyDependents: any;
        specialCircumstances: any;
        personalStatement: any;
        guardianNotes: any;
        documents: any;
        submitted: boolean;
        submittedAt: any;
        stage: any;
        lastSavedAt: any;
        requiredDocuments: {
            key: string;
            label: string;
            required: boolean;
        }[];
        reviewNotes: any;
        awardAmount: number;
        paymentDestination: any;
        progress: number;
        checklist: {
            id: string;
            label: string;
            done: any;
        }[];
        timeline: {
            label: string;
            status: string;
            date: any;
            note: string;
        }[];
    }>;
    saveApplication(propertyTenantId: string, dto: SaveApplicantApplicationDto): Promise<{
        _id: any;
        fullName: any;
        phone: any;
        email: any;
        idNumber: any;
        levelType: any;
        formOrLevel: any;
        yearOfStudy: any;
        institution: any;
        course: any;
        admissionNumber: any;
        parentName: any;
        parentPhone: any;
        parentEmail: any;
        parentNationalId: any;
        bankName: any;
        accountNumber: any;
        householdIncome: any;
        familyDependents: any;
        specialCircumstances: any;
        personalStatement: any;
        guardianNotes: any;
        documents: any;
        submitted: boolean;
        submittedAt: any;
        stage: any;
        lastSavedAt: any;
        requiredDocuments: {
            key: string;
            label: string;
            required: boolean;
        }[];
        reviewNotes: any;
        awardAmount: number;
        paymentDestination: any;
        progress: number;
        checklist: {
            id: string;
            label: string;
            done: any;
        }[];
        timeline: {
            label: string;
            status: string;
            date: any;
            note: string;
        }[];
    }>;
    submitApplication(propertyTenantId: string): Promise<{
        _id: any;
        fullName: any;
        phone: any;
        email: any;
        idNumber: any;
        levelType: any;
        formOrLevel: any;
        yearOfStudy: any;
        institution: any;
        course: any;
        admissionNumber: any;
        parentName: any;
        parentPhone: any;
        parentEmail: any;
        parentNationalId: any;
        bankName: any;
        accountNumber: any;
        householdIncome: any;
        familyDependents: any;
        specialCircumstances: any;
        personalStatement: any;
        guardianNotes: any;
        documents: any;
        submitted: boolean;
        submittedAt: any;
        stage: any;
        lastSavedAt: any;
        requiredDocuments: {
            key: string;
            label: string;
            required: boolean;
        }[];
        reviewNotes: any;
        awardAmount: number;
        paymentDestination: any;
        progress: number;
        checklist: {
            id: string;
            label: string;
            done: any;
        }[];
        timeline: {
            label: string;
            status: string;
            date: any;
            note: string;
        }[];
    }>;
    getChecklist(propertyTenantId: string): Promise<{
        id: string;
        label: string;
        done: any;
    }[]>;
    getTimeline(propertyTenantId: string): Promise<{
        label: string;
        status: string;
        date: any;
        note: string;
    }[]>;
    getOrgSettings(orgTenantId?: string): Promise<{
        mpesaClientId: any;
        orgName: any;
        bursaryOpen: boolean;
        applicationDeadline: any;
    }>;
    resendInvite(propertyTenantId: string, orgTenantId: string): Promise<{
        message: string;
        setupLink: string;
    } | {
        message: string;
        setupLink?: undefined;
    }>;
    generateAndSaveInviteToken(tenant: any): Promise<{
        token: string;
    }>;
    private get mailer();
    sendPortalInviteEmail(to: string, name: string, inviteLink: string): Promise<void>;
    private sanitize;
    private getApplicantPortalState;
    private calculateApplicationProgress;
    private buildChecklist;
    private buildTimeline;
}
