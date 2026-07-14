import { Component, OnInit } from '@angular/core';
import { BursaryService, BursaryApplication } from '../../../shared/services/bursary/bursary.service';
import { PropertyTenantsService } from '../../../shared/services/property-tenants/property-tenants.service';

interface InstitutionAllocation {
  name: string;
  count: number;
  totalAwarded: number;
}

@Component({
  selector: 'app-allocations-list',
  templateUrl: './allocations-list.component.html',
  styleUrls: ['./allocations-list.component.scss']
})
export class AllocationsListComponent implements OnInit {
  applications: BursaryApplication[] = [];
  loading = true;
  error = '';
  
  totalBudget = 28000000;
  totalAwarded = 0;
  awardCount = 0;
  
  universityAllocated = 0;
  highSchoolAllocated = 0;
  universityCount = 0;
  highSchoolCount = 0;

  institutionAllocations: InstitutionAllocation[] = [];

  constructor(
    private readonly bursaryService: BursaryService,
    private readonly tenantsService: PropertyTenantsService
  ) {}

  ngOnInit() {
    this.loadAllocations();
  }

  loadAllocations() {
    this.loading = true;
    this.error = '';

    this.bursaryService.getApplications().subscribe({
      next: (apps) => {
        this.applications = apps;
        
        this.totalAwarded = 0;
        this.awardCount = 0;
        this.universityAllocated = 0;
        this.highSchoolAllocated = 0;
        this.universityCount = 0;
        this.highSchoolCount = 0;

        const instMap = new Map<string, { count: number; total: number }>();

        apps.forEach((app) => {
          if (app.stage === 'awarded') {
            const amount = app.awardAmount || 0;
            this.totalAwarded += amount;
            this.awardCount++;

            const isUni = !!app.course;
            if (isUni) {
              this.universityAllocated += amount;
              this.universityCount++;
            } else {
              this.highSchoolAllocated += amount;
              this.highSchoolCount++;
            }

            const inst = app.institution?.trim() || 'Unspecified Institution';
            const curr = instMap.get(inst) || { count: 0, total: 0 };
            instMap.set(inst, {
              count: curr.count + 1,
              total: curr.total + amount
            });
          }
        });

        this.institutionAllocations = Array.from(instMap.entries()).map(([name, val]) => ({
          name,
          count: val.count,
          totalAwarded: val.total
        })).sort((a, b) => b.totalAwarded - a.totalAwarded);

        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to fetch allocations database.';
        this.loading = false;
      }
    });
  }
}
