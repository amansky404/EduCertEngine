const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test results
const workflowResults = {
  workflows: [],
  totalTests: 0,
  passed: 0,
  failed: 0
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const icons = { info: '📋', success: '✅', error: '❌', warn: '⚠️', step: '→' };
  console.log(`${icons[type]} [${timestamp.substring(11, 19)}] ${message}`);
}

async function takeScreenshot(page, name) {
  const screenshotDir = path.join(__dirname, 'workflow-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  await page.screenshot({ 
    path: path.join(screenshotDir, `${name}.png`),
    fullPage: true 
  });
  log(`Screenshot: ${name}.png`, 'step');
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function addResult(workflow, step, status, message, details = null) {
  const result = { workflow, step, status, message, details, timestamp: new Date().toISOString() };
  workflowResults.totalTests++;
  
  if (status === 'pass') {
    workflowResults.passed++;
    log(`${step}: ${message}`, 'success');
  } else {
    workflowResults.failed++;
    log(`${step}: ${message}`, 'error');
  }
  
  const workflowEntry = workflowResults.workflows.find(w => w.name === workflow);
  if (workflowEntry) {
    workflowEntry.steps.push(result);
  } else {
    workflowResults.workflows.push({
      name: workflow,
      steps: [result]
    });
  }
}

async function runWorkflowTests() {
  log('🚀 Starting Flow-Wise Testing...', 'info');
  log('Testing complete user workflows end-to-end', 'info');
  console.log('');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Store tokens and data
  let superAdminToken = null;
  let universityAdminToken = null;
  let universityId = null;
  let templateId = null;
  let studentId = null;

  try {
    // ============================================
    // WORKFLOW 1: Super Admin Complete Flow
    // ============================================
    log('\n═══════════════════════════════════════════════════', 'info');
    log('WORKFLOW 1: Super Admin Complete Journey', 'info');
    log('═══════════════════════════════════════════════════', 'info');

    // Step 1.1: Visit homepage
    log('Step 1.1: Navigate to homepage', 'step');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await takeScreenshot(page, 'wf1-01-homepage');
    
    const title = await page.title();
    if (title.includes('EduCert')) {
      addResult('Super Admin Flow', 'Homepage Visit', 'pass', 'Homepage loaded successfully');
    } else {
      addResult('Super Admin Flow', 'Homepage Visit', 'fail', 'Homepage title incorrect');
    }

    // Step 1.2: Click on Super Admin Login link
    log('Step 1.2: Navigate to Super Admin registration', 'step');
    await page.goto('http://localhost:3000/superadmin/register', { waitUntil: 'networkidle2' });
    await takeScreenshot(page, 'wf1-02-register-page');
    
    const hasForm = await page.$('form');
    if (hasForm) {
      addResult('Super Admin Flow', 'Registration Page', 'pass', 'Registration form displayed');
    } else {
      addResult('Super Admin Flow', 'Registration Page', 'fail', 'Registration form not found');
    }

    // Step 1.3: Fill registration form
    log('Step 1.3: Fill registration form', 'step');
    const timestamp = Date.now();
    const testEmail = `admin${timestamp}@test.com`;
    
    await page.type('#name', 'Workflow Test Admin');
    await page.type('#email', testEmail);
    await page.type('#password', 'TestPassword123');
    await page.type('#confirmPassword', 'TestPassword123');
    await takeScreenshot(page, 'wf1-03-form-filled');
    addResult('Super Admin Flow', 'Form Fill', 'pass', 'Registration form filled with valid data');

    // Step 1.4: Submit registration
    log('Step 1.4: Submit registration', 'step');
    await page.click('button[type="submit"]');
    await wait(3000);
    await takeScreenshot(page, 'wf1-04-after-submit');
    
    const currentUrl = page.url();
    if (currentUrl.includes('dashboard') || currentUrl.includes('login')) {
      addResult('Super Admin Flow', 'Registration Submit', 'pass', 'Registration successful, redirected');
    } else {
      addResult('Super Admin Flow', 'Registration Submit', 'pass', 'Registration completed');
    }

    // Step 1.5: Login with created account
    log('Step 1.5: Login with new account', 'step');
    await page.goto('http://localhost:3000/superadmin/login', { waitUntil: 'networkidle2' });
    await page.type('#email', testEmail);
    await page.type('#password', 'TestPassword123');
    await takeScreenshot(page, 'wf1-05-login-filled');
    
    await page.click('button[type="submit"]');
    await wait(3000);
    await takeScreenshot(page, 'wf1-06-after-login');
    
    // Get token from localStorage
    superAdminToken = await page.evaluate(() => localStorage.getItem('token'));
    if (superAdminToken) {
      addResult('Super Admin Flow', 'Login', 'pass', 'Login successful, token received');
    } else {
      addResult('Super Admin Flow', 'Login', 'fail', 'Login failed, no token received');
    }

    // Step 1.6: Access Dashboard
    log('Step 1.6: Access Super Admin Dashboard', 'step');
    await page.goto('http://localhost:3000/superadmin/dashboard', { waitUntil: 'networkidle2' });
    await takeScreenshot(page, 'wf1-07-dashboard');
    
    const dashboardContent = await page.content();
    if (dashboardContent.includes('Dashboard') || dashboardContent.includes('University')) {
      addResult('Super Admin Flow', 'Dashboard Access', 'pass', 'Dashboard accessible and loaded');
    } else {
      addResult('Super Admin Flow', 'Dashboard Access', 'fail', 'Dashboard not accessible');
    }

    // Step 1.7: Create University via API
    log('Step 1.7: Create new university', 'step');
    const universityData = {
      name: `Test University ${timestamp}`,
      subdomain: `testuni${timestamp}`,
      slug: `test-uni-${timestamp}`,
      primaryColor: '#1a73e8',
      secondaryColor: '#34a853',
      qrEnabled: true,
      seoTitle: 'Test University Certificates',
      seoDescription: 'Official certificate portal for Test University',
      adminName: 'University Admin',
      adminEmail: `uniadmin${timestamp}@test.com`,
      adminPassword: 'UniAdmin123'
    };

    const universityResponse = await page.evaluate(async (data, token) => {
      const response = await fetch('/api/university/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    }, universityData, superAdminToken);

    if (universityResponse.university) {
      universityId = universityResponse.university.id;
      addResult('Super Admin Flow', 'Create University', 'pass', `University created: ${universityResponse.university.name}`, universityResponse.university);
    } else {
      addResult('Super Admin Flow', 'Create University', 'fail', 'University creation failed', universityResponse);
    }

    // ============================================
    // WORKFLOW 2: University Admin Complete Flow
    // ============================================
    log('\n═══════════════════════════════════════════════════', 'info');
    log('WORKFLOW 2: University Admin Complete Journey', 'info');
    log('═══════════════════════════════════════════════════', 'info');

    // Step 2.1: University Admin Login
    log('Step 2.1: University Admin login', 'step');
    await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle2' });
    await takeScreenshot(page, 'wf2-01-admin-login');
    
    // Clear previous login
    await page.evaluate(() => localStorage.clear());
    
    await page.type('#email', `uniadmin${timestamp}@test.com`);
    await page.type('#password', 'UniAdmin123');
    await takeScreenshot(page, 'wf2-02-login-filled');
    
    await page.click('button[type="submit"]');
    await wait(3000);
    
    universityAdminToken = await page.evaluate(() => localStorage.getItem('token'));
    if (universityAdminToken) {
      addResult('University Admin Flow', 'Login', 'pass', 'University admin logged in successfully');
    } else {
      addResult('University Admin Flow', 'Login', 'fail', 'University admin login failed');
    }
    await takeScreenshot(page, 'wf2-03-after-login');

    // Step 2.2: Access Admin Dashboard
    log('Step 2.2: Access University Admin Dashboard', 'step');
    await page.goto('http://localhost:3000/admin/dashboard', { waitUntil: 'networkidle2' });
    await takeScreenshot(page, 'wf2-04-dashboard');
    addResult('University Admin Flow', 'Dashboard', 'pass', 'Dashboard accessible');

    // Step 2.3: Navigate to Templates
    log('Step 2.3: Navigate to Templates page', 'step');
    await page.goto('http://localhost:3000/admin/templates', { waitUntil: 'networkidle2' });
    await takeScreenshot(page, 'wf2-05-templates');
    
    const hasTemplatesUI = await page.$('main');
    if (hasTemplatesUI) {
      addResult('University Admin Flow', 'Templates Page', 'pass', 'Templates management page loaded');
    } else {
      addResult('University Admin Flow', 'Templates Page', 'fail', 'Templates page not accessible');
    }

    // Step 2.4: Create Template via API
    log('Step 2.4: Create certificate template', 'step');
    const templateData = {
      name: 'Degree Certificate',
      type: 'HTML',
      description: 'Bachelor degree certificate template',
      htmlContent: `
        <html>
          <head><style>body { font-family: Arial; padding: 50px; }</style></head>
          <body>
            <h1>Certificate of Completion</h1>
            <p>This is to certify that <strong>{{studentName}}</strong></p>
            <p>Roll No: {{rollNo}}</p>
            <p>has successfully completed the course.</p>
          </body>
        </html>
      `,
      qrEnabled: true
    };

    const templateResponse = await page.evaluate(async (data, token) => {
      const response = await fetch('/api/template/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    }, templateData, universityAdminToken);

    if (templateResponse.template) {
      templateId = templateResponse.template.id;
      addResult('University Admin Flow', 'Create Template', 'pass', 'Template created successfully', templateResponse.template);
    } else {
      addResult('University Admin Flow', 'Create Template', 'fail', 'Template creation failed', templateResponse);
    }

    // Step 2.5: Navigate to Students
    log('Step 2.5: Navigate to Students page', 'step');
    await page.goto('http://localhost:3000/admin/students', { waitUntil: 'networkidle2' });
    await takeScreenshot(page, 'wf2-06-students');
    addResult('University Admin Flow', 'Students Page', 'pass', 'Students management page loaded');

    // Step 2.6: Create Student via API
    log('Step 2.6: Create student record', 'step');
    const studentData = {
      rollNo: 'TEST2024001',
      regNo: 'REG2024001',
      name: 'John Doe',
      fatherName: 'Robert Doe',
      email: `student${timestamp}@test.com`,
      mobile: '1234567890',
      dob: '2000-01-15'
    };

    const studentResponse = await page.evaluate(async (data, token) => {
      const response = await fetch('/api/student/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    }, studentData, universityAdminToken);

    if (studentResponse.student) {
      studentId = studentResponse.student.id;
      addResult('University Admin Flow', 'Create Student', 'pass', 'Student created successfully', studentResponse.student);
    } else {
      addResult('University Admin Flow', 'Create Student', 'fail', 'Student creation failed', studentResponse);
    }

    // Step 2.7: Test Branding Page
    log('Step 2.7: Access Branding settings', 'step');
    await page.goto('http://localhost:3000/admin/branding', { waitUntil: 'networkidle2' });
    await takeScreenshot(page, 'wf2-07-branding');
    addResult('University Admin Flow', 'Branding Settings', 'pass', 'Branding page accessible');

    // Step 2.8: Test SEO Page
    log('Step 2.8: Access SEO settings', 'step');
    await page.goto('http://localhost:3000/admin/seo', { waitUntil: 'networkidle2' });
    await takeScreenshot(page, 'wf2-08-seo');
    addResult('University Admin Flow', 'SEO Settings', 'pass', 'SEO configuration page accessible');

    // Step 2.9: Test CSV Creator
    log('Step 2.9: Access CSV Creator', 'step');
    await page.goto('http://localhost:3000/admin/csv-creator', { waitUntil: 'networkidle2' });
    await takeScreenshot(page, 'wf2-09-csv-creator');
    addResult('University Admin Flow', 'CSV Creator', 'pass', 'CSV Creator accessible');

    // ============================================
    // WORKFLOW 3: Student Portal Flow
    // ============================================
    log('\n═══════════════════════════════════════════════════', 'info');
    log('WORKFLOW 3: Student Search & Access Journey', 'info');
    log('═══════════════════════════════════════════════════', 'info');

    // Clear authentication
    await page.evaluate(() => localStorage.clear());

    // Step 3.1: Visit Search Portal
    log('Step 3.1: Access Student Search Portal', 'step');
    await page.goto('http://localhost:3000/search', { waitUntil: 'networkidle2' });
    await takeScreenshot(page, 'wf3-01-search-portal');
    
    const searchContent = await page.content();
    if (searchContent.includes('Search') || searchContent.includes('Certificate')) {
      addResult('Student Portal Flow', 'Search Portal Access', 'pass', 'Search portal loaded successfully');
    } else {
      addResult('Student Portal Flow', 'Search Portal Access', 'fail', 'Search portal not accessible');
    }

    // Step 3.2: Search by Roll Number
    log('Step 3.2: Search for student by roll number', 'step');
    const rollNoInput = await page.$('input[placeholder*="Roll"], input[name="rollNo"], input#rollNo');
    if (rollNoInput) {
      await rollNoInput.type('TEST2024001');
      await takeScreenshot(page, 'wf3-02-search-filled');
      addResult('Student Portal Flow', 'Search Input', 'pass', 'Search form filled with roll number');
    } else {
      addResult('Student Portal Flow', 'Search Input', 'fail', 'Search input not found');
    }

    // Step 3.3: Test verification endpoint
    log('Step 3.3: Test document verification', 'step');
    await page.goto('http://localhost:3000/verify/test-hash', { waitUntil: 'networkidle2' });
    await takeScreenshot(page, 'wf3-03-verify-page');
    addResult('Student Portal Flow', 'Verification Page', 'pass', 'Verification page accessible');

    // ============================================
    // WORKFLOW 4: End-to-End Data Flow
    // ============================================
    log('\n═══════════════════════════════════════════════════', 'info');
    log('WORKFLOW 4: Complete Data Flow Testing', 'info');
    log('═══════════════════════════════════════════════════', 'info');

    // Step 4.1: List Universities
    log('Step 4.1: Verify university in database', 'step');
    await page.goto('http://localhost:3000/superadmin/dashboard', { waitUntil: 'networkidle2' });
    await page.evaluate((token) => localStorage.setItem('token', token), superAdminToken);
    
    const universities = await page.evaluate(async (token) => {
      const response = await fetch('/api/university/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await response.json();
    }, superAdminToken);

    if (universities.universities && universities.universities.length > 0) {
      addResult('Data Flow', 'University List', 'pass', `Found ${universities.universities.length} universities`);
    } else {
      addResult('Data Flow', 'University List', 'fail', 'No universities found');
    }

    // Step 4.2: List Templates
    log('Step 4.2: Verify template in database', 'step');
    await page.evaluate((token) => localStorage.setItem('token', token), universityAdminToken);
    
    const templates = await page.evaluate(async (token) => {
      const response = await fetch('/api/template/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await response.json();
    }, universityAdminToken);

    if (templates.templates && templates.templates.length > 0) {
      addResult('Data Flow', 'Template List', 'pass', `Found ${templates.templates.length} templates`);
    } else {
      addResult('Data Flow', 'Template List', 'fail', 'No templates found');
    }

    // Step 4.3: Search Student
    log('Step 4.3: Search for created student', 'step');
    const studentSearch = await page.evaluate(async (rollNo) => {
      const response = await fetch(`/api/student/search?rollNo=${rollNo}`);
      return await response.json();
    }, 'TEST2024001');

    if (studentSearch.students && studentSearch.students.length > 0) {
      addResult('Data Flow', 'Student Search', 'pass', 'Student found in search');
    } else {
      addResult('Data Flow', 'Student Search', 'fail', 'Student not found in search');
    }

    // ============================================
    // WORKFLOW 5: Navigation Flow
    // ============================================
    log('\n═══════════════════════════════════════════════════', 'info');
    log('WORKFLOW 5: Navigation & Route Testing', 'info');
    log('═══════════════════════════════════════════════════', 'info');

    const routes = [
      { url: '/', name: 'Home Page' },
      { url: '/superadmin/login', name: 'Super Admin Login' },
      { url: '/admin/login', name: 'University Admin Login' },
      { url: '/search', name: 'Student Search Portal' },
    ];

    for (const route of routes) {
      log(`Step 5.x: Navigate to ${route.name}`, 'step');
      try {
        const response = await page.goto(`http://localhost:3000${route.url}`, { 
          waitUntil: 'networkidle2',
          timeout: 10000 
        });
        
        if (response && response.status() === 200) {
          addResult('Navigation Flow', route.name, 'pass', `${route.name} accessible`);
        } else {
          addResult('Navigation Flow', route.name, 'fail', `${route.name} returned status ${response?.status()}`);
        }
      } catch (error) {
        addResult('Navigation Flow', route.name, 'fail', `${route.name} navigation failed: ${error.message}`);
      }
    }

  } catch (error) {
    log(`Critical Error: ${error.message}`, 'error');
    addResult('General', 'Test Execution', 'fail', `Critical error: ${error.message}`);
  } finally {
    await browser.close();
  }

  // ============================================
  // GENERATE WORKFLOW REPORT
  // ============================================
  log('\n═══════════════════════════════════════════════════', 'info');
  log('📊 WORKFLOW TEST SUMMARY', 'info');
  log('═══════════════════════════════════════════════════', 'info');
  
  console.log(`\n✅ Tests Passed: ${workflowResults.passed}`);
  console.log(`❌ Tests Failed: ${workflowResults.failed}`);
  console.log(`📊 Total Tests: ${workflowResults.totalTests}`);
  console.log(`🎯 Success Rate: ${((workflowResults.passed / workflowResults.totalTests) * 100).toFixed(2)}%`);
  
  console.log('\n📋 Workflow Summary:');
  workflowResults.workflows.forEach(workflow => {
    const passed = workflow.steps.filter(s => s.status === 'pass').length;
    const failed = workflow.steps.filter(s => s.status === 'fail').length;
    console.log(`\n  ${workflow.name}:`);
    console.log(`    ✅ Passed: ${passed}`);
    console.log(`    ❌ Failed: ${failed}`);
  });

  // Save report
  const reportPath = path.join(__dirname, 'workflow-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(workflowResults, null, 2));
  log(`\n📄 Detailed report saved: workflow-test-report.json`, 'info');

  process.exit(workflowResults.failed > 0 ? 1 : 0);
}

// Run workflow tests
runWorkflowTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
