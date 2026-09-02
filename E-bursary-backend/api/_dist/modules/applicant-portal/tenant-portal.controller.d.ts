import { TenantPortalService } from './tenant-portal.service';
import { FileUploadService, FileUploadInterface } from './services/file-upload.service';
import { PortalLoginDto, PortalRegisterDto, PortalSetupPasswordDto, UpdatePortalProfileDto } from './dto/portal-auth.dto';
import { SaveApplicantApplicationDto } from './dto/portal-application.dto';
export declare class TenantPortalController {
    private readonly service;
    private readonly fileUploadService;
    constructor(service: TenantPortalService, fileUploadService: FileUploadService);
    setupPassword(dto: PortalSetupPasswordDto): Promise<{
        message: string;
    }>;
    login(dto: PortalLoginDto): Promise<{
        token: string;
        profile: any;
        bursaryOpen: boolean;
        applicationDeadline: any;
    }>;
    register(dto: PortalRegisterDto): Promise<{
        token: string;
        profile: any;
        message: string;
    }>;
    getProfile(req: any): Promise<any>;
    getApplication(req: any): Promise<{
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
    saveApplication(req: any, dto: SaveApplicantApplicationDto): Promise<{
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
    submitApplication(req: any): Promise<{
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
    getChecklist(req: any): Promise<{
        id: string;
        label: string;
        done: any;
    }[]>;
    getTimeline(req: any): Promise<{
        label: string;
        status: string;
        date: any;
        note: string;
    }[]>;
    updateProfile(req: any, dto: UpdatePortalProfileDto): Promise<any>;
    getOrgSettings(): Promise<{
        mpesaClientId: any;
        orgName: any;
        bursaryOpen: boolean;
        applicationDeadline: any;
    }>;
    resendInvite(propertyTenantId: string, req: any): Promise<{
        message: string;
        setupLink: string;
    } | {
        message: string;
        setupLink?: undefined;
    }>;
    uploadFile(file: FileUploadInterface): {
        success: boolean;
        data: {
            url: string;
            filename: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: {
            message: any;
        };
        data?: undefined;
    };
}
