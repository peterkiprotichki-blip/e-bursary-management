import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../shared/services/theme/theme.service';
import { AuthService } from '../../shared/services/auth/auth.service';
import { TenantsService } from '../../shared/services/tenants/tenants.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  presetColors = [
    '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
    '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  ];

  bursaryOpen = true;
  applicationDeadline = '';
  statusSaving = false;
  statusSaved = false;
  statusError = '';

  constructor(
    public themeService: ThemeService,
    public authService: AuthService,
    private tenantsService: TenantsService,
  ) {}

  ngOnInit() {
    const tenant = this.activeTenant as any;
    if (tenant?.settings) {
      this.bursaryOpen = tenant.settings.bursaryOpen !== false;
      this.applicationDeadline = tenant.settings.applicationDeadline || '';
    }
  }

  get user() { return this.authService.getUser(); }

  get activeTenant() {
    const activeTenantId = this.authService.getActiveTenantId();
    return this.authService.getTenants().find((tenant) => tenant._id === activeTenantId) || null;
  }

  get tenantCount(): number {
    return this.authService.getTenants().length;
  }

  toggleDarkMode(): void { this.themeService.toggleTheme(); }

  setAccentColor(color: string): void { this.themeService.setAccentColor(color); }

  saveBursaryStatus() {
    if (!this.activeTenant) return;
    this.statusSaving = true;
    this.statusError = '';
    this.statusSaved = false;
      // If opening the bursary and no deadline is set, default to 14 days from today
      if (this.bursaryOpen && !this.applicationDeadline) {
        const now = new Date();
        const deadline = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        // store as ISO date (date-only portion will be used by the input)
        this.applicationDeadline = deadline.toISOString();
      }

    const newSettings = {
      ...(this.activeTenant.settings || {}),
      bursaryOpen: this.bursaryOpen,
      applicationDeadline: this.applicationDeadline,
    };
    this.tenantsService.update(this.activeTenant._id, { settings: newSettings } as any).subscribe({
      next: () => {
        this.statusSaving = false;
        this.statusSaved = true;
        if (this.activeTenant) {
          this.activeTenant.settings = newSettings;
          this.authService.setTenantContext(
            this.authService.getTenants(),
            this.authService.getActiveTenantId(),
          );
        }
        setTimeout(() => (this.statusSaved = false), 3000);
      },
      error: (err) => {
        this.statusSaving = false;
        this.statusError = err?.error?.message || 'Failed to update application status.';
      }
    });
  }
}
