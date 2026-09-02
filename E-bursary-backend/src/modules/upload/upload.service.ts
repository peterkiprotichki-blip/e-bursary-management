import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface FileUploadInterface {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@Injectable()
export class UploadService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    fs.mkdirSync(this.uploadDir, { recursive: true });
  }

  uploadFile(file: FileUploadInterface): { url: string; filename: string } {
    const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${safeName}`;
    fs.writeFileSync(path.join(this.uploadDir, filename), file.buffer);
    return { url: `/uploads/${filename}`, filename };
  }
}
