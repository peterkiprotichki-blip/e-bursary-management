import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
  safePreviewUrl: SafeResourceUrl | null = null;
  
  // Filtering
  applicants: { id: string; name: string }[] = [];
  selectedApplicantId: string = 'all';

  constructor(
    private readonly bursaryService: BursaryService,
    private readonly tenantsService: PropertyTenantsService,
    private readonly sanitizer: DomSanitizer
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
          
          // Add applicant to list for filtering if they have docs
          if (docs.length > 0) {
            this.applicants.push({ id: app._id, name: app.name });
          }
        });
        
        // Sort applicants alphabetically
        this.applicants.sort((a, b) => a.name.localeCompare(b.name));
        
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

  isPdf(url: string): boolean {
    if (!url) return false;
    return url.toLowerCase().includes('.pdf') || url.toLowerCase().endsWith('.pdf');
  }

  getPreviewImageUrl(url: string): string {
    if (!url) return '';
    if (this.isPdf(url)) {
      return url.replace(/\.pdf$/i, '.jpg');
    }
    return url;
  }

  get filteredDocuments(): EnrichedDocument[] {
    if (this.selectedApplicantId === 'all') return this.documents;
    return this.documents.filter(d => d.applicantId === this.selectedApplicantId);
  }

  openPreview(url: string) {
    this.selectedImageUrl = url;
    if (this.isPdf(url)) {
      this.safePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    } else {
      this.safePreviewUrl = null;
    }
  }

  closePreview() {
    this.selectedImageUrl = '';
    this.safePreviewUrl = null;
  }
}
