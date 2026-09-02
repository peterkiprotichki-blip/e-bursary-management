import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TenantPortalAuthService } from '../../shared/services/tenant-portal-auth.service';
import { PortalThemeService } from '../../shared/services/portal-theme.service';
import { TenantPortalService } from '../../shared/services/tenant-portal.service';

@Component({
  selector: 'app-portal-login',
  templateUrl: './portal-login.component.html',
  styleUrls: ['./portal-login.component.scss'],
})
export class PortalLoginComponent implements OnInit {
  form: FormGroup;
  registerForm: FormGroup;
  loading = false;
  registerLoading = false;
  checkingSession = false;
  error = '';
  registerError = '';
  success = '';
  showPassword = false;
  showConfirmPassword = false;
  mode: 'login' | 'register' = 'login';
  showClosedModal = false;
  bursaryOpen: boolean | null = null;
  private savedThemeDark: boolean | null = null;
  

  constructor(
    private fb: FormBuilder,
    private auth: TenantPortalAuthService,
    public theme: PortalThemeService,
    private router: Router,
    private route: ActivatedRoute,
    private portalService: TenantPortalService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', Validators.required],
    }, { validators: this.passwordsMatch });
  }

  ngOnInit() {
    this.savedThemeDark = this.theme.isDark;
    this.applyThemeForMode();

    if (this.auth.isLoggedIn()) {
      this.checkingSession = true;
      this.auth.verifyToken().subscribe((profile) => {
        if (profile) {
          this.router.navigate(['/applicant-portal/dashboard']);
        } else {
          // Stale/invalid token was cleared — show login form
          this.checkBursaryStatus();
        }
      });
    } else {
      this.checkBursaryStatus();
    }
  }

  private checkBursaryStatus() {
    this.checkingSession = true;
    this.portalService.getOrgSettings().subscribe({
      next: (settings) => {
        this.bursaryOpen = settings.bursaryOpen !== false;
        localStorage.setItem('portal_bursary_open', String(this.bursaryOpen));
        this.checkingSession = false;
      },
      error: () => {
        this.bursaryOpen = true; // Fallback
        this.checkingSession = false;
      }
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { email, password } = this.form.value;
    this.auth.login(email, password).subscribe({
      next: () => {
        this.loading = false;
        if (this.auth.isBursaryOpen()) {
          this.router.navigate(['/applicant-portal/dashboard']);
        } else {
          this.showClosedModal = true;
        }
      },
      error: (err) => {
        this.error = err?.error?.message || 'Invalid email or password';
        this.loading = false;
      },
    });
  }

  submitRegister() {
    if (this.registerForm.invalid) return;
    this.registerLoading = true;
    this.registerError = '';
    this.success = '';

    const { confirm, ...payload } = this.registerForm.value;
    this.auth.register(payload).subscribe({
      next: () => {
        this.success = 'Account created. You are now signed in.';
        this.registerLoading = false;
        this.router.navigate(['/applicant-portal/dashboard']);
      },
      error: (err) => {
        this.registerError = err?.error?.message || 'Registration failed';
        this.registerLoading = false;
      },
    });
  }

  setMode(mode: 'login' | 'register') {
    this.mode = mode;
    this.applyThemeForMode();
  }

  proceedAnyway() {
    this.showClosedModal = false;
    this.router.navigate(['/applicant-portal/dashboard']);
  }

  closeAndLogout() {
    this.auth.logout();
    this.showClosedModal = false;
  }

  private applyThemeForMode() {
    if (this.mode === 'register') {
      this.theme.setDark(false, false);
      return;
    }

    if (this.savedThemeDark !== null) {
      this.theme.setDark(this.savedThemeDark, false);
    }
  }

  private passwordsMatch(group: FormGroup) {
    return group.get('password')?.value === group.get('confirm')?.value ? null : { mismatch: true };
  }
}
