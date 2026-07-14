import { BursaryService } from './bursary.service';
import { UpdateApplicationStageDto } from './dto/update-application-stage.dto';
export declare class BursaryController {
    private readonly bursaryService;
    constructor(bursaryService: BursaryService);
    getDashboard(req: any): Promise<{
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
    getApplications(req: any): Promise<{
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
    updateApplicationStage(id: string, dto: UpdateApplicationStageDto, req: any): Promise<{
        _id: any;
        stage: any;
        reviewNotes: any;
        awardAmount: any;
        paymentDestination: any;
        reviewedAt: any;
    }>;
    updateApplication(id: string, dto: any, req: any): Promise<any>;
}
