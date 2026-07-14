import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ImgbbUploadService {
  private readonly apiKey = 'eebabade6f9785164a9d2dc3d4350076';
  private readonly uploadUrl = `https://api.imgbb.com/1/upload?key=${this.apiKey}`;

  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<string> {
    if (!file) {
      return throwError(() => new Error('No file selected.'));
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return throwError(() => new Error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.'));
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return throwError(() => new Error('File size exceeds the 10 MB limit.'));
    }

    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<any>(this.uploadUrl, formData).pipe(
      map((response) => {
        if (response && response.success && response.data && response.data.url) {
          return response.data.url;
        }
        throw new Error(response?.error?.message || 'ImgBB upload failed.');
      }),
      catchError((error) => {
        const errorMsg = error?.error?.error?.message || error?.message || 'Failed to upload image. Please try again.';
        return throwError(() => new Error(errorMsg));
      })
    );
  }
}
