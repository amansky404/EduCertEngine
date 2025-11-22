const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, 'dynamic-builder-screenshots');
const REPORT_FILE = path.join(__dirname, 'dynamic-builder-report.json');

// Test data
const TEST_CREDENTIALS = {
  superadmin: { email: 'superadmin@example.com', password: 'superadmin123' },
  admin: { email: 'admin@university.edu', password: 'admin123' }
};

const TEMPLATE_TYPES = ['HTML', 'PDF', 'CSV'];

// Test results
const testResults = {
  timestamp: new Date().toISOString(),
  totalTests: 0,
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to take screenshot
async function takeScreenshot(page, name) {
  const screenshotPath = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`📸 Screenshot saved: ${name}`);
  return screenshotPath;
}

// Helper function to log test result
function logTestResult(testName, status, details = {}) {
  const result = {
    test: testName,
    status,
    timestamp: new Date().toISOString(),
    ...details
  };
  
  testResults.totalTests++;
  if (status === 'PASSED') {
    testResults.passed++;
    console.log(`✅ ${testName} - PASSED`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName} - FAILED`);
    if (details.error) console.error(`   Error: ${details.error}`);
  }
  
  testResults.tests.push(result);
}

// Login function
async function login(page, role = 'admin') {
  console.log(`\n🔐 Logging in as ${role}...`);
  
  try {
    await page.goto(`${BASE_URL}/${role}/login`, { waitUntil: 'networkidle2', timeout: 30000 });
    await wait(1000);
    await takeScreenshot(page, `01-${role}-login-page`);
    
    // Fill login form
    await page.type('input[type="email"], input[name="email"]', TEST_CREDENTIALS[role].email);
    await page.type('input[type="password"], input[name="password"]', TEST_CREDENTIALS[role].password);
    await takeScreenshot(page, `02-${role}-login-filled`);
    
    // Click login button
    await page.click('button[type="submit"]');
    await wait(3000);
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
    
    await takeScreenshot(page, `03-${role}-dashboard`);
    logTestResult(`${role.toUpperCase()} Login`, 'PASSED');
    return true;
  } catch (error) {
    logTestResult(`${role.toUpperCase()} Login`, 'FAILED', { error: error.message });
    return false;
  }
}

// Test HTML Template Builder
async function testHTMLTemplateBuilder(page) {
  console.log('\n📄 Testing HTML Template Builder...');
  
  try {
    // Navigate to templates page
    await page.goto(`${BASE_URL}/admin/templates`, { waitUntil: 'networkidle2', timeout: 30000 });
    await wait(2000);
    await takeScreenshot(page, '10-templates-page');
    
    // Click "Create New Template" button
    await page.click('button:contains("Create New Template")');
    await wait(1000);
    await takeScreenshot(page, '11-create-form-opened');
    
    // Click HTML Builder tab
    await page.click('button[value="HTML"]');
    await wait(500);
    await takeScreenshot(page, '12-html-tab-selected');
    
    // Fill template name
    const templateName = `HTML_Template_${Date.now()}`;
    await page.type('input#name', templateName);
    await wait(500);
    
    // Fill description
    await page.type('textarea#description', 'Automated test HTML template');
    await wait(500);
    await takeScreenshot(page, '13-html-form-filled');
    
    // Click Create Template button
    await page.click('button[type="submit"]:contains("Create Template")');
    await wait(3000);
    await takeScreenshot(page, '14-html-template-created');
    
    logTestResult('HTML Template Creation', 'PASSED', { templateName });
    return true;
  } catch (error) {
    await takeScreenshot(page, '14-html-template-error');
    logTestResult('HTML Template Creation', 'FAILED', { error: error.message });
    return false;
  }
}

// Test PDF Template Builder
async function testPDFTemplateBuilder(page) {
  console.log('\n📑 Testing PDF Template Builder...');
  
  try {
    // Navigate to templates page
    await page.goto(`${BASE_URL}/admin/templates`, { waitUntil: 'networkidle2', timeout: 30000 });
    await wait(2000);
    
    // Click "Create New Template" button
    await page.click('button:contains("Create New Template")');
    await wait(1000);
    await takeScreenshot(page, '20-create-form-opened');
    
    // Click PDF Mapper tab
    await page.click('button[value="PDF_MAPPER"]');
    await wait(500);
    await takeScreenshot(page, '21-pdf-tab-selected');
    
    // Fill template name
    const templateName = `PDF_Template_${Date.now()}`;
    await page.type('input#name', templateName);
    await wait(500);
    
    // Fill description
    await page.type('textarea#description', 'Automated test PDF template');
    await wait(500);
    await takeScreenshot(page, '22-pdf-form-filled');
    
    // Click Create Template button
    await page.click('button[type="submit"]:contains("Create Template")');
    await wait(3000);
    await takeScreenshot(page, '23-pdf-template-created');
    
    logTestResult('PDF Template Creation', 'PASSED', { templateName });
    return true;
  } catch (error) {
    await takeScreenshot(page, '23-pdf-template-error');
    logTestResult('PDF Template Creation', 'FAILED', { error: error.message });
    return false;
  }
}

// Test CSV Template Builder  
async function testCSVTemplateBuilder(page) {
  console.log('\n📊 Testing Direct Upload Template Builder...');
  
  try {
    // Navigate to templates page
    await page.goto(`${BASE_URL}/admin/templates`, { waitUntil: 'networkidle2', timeout: 30000 });
    await wait(2000);
    
    // Click "Create New Template" button
    await page.click('button:contains("Create New Template")');
    await wait(1000);
    await takeScreenshot(page, '30-create-form-opened');
    
    // Click Direct Upload tab
    await page.click('button[value="DIRECT_UPLOAD"]');
    await wait(500);
    await takeScreenshot(page, '31-direct-upload-tab-selected');
    
    // Fill template name
    const templateName = `DirectUpload_Template_${Date.now()}`;
    await page.type('input#name', templateName);
    await wait(500);
    
    // Fill description
    await page.type('textarea#description', 'Automated test Direct Upload template');
    await wait(500);
    await takeScreenshot(page, '32-direct-upload-form-filled');
    
    // Click Create Template button
    await page.click('button[type="submit"]:contains("Create Template")');
    await wait(3000);
    await takeScreenshot(page, '33-direct-upload-template-created');
    
    logTestResult('Direct Upload Template Creation', 'PASSED', { templateName });
    return true;
  } catch (error) {
    await takeScreenshot(page, '33-direct-upload-template-error');
    logTestResult('Direct Upload Template Creation', 'FAILED', { error: error.message });
    return false;
  }
}

// Test template listing and verification
async function testTemplatesList(page) {
  console.log('\n📋 Testing Templates List...');
  
  try {
    await page.goto(`${BASE_URL}/admin/templates`, { waitUntil: 'networkidle2', timeout: 30000 });
    await wait(2000);
    await takeScreenshot(page, '40-templates-list');
    
    // Check if templates are displayed
    const templates = await page.$$('.border.rounded-lg, [class*="grid"] > div');
    console.log(`Found ${templates.length} template elements`);
    
    if (templates.length > 0) {
      logTestResult('Templates List Display', 'PASSED', { templateCount: templates.length });
    } else {
      logTestResult('Templates List Display', 'FAILED', { error: 'No templates found' });
    }
    
    return true;
  } catch (error) {
    await takeScreenshot(page, '40-templates-list-error');
    logTestResult('Templates List Display', 'FAILED', { error: error.message });
    return false;
  }
}

// Test certificate generation workflow
async function testCertificateGeneration(page) {
  console.log('\n🎓 Testing Certificate Generation Workflow...');
  
  try {
    await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'networkidle2', timeout: 30000 });
    await wait(2000);
    await takeScreenshot(page, '50-admin-dashboard');
    
    // Try to navigate to documents/certificates
    await page.goto(`${BASE_URL}/admin/documents`, { waitUntil: 'networkidle2', timeout: 30000 });
    await wait(2000);
    await takeScreenshot(page, '51-documents-page');
    
    logTestResult('Certificate Generation Page Access', 'PASSED');
    return true;
  } catch (error) {
    await takeScreenshot(page, '51-certificate-generation-error');
    logTestResult('Certificate Generation Page Access', 'FAILED', { error: error.message });
    return false;
  }
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting Dynamic Template Builder Tests...\n');
  console.log('=' .repeat(60));
  
  // Create screenshots directory
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
  
  let browser;
  
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: false,
      args: [
        '--start-maximized',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ],
      defaultViewport: null
    });
    
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(30000);
    
    // Test 1: Login
    const loginSuccess = await login(page, 'admin');
    
    if (loginSuccess) {
      // Test 2: HTML Template Builder
      await testHTMLTemplateBuilder(page);
      await wait(2000);
      
      // Test 3: PDF Template Builder
      await testPDFTemplateBuilder(page);
      await wait(2000);
      
      // Test 4: CSV Template Builder
      await testCSVTemplateBuilder(page);
      await wait(2000);
      
      // Test 5: Templates List
      await testTemplatesList(page);
      await wait(2000);
      
      // Test 6: Certificate Generation
      await testCertificateGeneration(page);
      await wait(2000);
    }
    
    // Generate report
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${testResults.totalTests}`);
    console.log(`Passed: ${testResults.passed} ✅`);
    console.log(`Failed: ${testResults.failed} ❌`);
    console.log(`Success Rate: ${((testResults.passed / testResults.totalTests) * 100).toFixed(2)}%`);
    console.log('='.repeat(60));
    
    // Save report
    fs.writeFileSync(REPORT_FILE, JSON.stringify(testResults, null, 2));
    console.log(`\n📄 Detailed report saved to: ${REPORT_FILE}`);
    console.log(`📸 Screenshots saved to: ${SCREENSHOTS_DIR}`);
    
    console.log('\n⏳ Browser will close in 10 seconds...');
    await wait(10000);
    
  } catch (error) {
    console.error('❌ Fatal error during testing:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run tests
runAllTests().catch(console.error);
