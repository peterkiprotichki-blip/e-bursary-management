export interface FileUploadInterface {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
}
export declare class UploadService {
    private readonly uploadDir;
    constructor();
    uploadFile(file: FileUploadInterface): {
        url: string;
        filename: string;
    };
}
