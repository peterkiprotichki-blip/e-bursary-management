import { Component, OnInit } from '@angular/core';
import { TenantPortalService } from '../shared/services/tenant-portal.service';
import { FileUploadService } from '../shared/services/file-upload.service';
import { ApplicantApplication, ApplicantDocument } from '../shared/interfaces/portal.interfaces';

@Component({
  selector: 'app-portal-payments',
  templateUrl: './portal-payments.component.html',
  styleUrls: ['./portal-payments.component.scss'],
})
export class PortalPaymentsComponent implements OnInit {
  application: ApplicantApplication | null = null;
  requiredDocs: Array<{ key: string; label: string; required: boolean }> = [];
  loading = true;
  saving = false;
  error = '';
  success = '';
  documentPreview = new Map<string, string>();

  constructor(
    private portalService: TenantPortalService,
    private fileUploadService: FileUploadService,
  ) {}

  ngOnInit() {
    this.portalService.getApplication().subscribe({
      next: (application) => {
        this.application = application;
        this.requiredDocs = application.requiredDocuments || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Unable to load documents.';
        this.loading = false;
      },
    });
  }

  onDocumentChange(event: Event, key: string) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.saving = true;
    this.error = '';
    this.success = '';
    this.fileUploadService.uploadFile(file).subscribe({
      next: (imageUrl) => {
        this.documentPreview.set(key, imageUrl);
        const documents = [...(this.application?.documents || [])].filter((doc) => doc.name !== key);
        documents.push({ name: key, fileName: file.name, mimeType: file.type, dataUrl: imageUrl });
        this.portalService.saveApplication({ ...this.application, documents } as Partial<ApplicantApplication>).subscribe({
          next: (application) => {
            this.application = application;
            this.success = 'Document uploaded successfully.';
            this.saving = false;
          },
          error: (err) => {
            this.error = err?.error?.message || 'Could not save the uploaded document.';
            this.saving = false;
          },
        });
      },
      error: (err) => {
        this.error = err.message || 'File upload failed.';
        this.saving = false;
      }
    });
  }

  removeDocument(docToRemove: ApplicantDocument) {
    const documents = (this.application?.documents || []).filter((doc) => doc.dataUrl !== docToRemove.dataUrl);
    this.saving = true;
    this.portalService.saveApplication({ ...this.application, documents } as Partial<ApplicantApplication>).subscribe({
      next: (application) => {
        this.application = application;
        this.saving = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Could not remove the document.';
        this.saving = false;
      },
    });
  }

  docName(key: string): string {
    return this.requiredDocs.find((doc) => doc.key === key)?.label || key;
  }

  existingDocument(key: string): ApplicantDocument | undefined {
    return this.application?.documents?.find((doc) => doc.name === key);
  }

  existingDocuments(key: string): ApplicantDocument[] {
    return (this.application?.documents || []).filter((doc) => doc.name === key);
  }

  requiredKeys(): string[] {
    return this.requiredDocs.length ? this.requiredDocs.map((doc) => doc.key) : [
      'national-id', 'fee-statement', 'admission-letter',
    ];
  }

  hasDocument(key: string): boolean {
    return !!this.existingDocument(key);
  }

  completionClass(key: string): string {
    return this.hasDocument(key) ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400';
  }

  completionLabel(key: string): string {
    return this.hasDocument(key) ? 'Uploaded' : 'Pending';
  }

  previewSrc(key: string): string {
    return this.documentPreview.get(key) || this.existingDocument(key)?.dataUrl || '';
  }

  isImage(key: string): boolean {
    const mimeType = this.existingDocument(key)?.mimeType || '';
    return mimeType.startsWith('image/') || !!this.documentPreview.get(key);
  }
}
