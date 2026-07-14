const BASE_URL = 'http://localhost:3400/api';

async function test() {
  console.log('=== Starting E2E Bursary Management Workflow Test ===\n');

  // 1. Applicant Login
  console.log('1. Logging in as applicant...');
  const appLoginRes = await fetch(`${BASE_URL}/applicant-portal/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'kiprotichkirui301@gmail.com',
      password: 'Kiprotich@2026'
    })
  });
  if (!appLoginRes.ok) {
    throw new Error(`Applicant login failed: ${await appLoginRes.text()}`);
  }
  const appLoginData = await appLoginRes.json();
  const applicantToken = appLoginData.token || appLoginData.accessToken;
  console.log('✔ Applicant logged in successfully. Token received.\n');

  // 2. Fetch / Save application details
  console.log('2. Fetching applicant portal state...');
  const appStateRes = await fetch(`${BASE_URL}/applicant-portal/application`, {
    headers: { 'Authorization': `Bearer ${applicantToken}` }
  });
  if (!appStateRes.ok) {
    throw new Error(`Failed to fetch application state: ${await appStateRes.text()}`);
  }
  const application = await appStateRes.json();
  console.log('✔ Fetched current application state:', {
    id: application._id,
    fullName: application.fullName,
    stage: application.stage,
    submitted: application.submitted
  });

  // Save changes to application
  console.log('Saving application details...');
  const saveRes = await fetch(`${BASE_URL}/applicant-portal/application`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${applicantToken}`
    },
    body: JSON.stringify({
      fullName: 'Kiprotich Kirui',
      idNumber: '38927110',
      levelType: 'university',
      admissionNumber: 'ADM-2026-X',
      institution: 'Kabarak University',
      course: 'BSc. Computer Science',
      parentName: 'Jane Kirui',
      parentPhone: '0712345699',
      parentEmail: 'jane.kirui@gmail.com',
      parentNationalId: '29881177',
      bankName: 'Cooperative Bank',
      accountNumber: '01129388172600',
      householdIncome: 'Below KES 15,000',
      familyDependents: '4',
      personalStatement: 'This is a personal statement detailing why I should be awarded the bursary to complete my studies.',
      documents: [
        { name: 'national-id', fileName: 'national-id.pdf' },
        { name: 'fee-statement', fileName: 'fee-statement.pdf' },
        { name: 'admission-letter', fileName: 'admission-letter.pdf' }
      ]
    })
  });
  if (!saveRes.ok) {
    throw new Error(`Failed to save application: ${await saveRes.text()}`);
  }
  const savedApp = await saveRes.json();
  console.log('✔ Application saved successfully. Progress:', savedApp.progress, '%\n');

  // 3. Submit application
  console.log('3. Submitting applicant portal application...');
  const submitRes = await fetch(`${BASE_URL}/applicant-portal/application/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${applicantToken}`
    }
  });
  if (!submitRes.ok) {
    console.log('⚠ Application submission response (checking if duplicate block worked):');
    const errText = await submitRes.text();
    console.log(`Response status: ${submitRes.status}, Body: ${errText}`);
  } else {
    const submittedData = await submitRes.json();
    console.log('✔ Application submitted successfully. Stage:', submittedData.stage);
  }
  console.log();

  // 4. Admin Login
  console.log('4. Logging in as Super Admin...');
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'superadmin@e-bursary.co.ke',
      password: 'SuperAdmin@2026'
    })
  });
  if (!adminLoginRes.ok) {
    throw new Error(`Admin login failed: ${await adminLoginRes.text()}`);
  }
  const adminLoginData = await adminLoginRes.json();
  const adminToken = adminLoginData.token || adminLoginData.accessToken;
  console.log('✔ Super Admin logged in successfully.\n');

  // 5. Get applications in Admin view
  console.log('5. Listing all applications on the Admin Portal...');
  const listAppsRes = await fetch(`${BASE_URL}/bursary/applications`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  if (!listAppsRes.ok) {
    throw new Error(`Failed to list applications: ${await listAppsRes.text()}`);
  }
  const appsList = await listAppsRes.json();
  const targetApp = appsList.find(a => a.email === 'kiprotichkirui301@gmail.com');
  if (!targetApp) {
    throw new Error('Could not find the target seeded applicant application in the admin portal list.');
  }
  console.log(`✔ Found target application: ${targetApp.fullName} (ID: ${targetApp._id}, Stage: ${targetApp.stage})\n`);

  // 6. Vetting decision modal update: Award stage
  console.log('6. Processing Vetting Decision: Awarding Bursary...');
  const awardRes = await fetch(`${BASE_URL}/bursary/applications/${targetApp._id}/stage`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      stage: 'awarded',
      awardAmount: 45000,
      paymentDestination: 'Direct to Institution (Cooperative Bank Account)',
      reviewNotes: 'Deserving applicant, verified documents.'
    })
  });
  if (!awardRes.ok) {
    throw new Error(`Failed to award application: ${await awardRes.text()}`);
  }
  const awardedApp = await awardRes.json();
  console.log('✔ Application stage successfully updated:', {
    id: awardedApp._id,
    stage: awardedApp.stage,
    awardAmount: awardedApp.awardAmount,
    paymentDestination: awardedApp.paymentDestination,
    reviewNotes: awardedApp.reviewNotes
  });
  console.log();

  // 7. Verify Auto-disbursement creation in payment history
  console.log('7. Verifying automatic disbursement generation in Payment History...');
  const paymentsRes = await fetch(`${BASE_URL}/payments`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  if (!paymentsRes.ok) {
    throw new Error(`Failed to list payments: ${await paymentsRes.text()}`);
  }
  const paymentsListRes = await paymentsRes.json();
  console.log('Returned payments:', paymentsListRes);
  const payments = paymentsListRes.data || paymentsListRes;
  const autoPayment = payments.find(p => p.amount === 45000 && p.notes.includes('Bursary'));
  if (!autoPayment) {
    throw new Error('❌ FAILED: Auto-generated disbursement payment not found in payments collection.');
  }
  console.log('✔ SUCCESS: Found auto-generated disbursement payment:', {
    _id: autoPayment._id,
    amount: autoPayment.amount,
    status: autoPayment.status,
    notes: autoPayment.notes
  });
  console.log('\n=== E2E Bursary Management Workflow Test Completed Successfully! ===');
}

test().catch(err => {
  console.error('\n❌ Test execution failed:', err);
  process.exit(1);
});
