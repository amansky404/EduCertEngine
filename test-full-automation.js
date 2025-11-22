#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const config = {
  baseUrl: 'http://localhost:3000',
  screenshotDir: path.join(__dirname, 'test-screenshots'),
  timeout: 30000,
  slowMo: 50,
  headless: false,
};

const testData = {
  admin: { email: 'admin@test.com', password: 'admin123' },
  template: { name: 'Auto Test Cert', type: 'HTML', description: 'Test template' },
  student: { name: 'John Doe', rollNo: 'AUTO001', email: 'john@test.com' },
};

const results = { passed: 0, failed: 0, tests: [] };

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function screenshot(page, name) {
  const file = path.join(config.screenshotDir, `${Date.now()}-${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`📸 ${file}`);
  return file;
}

function logTest(name, passed, error = null, ss = null) {
  const status = passed ? '✅' : '❌';
  console.log(`\n${status} ${name}`);
  if (error) console.log(`   Error: ${error.message || error}`);
  results.tests.push({ name, passed, error: error ? error.message : null, screenshot: ss });
  passed ? results.passed++ : results.failed++;
}

async function testHomepage(page) {
  try {
    await page.goto(config.baseUrl, { waitUntil: 'networkidle2' });
    const ss = await screenshot(page, 'homepage');
    logTest('Homepage Loads', true, null, ss);
  } catch (error) {
    const ss = await screenshot(page, 'homepage-error');
    logTest('Homepage Loads', false, error, ss);
  }
}

async function testLogin(page) {
  try {
    await page.goto(`${config.baseUrl}/admin/login`, { waitUntil: 'networkidle2' });
    await sleep(1000);
    
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    await page.type('input[type="email"]', testData.admin.email, { delay: 50 });
    await page.type('input[type="password"]', testData.admin.password, { delay: 50 });
    
    const ss1 = await screenshot(page, 'login-form');
    
    await page.click('button[type="submit"]');
    await sleep(4000);
    
    const url = page.url();
    const ss2 = await screenshot(page, 'after-login');
    
    if (url.includes('/admin') && !url.includes('/login')) {
      logTest('Admin Login', true, null, ss2);
      return true;
    } else {
      throw new Error(`Still at login: ${url}`);
    }
  } catch (error) {
    const ss = await screenshot(page, 'login-error');
    logTest('Admin Login', false, error, ss);
    return false;
  }
}

async function testNavigate(page, section, path) {
  try {
    await sleep(2000);
    
    // Try clicking link first
    try {
      const link = await page.$(`a[href*="${path}"]`);
      if (link) {
        await link.click();
        await sleep(2000);
      } else {
        await page.goto(`${config.baseUrl}${path}`, { waitUntil: 'networkidle2' });
      }
    } catch {
      await page.goto(`${config.baseUrl}${path}`, { waitUntil: 'networkidle2' });
    }
    
    const ss = await screenshot(page, `${section}-page`);
    const url = page.url();
    
    if (url.includes(path)) {
      logTest(`Navigate to ${section}`, true, null, ss);
      return true;
    } else {
      throw new Error(`Not at ${path}, at: ${url}`);
    }
  } catch (error) {
    const ss = await screenshot(page, `${section}-nav-error`);
    logTest(`Navigate to ${section}`, false, error, ss);
    return false;
  }
}

async function testCreateTemplate(page) {
  try {
    await sleep(1000);
    
    // Click create button
    const createBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      return buttons.find(b => b.textContent.toLowerCase().includes('create'));
    });
    
    if (createBtn) {
      await createBtn.click();
      await sleep(2000);
    }
    
    const ss1 = await screenshot(page, 'create-template-form');
    
    // Fill form
    await page.waitForSelector('input', { timeout: 5000 });
    
    // Name field
    const nameInput = await page.evaluateHandle(() => {
      return document.querySelector('input[name="name"]') || 
             document.querySelector('input#name') ||
             document.querySelector('input[placeholder*="name" i]');
    });
    if (nameInput) await nameInput.type(testData.template.name);
    
    // Type select
    const typeSelect = await page.$('select[name="type"], select#type');
    if (typeSelect) {
      await page.select('select[name="type"], select#type', 'HTML');
    }
    
    const ss2 = await screenshot(page, 'template-form-filled');
    
    // Submit
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await sleep(3000);
    }
    
    const ss3 = await screenshot(page, 'template-created');
    logTest('Create Template', true, null, ss3);
    return true;
  } catch (error) {
    const ss = await screenshot(page, 'create-template-error');
    logTest('Create Template', false, error, ss);
    return false;
  }
}

async function testAddStudent(page) {
  try {
    await sleep(1000);
    
    // Click add button
    const addBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      return buttons.find(b => b.textContent.toLowerCase().includes('add') || 
                               b.textContent.toLowerCase().includes('create'));
    });
    
    if (addBtn) {
      await addBtn.click();
      await sleep(1500);
    }
    
    const ss1 = await screenshot(page, 'add-student-form');
    
    // Fill fields
    await sleep(500);
    const inputs = await page.$$('input');
    
    for (const input of inputs) {
      const name = await input.evaluate(el => el.name || el.id);
      if (name && name.includes('name')) {
        await input.type(testData.student.name, { delay: 30 });
      } else if (name && name.includes('roll')) {
        await input.type(testData.student.rollNo, { delay: 30 });
      } else if (name && name.includes('email')) {
        await input.type(testData.student.email, { delay: 30 });
      }
    }
    
    const ss2 = await screenshot(page, 'student-form-filled');
    
    // Submit
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await sleep(3000);
    }
    
    const ss3 = await screenshot(page, 'student-added');
    logTest('Add Student', true, null, ss3);
    return true;
  } catch (error) {
    const ss = await screenshot(page, 'add-student-error');
    logTest('Add Student', false, error, ss);
    return false;
  }
}

async function testGenerateCertificate(page) {
  try {
    await sleep(2000);
    
    // Click generate button
    const genBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      return buttons.find(b => b.textContent.toLowerCase().includes('generate'));
    });
    
    if (genBtn) {
      await genBtn.click();
      await sleep(1500);
    }
    
    const ss1 = await screenshot(page, 'generate-form');
    
    // Select options
    const selects = await page.$$('select');
    for (const select of selects) {
      const options = await select.$$('option');
      if (options.length > 1) {
        const value = await options[1].evaluate(el => el.value);
        await select.select(value);
        await sleep(300);
      }
    }
    
    const ss2 = await screenshot(page, 'generate-selections');
    
    // Submit
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await sleep(6000); // Wait for PDF generation
    }
    
    const ss3 = await screenshot(page, 'certificate-generated');
    logTest('Generate Certificate', true, null, ss3);
    return true;
  } catch (error) {
    const ss = await screenshot(page, 'generate-error');
    logTest('Generate Certificate', false, error, ss);
    return false;
  }
}

async function runTests() {
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   EduCertEngine Full Flow Test (Chrome)  ║');
  console.log('╚═══════════════════════════════════════════╝\n');
  
  if (!fs.existsSync(config.screenshotDir)) {
    fs.mkdirSync(config.screenshotDir, { recursive: true });
  }
  
  let browser;
  
  try {
    console.log('🚀 Launching Chrome...');
    browser = await puppeteer.launch({
      headless: config.headless,
      slowMo: config.slowMo,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('✅ Browser ready\n');
    
    await testHomepage(page);
    
    const loginOk = await testLogin(page);
    if (!loginOk) {
      console.log('\n⚠️  Login failed. Ensure admin@test.com exists.');
      return;
    }
    
    await testNavigate(page, 'Templates', '/admin/templates');
    await testCreateTemplate(page);
    
    await testNavigate(page, 'Students', '/admin/students');
    await testAddStudent(page);
    
    await testNavigate(page, 'Documents', '/admin/documents');
    await testGenerateCertificate(page);
    
  } catch (error) {
    console.error('\n❌ Fatal:', error);
  } finally {
    if (browser) {
      console.log('\n🔒 Closing browser...');
      await browser.close();
    }
  }
  
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║            Test Summary                   ║');
  console.log('╚═══════════════════════════════════════════╝\n');
  console.log(`✅ Passed:  ${results.passed}`);
  console.log(`❌ Failed:  ${results.failed}`);
  console.log(`📊 Total:   ${results.passed + results.failed}`);
  console.log(`📸 Screenshots: ${config.screenshotDir}`);
  
  const file = path.join(__dirname, 'automation-test-results.json');
  fs.writeFileSync(file, JSON.stringify(results, null, 2));
  console.log(`📄 Results: ${file}\n`);
  
  if (results.failed > 0) {
    console.log('❌ Failed Tests:');
    results.tests.filter(t => !t.passed).forEach(t => {
      console.log(`   - ${t.name}: ${t.error}`);
    });
  }
  
  console.log('\n✨ Done!\n');
  process.exit(results.failed === 0 ? 0 : 1);
}

runTests().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
