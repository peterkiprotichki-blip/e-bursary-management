import { IsIn, IsOptional, IsString, MaxLength, IsNumber } from 'class-validator';

export class UpdateApplicationStageDto {
  @IsIn(['submitted', 'in_review', 'awarded', 'rejected'])
  stage: 'submitted' | 'in_review' | 'awarded' | 'rejected';

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reviewNotes?: string;

  @IsOptional()
  @IsNumber()
  awardAmount?: number;

  @IsOptional()
  @IsString()
  paymentDestination?: string;
}
