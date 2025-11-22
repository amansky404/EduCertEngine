console.log('\n╔══════════════════════════════════════════════════════════════════════════╗');
console.log('║         🎯 COMPLETE PROJECT FUNCTIONALITY TEST                          ║');
console.log('╚══════════════════════════════════════════════════════════════════════════╝\n');

const BASE_URL = 'http://localhost:3000';

async function test() {
  let passed = 0, failed = 0;
  
  console.log('════════════════════════════════════════════════════════════════════════════════');
  console.log('  PHASE 1: AUTHENTICATION FLOW');
  console.log('════════════════════════════════════════════════════════════════════════════════\n');
  
  // 1. Register Super Admin
  const ts = Date.now();
  const superAdminRes = await fetch(`${BASE_URL}/api/auth/superadmin-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `sa${ts}@test.com`,
      password: 'Test@1234',
      name: 'Super Admin'
    })
  });
  const saData = await superAdminRes.json();
  if (superAdminRes.ok && saData.token) {
    console.log('✅ 1. Super Admin Registration [201]');
    passed++;
  } else {
    console.log('❌ 1. Super Admin Registration [FAIL]');
    failed++;
    return;
  }
  
  const superToken = saData.token;
  
  console.log('\n════════════════════════════════════════════════════════════════════════════════');
  console.log('  PHASE 2: UNIVERSITY MANAGEMENT');
  console.log('════════════════════════════════════════════════════════════════════════════════\n');
  
  // 2. Create University
  const uniRes = await fetch(`${BASE_URL}/api/university/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${superToken}`
    },
    body: JSON.stringify({
      name: `University ${ts}`,
      subdomain: `uni${ts}`,
      slug: `uni${ts}`,
      adminEmail: `admin${ts}@test.com`,
      adminPassword: 'Admin@1234',
      adminName: 'University Admin',
      primaryColor: '#3b82f6',
      secondaryColor: '#1e40af',
      qrEnabled: true
    })
  });
  const uniData = await uniRes.json();
  if (uniRes.ok && uniData.university) {
    console.log(`✅ 2. Create University [201] ID: ${uniData.university.id}`);
    passed++;
  } else {
    console.log(`❌ 2. Create University [${uniRes.status}] ${uniData.error || ''}`);
    failed++;
    return;
  }
  
  const universityId = uniData.university.id;
  const adminEmail = `admin${ts}@test.com`;
  
  // 3. Admin Login
  const loginRes = await fetch(`${BASE_URL}/api/auth/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: adminEmail,
      password: 'Admin@1234'
    })
  });
  const loginData = await loginRes.json();
  if (loginRes.ok && loginData.token) {
    console.log('✅ 3. Admin Login [200]');
    passed++;
  } else {
    console.log('❌ 3. Admin Login [FAIL]');
    failed++;
    return;
  }
  
  const adminToken = loginData.token;
  
  console.log('\n════════════════════════════════════════════════════════════════════════════════');
  console.log('  PHASE 3: TEMPLATE MANAGEMENT');
  console.log('════════════════════════════════════════════════════════════════════════════════\n');
  
  // 4. Create HTML Template
  const templateRes = await fetch(`${BASE_URL}/api/template/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      universityId: universityId,
      name: 'HTML Certificate',
      type: 'html',
      content: '<div style="text-align:center;padding:50px"><h1>Certificate</h1><p>{{studentName}}</p><p>{{course}}</p></div>',
      fields: [
        { name: 'studentName', type: 'text', required: true },
        { name: 'course', type: 'text', required: true }
      ]
    })
  });
  const templateData = await templateRes.json();
  if (templateRes.ok && templateData.template) {
    console.log(`✅ 4. Create HTML Template [201] ID: ${templateData.template.id}`);
    passed++;
  } else {
    console.log(`❌ 4. Create HTML Template [${templateRes.status}] ${templateData.error || ''}`);
    failed++;
  }
  
  const templateId = templateData.template?.id;
  
  // 5. List Templates
  const listTempRes = await fetch(`${BASE_URL}/api/template/list?universityId=${universityId}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const listTempData = await listTempRes.json();
  if (listTempRes.ok) {
    console.log(`✅ 5. List Templates [200] Count: ${listTempData.templates?.length || 0}`);
    passed++;
  } else {
    console.log('❌ 5. List Templates [FAIL]');
    failed++;
  }
  
  console.log('\n════════════════════════════════════════════════════════════════════════════════');
  console.log('  PHASE 4: STUDENT MANAGEMENT');
  console.log('════════════════════════════════════════════════════════════════════════════════\n');
  
  // 6. Add Student
  const studentRes = await fetch(`${BASE_URL}/api/student/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      universityId: universityId,
      name: 'Alice Johnson',
      email: `alice${ts}@test.com`,
      rollNumber: `ROLL${ts}`,
      course: 'Computer Science',
      batch: '2024'
    })
  });
  const studentData = await studentRes.json();
  if (studentRes.ok && studentData.student) {
    console.log(`✅ 6. Add Student [201] ID: ${studentData.student.id}`);
    passed++;
  } else {
    console.log(`❌ 6. Add Student [${studentRes.status}] ${studentData.error || ''}`);
    failed++;
  }
  
  const studentId = studentData.student?.id;
  
  // 7. List Students
  const listStudRes = await fetch(`${BASE_URL}/api/student/list?universityId=${universityId}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const listStudData = await listStudRes.json();
  if (listStudRes.ok) {
    console.log(`✅ 7. List Students [200] Count: ${listStudData.students?.length || 0}`);
    passed++;
  } else {
    console.log('❌ 7. List Students [FAIL]');
    failed++;
  }
  
  // 8. Search Students
  const searchRes = await fetch(`${BASE_URL}/api/student/search?universityId=${universityId}&query=Alice`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const searchData = await searchRes.json();
  if (searchRes.ok) {
    console.log(`✅ 8. Search Students [200] Found: ${searchData.students?.length || 0}`);
    passed++;
  } else {
    console.log('❌ 8. Search Students [FAIL]');
    failed++;
  }
  
  console.log('\n════════════════════════════════════════════════════════════════════════════════');
  console.log('  PHASE 5: DOCUMENT GENERATION');
  console.log('════════════════════════════════════════════════════════════════════════════════\n');
  
  // 9. Generate Document
  if (templateId && studentId) {
    const docRes = await fetch(`${BASE_URL}/api/document/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        templateId: templateId,
        studentId: studentId,
        universityId: universityId,
        data: {
          studentName: 'Alice Johnson',
          course: 'Computer Science'
        }
      })
    });
    const docData = await docRes.json();
    if (docRes.ok && docData.document) {
      console.log(`✅ 9. Generate Document [201] ID: ${docData.document.id}`);
      passed++;
    } else {
      console.log(`❌ 9. Generate Document [${docRes.status}] ${docData.error || ''}`);
      failed++;
    }
  } else {
    console.log('⏭️  9. Generate Document [SKIPPED] Missing template or student');
  }
  
  // 10. List Documents
  const listDocRes = await fetch(`${BASE_URL}/api/document/list?universityId=${universityId}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const listDocData = await listDocRes.json();
  if (listDocRes.ok) {
    console.log(`✅ 10. List Documents [200] Count: ${listDocData.documents?.length || 0}`);
    passed++;
  } else {
    console.log('❌ 10. List Documents [FAIL]');
    failed++;
  }
  
  console.log('\n════════════════════════════════════════════════════════════════════════════════');
  console.log('  FINAL RESULTS');
  console.log('════════════════════════════════════════════════════════════════════════════════\n');
  
  const total = passed + failed;
  const percentage = ((passed / total) * 100).toFixed(1);
  
  console.log(`📊 Test Results:`);
  console.log(`   ✅ Passed: ${passed}/${total} (${percentage}%)`);
  console.log(`   ❌ Failed: ${failed}/${total}`);
  console.log(``);
  
  if (percentage >= 90) {
    console.log('🎉 EXCELLENT! Project is fully functional!');
  } else if (percentage >= 70) {
    console.log('✅ GOOD! Most features are working!');
  } else if (percentage >= 50) {
    console.log('⚠️  FAIR! Core features working, some need fixes!');
  } else {
    console.log('❌ NEEDS WORK! Several features need attention!');
  }
  
  console.log('\n════════════════════════════════════════════════════════════════════════════════\n');
}

test().catch(console.error);
