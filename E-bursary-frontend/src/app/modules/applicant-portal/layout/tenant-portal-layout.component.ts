import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TenantPortalAuthService } from '../shared/services/tenant-portal-auth.service';
import { TenantPortalService } from '../shared/services/tenant-portal.service';
import { PortalThemeService } from '../shared/services/portal-theme.service';
import { PortalProfile, PortalLease } from '../shared/interfaces/portal.interfaces';

@Component({
  selector: 'app-tenant-portal-layout',
  templateUrl: './tenant-portal-layout.component.html',
  styleUrls: ['./tenant-portal-layout.component.scss'],
})
export class TenantPortalLayoutComponent implements OnInit {
  profile: PortalProfile | null = null;
  orgName = 'E-Bursary';
  sidebarOpen = false;
  themeOpen = false;
  bursaryOpen = true;
  applicationDeadline = '';

  navItems = [
    { label: 'Dashboard', icon: 'fas fa-th-large', route: '/applicant-portal/dashboard' },
    { label: 'My Application', icon: 'fas fa-file-alt', route: '/applicant-portal/application' },
    { label: 'Application Status', icon: 'fas fa-signal', route: '/applicant-portal/status' },
  ];

  constructor(
    private auth: TenantPortalAuthService,
    private portalService: TenantPortalService,
    private router: Router,
    public theme: PortalThemeService,
  ) {}

  ngOnInit() {
    this.profile = this.auth.getProfile();
    this.auth.profile$.subscribe((p) => (this.profile = p));
    this.portalService.getOrgSettings().subscribe({
      next: (settings) => {
        this.orgName = settings.orgName || 'E-Bursary';
        this.bursaryOpen = settings.bursaryOpen !== false;
        this.applicationDeadline = settings.applicationDeadline || '';
        localStorage.setItem('portal_bursary_open', String(this.bursaryOpen));
      },
      error: () => {},
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/applicant-portal/login']);
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
