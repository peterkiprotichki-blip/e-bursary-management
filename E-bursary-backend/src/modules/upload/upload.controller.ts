import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadInterface, UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: FileUploadInterface) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    try {
      const result = await this.uploadService.uploadFile(file);
      return { url: result.url };
    } catch (error) {
      throw new BadRequestException(error.message || 'Error uploading file');
    }
  }
}
