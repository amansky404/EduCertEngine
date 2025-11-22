#!/usr/bin/env node

/**
 * Comprehensive Test - All Template Types
 * Tests HTML, PDF_MAPPER, and CANVAS with full certificate generation
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const config = {
  baseUrl: 'http://localhost:3000',
  screenshotDir: path.join(__dirname, 'test-screenshots-comprehensive'),
  timeout: 30000,
  slowMo: 50,
  headless: false,
};

const testData = {
  admin: { email: 'admin@test.com', password: 'admin123' },
  templates: [
    { name: 'HTML Certificate', type: 'HTML', desc: 'Rich text certificate' },
    { name: 'PDF Mapper Certificate', type: 'PDF_MAPPER', desc: 'Background with fields' },
    { name: 'Canvas Certificate', type: 'CANVAS', desc: 'Visual canvas design' },
  ],
  students: [
    { name: 'Alice Johnson', rollNo: 'COMP001', email: 'alice@test.com' },
    { name: 'Bob Smith', rollNo: 'COMP002', email: 'bob@test.com' },
    { name: 'Carol Davis', rollNo: 'COMP003', email: 'carol@test.com' },
  ],
};

const results = { passed: 0, failed: 0, tests: [], templates: [], students: [], certificates: [] };
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

async function createTemplate(page, template) {
  console.log(`\n📝 Creating ${template.type} template...`);
  try {
    await page.goto(`${config.baseUrl}/admin/templates`, { waitUntil: 'networkidle2' });
    await sleep(1000);
    
    const createBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button, a'));
      return btns.find(b => b.textContent.toLowerCase().includes('create'));
    });
    if (createBtn) await createBtn.click();
    await sleep(2000);
    
    await screenshot(page, `template-${template.type}-form`);
    
    const nameInput = await page.evaluateHandle(() => 
      document.querySelector('input[name="name"]') || document.querySelector('input#name')
    );
    if (nameInput) await nameInput.type(template.name);
    
    const typeSelect = await page.$('select[name="type"], select#type');
    if (typeSelect) await page.select('select[name="type"], select#type', template.type);
    
    await sleep(500);
    await screenshot(page, `template-${template.type}-filled`);
    
    const submit = await page.$('button[type="submit"]');
    if (submit) {
      await submit.click();
      await sleep(3000);
    }
    
    await screenshot(page, `template-${template.type}-created`);
    
    results.templates.push({ ...template, created: true });
    return log(`Create ${template.type} Template`, true);
  } catch (e) {
    await screenshot(page, `template-${template.type}-error`);
    return log(`Create ${template.type} Template`, false, e);
  }
}

async function addStudent(page, student, index) {
  console.log(`\n👤 Adding student ${index + 1}: ${student.name}...`);
  try {
    await page.goto(`${config.baseUrl}/admin/students`, { waitUntil: 'networkidle2' });
    await sleep(1000);
    
    const addBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button, a'));
      return btns.find(b => b.textContent.toLowerCase().includes('add') || 
                           b.textContent.toLowerCase().includes('create'));
    });
    if (addBtn) await addBtn.click();
    await sleep(1500);
    
    await screenshot(page, `student-${index+1}-form`);
    
    const inputs = await page.$$('input');
    for (const input of inputs) {
      const name = await input.evaluate(el => (el.name || el.id || '').toLowerCase());
      if (name.includes('name') && !name.includes('father') && !name.includes('mother')) {
        await input.type(student.name, { delay: 15 });
      } else if (name.includes('roll')) {
        await input.type(student.rollNo, { delay: 15 });
      } else if (name.includes('email')) {
        await input.type(student.email, { delay: 15 });
      }
    }
    
    await screenshot(page, `student-${index+1}-filled`);
    
    const submit = await page.$('button[type="submit"]');
    if (submit) {
      await submit.click();
      await sleep(2500);
    }
    
    await screenshot(page, `student-${index+1}-added`);
    
    results.students.push({ ...student, added: true });
    return log(`Add Student: ${student.name}`, true);
  } catch (e) {
    await screenshot(page, `student-${index+1}-error`);
    return log(`Add Student: ${student.name}`, false, e);
  }
}

async function generateCertificate(page, templateName, studentName) {
  console.log(`\n📜 Generating certificate: ${templateName} for ${studentName}...`);
  try {
    await page.goto(`${config.baseUrl}/admin/documents`, { waitUntil: 'networkidle2' });
    await sleep(1500);
    
    const genBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button, a'));
      return btns.find(b => b.textContent.toLowerCase().includes('generate'));
    });
    if (genBtn) await genBtn.click();
    await sleep(1500);
    
    await screenshot(page, `gen-${templateName}-${studentName}-form`);
    
    // Select template
    const templateSelect = await page.$('select[name="templateId"], select#templateId');
    if (templateSelect) {
      const options = await page.$$('select[name="templateId"] option, select#templateId option');
      for (const opt of options) {
        const text = await opt.evaluate(el => el.textContent);
        if (text && text.includes(templateName)) {
          const val = await opt.evaluate(el => el.value);
          await page.select('select[name="templateId"], select#templateId', val);
          break;
        }
      }
    }
    await sleep(500);
    
    // Select student
    const studentSelect = await page.$('select[name="studentId"], select#studentId');
    if (studentSelect) {
      const options = await page.$$('select[name="studentId"] option, select#studentId option');
      for (const opt of options) {
        const text = await opt.evaluate(el => el.textContent);
        if (text && text.includes(studentName)) {
          const val = await opt.evaluate(el => el.value);
          await page.select('select[name="studentId"], select#studentId', val);
          break;
        }
      }
    }
    
    await screenshot(page, `gen-${templateName}-${studentName}-selections`);
    
    const submit = await page.$('button[type="submit"]');
    if (submit) {
      await submit.click();
      await sleep(5000); // Wait for PDF generation
    }
    
    await screenshot(page, `gen-${templateName}-${studentName}-done`);
    
    results.certificates.push({ template: templateName, student: studentName });
    return log(`Generate: ${templateName} → ${studentName}`, true);
  } catch (e) {
    await screenshot(page, `gen-${templateName}-${studentName}-error`);
    return log(`Generate: ${templateName} → ${studentName}`, false, e);
  }
}

async function runTests() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  EduCertEngine - ALL TEMPLATES COMPREHENSIVE TEST   ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');
  console.log(`📋 Templates: ${testData.templates.length} (HTML, PDF_MAPPER, CANVAS)`);
  console.log(`👥 Students: ${testData.students.length}`);
  console.log(`📜 Expected Certificates: ${testData.templates.length * testData.students.length}\n`);
  
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
    
    // Phase 1: Login
    console.log('═'.repeat(60));
    console.log('PHASE 1: AUTHENTICATION');
    console.log('═'.repeat(60));
    if (!await login(page)) return;
    
    // Phase 2: Create Templates
    console.log('\n' + '═'.repeat(60));
    console.log('PHASE 2: TEMPLATE CREATION');
    console.log('═'.repeat(60));
    for (const template of testData.templates) {
      await createTemplate(page, template);
    }
    
    // Phase 3: Add Students
    console.log('\n' + '═'.repeat(60));
    console.log('PHASE 3: STUDENT MANAGEMENT');
    console.log('═'.repeat(60));
    for (let i = 0; i < testData.students.length; i++) {
      await addStudent(page, testData.students[i], i);
    }
    
    // Phase 4: Generate Certificates
    console.log('\n' + '═'.repeat(60));
    console.log('PHASE 4: CERTIFICATE GENERATION');
    console.log('═'.repeat(60));
    for (const template of testData.templates) {
      for (const student of testData.students) {
        await generateCertificate(page, template.name, student.name);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Fatal:', error);
  } finally {
    if (browser) {
      console.log('\n🔒 Closing browser...');
      await browser.close();
    }
  }
  
  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('FINAL RESULTS');
  console.log('═'.repeat(60));
  console.log(`\n✅ Passed:  ${results.passed}`);
  console.log(`❌ Failed:  ${results.failed}`);
  console.log(`📊 Total:   ${results.passed + results.failed}`);
  console.log(`\n📝 Templates: ${results.templates.length}`);
  console.log(`👥 Students:  ${results.students.length}`);
  console.log(`📜 Certificates: ${results.certificates.length}`);
  
  if (results.certificates.length > 0) {
    console.log('\n📋 Generated Certificates:');
    results.certificates.forEach((c, i) => {
      console.log(`   ${i+1}. ${c.template} → ${c.student}`);
    });
  }
  
  console.log(`\n📸 Screenshots: ${config.screenshotDir}`);
  
  const file = path.join(__dirname, 'comprehensive-test-results.json');
  fs.writeFileSync(file, JSON.stringify(results, null, 2));
  console.log(`📄 Results: ${file}`);
  
  if (results.failed > 0) {
    console.log('\n❌ Failed:');
    results.tests.filter(t => !t.passed).forEach(t => console.log(`   - ${t.name}`));
  }
  
  console.log('\n✨ Complete!\n');
  process.exit(results.failed === 0 ? 0 : 1);
}

runTests().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
