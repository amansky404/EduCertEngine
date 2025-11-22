console.log('\n╔══════════════════════════════════════════════════════════════════════════╗');
console.log('║                                                                          ║');
console.log('║              🔍 COMPREHENSIVE PROJECT CHECK                             ║');
console.log('║                                                                          ║');
console.log('╚══════════════════════════════════════════════════════════════════════════╝\n');

const BASE_URL = 'http://localhost:3000';
const results = { routes: [], apis: [], features: [], errors: [] };

const routes = [
  { path: '/', name: 'Landing Page' },
  { path: '/superadmin/register', name: 'Super Admin Register' },
  { path: '/superadmin/login', name: 'Super Admin Login' },
  { path: '/admin/login', name: 'Admin Login' },
  { path: '/verify', name: 'Certificate Verification' },
];

async function checkRoute(route) {
  try {
    const response = await fetch(`${BASE_URL}${route.path}`);
    const status = response.status;
    const working = status === 200 || status === 304;
    console.log(`${working ? '✅' : '❌'} ${route.name.padEnd(30)} [${status}]`);
    return working;
  } catch (error) {
    console.log(`❌ ${route.name.padEnd(30)} [ERROR]`);
    return false;
  }
}

async function registerSuperAdmin() {
  try {
    const timestamp = Date.now();
    const response = await fetch(`${BASE_URL}/api/auth/superadmin-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `superadmin${timestamp}@test.com`,
        password: 'Test@1234',
        name: 'Test Super Admin'
      })
    });
    const data = await response.json();
    if (response.ok && data.token) {
      console.log(`✅ Super Admin Registration      [201] ✓`);
      return data.token;
    } else {
      console.log(`❌ Super Admin Registration      [${response.status}]`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Super Admin Registration      [ERROR]`);
    return null;
  }
}

async function createUniversity(token) {
  try {
    const timestamp = Date.now();
    const response = await fetch(`${BASE_URL}/api/university/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: `Test University ${timestamp}`,
        subdomain: `testuni${timestamp}`,
        slug: `testuni${timestamp}`,
        adminEmail: `admin${timestamp}@test.com`,
        adminPassword: 'Admin@1234',
        adminName: 'Test Admin',
        primaryColor: '#3b82f6',
        secondaryColor: '#1e40af',
        qrEnabled: true
      })
    });
    const data = await response.json();
    if (response.ok && data.university) {
      console.log(`✅ University Creation           [201] ID: ${data.university.id}`);
      return { university: data.university, adminEmail: `admin${timestamp}@test.com` };
    } else {
      console.log(`❌ University Creation           [${response.status}] ${data.error || ''}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ University Creation           [ERROR]`);
    return null;
  }
}

async function adminLogin(email) {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: 'Admin@1234' })
    });
    const data = await response.json();
    if (response.ok && data.token) {
      console.log(`✅ Admin Login                   [200] ✓`);
      return data.token;
    } else {
      console.log(`❌ Admin Login                   [${response.status}]`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Admin Login                   [ERROR]`);
    return null;
  }
}

async function createTemplate(token, universityId) {
  try {
    const response = await fetch(`${BASE_URL}/api/templates/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        universityId: universityId,
        name: 'Test HTML Template',
        type: 'html',
        content: '<div style="text-align:center"><h1>{{studentName}}</h1></div>',
        fields: [{ name: 'studentName', type: 'text', required: true }]
      })
    });
    const data = await response.json();
    if (response.ok && data.template) {
      console.log(`✅ Template Creation             [201] ID: ${data.template.id}`);
      return data.template;
    } else {
      console.log(`❌ Template Creation             [${response.status}] ${data.error || ''}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Template Creation             [ERROR]`);
    return null;
  }
}

async function addStudent(token, universityId) {
  try {
    const timestamp = Date.now();
    const response = await fetch(`${BASE_URL}/api/students/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        universityId: universityId,
        name: 'John Doe',
        email: `student${timestamp}@test.com`,
        rollNumber: `ROLL${timestamp}`,
        course: 'Computer Science',
        batch: '2024'
      })
    });
    const data = await response.json();
    if (response.ok && data.student) {
      console.log(`✅ Add Student                   [201] ID: ${data.student.id}`);
      return data.student;
    } else {
      console.log(`❌ Add Student                   [${response.status}] ${data.error || ''}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Add Student                   [ERROR]`);
    return null;
  }
}

async function generateDocument(token, templateId, studentId, universityId) {
  try {
    const response = await fetch(`${BASE_URL}/api/documents/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        templateId: templateId,
        studentId: studentId,
        universityId: universityId,
        data: { studentName: 'John Doe' }
      })
    });
    const data = await response.json();
    if (response.ok && data.document) {
      console.log(`✅ Document Generation           [201] ID: ${data.document.id}`);
      return data.document;
    } else {
      console.log(`❌ Document Generation           [${response.status}] ${data.error || ''}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Document Generation           [ERROR]`);
    return null;
  }
}

async function runChecks() {
  console.log('════════════════════════════════════════════════════════════════════════════════');
  console.log('  PHASE 1: CHECKING ROUTES');
  console.log('════════════════════════════════════════════════════════════════════════════════\n');
  
  let routesOk = 0;
  for (const route of routes) {
    if (await checkRoute(route)) routesOk++;
  }
  
  console.log('\n════════════════════════════════════════════════════════════════════════════════');
  console.log('  PHASE 2: TESTING FULL WORKFLOW');
  console.log('════════════════════════════════════════════════════════════════════════════════\n');
  
  const superAdminToken = await registerSuperAdmin();
  if (!superAdminToken) {
    console.log('\n❌ Cannot continue - Super Admin registration failed\n');
    return;
  }
  
  const universityData = await createUniversity(superAdminToken);
  if (!universityData) {
    console.log('\n❌ Cannot continue - University creation failed\n');
    return;
  }
  
  const adminToken = await adminLogin(universityData.adminEmail);
  if (!adminToken) {
    console.log('\n❌ Cannot continue - Admin login failed\n');
    return;
  }
  
  const template = await createTemplate(adminToken, universityData.university.id);
  const student = await addStudent(adminToken, universityData.university.id);
  
  if (template && student) {
    await generateDocument(adminToken, template.id, student.id, universityData.university.id);
  } else {
    console.log('⏭️  Skipping document generation [Missing template or student]');
  }
  
  console.log('\n════════════════════════════════════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('════════════════════════════════════════════════════════════════════════════════\n');
  
  console.log(`📊 Results:`);
  console.log(`   Routes: ${routesOk}/${routes.length} working`);
  console.log(`   Super Admin: ${superAdminToken ? '✅' : '❌'}`);
  console.log(`   University Creation: ${universityData ? '✅' : '❌'}`);
  console.log(`   Admin Login: ${adminToken ? '✅' : '❌'}`);
  console.log(`   Template Creation: ${template ? '✅' : '❌'}`);
  console.log(`   Student Management: ${student ? '✅' : '❌'}`);
  
  console.log('\n════════════════════════════════════════════════════════════════════════════════');
  console.log('                    ✅ PROJECT CHECK COMPLETE!');
  console.log('════════════════════════════════════════════════════════════════════════════════\n');
}

runChecks().catch(console.error);
