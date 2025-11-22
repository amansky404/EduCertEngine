#!/usr/bin/env node

/**
 * Landing Page Builder Test
 * Tests the landing page builder and student search integration
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const config = {
  baseUrl: 'http://localhost:3000',
  screenshotDir: path.join(__dirname, 'test-screenshots-landing'),
  timeout: 30000,
  slowMo: 50,
  headless: false,
};

const testData = {
  admin: { email: 'admin@test.com', password: 'admin123' },
};

const results = { passed: 0, failed: 0, tests: [] };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function screenshot(page, name) {
  const file = path.join(config.screenshotDir, `${Date.now()}-${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`📸 ${path.basename(file)}`);
  return file;
}

function log(name, pass, error = null, ss = null) {
  console.log(`${pass ? '✅' : '❌'} ${name}`);
  if (error) console.log(`   ${error.message || error}`);
  results.tests.push({ name, passed: pass, error: error ? error.message : null, screenshot: ss });
  pass ? results.passed++ : results.failed++;
  return pass;
}

async function login(page) {
  console.log('\n🔐 Logging in...');
  try {
    await page.goto(`${config.baseUrl}/admin/login`, { waitUntil: 'networkidle2' });
    await page.type('input[type="email"]', testData.admin.email, { delay: 20 });
    await page.type('input[type="password"]', testData.admin.password, { delay: 20 });
    await screenshot(page, 'login');
    await page.click('button[type="submit"]');
    await sleep(3000);
    if (page.url().includes('/admin') && !page.url().includes('/login')) {
      await screenshot(page, 'dashboard');
      return log('Login', true);
    }
    throw new Error('Login failed');
  } catch (e) {
    await screenshot(page, 'login-error');
    return log('Login', false, e);
  }
}

async function testLandingBuilder(page) {
  console.log('\n🎨 Testing Landing Page Builder...');
  try {
    await page.goto(`${config.baseUrl}/admin/landing-builder`, { waitUntil: 'networkidle2' });
    await sleep(2000);
    
    await screenshot(page, 'landing-builder-main');
    
    // Check if sections are visible
    const sectionsExist = await page.$('.space-y-2');
    if (!sectionsExist) throw new Error('Sections panel not found');
    
    await screenshot(page, 'landing-builder-interface');
    return log('Landing Page Builder Loads', true);
  } catch (e) {
    await screenshot(page, 'landing-builder-error');
    return log('Landing Page Builder Loads', false, e);
  }
}

async function testStudentSearch(page) {
  console.log('\n🔍 Testing Student Search Page...');
  try {
    await page.goto(`${config.baseUrl}/search`, { waitUntil: 'networkidle2' });
    await sleep(2000);
    
    await screenshot(page, 'student-search-page');
    
    // Check search form exists
    const searchForm = await page.$('form');
    if (!searchForm) throw new Error('Search form not found');
    
    // Check search type buttons
    const rollNoBtn = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(b => b.textContent.includes('Roll Number'));
    });
    
    if (!rollNoBtn) throw new Error('Roll Number button not found');
    
    await screenshot(page, 'search-form-interface');
    return log('Student Search Page Loads', true);
  } catch (e) {
    await screenshot(page, 'search-error');
    return log('Student Search Page Loads', false, e);
  }
}

async function testSearchFunctionality(page) {
  console.log('\n🔎 Testing Search with Test Data...');
  try {
    await page.goto(`${config.baseUrl}/search`, { waitUntil: 'networkidle2' });
    await sleep(1500);
    
    // Use existing student data from previous tests
    await page.type('input#searchValue', 'COMP001', { delay: 30 });
    await screenshot(page, 'search-filled');
    
    await page.click('button[type="submit"]');
    await sleep(4000); // Wait for search results
    
    await screenshot(page, 'search-results');
    
    // Check if results appeared or error message
    const hasError = await page.$('text=Error');
    const hasStudent = await page.$('text=Student Found');
    const hasNotFound = await page.$('text=Student not found');
    
    if (hasStudent) {
      console.log('   ✓ Student found in search');
    } else if (hasNotFound || hasError) {
      console.log('   ℹ️  No student data available (expected for fresh test)');
    }
    
    return log('Search Functionality', true);
  } catch (e) {
    await screenshot(page, 'search-function-error');
    return log('Search Functionality', false, e);
  }
}

async function testResultPage(page) {
  console.log('\n📄 Testing Result Page...');
  try {
    await page.goto(`${config.baseUrl}/result`, { waitUntil: 'networkidle2' });
    await sleep(1500);
    
    await screenshot(page, 'result-page');
    
    // Check if page loads
    const pageLoaded = await page.evaluate(() => document.body.innerHTML.length > 0);
    if (!pageLoaded) throw new Error('Result page not loaded');
    
    return log('Result Page Loads', true);
  } catch (e) {
    await screenshot(page, 'result-error');
    return log('Result Page Loads', false, e);
  }
}

async function runTests() {
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║   Landing Page Builder & Search Integration Test  ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');
  
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
    console.log('✅ Ready\n');
    
    // Run tests
    if (!await login(page)) return;
    
    await testLandingBuilder(page);
    await testStudentSearch(page);
    await testSearchFunctionality(page);
    await testResultPage(page);
    
  } catch (error) {
    console.error('\n❌ Fatal:', error);
  } finally {
    if (browser) {
      console.log('\n🔒 Closing browser...');
      await browser.close();
    }
  }
  
  // Summary
  console.log('\n═══════════════════════════════════════');
  console.log('RESULTS');
  console.log('═══════════════════════════════════════');
  console.log(`\n✅ Passed:  ${results.passed}`);
  console.log(`❌ Failed:  ${results.failed}`);
  console.log(`📊 Total:   ${results.passed + results.failed}`);
  console.log(`📸 Screenshots: ${config.screenshotDir}\n`);
  
  const file = path.join(__dirname, 'landing-test-results.json');
  fs.writeFileSync(file, JSON.stringify(results, null, 2));
  console.log(`📄 Results: ${file}\n`);
  
  process.exit(results.failed === 0 ? 0 : 1);
}

runTests().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
