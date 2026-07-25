import { Component, OnInit } from '@angular/core';
import { BursaryApplication, BursaryService } from '../../../shared/services/bursary/bursary.service';
import { Router } from '@angular/router';
import { ThemeService } from '../../../shared/services/theme/theme.service';
import { PropertyTenantsService } from '../../../shared/services/property-tenants/property-tenants.service';

@Component({
  selector: 'app-applications-list',
  templateUrl: './applications-list.component.html',
  styleUrls: ['./applications-list.component.scss']
})
export class ApplicationsListComponent implements OnInit {
  selectedApp: BursaryApplication | null = null;
  applications: BursaryApplication[] = [];
  loading = true;
  updatingId = '';
  error = '';
  modalStage: 'submitted' | 'in_review' | 'awarded' | 'rejected' = 'in_review';
  reviewNotes = '';
  awardAmount = 0;
  paymentDestination = 'Direct to Institution';


  editingApp: BursaryApplication | null = null;
  editForm: any = {};

  constructor(
    private readonly bursaryService: BursaryService,
    private readonly propertyTenantsService: PropertyTenantsService,
    private readonly router: Router,
    public readonly themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.loading = true;
    this.error = '';
    this.bursaryService.getApplications().subscribe({
      next: (apps) => {
        this.applications = apps;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load applications.';
        this.loading = false;
      },
    });
  }

  openVettingModal(app: BursaryApplication, stage: 'in_review' | 'awarded' | 'rejected'): void {
    this.selectedApp = app;
    this.modalStage = stage;
    this.reviewNotes = app.reviewNotes || '';
    this.awardAmount = stage === 'awarded' ? (app.awardAmount || 35000) : 0;
    this.paymentDestination = app.paymentDestination || 'Direct to Institution';
  }

  viewApp(app: BursaryApplication): void {
    this.router.navigate(['/bursary/applications', app._id]);
  }

  closeModal(): void {
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

    this.bursaryService.updateApplicationStage(this.selectedApp._id, payload).subscribe({
      next: () => {
        this.updatingId = '';
        this.selectedApp = null;
        this.loadApplications();
      },
      error: (err: any) => {
        this.updatingId = '';
        this.error = err?.error?.message || 'Failed to update application stage.';
      },
    });
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

  docLabel(name: string): string {
    const map: Record<string, string> = {
      'national-id': 'National ID / Passport',
      'fee-statement': 'Fee Statement',
      'admission-letter': 'Admission Letter'
    };
    return map[name] || name;
  }

  openEditModal(app: BursaryApplication): void {
    this.editingApp = app;
    this.editForm = { ...app };
    this.propertyTenantsService.getById(app._id).subscribe({
      next: (pt) => {
        const portal = pt.metadata?.['applicantPortal'] || {};
        this.editForm = {
          fullName: portal.fullName || app.fullName || '',
          phone: portal.phone || app.phone || '',
          email: portal.email || app.email || '',
          idNumber: portal.idNumber || '',
          institution: portal.institution || app.institution || '',
          course: portal.course || app.course || '',
          admissionNumber: portal.admissionNumber || '',
          householdIncome: portal.householdIncome || '',
          familyDependents: portal.familyDependents || '',
          bankName: portal.bankName || '',
          accountNumber: portal.accountNumber || '',
          personalStatement: portal.personalStatement || '',
        };
      },
      error: () => {
        this.error = 'Failed to load application details for editing.';
      },
    });
  }

  submitEdit(): void {
    if (!this.editingApp) return;
    this.updatingId = this.editingApp._id;
    this.bursaryService.updateApplication(this.editingApp._id, this.editForm).subscribe({
      next: () => {
        this.updatingId = '';
        this.editingApp = null;
        this.loadApplications();
      },
      error: (err: any) => {
        this.updatingId = '';
        this.error = err?.error?.message || 'Failed to update application.';
      },
    });
  }
}
