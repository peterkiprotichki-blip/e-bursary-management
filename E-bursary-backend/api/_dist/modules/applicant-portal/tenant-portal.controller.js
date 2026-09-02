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
exports.TenantPortalController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const tenant_portal_service_1 = require("./tenant-portal.service");
const file_upload_service_1 = require("./services/file-upload.service");
const tenant_portal_jwt_guard_1 = require("./guards/tenant-portal-jwt.guard");
const portal_auth_dto_1 = require("./dto/portal-auth.dto");
const portal_application_dto_1 = require("./dto/portal-application.dto");
const swagger_1 = require("@nestjs/swagger");
let TenantPortalController = class TenantPortalController {
    constructor(service, fileUploadService) {
        this.service = service;
        this.fileUploadService = fileUploadService;
    }
    setupPassword(dto) {
        return this.service.setupPassword(dto);
    }
    login(dto) {
        return this.service.login(dto);
    }
    register(dto) {
        return this.service.register(dto);
    }
    getProfile(req) {
        return this.service.getProfile(req.user.sub);
    }
    getApplication(req) {
        return this.service.getApplication(req.user.sub);
    }
    saveApplication(req, dto) {
        return this.service.saveApplication(req.user.sub, dto);
    }
    submitApplication(req) {
        return this.service.submitApplication(req.user.sub);
    }
    getChecklist(req) {
        return this.service.getChecklist(req.user.sub);
    }
    getTimeline(req) {
        return this.service.getTimeline(req.user.sub);
    }
    updateProfile(req, dto) {
        return this.service.updateProfile(req.user.sub, dto);
    }
    getOrgSettings() {
        return this.service.getOrgSettings();
    }
    resendInvite(propertyTenantId, req) {
        return this.service.resendInvite(propertyTenantId, req.user.orgTenantId);
    }
    uploadFile(file) {
        try {
            const result = this.fileUploadService.uploadFile(file);
            return {
                success: true,
                data: {
                    url: result.url,
                    filename: result.filename,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: {
                    message: error.message || 'File upload failed',
                },
            };
        }
    }
};
exports.TenantPortalController = TenantPortalController;
__decorate([
    (0, common_1.Post)('auth/setup-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Set applicant portal password using invite token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [portal_auth_dto_1.PortalSetupPasswordDto]),
    __metadata("design:returntype", void 0)
], TenantPortalController.prototype, "setupPassword", null);
__decorate([
    (0, common_1.Post)('auth/login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Applicant portal login' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [portal_auth_dto_1.PortalLoginDto]),
    __metadata("design:returntype", void 0)
], TenantPortalController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('auth/register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Public applicant portal registration' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [portal_auth_dto_1.PortalRegisterDto]),
    __metadata("design:returntype", void 0)
], TenantPortalController.prototype, "register", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(tenant_portal_jwt_guard_1.TenantPortalJwtGuard),
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Get applicant profile' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TenantPortalController.prototype, "getProfile", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(tenant_portal_jwt_guard_1.TenantPortalJwtGuard),
    (0, common_1.Get)('application'),
    (0, swagger_1.ApiOperation)({ summary: 'Get applicant application draft' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TenantPortalController.prototype, "getApplication", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(tenant_portal_jwt_guard_1.TenantPortalJwtGuard),
    (0, common_1.Put)('application'),
    (0, swagger_1.ApiOperation)({ summary: 'Save applicant application draft' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, portal_application_dto_1.SaveApplicantApplicationDto]),
    __metadata("design:returntype", void 0)
], TenantPortalController.prototype, "saveApplication", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(tenant_portal_jwt_guard_1.TenantPortalJwtGuard),
    (0, common_1.Post)('application/submit'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit applicant application' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TenantPortalController.prototype, "submitApplication", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(tenant_portal_jwt_guard_1.TenantPortalJwtGuard),
    (0, common_1.Get)('application/checklist'),
    (0, swagger_1.ApiOperation)({ summary: 'Get applicant checklist' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TenantPortalController.prototype, "getChecklist", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(tenant_portal_jwt_guard_1.TenantPortalJwtGuard),
    (0, common_1.Get)('application/timeline'),
    (0, swagger_1.ApiOperation)({ summary: 'Get applicant timeline' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TenantPortalController.prototype, "getTimeline", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(tenant_portal_jwt_guard_1.TenantPortalJwtGuard),
    (0, common_1.Put)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Update applicant phone number' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, portal_auth_dto_1.UpdatePortalProfileDto]),
    __metadata("design:returntype", void 0)
], TenantPortalController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('org-settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get organisation settings (public for pre-login portal access checks)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TenantPortalController.prototype, "getOrgSettings", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(tenant_portal_jwt_guard_1.TenantPortalJwtGuard),
    (0, common_1.Post)('resend-invite/:propertyTenantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Resend portal invite email (for administrators)' }),
    __param(0, (0, common_1.Param)('propertyTenantId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TenantPortalController.prototype, "resendInvite", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(tenant_portal_jwt_guard_1.TenantPortalJwtGuard),
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({ summary: 'Upload applicant document/image' }),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TenantPortalController.prototype, "uploadFile", null);
exports.TenantPortalController = TenantPortalController = __decorate([
    (0, swagger_1.ApiTags)('Applicant Portal'),
    (0, common_1.Controller)('applicant-portal'),
    __metadata("design:paramtypes", [tenant_portal_service_1.TenantPortalService,
        file_upload_service_1.FileUploadService])
], TenantPortalController);
//# sourceMappingURL=tenant-portal.controller.js.map