import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TenantPortalService } from '../shared/services/tenant-portal.service';
import { TenantPortalAuthService } from '../shared/services/tenant-portal-auth.service';
import { ApplicantApplication, ApplicantChecklistItem, ApplicantSupportStep, ApplicantTimelineItem, PortalProfile } from '../shared/interfaces/portal.interfaces';

@Component({
  selector: 'app-portal-dashboard',
  templateUrl: './portal-dashboard.component.html',
  styleUrls: ['./portal-dashboard.component.scss'],
})
export class PortalDashboardComponent implements OnInit {
  profile: PortalProfile | null = null;
  application: ApplicantApplication | null = null;
  checklist: ApplicantChecklistItem[] = [];
  timeline: ApplicantTimelineItem[] = [];
  supportSteps: ApplicantSupportStep[] = [
    {
      title: 'Fill in your details yourself',
      description: 'Use the portal directly to enter accurate personal, school, and household information.',
      icon: 'fas fa-pen-to-square',
    },
    {
      title: 'Upload proof documents',
      description: 'Keep your ID, fee statement, and admission letter in one place.',
      icon: 'fas fa-file-arrow-up',
    },
    {
      title: 'Track review status',
      description: 'Follow each stage from draft to submission, review, award, and disbursement.',
      icon: 'fas fa-chart-line',
    },
  ];
  loading = true;
  error = '';
  bursaryOpen = true;
  applicationDeadline = '';

  get applicationProgress(): number {
    return this.application?.progress || 0;
  }

  constructor(
    private portalService: TenantPortalService,
    private auth: TenantPortalAuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.profile = this.auth.getProfile();
    this.bursaryOpen = this.auth.isBursaryOpen();
    this.portalService.getOrgSettings().subscribe({
      next: (settings) => {
        this.applicationDeadline = settings.applicationDeadline || '';
      },
      error: () => {},
    });
    this.load();
  }

  load() {
    this.loading = true;
    this.portalService.getApplication().subscribe({
      next: (application) => {
        this.application = application;
        this.checklist = application.checklist || [];
        this.timeline = application.timeline || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
    this.portalService.getChecklist().subscribe({
      next: (items) => (this.checklist = items),
      error: () => {},
    });
    this.portalService.getTimeline().subscribe({
      next: (items) => (this.timeline = items),
      error: () => {},
    });
  }

  goToApplication() {
    this.router.navigate(['/applicant-portal/application']);
  }

  getFirstName(profile: any): string {
    if (!profile || !profile.name || typeof profile.name !== 'string') return 'Applicant';
    return profile.name.split(' ')[0];
  }
}
