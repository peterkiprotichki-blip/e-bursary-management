import { Model } from 'mongoose';
import { PropertyTenant } from '../applicants/schemas/property-tenant.schema';
import { Payment } from '../disbursements/schemas/payment.schema';
import { UpdateApplicationStageDto } from './dto/update-application-stage.dto';
export declare class BursaryService {
    private readonly propertyTenantModel;
    private readonly paymentModel;
    private readonly logger;
    constructor(propertyTenantModel: Model<PropertyTenant>, paymentModel: Model<Payment>);
    private get mailer();
    getDashboardSummary(tenantId: string): Promise<{
        applicants: {
            total: number;
            submitted: number;
            inReview: number;
            awarded: number;
            rejected: number;
        };
        disbursements: {
            total: any;
            monthly: number;
            completedPayments: number;
        };
    }>;
    listApplications(tenantId: string): Promise<{
        _id: any;
        fullName: any;
        email: any;
        phone: any;
        institution: any;
        course: any;
        progress: number;
        stage: any;
        submittedAt: any;
        reviewNotes: any;
        awardAmount: number;
        paymentDestination: any;
        updatedAt: any;
    }[]>;
    updateApplicationStage(tenantId: string, applicantId: string, dto: UpdateApplicationStageDto, reviewerId: string): Promise<{
        _id: any;
        stage: any;
        reviewNotes: any;
        awardAmount: any;
        paymentDestination: any;
        reviewedAt: any;
    }>;
    updateApplication(tenantId: string, applicantId: string, dto: any): Promise<any>;
    private currentMonthTotal;
    private stageCopy;
    private sendStageNotificationEmail;
    private calcProgress;
}
