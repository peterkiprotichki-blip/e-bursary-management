import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap, catchError } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { PortalProfile } from '../interfaces/portal.interfaces';

const TOKEN_KEY = 'portal_token';
const PROFILE_KEY = 'portal_profile';
const BURSARY_OPEN_KEY = 'portal_bursary_open';

@Injectable({ providedIn: 'root' })
export class TenantPortalAuthService {
  private readonly apiUrl = environment.apiUrl;

  private profileSubject = new BehaviorSubject<PortalProfile | null>(this.storedProfile());
  profile$ = this.profileSubject.asObservable();

  constructor(private http: HttpClient) {}

  setupPassword(token: string, password: string) {
    return this.http.post(`${this.apiUrl}/applicant-portal/auth/setup-password`, { token, password });
  }

  register(payload: { location: string; fullName: string; email: string; password: string; phone: string }) {
    return this.http
      .post<{ token: string; profile: PortalProfile; message: string }>(`${this.apiUrl}/applicant-portal/auth/register`, payload)
      .pipe(
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.token);
          localStorage.setItem(PROFILE_KEY, JSON.stringify(res.profile));
          this.profileSubject.next(res.profile);
        }),
      );
  }

  login(email: string, password: string) {
    return this.http
      .post<{ token: string; profile: PortalProfile; bursaryOpen: boolean }>(`${this.apiUrl}/applicant-portal/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.token);
          localStorage.setItem(PROFILE_KEY, JSON.stringify(res.profile));
          localStorage.setItem(BURSARY_OPEN_KEY, String(res.bursaryOpen ?? true));
          this.profileSubject.next(res.profile);
        }),
      );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(BURSARY_OPEN_KEY);
    this.profileSubject.next(null);
  }

  isBursaryOpen(): boolean {
    return localStorage.getItem(BURSARY_OPEN_KEY) !== 'false';
  }

  /** Calls GET /applicant-portal/profile to validate the stored token.
   *  Returns the profile on success, or null (after clearing the session) on 401/error. */
  verifyToken(): Observable<PortalProfile | null> {
    return this.http.get<PortalProfile>(`${this.apiUrl}/applicant-portal/profile`).pipe(
      tap((profile) => {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
        this.profileSubject.next(profile);
      }),
      catchError(() => {
        this.logout();
        return of(null);
      }),
    );
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getProfile(): PortalProfile | null {
    return this.profileSubject.value;
  }

  private storedProfile(): PortalProfile | null {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
