import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

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

@Injectable()
export class FileUploadService {
  private uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  uploadFile(file: FileUploadInterface): { url: string; filename: string } {
    if (!file) {
      throw new Error('No file provided');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const filename = `${timestamp}-${random}-${file.originalname}`;
    const filepath = path.join(this.uploadDir, filename);

    // Save file
    fs.writeFileSync(filepath, file.buffer);

    // Return accessible URL (relative to API server)
    return {
      url: `/uploads/${filename}`,
      filename: filename,
    };
  }

  deleteFile(filename: string): boolean {
    const filepath = path.join(this.uploadDir, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return true;
    }
    return false;
  }
}
