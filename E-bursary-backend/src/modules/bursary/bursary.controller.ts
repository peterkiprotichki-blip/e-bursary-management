import { Body, Controller, ForbiddenException, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BursaryService } from './bursary.service';
import { UpdateApplicationStageDto } from './dto/update-application-stage.dto';

@ApiTags('Bursary')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bursary')
export class BursaryController {
  constructor(private readonly bursaryService: BursaryService) {}

  @Get('dashboard')
  getDashboard(@Req() req: any) {
    const tenantId = req.user?.tenantId || '';
    return this.bursaryService.getDashboardSummary(tenantId);
  }

  @Get('applications')
  getApplications(@Req() req: any) {
    const tenantId = req.user?.tenantId || '';
    return this.bursaryService.listApplications(tenantId);
  }

  @Put('applications/:id/stage')
  updateApplicationStage(@Param('id') id: string, @Body() dto: UpdateApplicationStageDto, @Req() req: any) {
    if (req.user?.role !== 'super_admin') {
      throw new ForbiddenException('Only the bursary disbursement administrator can allocate funds.');
    }
    const tenantId = req.user?.tenantId || '';
    const reviewerId = req.user?.sub || '';
    return this.bursaryService.updateApplicationStage(tenantId, id, dto, reviewerId);
  }

  @Put('applications/:id')
  updateApplication(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    const tenantId = req.user?.tenantId || '';
    return this.bursaryService.updateApplication(tenantId, id, dto);
  }
}
