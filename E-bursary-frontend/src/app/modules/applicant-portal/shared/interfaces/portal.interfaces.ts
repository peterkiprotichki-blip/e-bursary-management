export interface PortalProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  avatar: string;
  currentPropertyId: string;
  currentLeaseId: string;
  isActive: boolean;
  occupation: string;
  employer: string;
}

export interface ApplicantDocument {
  name: string;
  fileName?: string;
  mimeType?: string;
  dataUrl?: string;
}

export interface ApplicantChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface ApplicantTimelineItem {
  label: string;
  status: string;
  date: string;
  note: string;
}

export interface ApplicantApplication {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  idNumber: string;
  institution: string;
  course: string;
  admissionNumber: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  parentNationalId?: string;
  disabilityStatus?: string;
  bankName: string;
  accountNumber: string;
  householdIncome: string;
  familyDependents: string;
  specialCircumstances: string;
  personalStatement: string;
  guardianNotes: string;
  levelType: 'high_school' | 'university' | 'primary_school';
  formOrLevel?: string;
  yearOfStudy?: string;
  documents: ApplicantDocument[];
  submitted: boolean;
  submittedAt: string;
  stage: string;
  lastSavedAt: string;
  progress: number;
  requiredDocuments: Array<{ key: string; label: string; required: boolean }>;
  awardAmount?: number;
  paymentDestination?: string;
  reviewNotes?: string;
  checklist: ApplicantChecklistItem[];
  timeline: ApplicantTimelineItem[];
}

export interface PortalLease {
  _id: string;
  leaseNumber: string;
  status: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  currency: string;
  depositAmount: number;
  depositPaid: boolean;
  paymentFrequency: string;
  paymentDueDay: number;
  terms: string;
  propertyName: string;
  unitNumber: string;
  propertyTenantName: string;
  isSigned: boolean;
  signedAt?: string;
}

export interface PortalPayment {
  _id: string;
  amount: number;
  currency: string;
  paymentDate: string;
  paymentMethod: string;
  paymentType: string;
  status: string;
  mpesaTransactionId: string;
  mpesaPhoneNumber: string;
  receiptNumber: string;
  paymentPeriod: string;
  propertyName: string;
  notes: string;
}

export interface PortalBalance {
  balance: number;
  totalPaid: number;
  totalDue: number;
  rentAmount: number;
  currency: string;
  overdueMonths: number;
}

export interface PortalDamage {
  _id: string;
  description: string;
  damageType: string;
  severity: string;
  status: string;
  location: string;
  notes: string;
  reportedDate: string;
  propertyName: string;
  createdAt?: string;
}

export interface ApplicantSupportStep {
  title: string;
  description: string;
  icon: string;
}

export interface MpesaStkResponse {
  message: string;
  checkoutRequestId: string;
  paymentId: string;
}
