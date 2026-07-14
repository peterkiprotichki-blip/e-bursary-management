import { Component, OnInit } from '@angular/core';
import { BursaryService } from '../../../shared/services/bursary/bursary.service';
import { PropertyTenantsService } from '../../../shared/services/property-tenants/property-tenants.service';

interface EnrichedDocument {
  applicantId: string;
  applicantName: string;
  docName: string;
  fileName: string;
  mimeType: string;
  dataUrl: string;
}

@Component({
  selector: 'app-documents-list',
  templateUrl: './documents-list.component.html',
  styleUrls: ['./documents-list.component.scss']
})
export class DocumentsListComponent implements OnInit {
  documents: EnrichedDocument[] = [];
  loading = true;
  error = '';
  selectedImageUrl = '';

  constructor(
    private readonly bursaryService: BursaryService,
    private readonly tenantsService: PropertyTenantsService
  ) {}

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.loading = true;
    this.error = '';
    this.tenantsService.getAll(1, 100).subscribe({
      next: (res) => {
        const docList: EnrichedDocument[] = [];
        res.data.forEach((app) => {
          const docs = app.metadata?.['applicantPortal']?.['documents'] || [];
          docs.forEach((doc: any) => {
            docList.push({
              applicantId: app._id,
              applicantName: app.name,
              docName: doc.name,
              fileName: doc.fileName || 'document.png',
              mimeType: doc.mimeType || 'image/png',
              dataUrl: doc.dataUrl
            });
          });
        });
        this.documents = docList;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load uploaded documents.';
        this.loading = false;
      }
    });
  }

  docLabel(name: string): string {
    const map: Record<string, string> = {
      'national-id': 'National ID / Passport',
      'fee-statement': 'Fee Statement',
      'admission-letter': 'Admission Letter'
    };
    return map[name] || name;
  }

  openPreview(url: string) {
    this.selectedImageUrl = url;
  }

  closePreview() {
    this.selectedImageUrl = '';
  }
}
