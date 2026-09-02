/**
 * Complete Database Seed Script for E-Bursary Management System
 * 
 * Seeds:
 *   1. Organization: "County Bursary Fund"
 *   2. Super Admin: superadmin@e-bursary.co.ke / SuperAdmin@2026
 *   3. Portal tenant: tenant.test@e-bursary.co.ke / Tenant@1234
 *   4. Four lifecycled applicants:
 *        - Kiprotich Kirui (kiprotichkirui301@gmail.com / Kiprotich@2026) -> Awarded & Disbursed
 *        - Jane Chepngetich (jane.test@e-bursary.co.ke / Jane@1234) -> Submitted (Pending Vetting)
 *        - Emmanuel Kipkemoi (emmanuel.test@e-bursary.co.ke / Emmanuel@1234) -> Rejected
 *        - Peter Kipkoech (peter.test@e-bursary.co.ke / Peter@1234) -> In Review
 *   5. Disbursed transaction history logs.
 * 
 * Usage: node seed-bursary.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const schema = (col) =>
  mongoose.model(col + '__seed', new mongoose.Schema({}, { strict: false, collection: col }));

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/e-bursary';
  console.log('Connecting to MongoDB at:', uri);
  await mongoose.connect(uri);
  console.log('✔ Connected to MongoDB');

  const OrgM = schema('tenants');
  const UserM = schema('e-bursarycusers');
  const ApplicantM = schema('propertytenants');
  const LeaseM = schema('leases');
  const PaymentM = schema('payments');

  // Clean old seed records
  console.log('Clearing old database records...');
  await OrgM.deleteMany({ name: 'County Bursary Fund' });
  await UserM.deleteMany({ email: { $in: ['superadmin@e-bursary.co.ke', 'tenant.test@e-bursary.co.ke'] } });
  await ApplicantM.deleteMany({ email: { $in: ['kiprotichkirui301@gmail.com', 'jane.test@e-bursary.co.ke', 'emmanuel.test@e-bursary.co.ke', 'peter.test@e-bursary.co.ke'] } });
  await LeaseM.deleteMany({ tenantEmail: { $in: ['kiprotichkirui301@gmail.com', 'jane.test@e-bursary.co.ke', 'emmanuel.test@e-bursary.co.ke', 'peter.test@e-bursary.co.ke'] } });
  await PaymentM.deleteMany({ propertyTenantName: { $in: ['Kiprotich Kirui', 'Jane Chepngetich', 'Emmanuel Kipkemoi', 'Peter Kipkoech'] } });

  /* 1. Create Organization */
  const org = await OrgM.create({
    name: 'County Bursary Fund',
    slug: 'county-bursary-fund',
    email: 'info@county-bursary.go.ke',
    phone: '020-200300',
    address: 'Governor\'s Office Complex, Nairobi',
    plan: 'enterprise',
    isActive: true,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const orgId = org._id.toString();
  console.log('✔ Organization seeded:', org.name, `(${orgId})`);

  /* 2. Create Users */
  const superAdminHash = await bcrypt.hash('SuperAdmin@2026', 10);
  const tenantUserHash = await bcrypt.hash('Tenant@1234', 10);

  const superAdmin = await UserM.create({
    name: 'County Admin Director',
    email: 'superadmin@e-bursary.co.ke',
    password: superAdminHash,
    role: 'super_admin',
    permissions: ['view_dashboard', 'view_reports', 'view_users'],
    isEmailVerified: true,
    isApproved: true,
    isActive: true,
    isDeleted: false,
    authProvider: 'credentials',
    tenantIds: [orgId],
    activeTenantId: orgId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log('✔ Super Admin seeded: superadmin@e-bursary.co.ke');

  const tenantUser = await UserM.create({
    name: 'Bursary Board Officer',
    email: 'tenant.test@e-bursary.co.ke',
    password: tenantUserHash,
    role: 'admin',
    permissions: ['view_dashboard', 'view_reports'],
    isEmailVerified: true,
    isApproved: true,
    isActive: true,
    isDeleted: false,
    authProvider: 'credentials',
    tenantIds: [orgId],
    activeTenantId: orgId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log('✔ Tenant Admin seeded: tenant.test@e-bursary.co.ke');

  /* 3. Create Applicants */
  const kiprotichHash = await bcrypt.hash('Kiprotich@2026', 10);
  const janeHash = await bcrypt.hash('Jane@1234', 10);
  const emmanuelHash = await bcrypt.hash('Emmanuel@1234', 10);
  const peterHash = await bcrypt.hash('Peter@1234', 10);

  // Applicant 1: Kiprotich Kirui (Awarded & Disbursed)
  const kiprotich = await ApplicantM.create({
    tenantId: orgId,
    name: 'Kiprotich Kirui',
    email: 'kiprotichkirui301@gmail.com',
    phone: '0712345699',
    idNumber: 'KE3940192',
    isActive: true,
    isDeleted: false,
    portalPassword: kiprotichHash,
    portalPasswordSet: true,
    portalInviteTokenUsed: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      applicantPortal: {
        fullName: 'Kiprotich Kirui',
        email: 'kiprotichkirui301@gmail.com',
        phone: '0712345699',
        idNumber: 'KE3940192',
        levelType: 'university',
        institution: 'Kenyatta University',
        admissionNumber: 'KU/49102/2023',
        course: 'BSc. Civil Engineering',
        yearOfStudy: 'Year 3',
        parentName: 'David Kirui',
        parentPhone: '0722300400',
        householdIncome: '25,000 KES',
        familyDependents: '5',
        specialCircumstances: 'Orphaned (Single Parent household, farming income only)',
        personalStatement: 'I am in my third year of study pursuing civil engineering. I need assistance in clearing my tuition balance so I can write my final semester exams.',
        submitted: true,
        submittedAt: new Date(),
        progress: 100,
        stage: 'awarded',
        reviewNotes: 'Deserving applicant, verified documents.',
        awardAmount: 45000,
        paymentDestination: 'Direct to Institution (Cooperative Bank Account)',
        documents: [
          {
            name: 'national-id',
            fileName: 'national_id_card.png',
            mimeType: 'image/png',
            dataUrl: 'https://i.ibb.co/VvZ3XvY/national-id.png'
          },
          {
            name: 'fee-statement',
            fileName: 'fee_statement_ku.png',
            mimeType: 'image/png',
            dataUrl: 'https://i.ibb.co/6P93w5n/fee-statement.png'
          },
          {
            name: 'admission-letter',
            fileName: 'admission_letter.png',
            mimeType: 'image/png',
            dataUrl: 'https://i.ibb.co/Lvb8t1f/admission-letter.png'
          }
        ]
      }
    }
  });

  // Applicant 2: Jane Chepngetich (Submitted - Pending Vetting)
  const jane = await ApplicantM.create({
    tenantId: orgId,
    name: 'Jane Chepngetich',
    email: 'jane.test@e-bursary.co.ke',
    phone: '0722888999',
    idNumber: 'KE8810293',
    isActive: true,
    isDeleted: false,
    portalPassword: janeHash,
    portalPasswordSet: true,
    portalInviteTokenUsed: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      applicantPortal: {
        fullName: 'Jane Chepngetich',
        email: 'jane.test@e-bursary.co.ke',
        phone: '0722888999',
        idNumber: 'KE8810293',
        levelType: 'university',
        institution: 'University of Nairobi',
        admissionNumber: 'UON/MED/3910/2024',
        course: 'Bachelor of Medicine & Surgery',
        yearOfStudy: 'Year 2',
        parentName: 'David Chepngetich',
        parentPhone: '0722888888',
        householdIncome: '18,000 KES',
        familyDependents: '6',
        specialCircumstances: 'Parents are low-income casual laborers.',
        personalStatement: 'I am a second-year medical student. My family lives on subsistence farming and small market retail. This bursary will keep me in school.',
        submitted: true,
        submittedAt: new Date(),
        progress: 100,
        stage: 'submitted',
        documents: [
          {
            name: 'national-id',
            fileName: 'jane_id.png',
            mimeType: 'image/png',
            dataUrl: 'https://i.ibb.co/VvZ3XvY/national-id.png'
          },
          {
            name: 'fee-statement',
            fileName: 'fee_statement_uon.png',
            mimeType: 'image/png',
            dataUrl: 'https://i.ibb.co/6P93w5n/fee-statement.png'
          }
        ]
      }
    }
  });

  // Applicant 3: Emmanuel Kipkemoi (Rejected)
  const emmanuel = await ApplicantM.create({
    tenantId: orgId,
    name: 'Emmanuel Kipkemoi',
    email: 'emmanuel.test@e-bursary.co.ke',
    phone: '0722444555',
    idNumber: 'KE9912048',
    isActive: true,
    isDeleted: false,
    portalPassword: emmanuelHash,
    portalPasswordSet: true,
    portalInviteTokenUsed: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      applicantPortal: {
        fullName: 'Emmanuel Kipkemoi',
        email: 'emmanuel.test@e-bursary.co.ke',
        phone: '0722444555',
        idNumber: 'KE9912048',
        levelType: 'high_school',
        institution: 'Kabianga High School',
        admissionNumber: 'ADM-8910',
        formOrLevel: 'Form 3',
        parentName: 'Richard Kipkemoi',
        parentPhone: '0722444555',
        householdIncome: '30,000 KES',
        familyDependents: '3',
        personalStatement: 'Secondary school funding assistance.',
        submitted: true,
        submittedAt: new Date(),
        progress: 100,
        stage: 'rejected',
        reviewNotes: 'Incomplete application — did not attach fee statement.',
        documents: [
          {
            name: 'national-id',
            fileName: 'parent_id.png',
            mimeType: 'image/png',
            dataUrl: 'https://i.ibb.co/VvZ3XvY/national-id.png'
          }
        ]
      }
    }
  });

  // Applicant 4: Peter Kipkoech (In Review)
  const peter = await ApplicantM.create({
    tenantId: orgId,
    name: 'Peter Kipkoech',
    email: 'peter.test@e-bursary.co.ke',
    phone: '0747789098',
    idNumber: 'KE2930281',
    isActive: true,
    isDeleted: false,
    portalPassword: peterHash,
    portalPasswordSet: true,
    portalInviteTokenUsed: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      applicantPortal: {
        fullName: 'Peter Kipkoech',
        email: 'peter.test@e-bursary.co.ke',
        phone: '0747789098',
        idNumber: 'KE2930281',
        levelType: 'university',
        institution: 'Jomo Kenyatta University',
        admissionNumber: 'JKU/ENG/2022',
        course: 'B.Eng. Electrical & Electronic',
        yearOfStudy: 'Year 4',
        parentName: 'Mercy Kipkoech',
        parentPhone: '0722999000',
        householdIncome: '12,000 KES',
        familyDependents: '4',
        personalStatement: 'Need support to complete my final year engineering project.',
        submitted: true,
        submittedAt: new Date(),
        progress: 85,
        stage: 'in_review',
        reviewNotes: 'Academic documents look solid. Reviewing household income claim.',
        documents: [
          {
            name: 'national-id',
            fileName: 'peter_id.png',
            mimeType: 'image/png',
            dataUrl: 'https://i.ibb.co/VvZ3XvY/national-id.png'
          }
        ]
      }
    }
  });

  /* 4. Seed Leases (Vetting Cycles) */
  const lease1 = await LeaseM.create({
    tenantId: orgId,
    propertyId: 'dummy-property-id',
    unitId: 'dummy-unit-id',
    propertyTenantId: kiprotich._id.toString(),
    tenantName: 'Kiprotich Kirui',
    tenantEmail: 'kiprotichkirui301@gmail.com',
    unitNumber: 'KU/49102/2023',
    propertyName: 'Direct to Institution (Cooperative Bank Account)',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    rentAmount: 45000,
    currency: 'KES',
    status: 'active',
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const lease2 = await LeaseM.create({
    tenantId: orgId,
    propertyId: 'dummy-property-id',
    unitId: 'dummy-unit-id',
    propertyTenantId: jane._id.toString(),
    tenantName: 'Jane Chepngetich',
    tenantEmail: 'jane.test@e-bursary.co.ke',
    unitNumber: 'UON/MED/3910/2024',
    propertyName: 'Pending Account Details',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    rentAmount: 35000,
    currency: 'KES',
    status: 'active',
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const lease3 = await LeaseM.create({
    tenantId: orgId,
    propertyId: 'dummy-property-id',
    unitId: 'dummy-unit-id',
    propertyTenantId: emmanuel._id.toString(),
    tenantName: 'Emmanuel Kipkemoi',
    tenantEmail: 'emmanuel.test@e-bursary.co.ke',
    unitNumber: 'ADM-8910',
    propertyName: 'Rejected',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    rentAmount: 0,
    currency: 'KES',
    status: 'active',
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const lease4 = await LeaseM.create({
    tenantId: orgId,
    propertyId: 'dummy-property-id',
    unitId: 'dummy-unit-id',
    propertyTenantId: peter._id.toString(),
    tenantName: 'Peter Kipkoech',
    tenantEmail: 'peter.test@e-bursary.co.ke',
    unitNumber: 'JKU/ENG/2022',
    propertyName: 'Direct to Institution',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    rentAmount: 30000,
    currency: 'KES',
    status: 'active',
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Link lease IDs back to applicants
  await ApplicantM.updateOne({ _id: kiprotich._id }, { $set: { currentLeaseId: lease1._id.toString() } });
  await ApplicantM.updateOne({ _id: jane._id }, { $set: { currentLeaseId: lease2._id.toString() } });
  await ApplicantM.updateOne({ _id: emmanuel._id }, { $set: { currentLeaseId: lease3._id.toString() } });
  await ApplicantM.updateOne({ _id: peter._id }, { $set: { currentLeaseId: lease4._id.toString() } });

  /* 5. Seed Disbursement History */
  await PaymentM.create({
    tenantId: orgId,
    leaseId: lease1._id.toString(),
    propertyTenantId: kiprotich._id.toString(),
    propertyId: 'dummy-property-id',
    amount: 45000,
    currency: 'KES',
    paymentDate: new Date(),
    paymentMethod: 'bank_transfer',
    paymentType: 'other',
    status: 'completed',
    receiptNumber: `DISB-${Date.now().toString(36).toUpperCase()}`,
    paymentPeriod: '2026',
    notes: 'Bursary Allocation: Deserving applicant, verified documents.',
    propertyName: 'Direct to Institution (Cooperative Bank Account)',
    propertyTenantName: 'Kiprotich Kirui',
    recordedBy: tenantUser._id.toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('✔ Disbursement record seeded for Kiprotich Kirui');

  console.log('\n======================================================');
  console.log('  E-BURSARY DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  console.log('======================================================');
  console.log('  1. ADMIN SIDE (Super Admin Dashboard)');
  console.log('     URL      : http://localhost:4400/login');
  console.log('     Email    : superadmin@e-bursary.co.ke');
  console.log('     Password : SuperAdmin@2026');
  console.log('  2. APPLICANT PORTAL LOGIN');
  console.log('     URL      : http://localhost:4400/applicant-portal/login');
  console.log('     Student 1: kiprotichkirui301@gmail.com / Kiprotich@2026 (Awarded)');
  console.log('     Student 2: jane.test@e-bursary.co.ke / Jane@1234 (Submitted)');
  console.log('     Student 3: peter.test@e-bursary.co.ke / Peter@1234 (In Review)');
  console.log('     Student 4: emmanuel.test@e-bursary.co.ke / Emmanuel@1234 (Rejected)');
  console.log('======================================================\n');

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('✘ Seed failed:', err.message);
  process.exit(1);
});
