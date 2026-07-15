export interface FileUploadInterface {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
    filename?: string;
    encoding?: string;
    fieldname?: string;
    destination?: string;
    path?: string;
}
export declare class FileUploadService {
    private uploadDir;
    constructor();
    uploadFile(file: FileUploadInterface): {
        url: string;
        filename: string;
    };
    deleteFile(filename: string): boolean;
}
