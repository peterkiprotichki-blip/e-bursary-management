import { Component, OnInit } from '@angular/core';
import { TenantPortalService } from '../shared/services/tenant-portal.service';
import { ApplicantApplication, ApplicantTimelineItem } from '../shared/interfaces/portal.interfaces';

@Component({
  selector: 'app-portal-invoices',
  templateUrl: './portal-invoices.component.html',
  styleUrls: ['./portal-invoices.component.scss'],
})
export class PortalInvoicesComponent implements OnInit {
  application: ApplicantApplication | null = null;
  timeline: ApplicantTimelineItem[] = [];
  loading = true;
  error = '';

  get progress(): number {
    return this.application?.progress || 0;
  }

  constructor(private portalService: TenantPortalService) {}

  ngOnInit() {
    this.portalService.getApplication().subscribe({
      next: (data) => {
        this.application = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load application status.';
        this.loading = false;
      },
    });

    this.portalService.getTimeline().subscribe({
      next: (items) => {
        this.timeline = items;
        this.loading = false;
      },
      error: () => {},
    });
  }

  timelineClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400';
      case 'in_review':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
      case 'pending':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400';
      case 'rejected':
        return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400';
    }
  }

  stageLabel(): string {
    return this.application?.stage || 'draft';
  }
}
