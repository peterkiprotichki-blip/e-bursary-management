import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../shared/services/theme/theme.service';
import { AuthService } from '../../shared/services/auth/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  superAdminOnly?: boolean;
  roles?: string[]; // Specify which roles can see this item
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() collapsed = false;
  @Input() mobileHidden = true;
  @Input() isMobile = false;
  @Output() toggle = new EventEmitter<void>();
  @Output() navigate = new EventEmitter<void>();

  allNavItems: NavItem[] = [
    { label: 'Dashboard', icon: 'fas fa-th-large', route: '/dashboard', roles: ['super_admin', 'admin', 'manager'] },
    { label: 'Applicants', icon: 'fas fa-user-graduate', route: '/bursary/applicants', roles: ['super_admin', 'admin', 'manager'] },
    { label: 'Applications', icon: 'fas fa-file-alt', route: '/bursary/applications', roles: ['super_admin', 'admin', 'manager'] },
    { label: 'Programs', icon: 'fas fa-briefcase', route: '/bursary/programs', roles: ['super_admin', 'admin'] },
    { label: 'Allocations', icon: 'fas fa-hand-holding-usd', route: '/bursary/allocations', roles: ['super_admin', 'admin'] },
    { label: 'Documents', icon: 'fas fa-file-upload', route: '/bursary/documents', roles: ['super_admin', 'admin', 'manager'] },
    { label: 'Disbursements', icon: 'fas fa-wallet', route: '/payments', roles: ['super_admin'] },
    { label: 'Reports', icon: 'fas fa-chart-bar', route: '/reports', roles: ['super_admin', 'admin', 'manager'] },
    { label: 'Settings', icon: 'fas fa-cog', route: '/settings', roles: ['super_admin', 'admin'] },
  ];

  navItems: NavItem[] = [];
  private userSub?: Subscription;

  constructor(
    public router: Router,
    public themeService: ThemeService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.userSub = this.authService.user$.subscribe((user) => {
      const userRole = user?.role || '';
      this.navItems = this.allNavItems.filter((item) => {
        // If item has superAdminOnly flag, only show for super_admin
        if (item.superAdminOnly) {
          return userRole === 'super_admin';
        }
        // If item has roles array, check if user role is included
        if (item.roles) {
          return item.roles.includes(userRole);
        }
        // Default: show all items
        return true;
      });
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }
}
