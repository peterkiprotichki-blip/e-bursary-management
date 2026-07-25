import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FileUploadService {
  private readonly apiUrl = environment.apiUrl || 'http://localhost:3400/api';
  private readonly uploadUrl = `${this.apiUrl}/applicant-portal/upload`;

  constructor(private http: HttpClient) {}

  uploadFile(file: File): Observable<string> {
    if (!file) {
      return throwError(() => new Error('No file selected.'));
    }
    
    // Accept images and pdfs
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      return throwError(() => new Error('Invalid file type. Please upload a JPEG, PNG, GIF, WebP, or PDF.'));
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return throwError(() => new Error('File size exceeds the 10 MB limit.'));
    }

    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(this.uploadUrl, formData).pipe(
      map((response) => {
        if (response && response.success && response.data && response.data.url) {
          // Convert relative URL to absolute if needed
          const url = response.data.url;
          if (url.startsWith('/')) {
            return `${this.apiUrl}${url}`;
          }
          return url;
        }
        throw new Error(response?.error?.message || 'File upload failed.');
      }),
      catchError((error) => {
        const errorMsg = error?.error?.message || error?.message || 'Failed to upload file. Please try again.';
        return throwError(() => new Error(errorMsg));
      })
    );
  }
}
