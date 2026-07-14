import { Component, OnInit } from '@angular/core';
import { PropertyTenantsService } from '../../../shared/services/property-tenants/property-tenants.service';
import { PropertyTenant } from '../../../shared/interfaces/models';

@Component({
  selector: 'app-applicants-list',
  templateUrl: './applicants-list.component.html',
  styleUrls: ['./applicants-list.component.scss']
})
export class ApplicantsListComponent implements OnInit {
  applicants: PropertyTenant[] = [];
  loading = true;
  error = '';
  search = '';

  constructor(private readonly tenantsService: PropertyTenantsService) {}

  ngOnInit() {
    this.loadApplicants();
  }

  loadApplicants() {
    this.loading = true;
    this.error = '';
    this.tenantsService.getAll(1, 100, this.search).subscribe({
      next: (res) => {
        this.applicants = res.data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load registered applicants.';
        this.loading = false;
      }
    });
  }

  onSearch() {
    this.loadApplicants();
  }
}
