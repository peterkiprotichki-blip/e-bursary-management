export declare class PortalDocumentDto {
    name?: string;
    fileName?: string;
    mimeType?: string;
    dataUrl?: string;
}
export declare class SaveApplicantApplicationDto {
    fullName?: string;
    phone?: string;
    email?: string;
    idNumber?: string;
    institution?: string;
    course?: string;
    admissionNumber?: string;
    parentName?: string;
    parentPhone?: string;
    parentEmail?: string;
    parentNationalId?: string;
    disabilityStatus?: string;
    bankName?: string;
    accountNumber?: string;
    householdIncome?: string;
    familyDependents?: string;
    specialCircumstances?: string;
    personalStatement?: string;
    guardianNotes?: string;
    levelType?: string;
    formOrLevel?: string;
    yearOfStudy?: string;
    documents?: PortalDocumentDto[];
}
