"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BursaryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const bursary_service_1 = require("./bursary.service");
const update_application_stage_dto_1 = require("./dto/update-application-stage.dto");
let BursaryController = class BursaryController {
    constructor(bursaryService) {
        this.bursaryService = bursaryService;
    }
    getDashboard(req) {
        const tenantId = req.user?.tenantId || '';
        return this.bursaryService.getDashboardSummary(tenantId);
    }
    getApplications(req) {
        const tenantId = req.user?.tenantId || '';
        return this.bursaryService.listApplications(tenantId);
    }
    updateApplicationStage(id, dto, req) {
        if (req.user?.role !== 'super_admin') {
            throw new common_1.ForbiddenException('Only the bursary disbursement administrator can allocate funds.');
        }
        const tenantId = req.user?.tenantId || '';
        const reviewerId = req.user?.sub || '';
        return this.bursaryService.updateApplicationStage(tenantId, id, dto, reviewerId);
    }
    updateApplication(id, dto, req) {
        const tenantId = req.user?.tenantId || '';
        return this.bursaryService.updateApplication(tenantId, id, dto);
    }
};
exports.BursaryController = BursaryController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BursaryController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('applications'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BursaryController.prototype, "getApplications", null);
__decorate([
    (0, common_1.Put)('applications/:id/stage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_application_stage_dto_1.UpdateApplicationStageDto, Object]),
    __metadata("design:returntype", void 0)
], BursaryController.prototype, "updateApplicationStage", null);
__decorate([
    (0, common_1.Put)('applications/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], BursaryController.prototype, "updateApplication", null);
exports.BursaryController = BursaryController = __decorate([
    (0, swagger_1.ApiTags)('Bursary'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('bursary'),
    __metadata("design:paramtypes", [bursary_service_1.BursaryService])
], BursaryController);
//# sourceMappingURL=bursary.controller.js.map