#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000';

async function testFullFlow() {
  console.log('🚀 Testing Full Template Flow\n');
  
  try {
    // Login
    console.log('1️⃣  Logging in...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/superadmin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@fix.com', password: 'admin123' })
    });
    
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('✅ Logged in successfully\n');

    // Get universities
    console.log('2️⃣  Fetching universities...');
    const univRes = await fetch(`${BASE_URL}/api/university/list`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const univData = await univRes.json();
    const university = univData.universities[0];
    console.log(`✅ Found university: ${university.name}\n`);

    // List existing templates
    console.log('3️⃣  Listing templates...');
    const listRes = await fetch(`${BASE_URL}/api/template/list`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const listData = await listRes.json();
    console.log(`✅ Found ${listData.templates.length} templates\n`);

    // Test each template type
    const templateIds = {};

    // HTML Template
    console.log('4️⃣  Testing HTML Template Builder...');
    const htmlRes = await fetch(`${BASE_URL}/api/template/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test HTML Certificate',
        description: 'HTML certificate template with rich text editor',
        type: 'HTML',
        qrEnabled: true,
        universityId: university.id
      })
    });
    const htmlData = await htmlRes.json();
    templateIds.html = htmlData.template.id;
    console.log(`✅ Created HTML template: ${templateIds.html}\n`);

    // PDF Mapper Template
    console.log('5️⃣  Testing PDF Mapper Template...');
    const pdfRes = await fetch(`${BASE_URL}/api/template/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test PDF Mapper Certificate',
        description: 'PDF template with field mapping',
        type: 'PDF_MAPPER',
        qrEnabled: true,
        universityId: university.id
      })
    });
    const pdfData = await pdfRes.json();
    templateIds.pdf = pdfData.template.id;
    console.log(`✅ Created PDF Mapper template: ${templateIds.pdf}\n`);

    // Direct Upload Template
    console.log('6️⃣  Testing Direct Upload Template...');
    const directRes = await fetch(`${BASE_URL}/api/template/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test Direct Upload Certificate',
        description: 'Direct upload bulk documents',
        type: 'DIRECT_UPLOAD',
        qrEnabled: false,
        universityId: university.id
      })
    });
    const directData = await directRes.json();
    templateIds.direct = directData.template.id;
    console.log(`✅ Created Direct Upload template: ${templateIds.direct}\n`);

    // Test GET template
    console.log('7️⃣  Testing GET template...');
    const getRes = await fetch(`${BASE_URL}/api/template/get/${templateIds.html}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const getData = await getRes.json();
    console.log(`✅ Retrieved template: ${getData.template.name}\n`);

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ All Tests Passed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 Template IDs created:');
    console.log(`   HTML Builder:    ${templateIds.html}`);
    console.log(`   PDF Mapper:      ${templateIds.pdf}`);
    console.log(`   Direct Upload:   ${templateIds.direct}\n`);
    console.log('🌐 Open in browser:');
    console.log(`   Dashboard:       ${BASE_URL}/admin/dashboard`);
    console.log(`   Templates:       ${BASE_URL}/admin/templates`);
    console.log(`   HTML Builder:    ${BASE_URL}/admin/templates/html-builder/${templateIds.html}`);
    console.log(`   PDF Mapper:      ${BASE_URL}/admin/templates/pdf-mapper/${templateIds.pdf}`);
    console.log(`   Direct Upload:   ${BASE_URL}/admin/templates/direct-upload/${templateIds.direct}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFullFlow();
