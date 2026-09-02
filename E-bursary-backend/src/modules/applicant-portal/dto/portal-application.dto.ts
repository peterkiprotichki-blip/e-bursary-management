import { IsArray, IsOptional, IsString } from 'class-validator';

export class PortalDocumentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsString()
  dataUrl?: string;
}

export class SaveApplicantApplicationDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  idNumber?: string;

  @IsOptional()
  @IsString()
  institution?: string;

  @IsOptional()
  @IsString()
  course?: string;

  @IsOptional()
  @IsString()
  admissionNumber?: string;

  @IsOptional()
  @IsString()
  parentName?: string;

  @IsOptional()
  @IsString()
  parentPhone?: string;

  @IsOptional()
  @IsString()
  parentEmail?: string;

  @IsOptional()
  @IsString()
  parentNationalId?: string;

  @IsOptional()
  @IsString()
  disabilityStatus?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsString()
  householdIncome?: string;

  @IsOptional()
  @IsString()
  familyDependents?: string;

  @IsOptional()
  @IsString()
  specialCircumstances?: string;

  @IsOptional()
  @IsString()
  personalStatement?: string;

  @IsOptional()
  @IsString()
  guardianNotes?: string;

  @IsOptional()
  @IsString()
  levelType?: string;

  @IsOptional()
  @IsString()
  formOrLevel?: string;

  @IsOptional()
  @IsString()
  yearOfStudy?: string;

  @IsOptional()
  @IsArray()
  documents?: PortalDocumentDto[];
}
