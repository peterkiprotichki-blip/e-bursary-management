import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
export declare class UploadService {
    constructor();
    uploadFile(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse>;
}
