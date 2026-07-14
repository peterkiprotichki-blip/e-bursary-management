export declare class UpdateApplicationStageDto {
    stage: 'submitted' | 'in_review' | 'awarded' | 'rejected';
    reviewNotes?: string;
    awardAmount?: number;
    paymentDestination?: string;
}
