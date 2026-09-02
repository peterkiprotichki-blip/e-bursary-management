import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { TenantPortalService } from '../shared/services/tenant-portal.service';
import { TenantPortalAuthService } from '../shared/services/tenant-portal-auth.service';
import { FileUploadService } from '../shared/services/file-upload.service';
import { ApplicantApplication, ApplicantDocument } from '../shared/interfaces/portal.interfaces';

interface DocSlot {
  key: string;
  label: string;
  max: number;
}

@Component({
  selector: 'app-portal-lease',
  templateUrl: './portal-lease.component.html',
  styleUrls: ['./portal-lease.component.scss'],
})
export class PortalLeaseComponent implements OnInit {
  application: ApplicantApplication | null = null;
  form: FormGroup;
  requiredDocs: ApplicantDocument[] = [];
  loading = true;
  saving = false;
  submitted = false;
  error = '';
  success = '';
  viewMode: 'list' | 'edit' = 'list';
  bursaryOpen = true;

  docSlots: DocSlot[] = [];

  documentPreviews = new Map<string, string[]>();
  uploadingDocs = new Map<string, boolean>();
  uploadErrors = new Map<string, string>();

  levelType: 'university' | 'high_school' | 'primary_school' | null = null;

  constructor(
    private fb: FormBuilder,
    private portalService: TenantPortalService,
    private auth: TenantPortalAuthService,
    private fileUpload: FileUploadService,
  ) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      idNumber: ['', Validators.required],
      levelType: ['', Validators.required],
      institution: ['', Validators.required],
      admissionNumber: ['', Validators.required],
      course: [''],
      yearOfStudy: [''],
      formOrLevel: [''],
      parentName: [''],
      parentPhone: [''],
      parentEmail: [''],
      parentNationalId: [''],
      disabilityStatus: ['No'],
      bankName: ['', Validators.required],
      accountNumber: ['', Validators.required],
      personalStatement: ['', Validators.required],
      guardianNotes: [''],
    });
  }

  ngOnInit() {
    this.bursaryOpen = this.auth.isBursaryOpen();
    this.form.get('levelType')?.valueChanges.subscribe((val) => {
      if (val) {
        this.levelType = val;
        this.updateValidators(val);
        this.setDocSlots(val);
      }
    });
    this.load();
  }

  selectLevel(level: 'university' | 'high_school' | 'primary_school') {
    this.levelType = level;
    this.form.patchValue({ levelType: level });
    this.updateValidators(level);
    this.setDocSlots(level);
  }

  startNewApplication() {
    if (!this.bursaryOpen) return;
    this.error = '';
    this.success = '';
    this.levelType = null;
    this.form.reset();

    const profile = this.auth.getProfile();
    if (profile) {
      this.form.patchValue({
        fullName: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        idNumber: profile.idNumber || '',
      });
    }

    this.documentPreviews.clear();
    this.uploadErrors.clear();
    this.viewMode = 'edit';
  }

  editApplication() {
    if (!this.bursaryOpen || this.application?.submitted) return;
    this.error = '';
    this.success = '';
    if (!this.levelType) {
      this.form.reset();
      const profile = this.auth.getProfile();
      if (profile) {
        this.form.patchValue({
          fullName: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          idNumber: profile.idNumber || '',
        });
      }
      this.documentPreviews.clear();
      this.uploadErrors.clear();
    }
    this.viewMode = 'edit';
  }

  backToList() {
    this.viewMode = 'list';
    this.submitted = false;
    this.error = '';
    this.load();
  }

  updateValidators(level: string) {
    const courseCtrl = this.form.get('course');
    const yearOfStudyCtrl = this.form.get('yearOfStudy');
    const formOrLevelCtrl = this.form.get('formOrLevel');
    const idNumberCtrl = this.form.get('idNumber');
    const parentEmailCtrl = this.form.get('parentEmail');
    const parentNationalIdCtrl = this.form.get('parentNationalId');
    const parentNameCtrl = this.form.get('parentName');
    const parentPhoneCtrl = this.form.get('parentPhone');

    if (level === 'high_school' || level === 'primary_school') {
      courseCtrl?.clearValidators();
      yearOfStudyCtrl?.clearValidators();
      formOrLevelCtrl?.setValidators([Validators.required]);
      idNumberCtrl?.clearValidators();
      parentEmailCtrl?.setValidators([Validators.required, Validators.email]);
      parentNationalIdCtrl?.setValidators([Validators.required]);
      parentNameCtrl?.setValidators([Validators.required]);
      parentPhoneCtrl?.clearValidators();
    } else {
      courseCtrl?.setValidators([Validators.required]);
      yearOfStudyCtrl?.setValidators([Validators.required]);
      formOrLevelCtrl?.clearValidators();
      idNumberCtrl?.setValidators([Validators.required]);
      parentEmailCtrl?.clearValidators();
      parentNationalIdCtrl?.clearValidators();
      parentNameCtrl?.clearValidators();
      parentPhoneCtrl?.clearValidators();
    }

    courseCtrl?.updateValueAndValidity({ emitEvent: false });
    yearOfStudyCtrl?.updateValueAndValidity({ emitEvent: false });
    formOrLevelCtrl?.updateValueAndValidity({ emitEvent: false });
    idNumberCtrl?.updateValueAndValidity({ emitEvent: false });
    parentEmailCtrl?.updateValueAndValidity({ emitEvent: false });
    parentNationalIdCtrl?.updateValueAndValidity({ emitEvent: false });
    parentNameCtrl?.updateValueAndValidity({ emitEvent: false });
    parentPhoneCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  private focusFirstInvalidControl() {
    const firstInvalid = Object.keys(this.form.controls).find((name) => this.form.get(name)?.invalid);
    if (!firstInvalid) return;

    const element = document.querySelector(`[formControlName="${firstInvalid}"]`) as HTMLElement | null;
    if (!element) return;

    element.focus();
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  load() {
    this.loading = true;
    this.portalService.getApplication().subscribe({
      next: (application) => {
        this.application = application;
        this.submitted = Boolean(application.submitted);
        this.requiredDocs = (application.requiredDocuments || []).map((doc) => ({ name: doc.label }));

        this.docSlots.forEach((slot) => {
          const urls = (application.documents || [])
            .filter((d) => d.name === slot.key && d.dataUrl)
            .map((d) => d.dataUrl!);
          if (urls.length) {
            this.documentPreviews.set(slot.key, urls);
          }
        });

        const existingLevel = application.levelType || '';
        if (existingLevel && (existingLevel === 'university' || existingLevel === 'high_school' || existingLevel === 'primary_school')) {
          this.levelType = existingLevel;
          this.updateValidators(existingLevel);
          this.setDocSlots(existingLevel);
        }
        const profile = this.auth.getProfile();
        this.form.patchValue({
          fullName: application.fullName || profile?.name || '',
          phone: application.phone || profile?.phone || '',
          email: application.email || profile?.email || '',
          idNumber: application.idNumber || profile?.idNumber || '',
          levelType: existingLevel,
          institution: application.institution,
          admissionNumber: application.admissionNumber,
          course: application.course,
          yearOfStudy: application.yearOfStudy,
          formOrLevel: application.formOrLevel,
          parentName: application.parentName,
          parentPhone: application.parentPhone,
          parentEmail: application.parentEmail,
          parentNationalId: application.parentNationalId,
          disabilityStatus: application.disabilityStatus || 'No',
          bankName: application.bankName,
          accountNumber: application.accountNumber,
          personalStatement: application.personalStatement,
          guardianNotes: application.guardianNotes,
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Unable to load application.';
        this.loading = false;
      },
    });
  }

  private setDocSlots(level: string) {
    this.docSlots = level === 'high_school' || level === 'primary_school'
      ? [
          { key: 'passport-photo', label: 'Student passport photo', max: 1 },
          { key: 'fee-structure', label: 'School fee structure', max: 1 },
        ]
      : [
          { key: 'national-id', label: 'National ID / Passport', max: 1 },
          { key: 'fee-structure', label: 'Fee structure', max: 1 },
          { key: 'course-details', label: 'Course registration / details', max: 1 },
          { key: 'passport-photo', label: 'Passport photo', max: 1 },
        ];
  }

  saveDraft() {
    this.saving = true;
    this.error = '';
    this.portalService.saveApplication(this.form.value).subscribe({
      next: (application) => {
        this.application = application;
        this.success = 'Application draft saved.';
        this.saving = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Could not save your draft.';
        this.saving = false;
      },
    });
  }

  submitApplication() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalidControl();
      this.error = 'Please complete all required fields before submitting.';
      return;
    }

    this.saving = true;
    this.error = '';
    this.portalService.saveApplication(this.form.value).pipe(
      switchMap(() => this.portalService.submitApplication()),
    ).subscribe({
      next: (application) => {
        this.application = application;
        this.submitted = true;
        this.success = 'Application submitted successfully.';
        this.saving = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Could not submit your application.';
        this.saving = false;
      },
    });
  }

  onDocumentChange(event: Event, key: string) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const slot = this.docSlots.find((s) => s.key === key);
    const currentCount = (this.documentPreviews.get(key) || []).length;
    if (slot && currentCount >= slot.max) {
      this.uploadErrors.set(key, `Maximum ${slot.max} image(s) allowed for ${slot.label}.`);
      input.value = '';
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      this.uploadErrors.set(key, 'Only JPEG, PNG, GIF, WebP, or PDF files are supported.');
      input.value = '';
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.uploadErrors.set(key, 'File exceeds the 10 MB size limit.');
      input.value = '';
      return;
    }

    this.uploadErrors.delete(key);
    this.uploadingDocs.set(key, true);

    this.fileUpload.uploadFile(file).subscribe({
      next: (imageUrl) => {
        this.uploadingDocs.set(key, false);

        const existing = this.documentPreviews.get(key) || [];
        this.documentPreviews.set(key, [...existing, imageUrl]);

        const otherDocs = (this.application?.documents || []).filter((doc) => doc.name !== key);
        const slotDocs = this.documentPreviews.get(key) || [];
        const allDocs = [
          ...otherDocs,
          ...slotDocs.map((url) => ({ name: key, fileName: file.name, mimeType: file.type, dataUrl: url })),
        ];

        this.portalService.saveApplication({ ...this.form.value, documents: allDocs }).subscribe({
          next: (application) => {
            this.application = application;
            input.value = '';
          },
          error: () => {
            this.uploadErrors.set(key, 'Uploaded to ImgBB but failed to save to your application. Please try again.');
          },
        });
      },
      error: (err) => {
        this.uploadingDocs.set(key, false);
        this.uploadErrors.set(key, (err as Error)?.message || 'Image upload failed. Please try again.');
        input.value = '';
      },
    });
  }

  removeDocument(key: string, index: number) {
    const urls = this.documentPreviews.get(key) || [];
    urls.splice(index, 1);
    if (urls.length) {
      this.documentPreviews.set(key, urls);
    } else {
      this.documentPreviews.delete(key);
    }
    this.uploadErrors.delete(key);

    const otherDocs = (this.application?.documents || []).filter((doc) => doc.name !== key);
    const slotDocs = this.documentPreviews.get(key) || [];
    const allDocs = [
      ...otherDocs,
      ...slotDocs.map((url) => ({ name: key, dataUrl: url }) as ApplicantDocument),
    ];

    this.portalService.saveApplication({ ...this.form.value, documents: allDocs }).subscribe({
      next: (application) => (this.application = application),
      error: () => {},
    });
  }

  slotCount(key: string): number {
    return (this.documentPreviews.get(key) || []).length;
  }

  slotMax(key: string): number {
    return this.docSlots.find((s) => s.key === key)?.max ?? 4;
  }

  slotName(key: string): string {
    return this.docSlots.find((s) => s.key === key)?.label ?? key;
  }
}
