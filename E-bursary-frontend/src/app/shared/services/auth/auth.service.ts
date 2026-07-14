import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthResponse, BomoproUser, BomoproPermission, Tenant } from '../../interfaces/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUser$ = new BehaviorSubject<BomoproUser | null>(null);
  private tenants$ = new BehaviorSubject<Tenant[]>([]);
  private activeTenantId$ = new BehaviorSubject<string>('');

  user$ = this.currentUser$.asObservable();
  tenantList$ = this.tenants$.asObservable();
  currentTenantId$ = this.activeTenantId$.asObservable();

  constructor(private http: HttpClient) {
    this.loadUser();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res) => {
        localStorage.setItem('e_bursary_token', res.token);
        localStorage.setItem('e_bursary_user', JSON.stringify(res.user));
        this.currentUser$.next(res.user);
        this.setTenantContext(res.tenants || [], res.activeTenantId || '');
      }),
    );
  }

  signup(name: string, email: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/signup`, { name, email, password });
  }

  verifyEmail(token: string): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${this.apiUrl}/verify-email`, { params: { token } });
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { name, email, password }).pipe(
      tap((res) => {
        localStorage.setItem('e_bursary_token', res.token);
        localStorage.setItem('e_bursary_user', JSON.stringify(res.user));
        this.currentUser$.next(res.user);
      }),
    );
  }

  googleLogin(): void {
    window.location.href = `${environment.apiUrl}/auth/google`;
  }

  handleGoogleCallback(token: string, user: BomoproUser, tenants: Tenant[] = [], activeTenantId: string = ''): void {
    localStorage.setItem('e_bursary_token', token);
    localStorage.setItem('e_bursary_user', JSON.stringify(user));
    this.currentUser$.next(user);
    this.setTenantContext(tenants, activeTenantId);
  }

  approveUser(userId: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/users/${userId}/approve`, {});
  }

  rejectUser(userId: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/users/${userId}/reject`, {});
  }

  switchTenant(tenantId: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/switch-tenant`, { tenantId }).pipe(
      tap((res) => {
        localStorage.setItem('e_bursary_token', res.token);
        localStorage.setItem('e_bursary_user', JSON.stringify(res.user));
        this.currentUser$.next(res.user);
        this.setTenantContext(res.tenants || this.tenants$.value || [], res.activeTenantId || tenantId || '');
      }),
    );
  }

  addUserToTenant(userId: string, tenantId: string): Observable<BomoproUser> {
    return this.http.post<BomoproUser>(`${this.apiUrl}/users/${userId}/add-to-tenant`, { tenantId });
  }

  removeUserFromTenant(userId: string, tenantId: string): Observable<BomoproUser> {
    return this.http.post<BomoproUser>(`${this.apiUrl}/users/${userId}/remove-from-tenant`, { tenantId });
  }

  setPassword(password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/set-password`, { password });
  }

  logout(): void {
    localStorage.removeItem('e_bursary_token');
    localStorage.removeItem('e_bursary_user');
    localStorage.removeItem('e_bursary_tenants');
    localStorage.removeItem('e_bursary_active_tenant');
    this.currentUser$.next(null);
    this.tenants$.next([]);
    this.activeTenantId$.next('');
  }

  getToken(): string | null {
    // Check new key first, fall back to old key for backward compatibility
    return localStorage.getItem('e_bursary_token') || localStorage.getItem('rentium_token');
  }

  getUser(): BomoproUser | null {
    return this.currentUser$.value;
  }

  getTenants(): Tenant[] {
    return this.tenants$.value;
  }

  getActiveTenantId(): string {
    return this.activeTenantId$.value;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isSuperAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'super_admin';
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'admin' || user?.role === 'super_admin';
  }

  isManager(): boolean {
    const user = this.getUser();
    return user?.role === 'manager';
  }

  isTenant(): boolean {
    const user = this.getUser();
    return user?.role === 'tenant';
  }

  hasPermission(permission: BomoproPermission): boolean {
    const user = this.getUser();
    return user?.permissions?.includes(permission) || false;
  }

  setTenantContext(tenants: Tenant[], activeTenantId = ''): void {
    const normalizedTenants = (tenants || []).map((tenant: any) => ({
      ...tenant,
      _id: this.normalizeTenantId(tenant?._id ?? tenant?.id),
    })) as Tenant[];
    const normalizedActiveTenantId = this.normalizeTenantId(activeTenantId);
    const resolvedActiveTenantId = normalizedActiveTenantId && normalizedTenants.some((tenant) => tenant._id === normalizedActiveTenantId)
      ? normalizedActiveTenantId
      : normalizedTenants[0]?._id || '';

    if (normalizedTenants.length) {
      localStorage.setItem('e_bursary_tenants', JSON.stringify(normalizedTenants));
    } else {
      localStorage.removeItem('e_bursary_tenants');
    }

    if (resolvedActiveTenantId) {
      localStorage.setItem('e_bursary_active_tenant', resolvedActiveTenantId);
    } else {
      localStorage.removeItem('e_bursary_active_tenant');
    }

    this.tenants$.next(normalizedTenants);
    this.activeTenantId$.next(resolvedActiveTenantId);
  }

  private normalizeTenantId(value: any): string {
    if (typeof value === 'string') {
      return value;
    }
    if (value === null || value === undefined) {
      return '';
    }
    return String(value);
  }

  private loadUser(): void {
    const userJson = localStorage.getItem('e_bursary_user') || localStorage.getItem('rentium_user');
    if (userJson) {
      try { this.currentUser$.next(JSON.parse(userJson)); } catch (e) {}
    }
    const tenantsJson = localStorage.getItem('e_bursary_tenants') || localStorage.getItem('rentium_tenants');
    let tenants: Tenant[] = [];
    if (tenantsJson) {
      try { tenants = JSON.parse(tenantsJson); } catch (e) {}
    }
    this.setTenantContext(tenants, localStorage.getItem('e_bursary_active_tenant') || localStorage.getItem('rentium_active_tenant') || '');
  }
}
