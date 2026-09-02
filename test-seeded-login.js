const http = require('http');

function testLogin(email, password) {
  const payload = JSON.stringify({ email, password });
  
  const req = http.request('http://localhost:3400/api/applicant-portal/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log(`\n✓ Login successful for ${email}`);
        console.log(`  Name: ${data.profile.name}`);
        console.log(`  Stage: ${data.profile.metadata.applicantPortal.stage}`);
        console.log(`  Progress: ${data.profile.metadata.applicantPortal.progress}%`);
        console.log(`  Submitted: ${data.profile.metadata.applicantPortal.submitted}`);
        console.log(`  Level: ${data.profile.metadata.applicantPortal.levelType}`);
      } catch(e) {
        console.error(`✗ Parse error: ${e.message}`);
      }
    });
  });

  req.on('error', err => console.error(`✗ Request error: ${err.message}`));
  req.write(payload);
  req.end();
}

// Test seeded accounts
console.log('Testing Seeded Applicant Accounts...');
testLogin('jane.test@e-bursary.co.ke', 'Jane@1234');

setTimeout(() => {
  testLogin('peter.test@e-bursary.co.ke', 'Peter@1234');
}, 500);

setTimeout(() => {
  testLogin('kiprotichkirui301@gmail.com', 'Kiprotich@2026');
}, 1000);
