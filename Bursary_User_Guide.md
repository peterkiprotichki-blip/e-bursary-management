# E-Bursary Management System - User & Administrator Guide

Welcome to the **E-Bursary Management System**. This guide provides step-by-step instructions on how to use the Applicant Portal (for students) and the Main Admin Portal (for program administrators).

---

## 1. Student / Applicant Portal Guide

The **Applicant Portal** allows secondary school and university students to apply for funding support, upload verify documents, save drafts, and track progress.

### 🔑 Portal Login
- **URL**: `http://localhost:4200/applicant-portal/login`
- **Default Seeded Account**:
  - **Email**: `kiprotichkirui301@gmail.com`
  - **Password**: `Kiprotich@2026`

---

### 📝 Step-by-Step Application Steps

#### Step 1: Education Level Selector
1. Click **Apply Now** from the student sidebar.
2. Select your study category:
   - **Secondary / High School**
   - **University / College**
3. The system will dynamically load relevant forms (e.g. *Course & Year of Study* for tertiary levels, and *Form Level* for secondary levels).

#### Step 2: Personal & Academic Details
1. Enter your **Full Name**, **National ID Number**, **Phone Number**, and **Email**.
2. Provide your active **Institution Name** and your **Admission Number**.

#### Step 3: Household & Parent/Guardian Details
1. Provide your **Parent/Guardian Name** and **Phone Number**.
2. Enter your **Monthly Household Income (KES)** and count of **Family Dependents**.
3. Detail any **Special Circumstances** (e.g. Orphaned, disabled parent, chronic illness).
4. Write a brief **Personal Statement** detailing why you are deserving of bursary funding.

#### Step 4: Multi-Image Document Uploads (ImgBB API)
1. You must upload supporting files under the designated slots:
   - **National ID / Passport** (both student and parent/guardian)
   - **Admission Letter**
   - **Fee Statement**
2. Click **Choose Files** (you can select and upload **multiple images** at once).
3. The upload will start automatically showing a loading spinner.
4. Once completed, a thumbnail card preview will render. Hover over files to inspect them, or click the **Trash Can Icon** to remove any duplicate files.
5. All images are securely stored in the cloud using the ImgBB hosting service.

#### Step 5: Save Draft vs. Submit
- **Save Draft**: Saves all text and document states. You can log out and resume editing at any time.
- **Submit Application**: Submits your application for committee review. 
  - *Note*: Once submitted, your application locks into **Read-Only Mode** to preserve document integrity.

#### Step 6: Vetting Status & Invoicing
- Go to the **Invoice / Status** panel in your sidebar.
- You will see a status tracking block. Once the admin takes action, this panel dynamically turns into:
  - 🎉 **Green Award Widget**: Shows the awarded amount, payment destination channel, and committee review notes.
  - ❌ **Red Rejection Widget**: Displays the reason for rejection (e.g. *Missing Fee Statement*).

---

## 2. Administrator & Vetting Portal Guide

The **Main Admin Portal** allows board officers to manage funding programs, review student profiles, audit uploaded documents, and track disbursement logs.

### 🔑 Portal Login
- **URL**: `http://localhost:4200/login`
- **Default Seeded Accounts**:
  - **Super Admin**: `superadmin@e-bursary.co.ke` / `SuperAdmin@2026`
  - **Tenant Officer**: `tenant.test@e-bursary.co.ke` / `Tenant@1234`

---

### 🏛️ Dashboard Overviews

- **Applicants**: Lists all registered student accounts, emails, phones, and education level tags.
- **Programs**: Create, update, or close bursary schemes (e.g. *University STEM Scholar Round*). Tracks total budgets against active allocations.
- **Allocations**: Computes live splits (University vs High School total spend shares) and sums up distribution counts grouped by target institutions.
- **Documents**: Aggregates all uploaded student documents into a central central review gallery. Click on any file to inspect it in full screen.
- **Reports**: Displays charts showing monthly disbursement flows, approval rates, and application pipelines.

---

### 🗳️ Vetting Applications (Review, Award, Reject)

1. Go to the **Applications** page in the admin sidebar.
2. Search or filter through the list of submitted student applications.
3. Click the **View** button in the actions column:
   - This opens a modal displaying **all details** filled out by the applicant (personal metrics, parent contacts, household income, statement, and document attachments).
   - Click any thumbnail in the document verification grid to open it in a **zoom lightbox**.
4. To take action, click one of the buttons at the bottom of the viewer:
   - **Review**: Puts the application in review status while checking details.
   - **Award**: Opens the award panel. Input the **Award Amount (KES)** and select the **Payment Channel** (e.g., *Direct to School Co-op Bank Account*). Click **Submit Decision**.
     - *Note*: Awarding an application automatically generates a completed transaction log in the **Disbursement** section.
   - **Reject**: Opens the reject panel. Input the rejection reason and click **Submit Decision**.

---

## 3. Database Seeding Script

If you want to clear your current database and populate it with four lifecycled test students (Draft, Pending Review, Awarded, Rejected), run the following:

```bash
# 1. Open a terminal in the backend project
cd E-bursary-backend

# 2. Run the seed script
node seed-bursary.js
```
This script populates all collections (tenants, propertytenants, payments, leases, and users) with sample bursary data for testing.
