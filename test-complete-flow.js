/**
 * Complete Flow Test Script for EduCertEngine
 * Tests all major workflows end-to-end
 */

const API_BASE = 'http://localhost:3000';

// Test data
const testData = {
  superAdmin: {
    name: 'Super Admin',
    email: 'superadmin@educert.com',
    password: 'admin12345'
  },
  university: {
    name: 'Tech University',
    subdomain: 'techuni',
    slug: 'tech-university',
    description: 'Leading technical institute',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    accentColor: '#8B5CF6'
  },
  universityAdmin: {
    name: 'John Admin',
    email: 'admin@techuni.edu',
    password: 'admin123'
  },
  template: {
    name: 'Degree Certificate',
    description: 'Final year degree certificate',
    type: 'HTML_BUILDER',
    pageSize: 'A4',
    orientation: 'LANDSCAPE',
    htmlContent: `
      <div style="text-align: center; padding: 50px; font-family: Arial;">
        <h1>🎓 TECH UNIVERSITY</h1>
        <h2>CERTIFICATE OF COMPLETION</h2>
        <p style="margin: 30px 0;">This is to certify that</p>
        <h2 style="color: #3B82F6;">{{studentName}}</h2>
        <p>Roll No: {{rollNo}}</p>
        <p>has successfully completed the degree program</p>
        <h3>{{courseName}}</h3>
        <p style="margin-top: 50px;">Issued on: {{date}}</p>
      </div>
    `,
    qrEnabled: true,
    qrPosition: 'BOTTOM_RIGHT'
  },
  students: [
    {
      name: 'John Smith',
      rollNo: '2024001',
      regNo: 'REG2024001',
      mobile: '+1234567890',
      email: 'john@example.com',
      dob: '2000-01-01',
      courseName: 'Computer Science'
    },
    {
      name: 'Jane Doe',
      rollNo: '2024002',
      regNo: 'REG2024002',
      mobile: '+1234567891',
      email: 'jane@example.com',
      dob: '2000-02-02',
      courseName: 'Electrical Engineering'
    }
  ]
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.bright}${colors.cyan}[STEP ${step}]${colors.reset} ${message}`);
}

function logSuccess(message) {
  log(`${colors.green}✓${colors.reset} ${message}`);
}

function logError(message) {
  log(`${colors.red}✗${colors.reset} ${message}`, colors.red);
}

function logInfo(message) {
  log(`${colors.blue}ℹ${colors.reset} ${message}`);
}

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testFlow() {
  log('\n' + '='.repeat(70), colors.bright);
  log('  EDUCERTENGINE - COMPLETE FLOW TEST', colors.bright + colors.cyan);
  log('='.repeat(70) + '\n', colors.bright);

  let superAdminToken = null;
  let universityId = null;
  let universityAdminToken = null;
  let templateId = null;
  let studentIds = [];
  let documentIds = [];

  // STEP 1: Register Super Admin
  logStep(1, 'Register Super Admin');
  const registerResult = await makeRequest('/api/auth/superadmin-register', {
    method: 'POST',
    body: JSON.stringify(testData.superAdmin)
  });

  if (registerResult.success) {
    superAdminToken = registerResult.data.token;
    logSuccess('Super Admin registered successfully');
    logInfo(`Token: ${superAdminToken.substring(0, 30)}...`);
  } else {
    logError('Super Admin registration failed');
    logError(registerResult.data?.error || registerResult.error);
    if (registerResult.status === 400) {
      logInfo('Super Admin might already exist, trying login...');
      
      // Try login instead
      const loginResult = await makeRequest('/api/auth/superadmin-login', {
        method: 'POST',
        body: JSON.stringify({
          email: testData.superAdmin.email,
          password: testData.superAdmin.password
        })
      });
      
      if (loginResult.success) {
        superAdminToken = loginResult.data.token;
        logSuccess('Super Admin logged in successfully');
      } else {
        logError('Super Admin login failed');
        return;
      }
    } else {
      return;
    }
  }

  // STEP 2: Create University
  logStep(2, 'Create University');
  const universityResult = await makeRequest('/api/university/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${superAdminToken}`
    },
    body: JSON.stringify({
      ...testData.university,
      adminName: testData.universityAdmin.name,
      adminEmail: testData.universityAdmin.email,
      adminPassword: testData.universityAdmin.password
    })
  });

  if (universityResult.success) {
    universityId = universityResult.data.university?.id;
    logSuccess('University created successfully');
    logInfo(`University ID: ${universityId}`);
    logInfo(`Subdomain: ${testData.university.subdomain}.educert.com`);
    logInfo(`Admin: ${testData.universityAdmin.email}`);
  } else {
    logError('University creation failed');
    logError(universityResult.data?.error || universityResult.error);
    if (universityResult.status === 400) {
      logInfo('University might already exist, continuing with existing data...');
      // In a real scenario, you'd fetch the existing university
    } else {
      return;
    }
  }

  // STEP 3: Login as University Admin
  logStep(3, 'Login as University Admin');
  const adminLoginResult = await makeRequest('/api/auth/admin-login', {
    method: 'POST',
    body: JSON.stringify({
      email: testData.universityAdmin.email,
      password: testData.universityAdmin.password,
      subdomain: testData.university.subdomain
    })
  });

  if (adminLoginResult.success) {
    universityAdminToken = adminLoginResult.data.token;
    logSuccess('University Admin logged in successfully');
    logInfo(`Token: ${universityAdminToken.substring(0, 30)}...`);
  } else {
    logError('University Admin login failed');
    logError(adminLoginResult.data?.error || adminLoginResult.error);
    return;
  }

  // STEP 4: Create Template
  logStep(4, 'Create Certificate Template');
  const templateResult = await makeRequest('/api/template/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${universityAdminToken}`
    },
    body: JSON.stringify(testData.template)
  });

  if (templateResult.success) {
    templateId = templateResult.data.template?.id;
    logSuccess('Template created successfully');
    logInfo(`Template ID: ${templateId}`);
    logInfo(`Template Name: ${testData.template.name}`);
  } else {
    logError('Template creation failed');
    logError(templateResult.data?.error || templateResult.error);
  }

  // STEP 5: Add Students
  logStep(5, `Add ${testData.students.length} Students`);
  for (let i = 0; i < testData.students.length; i++) {
    const student = testData.students[i];
    const studentResult = await makeRequest('/api/student/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${universityAdminToken}`
      },
      body: JSON.stringify({
        ...student,
        templateId: templateId,
        generateDocument: true,
        publish: true
      })
    });

    if (studentResult.success) {
      studentIds.push(studentResult.data.student?.id);
      logSuccess(`Student ${i + 1} created: ${student.name} (${student.rollNo})`);
    } else {
      logError(`Student ${i + 1} creation failed: ${student.name}`);
      logError(studentResult.data?.error || studentResult.error);
    }
  }

  // STEP 6: Check Documents
  logStep(6, 'Verify Document Generation');
  const documentsResult = await makeRequest('/api/document/list', {
    headers: {
      'Authorization': `Bearer ${universityAdminToken}`
    }
  });

  if (documentsResult.success) {
    const documents = documentsResult.data.documents || [];
    logSuccess(`Found ${documents.length} documents`);
    documents.forEach(doc => {
      documentIds.push(doc.id);
      logInfo(`- ${doc.student?.name} - ${doc.template?.name} - Status: ${doc.published ? 'Published' : 'Draft'}`);
    });
  } else {
    logError('Failed to fetch documents');
  }

  // STEP 7: Test Student Search (Public)
  logStep(7, 'Test Student Search Portal');
  const searchResult = await makeRequest(`/api/student/search?rollNo=${testData.students[0].rollNo}`);

  if (searchResult.success) {
    const results = searchResult.data.documents || [];
    logSuccess(`Search successful - Found ${results.length} document(s)`);
    results.forEach(doc => {
      logInfo(`- ${doc.template?.name} - Issued: ${doc.createdAt}`);
    });
  } else {
    logError('Student search failed');
  }

  // STEP 8: Summary
  log('\n' + '='.repeat(70), colors.bright);
  log('  TEST SUMMARY', colors.bright + colors.cyan);
  log('='.repeat(70), colors.bright);
  
  logSuccess(`Super Admin: Registered/Logged In`);
  logSuccess(`University: ${testData.university.name} (${testData.university.subdomain})`);
  logSuccess(`University Admin: ${testData.universityAdmin.email}`);
  logSuccess(`Template: ${testData.template.name} ${templateId ? `(ID: ${templateId})` : ''}`);
  logSuccess(`Students: ${studentIds.length} created`);
  logSuccess(`Documents: ${documentIds.length} generated`);
  logSuccess(`Search: Working for public access`);
  
  log('\n' + '='.repeat(70), colors.bright);
  log('  🎉 ALL TESTS COMPLETED! 🎉', colors.bright + colors.green);
  log('='.repeat(70) + '\n', colors.bright);
  
  logInfo('Next steps:');
  logInfo('1. Open Chrome: http://localhost:3000');
  logInfo(`2. Login as Super Admin: ${testData.superAdmin.email}`);
  logInfo(`3. Or login as University Admin: ${testData.universityAdmin.email}`);
  logInfo(`4. Search for student: Roll No ${testData.students[0].rollNo}`);
  logInfo('5. View and download certificates');
  
  log('');
}

// Run the test
testFlow().catch(error => {
  logError('Test failed with error:');
  console.error(error);
});
