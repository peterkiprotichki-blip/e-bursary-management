import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface BursaryDashboardSummary {
  applicants: {
    total: number;
    submitted: number;
    inReview: number;
    awarded: number;
    rejected: number;
  };
  disbursements: {
    total: number;
    monthly: number;
    completedPayments: number;
  };
}

export interface BursaryApplication {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  course: string;
  progress: number;
  stage: 'submitted' | 'in_review' | 'awarded' | 'rejected';
  submittedAt: string;
  reviewNotes: string;
  awardAmount: number;
  paymentDestination?: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class BursaryService {
  private readonly apiUrl = `${environment.apiUrl}/bursary`;

  constructor(private readonly http: HttpClient) {}

  getDashboardSummary(): Observable<BursaryDashboardSummary> {
    return this.http.get<BursaryDashboardSummary>(`${this.apiUrl}/dashboard`);
  }

  getApplications(): Observable<BursaryApplication[]> {
    return this.http.get<BursaryApplication[]>(`${this.apiUrl}/applications`);
  }

  updateApplicationStage(
    applicationId: string,
    payload: {
      stage: 'submitted' | 'in_review' | 'awarded' | 'rejected';
      reviewNotes?: string;
      awardAmount?: number;
      paymentDestination?: string;
    },
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/applications/${applicationId}/stage`, payload);
  }

  updateApplication(applicationId: string, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/applications/${applicationId}`, payload);
  }
}
