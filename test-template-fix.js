#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000';

// Test Authentication and Template Creation
async function testTemplateFlow() {
  console.log('🚀 Starting Template Fix Test\n');

  try {
    // Step 1: Login as super admin
    console.log('Step 1: Logging in as Super Admin...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/superadmin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@fix.com',
        password: 'admin123'
      })
    });

    if (!loginRes.ok) {
      console.error('❌ Login failed:', await loginRes.text());
      return;
    }

    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('✅ Login successful\n');

    // Step 2: Get universities
    console.log('Step 2: Fetching universities...');
    const univRes = await fetch(`${BASE_URL}/api/university/list`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!univRes.ok) {
      console.error('❌ Failed to fetch universities');
      return;
    }

    const univData = await univRes.json();
    const universities = univData.universities || [];
    console.log(`✅ Found ${universities.length} universities\n`);

    if (universities.length === 0) {
      console.error('❌ No universities found!');
      return;
    }

    const universityId = universities[0].id;
    console.log(`Using university: ${universities[0].name} (${universityId})\n`);

    // Step 3: Create HTML Template
    console.log('Step 3: Creating HTML Template...');
    const htmlTemplate = {
      name: 'Test HTML Template',
      description: 'Test HTML template for certificate',
      type: 'HTML',
      qrEnabled: true,
      universityId: universityId
    };

    const createHtmlRes = await fetch(`${BASE_URL}/api/template/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(htmlTemplate)
    });

    if (!createHtmlRes.ok) {
      const errorText = await createHtmlRes.text();
      console.error('❌ Failed to create HTML template:', errorText);
    } else {
      const htmlData = await createHtmlRes.json();
      console.log('✅ HTML Template created:', htmlData.template.id);
    }

    // Step 4: Create PDF Mapper Template
    console.log('\nStep 4: Creating PDF Mapper Template...');
    const pdfTemplate = {
      name: 'Test PDF Mapper Template',
      description: 'Test PDF mapper template for certificate',
      type: 'PDF_MAPPER',
      qrEnabled: true,
      universityId: universityId
    };

    const createPdfRes = await fetch(`${BASE_URL}/api/template/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(pdfTemplate)
    });

    if (!createPdfRes.ok) {
      const errorText = await createPdfRes.text();
      console.error('❌ Failed to create PDF template:', errorText);
    } else {
      const pdfData = await createPdfRes.json();
      console.log('✅ PDF Mapper Template created:', pdfData.template.id);
    }

    // Step 5: Create Direct Upload Template
    console.log('\nStep 5: Creating Direct Upload Template...');
    const directTemplate = {
      name: 'Test Direct Upload Template',
      description: 'Test direct upload template for certificate',
      type: 'DIRECT_UPLOAD',
      qrEnabled: false,
      universityId: universityId
    };

    const createDirectRes = await fetch(`${BASE_URL}/api/template/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(directTemplate)
    });

    if (!createDirectRes.ok) {
      const errorText = await createDirectRes.text();
      console.error('❌ Failed to create Direct Upload template:', errorText);
    } else {
      const directData = await createDirectRes.json();
      console.log('✅ Direct Upload Template created:', directData.template.id);
    }

    // Step 6: List all templates
    console.log('\nStep 6: Listing all templates...');
    const listRes = await fetch(`${BASE_URL}/api/template/list`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!listRes.ok) {
      console.error('❌ Failed to list templates');
    } else {
      const listData = await listRes.json();
      console.log(`✅ Total templates: ${listData.templates?.length || 0}`);
      
      if (listData.templates && listData.templates.length > 0) {
        console.log('\nTemplates:');
        listData.templates.forEach((t, i) => {
          console.log(`  ${i + 1}. ${t.name} (${t.type}) - ID: ${t.id}`);
        });
      }
    }

    console.log('\n✅ Template test completed successfully!');
    console.log('\n🌐 Open browser: http://localhost:3000/admin/templates');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testTemplateFlow();
