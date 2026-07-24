import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ApplicantApplication, ApplicantChecklistItem, ApplicantTimelineItem, PortalBalance, PortalDamage, PortalLease, PortalPayment, PortalProfile, MpesaStkResponse } from '../interfaces/portal.interfaces';

@Injectable({ providedIn: 'root' })
export class TenantPortalService {
  private readonly base = `${environment.apiUrl}/applicant-portal`;

  constructor(private http: HttpClient) {}

  getProfile() {
    return this.http.get<PortalProfile>(`${this.base}/profile`);
  }

  getApplication() {
    return this.http.get<ApplicantApplication>(`${this.base}/application`);
  }

  saveApplication(payload: Partial<ApplicantApplication>) {
    return this.http.put<ApplicantApplication>(`${this.base}/application`, payload);
  }

  submitApplication() {
    return this.http.post<ApplicantApplication>(`${this.base}/application/submit`, {});
  }

  getChecklist() {
    return this.http.get<ApplicantChecklistItem[]>(`${this.base}/application/checklist`);
  }

  getTimeline() {
    return this.http.get<ApplicantTimelineItem[]>(`${this.base}/application/timeline`);
  }

  updateProfile(phone: string) {
    return this.http.put<PortalProfile>(`${this.base}/profile`, { phone });
  }

  getLease() {
    return this.http.get<PortalLease>(`${this.base}/lease`);
  }

  signLease(leaseId: string) {
    return this.http.post<PortalLease>(`${this.base}/lease/${leaseId}/sign`, {});
  }

  getPayments() {
    return this.http.get<PortalPayment[]>(`${this.base}/payments`);
  }

  getPaymentStatus(paymentId: string) {
    return this.http.get<PortalPayment>(`${this.base}/payments/${paymentId}/status`);
  }

  initiateMpesaPayment(payload: {
    phoneNumber: string;
    amount: number;
    leaseId: string;
    paymentPeriod?: string;
    notes?: string;
  }) {
    return this.http.post<MpesaStkResponse>(`${this.base}/payments/mpesa-stk`, payload);
  }

  getInvoices() {
    return this.http.get<PortalPayment[]>(`${this.base}/invoices`);
  }

  getOrgSettings() {
    return this.http.get<{ mpesaClientId: string; orgName: string; bursaryOpen: boolean; applicationDeadline?: string }>(`${this.base}/org-settings`);
  }

  confirmMpesaPayment(payload: {
    leaseId: string;
    amount: number;
    phoneNumber: string;
    mpesaReceiptNumber: string;
    checkoutRequestId: string;
    paymentPeriod?: string;
    notes?: string;
  }) {
    return this.http.post<PortalPayment>(`${this.base}/payments/confirm-mpesa`, payload);
  }

  getBalance() {
    return this.http.get<PortalBalance>(`${this.base}/balance`);
  }

  submitDamage(dto: {
    description: string;
    damageType: string;
    severity: string;
    location: string;
    notes?: string;
  }) {
    return this.http.post<PortalDamage>(`${this.base}/damages`, dto);
  }

  getDamages() {
    return this.http.get<PortalDamage[]>(`${this.base}/damages`);
  }

  resendReceipt(paymentId: string) {
    return this.http.post<{ message: string }>(`${this.base}/payments/${paymentId}/resend-receipt`, {});
  }
}
