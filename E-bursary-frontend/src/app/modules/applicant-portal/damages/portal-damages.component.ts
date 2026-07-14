import { Component, OnInit } from '@angular/core';
import { TenantPortalService } from '../shared/services/tenant-portal.service';
import { ApplicantChecklistItem, ApplicantSupportStep } from '../shared/interfaces/portal.interfaces';

@Component({
  selector: 'app-portal-damages',
  templateUrl: './portal-damages.component.html',
  styleUrls: ['./portal-damages.component.scss'],
})
export class PortalDamagesComponent implements OnInit {
  checklist: ApplicantChecklistItem[] = [];
  loading = true;
  listLoading = true;
  error = '';
  supportSteps: ApplicantSupportStep[] = [
    {
      title: 'Prepare the paperwork',
      description: 'Have your ID, fee statement, admission letter, and parent details ready before you submit.',
      icon: 'fas fa-clipboard-list',
    },
    {
      title: 'Enter accurate information',
      description: 'Use the portal to type your details directly so the record stays consistent and reviewable.',
      icon: 'fas fa-pen-to-square',
    },
    {
      title: 'Track every stage',
      description: 'Watch your timeline move from draft to review, award, and disbursement.',
      icon: 'fas fa-chart-line',
    },
  ];

  constructor(private portalService: TenantPortalService) {}

  ngOnInit() {
    this.loadChecklist();
  }

  loadChecklist() {
    this.listLoading = true;
    this.portalService.getChecklist().subscribe({
      next: (items) => {
        this.checklist = items;
        this.listLoading = false;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Unable to load checklist.';
        this.listLoading = false;
        this.loading = false;
      },
    });
  }

  totalDone(): number {
    return this.checklist.filter((item) => item.done).length;
  }

  completionPercent(): number {
    if (!this.checklist.length) return 0;
    return Math.round((this.totalDone() / this.checklist.length) * 100);
  }

  checklistClass(done: boolean): string {
    return done ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400';
  }
}
