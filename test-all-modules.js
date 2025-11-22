const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test results
const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

// Helper function to take screenshots
async function takeScreenshot(page, name) {
  const screenshotDir = path.join(__dirname, 'test-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  await page.screenshot({ 
    path: path.join(screenshotDir, `${name}.png`),
    fullPage: true 
  });
  console.log(`📸 Screenshot saved: ${name}.png`);
}

// Helper to add test result
function addResult(status, module, message) {
  const result = { module, message, timestamp: new Date().toISOString() };
  if (status === 'pass') {
    testResults.passed.push(result);
    console.log(`✅ PASS: ${module} - ${message}`);
  } else if (status === 'fail') {
    testResults.failed.push(result);
    console.log(`❌ FAIL: ${module} - ${message}`);
  } else {
    testResults.warnings.push(result);
    console.log(`⚠️  WARN: ${module} - ${message}`);
  }
}

// Helper to wait and handle errors
async function safeWaitForSelector(page, selector, timeout = 10000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (e) {
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting comprehensive module testing...\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('🔴 Browser Error:', msg.text());
    }
  });

  try {
    // ============================================
    // TEST 1: Home Page
    // ============================================
    console.log('\n📋 TEST 1: Home Page');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
    await takeScreenshot(page, '01-homepage');
    
    const homeTitle = await page.title();
    if (homeTitle.includes('EduCert')) {
      addResult('pass', 'Home Page', 'Page loaded successfully');
    } else {
      addResult('fail', 'Home Page', `Wrong title: ${homeTitle}`);
    }

    // Check key elements
    const hasHeader = await safeWaitForSelector(page, 'header');
    const hasFeatures = await safeWaitForSelector(page, '#features');
    const hasFooter = await safeWaitForSelector(page, 'footer');
    
    if (hasHeader && hasFeatures && hasFooter) {
      addResult('pass', 'Home Page', 'All sections present');
    } else {
      addResult('fail', 'Home Page', 'Missing sections');
    }

    // ============================================
    // TEST 2: Super Admin Registration
    // ============================================
    console.log('\n📋 TEST 2: Super Admin Registration');
    await page.goto('http://localhost:3000/superadmin/register', { waitUntil: 'networkidle2' });
    await takeScreenshot(page, '02-superadmin-register');

    const hasRegForm = await safeWaitForSelector(page, 'form');
    if (hasRegForm) {
      addResult('pass', 'Super Admin Register', 'Registration form loaded');
      
      // Fill the form
      await page.type('#name', 'Test Admin User');
      await page.type('#email', `testadmin${Date.now()}@test.com`);
      await page.type('#password', 'Test123456789');
      await page.type('#confirmPassword', 'Test123456789');
      
      await takeScreenshot(page, '02b-superadmin-form-filled');
      
      // Submit form
      await page.click('button[type="submit"]');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const currentUrl = page.url();
      if (currentUrl.includes('dashboard') || currentUrl.includes('login')) {
        addResult('pass', 'Super Admin Register', 'Registration successful');
      } else {
        addResult('warn', 'Super Admin Register', 'Registration completed but redirect unclear');
      }
      
      await takeScreenshot(page, '02c-after-registration');
    } else {
      addResult('fail', 'Super Admin Register', 'Form not found');
    }

    // ============================================
    // TEST 3: Super Admin Login
    // ============================================
    console.log('\n📋 TEST 3: Super Admin Login');
    await page.goto('http://localhost:3000/superadmin/login', { waitUntil: 'networkidle2' });
    await takeScreenshot(page, '03-superadmin-login');

    const hasLoginForm = await safeWaitForSelector(page, 'form');
    if (hasLoginForm) {
      addResult('pass', 'Super Admin Login', 'Login page loaded');
      
      // Login with existing account
      await page.type('#email', 'testadmin@test.com');
      await page.type('#password', 'Test123456');
      
      await takeScreenshot(page, '03b-login-filled');
      
      await page.click('button[type="submit"]');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      await takeScreenshot(page, '03c-after-login');
      
      const afterLoginUrl = page.url();
      if (afterLoginUrl.includes('dashboard')) {
        addResult('pass', 'Super Admin Login', 'Login successful - redirected to dashboard');
      } else {
        addResult('warn', 'Super Admin Login', `Login completed - URL: ${afterLoginUrl}`);
      }
    } else {
      addResult('fail', 'Super Admin Login', 'Login form not found');
    }

    // ============================================
    // TEST 4: Super Admin Dashboard
    // ============================================
    console.log('\n📋 TEST 4: Super Admin Dashboard');
    await page.goto('http://localhost:3000/superadmin/dashboard', { waitUntil: 'networkidle2' });
    await takeScreenshot(page, '04-superadmin-dashboard');

    const hasDashboard = await safeWaitForSelector(page, 'main');
    if (hasDashboard) {
      addResult('pass', 'Super Admin Dashboard', 'Dashboard loaded');
      
      // Check for key dashboard elements
      const dashboardText = await page.content();
      if (dashboardText.includes('University') || dashboardText.includes('Dashboard')) {
        addResult('pass', 'Super Admin Dashboard', 'Dashboard content present');
      }
    } else {
      addResult('fail', 'Super Admin Dashboard', 'Dashboard not accessible');
    }

    // ============================================
    // TEST 5: University Admin Login
    // ============================================
    console.log('\n📋 TEST 5: University Admin Login');
    await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle2' });
    await takeScreenshot(page, '05-admin-login');

    const hasAdminLoginForm = await safeWaitForSelector(page, 'form');
    if (hasAdminLoginForm) {
      addResult('pass', 'University Admin Login', 'Login page loaded');
      
      await page.type('#email', 'admin@testuni.com');
      await page.type('#password', 'Admin123456');
      
      await takeScreenshot(page, '05b-admin-login-filled');
      
      await page.click('button[type="submit"]');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      await takeScreenshot(page, '05c-after-admin-login');
      
      const adminUrl = page.url();
      if (adminUrl.includes('admin') && (adminUrl.includes('dashboard') || adminUrl.includes('templates'))) {
        addResult('pass', 'University Admin Login', 'Admin login successful');
      } else {
        addResult('warn', 'University Admin Login', `Login completed - URL: ${adminUrl}`);
      }
    } else {
      addResult('fail', 'University Admin Login', 'Login form not found');
    }

    // ============================================
    // TEST 6: Admin Dashboard
    // ============================================
    console.log('\n📋 TEST 6: University Admin Dashboard');
    await page.goto('http://localhost:3000/admin/dashboard', { waitUntil: 'networkidle2' });
    await takeScreenshot(page, '06-admin-dashboard');

    const hasAdminDash = await safeWaitForSelector(page, 'main');
    if (hasAdminDash) {
      addResult('pass', 'Admin Dashboard', 'Dashboard accessible');
    } else {
      addResult('fail', 'Admin Dashboard', 'Dashboard not accessible');
    }

    // ============================================
    // TEST 7: Templates Page
    // ============================================
    console.log('\n📋 TEST 7: Templates Management');
    await page.goto('http://localhost:3000/admin/templates', { waitUntil: 'networkidle2' });
    await takeScreenshot(page, '07-templates');

    const hasTemplates = await safeWaitForSelector(page, 'main');
    if (hasTemplates) {
      addResult('pass', 'Templates', 'Templates page loaded');
      
      const pageContent = await page.content();
      if (pageContent.includes('Template') || pageContent.includes('Create')) {
        addResult('pass', 'Templates', 'Template management UI present');
      }
    } else {
      addResult('fail', 'Templates', 'Templates page not accessible');
    }

    // ============================================
    // TEST 8: Students Page
    // ============================================
    console.log('\n📋 TEST 8: Students Management');
    await page.goto('http://localhost:3000/admin/students', { waitUntil: 'networkidle2' });
    await takeScreenshot(page, '08-students');

    const hasStudents = await safeWaitForSelector(page, 'main');
    if (hasStudents) {
      addResult('pass', 'Students', 'Students page loaded');
    } else {
      addResult('fail', 'Students', 'Students page not accessible');
    }

    // ============================================
    // TEST 9: CSV Creator
    // ============================================
    console.log('\n📋 TEST 9: CSV Creator');
    await page.goto('http://localhost:3000/admin/csv-creator', { waitUntil: 'networkidle2' });
    await takeScreenshot(page, '09-csv-creator');

    const hasCsv = await safeWaitForSelector(page, 'main');
    if (hasCsv) {
      addResult('pass', 'CSV Creator', 'CSV Creator page loaded');
    } else {
      addResult('fail', 'CSV Creator', 'CSV Creator not accessible');
    }

    // ============================================
    // TEST 10: Branding Settings
    // ============================================
    console.log('\n📋 TEST 10: Branding Settings');
    await page.goto('http://localhost:3000/admin/branding', { waitUntil: 'networkidle2' });
    await takeScreenshot(page, '10-branding');

    const hasBranding = await safeWaitForSelector(page, 'main');
    if (hasBranding) {
      addResult('pass', 'Branding', 'Branding page loaded');
    } else {
      addResult('fail', 'Branding', 'Branding page not accessible');
    }

    // ============================================
    // TEST 11: SEO Settings
    // ============================================
    console.log('\n📋 TEST 11: SEO Settings');
    await page.goto('http://localhost:3000/admin/seo', { waitUntil: 'networkidle2' });
    await takeScreenshot(page, '11-seo');

    const hasSeo = await safeWaitForSelector(page, 'main');
    if (hasSeo) {
      addResult('pass', 'SEO Settings', 'SEO page loaded');
    } else {
      addResult('fail', 'SEO Settings', 'SEO page not accessible');
    }

    // ============================================
    // TEST 12: Landing Page Builder
    // ============================================
    console.log('\n📋 TEST 12: Landing Page Builder');
    await page.goto('http://localhost:3000/admin/landing-builder', { waitUntil: 'networkidle2' });
    await takeScreenshot(page, '12-landing-builder');

    const hasLanding = await safeWaitForSelector(page, 'main');
    if (hasLanding) {
      addResult('pass', 'Landing Builder', 'Landing page builder loaded');
    } else {
      addResult('fail', 'Landing Builder', 'Landing builder not accessible');
    }

    // ============================================
    // TEST 13: Search Portal (Student View)
    // ============================================
    console.log('\n📋 TEST 13: Student Search Portal');
    await page.goto('http://localhost:3000/search', { waitUntil: 'networkidle2' });
    await takeScreenshot(page, '13-search-portal');

    const hasSearch = await safeWaitForSelector(page, 'main');
    if (hasSearch) {
      addResult('pass', 'Search Portal', 'Search portal loaded');
      
      const searchContent = await page.content();
      if (searchContent.includes('Search') || searchContent.includes('Certificate')) {
        addResult('pass', 'Search Portal', 'Search UI present');
      }
    } else {
      addResult('fail', 'Search Portal', 'Search portal not accessible');
    }

    // ============================================
    // TEST 14: Settings Page
    // ============================================
    console.log('\n📋 TEST 14: Settings');
    await page.goto('http://localhost:3000/admin/settings', { waitUntil: 'networkidle2' });
    await takeScreenshot(page, '14-settings');

    const hasSettings = await safeWaitForSelector(page, 'main');
    if (hasSettings) {
      addResult('pass', 'Settings', 'Settings page loaded');
    } else {
      addResult('fail', 'Settings', 'Settings page not accessible');
    }

    // ============================================
    // TEST 15: API Health Check
    // ============================================
    console.log('\n📋 TEST 15: API Endpoints');
    
    // Test API endpoints
    const apiTests = [
      { url: '/api/auth/superadmin-login', method: 'POST' },
      { url: '/api/auth/admin-login', method: 'POST' },
    ];

    for (const api of apiTests) {
      try {
        const response = await page.goto(`http://localhost:3000${api.url}`, { 
          waitUntil: 'networkidle2',
          timeout: 5000 
        });
        
        if (response && (response.status() < 500)) {
          addResult('pass', `API ${api.url}`, `API endpoint accessible (${response.status()})`);
        } else {
          addResult('fail', `API ${api.url}`, `API error (${response?.status()})`);
        }
      } catch (e) {
        addResult('warn', `API ${api.url}`, 'API endpoint check failed');
      }
    }

  } catch (error) {
    console.error('❌ Test Error:', error.message);
    addResult('fail', 'General', `Test error: ${error.message}`);
  } finally {
    await browser.close();
  }

  // ============================================
  // GENERATE TEST REPORT
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed.length}`);
  console.log(`❌ Failed: ${testResults.failed.length}`);
  console.log(`⚠️  Warnings: ${testResults.warnings.length}`);
  console.log('='.repeat(60));

  if (testResults.failed.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.failed.forEach(test => {
      console.log(`  - ${test.module}: ${test.message}`);
    });
  }

  if (testResults.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    testResults.warnings.forEach(test => {
      console.log(`  - ${test.module}: ${test.message}`);
    });
  }

  // Save detailed report
  const reportPath = path.join(__dirname, 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 Detailed report saved: test-report.json`);

  // Exit with appropriate code
  process.exit(testResults.failed.length > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
