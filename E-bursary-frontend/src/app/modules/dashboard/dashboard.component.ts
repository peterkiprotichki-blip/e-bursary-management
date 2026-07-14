import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../shared/services/theme/theme.service';
import { BursaryDashboardSummary, BursaryService } from '../../shared/services/bursary/bursary.service';
import { AuthService } from '../../shared/services/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  summary: BursaryDashboardSummary | null = null;
  loading = true;

  constructor(
    private bursaryService: BursaryService,
    private authService: AuthService,
    public themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.bursaryService.getDashboardSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  get isBursaryOpen(): boolean {
    const activeTenantId = this.authService.getActiveTenantId();
    const activeTenant = this.authService.getTenants().find((t) => t._id === activeTenantId);
    return activeTenant?.settings?.['bursaryOpen'] !== false;
  }
}
