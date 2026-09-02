import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TenantPortalService } from './tenant-portal.service';
import { FileUploadService, FileUploadInterface } from './services/file-upload.service';
import { TenantPortalJwtGuard } from './guards/tenant-portal-jwt.guard';
import { PortalLoginDto, PortalRegisterDto, PortalSetupPasswordDto, UpdatePortalProfileDto } from './dto/portal-auth.dto';
import { SaveApplicantApplicationDto } from './dto/portal-application.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Applicant Portal')
@Controller('applicant-portal')
export class TenantPortalController {
  constructor(
    private readonly service: TenantPortalService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  // ──── Public Auth ────────────────────────────────────

  @Post('auth/setup-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set applicant portal password using invite token' })
  setupPassword(@Body() dto: PortalSetupPasswordDto) {
    return this.service.setupPassword(dto);
  }

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Applicant portal login' })
  login(@Body() dto: PortalLoginDto) {
    return this.service.login(dto);
  }

  @Post('auth/register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Public applicant portal registration' })
  register(@Body() dto: PortalRegisterDto) {
    return this.service.register(dto);
  }

  // ──── Protected Profile ──────────────────────────────

  @ApiBearerAuth()
  @UseGuards(TenantPortalJwtGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get applicant profile' })
  getProfile(@Request() req: any) {
    return this.service.getProfile(req.user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(TenantPortalJwtGuard)
  @Get('application')
  @ApiOperation({ summary: 'Get applicant application draft' })
  getApplication(@Request() req: any) {
    return this.service.getApplication(req.user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(TenantPortalJwtGuard)
  @Put('application')
  @ApiOperation({ summary: 'Save applicant application draft' })
  saveApplication(@Request() req: any, @Body() dto: SaveApplicantApplicationDto) {
    return this.service.saveApplication(req.user.sub, dto);
  }

  @ApiBearerAuth()
  @UseGuards(TenantPortalJwtGuard)
  @Post('application/submit')
  @ApiOperation({ summary: 'Submit applicant application' })
  submitApplication(@Request() req: any) {
    return this.service.submitApplication(req.user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(TenantPortalJwtGuard)
  @Get('application/checklist')
  @ApiOperation({ summary: 'Get applicant checklist' })
  getChecklist(@Request() req: any) {
    return this.service.getChecklist(req.user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(TenantPortalJwtGuard)
  @Get('application/timeline')
  @ApiOperation({ summary: 'Get applicant timeline' })
  getTimeline(@Request() req: any) {
    return this.service.getTimeline(req.user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(TenantPortalJwtGuard)
  @Put('profile')
  @ApiOperation({ summary: 'Update applicant phone number' })
  updateProfile(@Request() req: any, @Body() dto: UpdatePortalProfileDto) {
    return this.service.updateProfile(req.user.sub, dto);
  }

  // ──── Org Settings ───────────────────────────────────

  @Get('org-settings')
  @ApiOperation({ summary: 'Get organisation settings (public for pre-login portal access checks)' })
  getOrgSettings() {
    return this.service.getOrgSettings();
  }

  // ──── Resend Invite (admin-side utility) ─────────────

  @ApiBearerAuth()
  @UseGuards(TenantPortalJwtGuard)
  @Post('resend-invite/:propertyTenantId')
  @ApiOperation({ summary: 'Resend portal invite email (for administrators)' })
  resendInvite(@Param('propertyTenantId') propertyTenantId: string, @Request() req: any) {
    return this.service.resendInvite(propertyTenantId, req.user.orgTenantId);
  }

  // ──── File Upload ────────────────────────────────────

  @ApiBearerAuth()
  @UseGuards(TenantPortalJwtGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload applicant document/image' })
  uploadFile(@UploadedFile() file: FileUploadInterface) {
    try {
      const result = this.fileUploadService.uploadFile(file);
      return {
        success: true,
        data: {
          url: result.url,
          filename: result.filename,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.message || 'File upload failed',
        },
      };
    }
  }
}

