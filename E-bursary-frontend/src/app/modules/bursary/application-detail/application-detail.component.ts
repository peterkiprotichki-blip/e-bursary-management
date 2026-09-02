import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BursaryApplication, BursaryService } from '../../../shared/services/bursary/bursary.service';
import { PropertyTenantsService } from '../../../shared/services/property-tenants/property-tenants.service';

@Component({
  selector: 'app-application-detail',
  templateUrl: './application-detail.component.html'
})
export class ApplicationDetailComponent implements OnInit {
  viewingApp: any = null;
  loading: boolean = true;
  error: string = '';
  
  selectedPreviewUrl: string = '';
  safePreviewUrl: SafeResourceUrl | null = null;
  
  updatingId: string = '';
  modalStage: 'in_review' | 'awarded' | 'rejected' = 'in_review';
  reviewNotes: string = '';
  awardAmount: number = 0;
  paymentDestination: string = 'Direct to Institution';

  // State to control vetting modal visibility
  showVettingModal: boolean = false;
  selectedApp: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bursaryService: BursaryService,
    private propertyTenantsService: PropertyTenantsService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadApplicationDetails(id);
    } else {
      this.error = 'Invalid application ID';
      this.loading = false;
    }
  }

  loadApplicationDetails(id: string): void {
    this.loading = true;
    this.error = '';

    // First, fetch the original application to get its stage/metadata
    this.bursaryService.getApplications().subscribe({
      next: (apps: BursaryApplication[]) => {
        const originalApp = apps.find((a: BursaryApplication) => a._id === id);
        if (!originalApp) {
          this.error = 'Application not found in the list.';
          this.loading = false;
          return;
        }

        this.propertyTenantsService.getById(id).subscribe({
          next: (pt: any) => {
            this.viewingApp = pt.metadata?.['applicantPortal'] || {};
            this.viewingApp._id = pt._id;
            this.viewingApp.stage = originalApp.stage;
            this.viewingApp.originalApp = originalApp;
            this.loading = false;
          },
          error: () => {
            this.error = 'Failed to load applicant details.';
            this.loading = false;
          }
        });
      },
      error: () => {
        this.error = 'Failed to verify application.';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/bursary/applications']);
  }

  docLabel(name: string): string {
    const map: Record<string, string> = {
      'national-id': 'National ID / Passport',
      'fee-statement': 'Fee Statement',
      'admission-letter': 'Admission Letter'
    };
    return map[name] || name;
  }

  isSchoolLevel(levelType: string): boolean {
    return levelType === 'high_school' || levelType === 'primary_school';
  }

  badgeClass(stage: string): string {
    const map: Record<string, string> = {
      submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      in_review: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      awarded: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[stage] || 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300';
  }

  isPdf(url: string): boolean {
    if (!url) return false;
    return url.toLowerCase().includes('.pdf') || url.toLowerCase().endsWith('.pdf');
  }



  openPreview(url: string): void {
    this.selectedPreviewUrl = url;
    if (this.isPdf(url)) {
      this.safePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    } else {
      this.safePreviewUrl = null;
    }
  }

  closePreview(): void {
    this.selectedPreviewUrl = '';
    this.safePreviewUrl = null;
  }

  openVettingModal(app: any, stage: 'in_review' | 'awarded' | 'rejected'): void {
    this.selectedApp = app;
    this.modalStage = stage;
    this.reviewNotes = app.reviewNotes || '';
    this.awardAmount = stage === 'awarded' ? (app.awardAmount || 35000) : 0;
    this.paymentDestination = app.paymentDestination || 'Direct to Institution';
    this.showVettingModal = true;
  }

  closeVettingModal(): void {
    this.showVettingModal = false;
    this.selectedApp = null;
  }

  submitVetting(): void {
    if (!this.selectedApp) return;

    this.updatingId = this.selectedApp._id;
    const payload: any = {
      stage: this.modalStage,
      reviewNotes: this.reviewNotes,
    };

    if (this.modalStage === 'awarded') {
      payload.awardAmount = this.awardAmount;
      payload.paymentDestination = this.paymentDestination;
    }

    const applicantId = this.selectedApp._id;
    this.bursaryService.updateApplicationStage(this.selectedApp._id, payload).subscribe({
      next: () => {
        this.updatingId = '';
        this.closeVettingModal();
        // Reload details to reflect new stage
        this.loadApplicationDetails(applicantId);
      },
      error: (err: any) => {
        this.updatingId = '';
        this.error = err?.error?.message || 'Failed to update application stage.';
      },
    });
  }
}
