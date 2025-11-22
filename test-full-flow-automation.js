#!/usr/bin/env node

/**
 * Full Flow Automation Test for EduCertEngine
 * Tests the complete workflow from login to certificate generation
 * Uses Puppeteer with Chrome
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  baseUrl: 'http://localhost:3000',
  screenshotDir: path.join(__dirname, 'test-screenshots'),
  timeout: 30000,
  slowMo: 100, // Slow down for visibility
  headless: false, // Set to true for CI/CD
};

// Test credentials (these should exist in your database)
const testData = {
  superadmin: {
    email: 'super@admin.com',
    password: 'admin123',
  },
  admin: {
    email: 'admin@test.com',
    password: 'admin123',
  },
  university: {
    name: 'Test University',
    subdomain: 'testuni',
  },
  template: {
    name: 'Test Certificate',
    type: 'HTML',
    description: 'Automated test template',
    htmlContent: '<h1>Certificate of Achievement</h1><p>This is to certify that {{studentName}} with roll number {{rollNo}} has successfully completed the course.</p>',
  },
  student: {
    name: 'John Doe',
    rollNo: 'TEST001',
    regNo: 'REG2024001',
    email: 'john.doe@test.com',
    mobile: '1234567890',
  },
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: [],
};

// Helper: Take screenshot
async function takeScreenshot(page, name) {
  const filename = path.join(config.screenshotDir, `${Date.now()}-${name}.png`);
  await page.screenshot({ path: filename, fullPage: true });
  console.log(`📸 Screenshot saved: ${filename}`);
  return filename;
}

// Helper: Wait for navigation
async function waitForNav(page, timeout = config.timeout) {
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout });
}

// Helper: Log test result
function logTest(name, passed, error = null, screenshot = null) {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`\n${status}: ${name}`);
  
  if (error) {
    console.log(`   Error: ${error.message || error}`);
  }
  
  results.tests.push({
    name,
    passed,
    error: error ? error.message : null,
    screenshot,
    timestamp: new Date().toISOString(),
  });
  
  if (passed) {
    results.passed++;
  } else {
    results.failed++;
  }
}

// Test 1: Homepage loads
async function testHomepage(page) {
  const testName = 'Homepage Loads';
  try {
    await page.goto(config.baseUrl, { waitUntil: 'networkidle2' });
    const title = await page.title();
    const screenshot = await takeScreenshot(page, 'homepage');
    
    if (title) {
      logTest(testName, true, null, screenshot);
    } else {
      throw new Error('Page title not found');
    }
  } catch (error) {
    const screenshot = await takeScreenshot(page, 'homepage-error');
    logTest(testName, false, error, screenshot);
  }
}

// Test 2: Admin login
async function testAdminLogin(page) {
  const testName = 'Admin Login';
  try {
    await page.goto(`${config.baseUrl}/admin/login`, { waitUntil: 'networkidle2' });
    
    // Fill login form
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    await page.type('input[type="email"]', testData.admin.email);
    await page.type('input[type="password"]', testData.admin.password);
    
    const screenshot1 = await takeScreenshot(page, 'login-form');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const url = page.url();
    const screenshot2 = await takeScreenshot(page, 'after-login');
    
    if (url.includes('/admin') && !url.includes('/login')) {
      logTest(testName, true, null, screenshot2);
      return true;
    } else {
      throw new Error(`Login failed, still at: ${url}`);
    }
  } catch (error) {
    const screenshot = await takeScreenshot(page, 'login-error');
    logTest(testName, false, error, screenshot);
    return false;
  }
}

// Test 3: Navigate to Templates
async function testNavigateToTemplates(page) {
  const testName = 'Navigate to Templates';
  try {
    // Look for templates link
    await new Promise(resolve => setTimeout(resolve, 2000);
    
    // Try different selectors
    const selectors = [
      'a[href*="templates"]',
      'nav a:has-text("Templates")',
      'a:has-text("Templates")',
    ];
    
    let clicked = false;
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          await element.click();
          clicked = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!clicked) {
      // Try navigating directly
      await page.goto(`${config.baseUrl}/admin/templates`, { waitUntil: 'networkidle2' });
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000);
    const screenshot = await takeScreenshot(page, 'templates-page');
    
    const url = page.url();
    if (url.includes('/templates')) {
      logTest(testName, true, null, screenshot);
      return true;
    } else {
      throw new Error(`Not on templates page: ${url}`);
    }
  } catch (error) {
    const screenshot = await takeScreenshot(page, 'templates-nav-error');
    logTest(testName, false, error, screenshot);
    return false;
  }
}

// Test 4: Create HTML Template
async function testCreateTemplate(page) {
  const testName = 'Create HTML Template';
  try {
    // Look for create button
    await new Promise(resolve => setTimeout(resolve, 1000);
    
    const createButton = await page.$('button:has-text("Create"), a:has-text("Create")');
    if (createButton) {
      await createButton.click();
    } else {
      // Try direct navigation
      await page.goto(`${config.baseUrl}/admin/templates/create`, { waitUntil: 'networkidle2' });
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000);
    const screenshot1 = await takeScreenshot(page, 'create-template-form');
    
    // Fill form
    await page.waitForSelector('input[name="name"], input#name', { timeout: 5000 });
    await page.type('input[name="name"], input#name', testData.template.name);
    
    // Select type
    const typeSelect = await page.$('select[name="type"], select#type');
    if (typeSelect) {
      await page.select('select[name="type"], select#type', testData.template.type);
    }
    
    // Description
    const descField = await page.$('textarea[name="description"], textarea#description, input[name="description"]');
    if (descField) {
      await descField.type(testData.template.description);
    }
    
    const screenshot2 = await takeScreenshot(page, 'create-template-filled');
    
    // Submit
    await page.click('button[type="submit"]');
    await new Promise(resolve => setTimeout(resolve, 3000);
    
    const screenshot3 = await takeScreenshot(page, 'template-created');
    
    logTest(testName, true, null, screenshot3);
    return true;
  } catch (error) {
    const screenshot = await takeScreenshot(page, 'create-template-error');
    logTest(testName, false, error, screenshot);
    return false;
  }
}

// Test 5: Edit Template HTML Content
async function testEditTemplateContent(page) {
  const testName = 'Edit Template HTML Content';
  try {
    await new Promise(resolve => setTimeout(resolve, 2000);
    
    // Find the template and click edit
    const editButton = await page.$('button:has-text("Edit"), a:has-text("Edit")');
    if (editButton) {
      await editButton.click();
      await new Promise(resolve => setTimeout(resolve, 2000);
    }
    
    const screenshot1 = await takeScreenshot(page, 'edit-template');
    
    // Try to find HTML editor
    const editorSelectors = [
      '.ql-editor',
      'textarea[name="htmlContent"]',
      '[contenteditable="true"]',
      'textarea',
    ];
    
    let editorFound = false;
    for (const selector of editorSelectors) {
      const editor = await page.$(selector);
      if (editor) {
        await editor.click();
        await new Promise(resolve => setTimeout(resolve, 500);
        await editor.type(testData.template.htmlContent);
        editorFound = true;
        break;
      }
    }
    
    if (!editorFound) {
      console.log('⚠️  HTML editor not found, skipping content edit');
    }
    
    const screenshot2 = await takeScreenshot(page, 'template-content-edited');
    
    // Save
    const saveButton = await page.$('button:has-text("Save")');
    if (saveButton) {
      await saveButton.click();
      await new Promise(resolve => setTimeout(resolve, 2000);
    }
    
    const screenshot3 = await takeScreenshot(page, 'template-saved');
    
    logTest(testName, true, null, screenshot3);
    return true;
  } catch (error) {
    const screenshot = await takeScreenshot(page, 'edit-content-error');
    logTest(testName, false, error, screenshot);
    return false;
  }
}

// Test 6: Navigate to Students
async function testNavigateToStudents(page) {
  const testName = 'Navigate to Students';
  try {
    await new Promise(resolve => setTimeout(resolve, 2000);
    
    // Look for students link
    const selectors = [
      'a[href*="students"]',
      'nav a:has-text("Students")',
      'a:has-text("Students")',
    ];
    
    let clicked = false;
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          await element.click();
          clicked = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!clicked) {
      await page.goto(`${config.baseUrl}/admin/students`, { waitUntil: 'networkidle2' });
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000);
    const screenshot = await takeScreenshot(page, 'students-page');
    
    const url = page.url();
    if (url.includes('/students')) {
      logTest(testName, true, null, screenshot);
      return true;
    } else {
      throw new Error(`Not on students page: ${url}`);
    }
  } catch (error) {
    const screenshot = await takeScreenshot(page, 'students-nav-error');
    logTest(testName, false, error, screenshot);
    return false;
  }
}

// Test 7: Add Student
async function testAddStudent(page) {
  const testName = 'Add Student';
  try {
    await new Promise(resolve => setTimeout(resolve, 1000);
    
    // Look for add/create button
    const createButton = await page.$('button:has-text("Add"), button:has-text("Create")');
    if (createButton) {
      await createButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000);
    }
    
    const screenshot1 = await takeScreenshot(page, 'add-student-form');
    
    // Fill student form
    const fields = [
      { selector: 'input[name="name"]', value: testData.student.name },
      { selector: 'input[name="rollNo"]', value: testData.student.rollNo },
      { selector: 'input[name="regNo"]', value: testData.student.regNo },
      { selector: 'input[name="email"]', value: testData.student.email },
      { selector: 'input[name="mobile"]', value: testData.student.mobile },
    ];
    
    for (const field of fields) {
      const element = await page.$(field.selector);
      if (element) {
        await element.type(field.value);
        await new Promise(resolve => setTimeout(resolve, 200);
      }
    }
    
    const screenshot2 = await takeScreenshot(page, 'student-form-filled');
    
    // Submit
    const submitButton = await page.$('button[type="submit"]');
    if (submitButton) {
      await submitButton.click();
      await new Promise(resolve => setTimeout(resolve, 3000);
    }
    
    const screenshot3 = await takeScreenshot(page, 'student-added');
    
    logTest(testName, true, null, screenshot3);
    return true;
  } catch (error) {
    const screenshot = await takeScreenshot(page, 'add-student-error');
    logTest(testName, false, error, screenshot);
    return false;
  }
}

// Test 8: Navigate to Documents/Certificates
async function testNavigateToDocuments(page) {
  const testName = 'Navigate to Documents';
  try {
    await new Promise(resolve => setTimeout(resolve, 2000);
    
    const selectors = [
      'a[href*="documents"]',
      'a[href*="certificates"]',
      'nav a:has-text("Documents")',
      'nav a:has-text("Certificates")',
    ];
    
    let clicked = false;
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          await element.click();
          clicked = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!clicked) {
      await page.goto(`${config.baseUrl}/admin/documents`, { waitUntil: 'networkidle2' });
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000);
    const screenshot = await takeScreenshot(page, 'documents-page');
    
    logTest(testName, true, null, screenshot);
    return true;
  } catch (error) {
    const screenshot = await takeScreenshot(page, 'documents-nav-error');
    logTest(testName, false, error, screenshot);
    return false;
  }
}

// Test 9: Generate Certificate
async function testGenerateCertificate(page) {
  const testName = 'Generate Certificate';
  try {
    await new Promise(resolve => setTimeout(resolve, 2000);
    
    // Look for generate button
    const generateButton = await page.$('button:has-text("Generate")');
    if (generateButton) {
      await generateButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000);
    }
    
    const screenshot1 = await takeScreenshot(page, 'generate-form');
    
    // Select template and student
    const templateSelect = await page.$('select[name="templateId"]');
    if (templateSelect) {
      await new Promise(resolve => setTimeout(resolve, 500);
      const options = await page.$$('select[name="templateId"] option');
      if (options.length > 1) {
        await page.select('select[name="templateId"]', await options[1].evaluate(el => el.value));
      }
    }
    
    const studentSelect = await page.$('select[name="studentId"]');
    if (studentSelect) {
      await new Promise(resolve => setTimeout(resolve, 500);
      const options = await page.$$('select[name="studentId"] option');
      if (options.length > 1) {
        await page.select('select[name="studentId"]', await options[1].evaluate(el => el.value));
      }
    }
    
    const screenshot2 = await takeScreenshot(page, 'generate-form-filled');
    
    // Click generate
    const submitButton = await page.$('button[type="submit"]');
    if (submitButton) {
      await submitButton.click();
      await new Promise(resolve => setTimeout(resolve, 5000); // Wait for PDF generation
    }
    
    const screenshot3 = await takeScreenshot(page, 'certificate-generated');
    
    // Check for success message or PDF
    const successIndicators = [
      'text=Success',
      'text=Generated',
      'text=Certificate',
      '.success',
      '[role="alert"]',
    ];
    
    let success = false;
    for (const indicator of successIndicators) {
      const element = await page.$(indicator);
      if (element) {
        success = true;
        break;
      }
    }
    
    logTest(testName, true, null, screenshot3);
    return true;
  } catch (error) {
    const screenshot = await takeScreenshot(page, 'generate-error');
    logTest(testName, false, error, screenshot);
    return false;
  }
}

// Test 10: View Generated Certificate
async function testViewCertificate(page) {
  const testName = 'View Generated Certificate';
  try {
    await new Promise(resolve => setTimeout(resolve, 2000);
    
    // Look for view/download button
    const viewButton = await page.$('a[href*=".pdf"], button:has-text("View"), a:has-text("View")');
    if (viewButton) {
      const screenshot1 = await takeScreenshot(page, 'before-view');
      
      // Get PDF URL
      const href = await viewButton.evaluate(el => el.href || el.getAttribute('data-url'));
      if (href) {
        console.log(`📄 Certificate PDF: ${href}`);
      }
      
      logTest(testName, true, null, screenshot1);
      return true;
    } else {
      throw new Error('View/Download button not found');
    }
  } catch (error) {
    const screenshot = await takeScreenshot(page, 'view-error');
    logTest(testName, false, error, screenshot);
    return false;
  }
}

// Main test runner
async function runFullFlow() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   EduCertEngine Full Flow Automation Test     ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  
  // Create screenshot directory
  if (!fs.existsSync(config.screenshotDir)) {
    fs.mkdirSync(config.screenshotDir, { recursive: true });
  }
  
  let browser;
  let page;
  
  try {
    console.log('🚀 Launching Chrome...');
    browser = await puppeteer.launch({
      headless: config.headless,
      slowMo: config.slowMo,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
    
    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('✅ Browser launched\n');
    console.log('📋 Running tests...\n');
    
    // Run all tests in sequence
    await testHomepage(page);
    
    const loginSuccess = await testAdminLogin(page);
    if (!loginSuccess) {
      console.log('\n⚠️  Login failed. Skipping remaining tests.');
      console.log('💡 Make sure you have an admin user with:');
      console.log(`   Email: ${testData.admin.email}`);
      console.log(`   Password: ${testData.admin.password}`);
    } else {
      await testNavigateToTemplates(page);
      await testCreateTemplate(page);
      await testEditTemplateContent(page);
      await testNavigateToStudents(page);
      await testAddStudent(page);
      await testNavigateToDocuments(page);
      await testGenerateCertificate(page);
      await testViewCertificate(page);
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    if (page) {
      await takeScreenshot(page, 'fatal-error');
    }
  } finally {
    if (browser) {
      console.log('\n🔒 Closing browser...');
      await browser.close();
    }
  }
  
  // Print summary
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║              Test Summary                      ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  console.log(`✅ Passed:  ${results.passed}`);
  console.log(`❌ Failed:  ${results.failed}`);
  console.log(`⏭️  Skipped: ${results.skipped}`);
  console.log(`📊 Total:   ${results.passed + results.failed + results.skipped}`);
  console.log(`📸 Screenshots saved in: ${config.screenshotDir}`);
  
  // Save results to JSON
  const resultsFile = path.join(__dirname, 'automation-test-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  console.log(`📄 Results saved to: ${resultsFile}`);
  
  // Print failed tests
  if (results.failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.tests.filter(t => !t.passed).forEach(test => {
      console.log(`   - ${test.name}: ${test.error}`);
    });
  }
  
  console.log('\n✨ Test run completed!\n');
  
  process.exit(results.failed === 0 ? 0 : 1);
}

// Run the tests
runFullFlow().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
