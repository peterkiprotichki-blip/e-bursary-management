import { FileUploadInterface, UploadService } from './upload.service';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadFile(file: FileUploadInterface): Promise<{
        url: string;
    }>;
}
