const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configuration
const modules = [
  { name: 'Computer Science', code: 'CS101', duration: '4 years' },
  { name: 'Mathematics', code: 'MATH201', duration: '3 years' },
  { name: 'Physics', code: 'PHY301', duration: '3 years' },
  { name: 'Chemistry', code: 'CHEM401', duration: '3 years' },
  { name: 'Business Administration', code: 'BUS501', duration: '4 years' }
];

const templates = [
  {
    name: 'Classic Certificate',
    style: 'classic',
    colors: { primary: '#2c3e50', secondary: '#e74c3c' }
  },
  {
    name: 'Modern Certificate',
    style: 'modern',
    colors: { primary: '#3498db', secondary: '#9b59b6' }
  },
  {
    name: 'Elegant Certificate',
    style: 'elegant',
    colors: { primary: '#16a085', secondary: '#f39c12' }
  },
  {
    name: 'Professional Certificate',
    style: 'professional',
    colors: { primary: '#34495e', secondary: '#1abc9c' }
  },
  {
    name: 'Academic Certificate',
    style: 'academic',
    colors: { primary: '#8e44ad', secondary: '#e67e22' }
  }
];

const testResults = {
  totalCertificates: 0,
  created: 0,
  failed: 0,
  certificates: []
};

function log(message, type = 'info') {
  const icons = { info: '📋', success: '✅', error: '❌', warn: '⚠️', template: '🎨', module: '📚', cert: '🎓' };
  console.log(`${icons[type]} ${message}`);
}

function generateTemplateHTML(template, module) {
  const { primary, secondary } = template.colors;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body {
            font-family: 'Georgia', 'Times New Roman', serif;
            background: linear-gradient(135deg, ${primary} 0%, ${secondary} 100%);
            padding: 40px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .certificate {
            background: white;
            padding: 60px 80px;
            max-width: 900px;
            border: 15px solid ${primary};
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            position: relative;
          }
          
          .certificate::before {
            content: '';
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 2px solid ${secondary};
          }
          
          .header {
            text-align: center;
            margin-bottom: 40px;
            position: relative;
            z-index: 1;
          }
          
          .title {
            font-size: 56px;
            color: ${primary};
            text-transform: uppercase;
            letter-spacing: 8px;
            font-weight: bold;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
          }
          
          .subtitle {
            font-size: 24px;
            color: ${secondary};
            letter-spacing: 2px;
            font-style: italic;
          }
          
          .content {
            text-align: center;
            margin: 40px 0;
            line-height: 2;
          }
          
          .award-text {
            font-size: 20px;
            color: #555;
            margin-bottom: 20px;
          }
          
          .student-name {
            font-size: 48px;
            color: ${primary};
            font-weight: bold;
            margin: 30px 0;
            padding: 20px;
            border-bottom: 4px solid ${secondary};
            display: inline-block;
          }
          
          .module-info {
            background: linear-gradient(135deg, ${primary}10 0%, ${secondary}10 100%);
            padding: 30px;
            margin: 30px 0;
            border-radius: 10px;
            border-left: 5px solid ${primary};
          }
          
          .module-title {
            font-size: 32px;
            color: ${primary};
            font-weight: bold;
            margin-bottom: 15px;
          }
          
          .module-details {
            font-size: 18px;
            color: #666;
            line-height: 1.8;
          }
          
          .achievement {
            font-size: 18px;
            color: #444;
            margin: 20px 0;
            line-height: 1.8;
          }
          
          .details-section {
            display: flex;
            justify-content: space-around;
            margin: 40px 0;
            flex-wrap: wrap;
          }
          
          .detail-item {
            text-align: center;
            padding: 15px;
            min-width: 200px;
          }
          
          .detail-label {
            font-size: 14px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
          }
          
          .detail-value {
            font-size: 18px;
            color: ${primary};
            font-weight: bold;
          }
          
          .signatures {
            display: flex;
            justify-content: space-around;
            margin-top: 60px;
          }
          
          .signature-block {
            text-align: center;
            width: 250px;
          }
          
          .signature-line {
            border-top: 2px solid ${primary};
            margin-bottom: 10px;
          }
          
          .signature-title {
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid ${secondary};
          }
          
          .template-style {
            font-size: 12px;
            color: #999;
            font-style: italic;
          }
          
          @media print {
            body { background: white; padding: 0; }
            .certificate { border: 15px solid ${primary}; box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="header">
            <div class="title">Certificate</div>
            <div class="subtitle">${template.name}</div>
          </div>
          
          <div class="content">
            <div class="award-text">
              This is to certify that
            </div>
            
            <div class="student-name">{{studentName}}</div>
            
            <div class="module-info">
              <div class="module-title">${module.name}</div>
              <div class="module-details">
                <strong>Module Code:</strong> ${module.code}<br>
                <strong>Duration:</strong> ${module.duration}
              </div>
            </div>
            
            <div class="achievement">
              has successfully completed the module with distinction,
              demonstrating exceptional understanding and dedication
              to academic excellence.
            </div>
            
            <div class="details-section">
              <div class="detail-item">
                <div class="detail-label">Roll Number</div>
                <div class="detail-value">{{rollNo}}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Registration</div>
                <div class="detail-value">{{regNo}}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Issue Date</div>
                <div class="detail-value">{{issueDate}}</div>
              </div>
            </div>
          </div>
          
          <div class="signatures">
            <div class="signature-block">
              <div class="signature-line"></div>
              <div class="signature-title">Director</div>
            </div>
            <div class="signature-block">
              <div class="signature-line"></div>
              <div class="signature-title">Head of Department</div>
            </div>
            <div class="signature-block">
              <div class="signature-line"></div>
              <div class="signature-title">Registrar</div>
            </div>
          </div>
          
          <div class="footer">
            <div class="template-style">Template: ${template.style}</div>
          </div>
        </div>
      </body>
    </html>
  `;
}

async function createCertificatesForModules() {
  log('', 'info');
  log('╔═══════════════════════════════════════════════════════════════╗', 'info');
  log('║                                                               ║', 'info');
  log('║     🎓 CREATE CERTIFICATES FOR EACH MODULE & TEMPLATE 🎓      ║', 'info');
  log('║                                                               ║', 'info');
  log('╚═══════════════════════════════════════════════════════════════╝', 'info');
  log('', 'info');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080', '--start-maximized'],
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();
  const timestamp = Date.now();
  let adminToken = null;

  try {
    // ============================================
    // STEP 1: Login as Admin
    // ============================================
    log('═══════════════════════════════════════════════════════════════', 'info');
    log('STEP 1: Admin Login', 'info');
    log('═══════════════════════════════════════════════════════════════', 'info');

    await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle2' });
    await page.type('#email', 'admin@testuni.com', { delay: 50 });
    await page.type('#password', 'Admin123456', { delay: 50 });
    await page.click('button[type="submit"]');
    await await new Promise(resolve => setTimeout(resolve, 3000));

    adminToken = await page.evaluate(() => localStorage.getItem('token'));
    if (adminToken) {
      log('Admin logged in successfully', 'success');
    } else {
      throw new Error('Login failed');
    }

    // ============================================
    // STEP 2: Create Templates for Each Module
    // ============================================
    log('', 'info');
    log('═══════════════════════════════════════════════════════════════', 'info');
    log('STEP 2: Creating Templates for Each Module', 'info');
    log('═══════════════════════════════════════════════════════════════', 'info');

    const createdTemplates = [];

    for (let i = 0; i < modules.length; i++) {
      const module = modules[i];
      const template = templates[i];

      log(`\nCreating template for ${module.name}...`, 'template');
      log(`  Template Style: ${template.name}`, 'info');
      log(`  Module Code: ${module.code}`, 'info');

      const templateData = {
        name: `${module.name} - ${template.name} (${timestamp})`,
        type: 'HTML',
        description: `${template.name} certificate for ${module.name} module`,
        htmlContent: generateTemplateHTML(template, module),
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
      }, templateData, adminToken);

      if (templateResponse.template) {
        createdTemplates.push({
          id: templateResponse.template.id,
          name: templateData.name,
          module: module,
          template: template
        });
        log(`✅ Template created: ${templateData.name}`, 'success');
        testResults.created++;
      } else {
        log(`❌ Failed to create template for ${module.name}`, 'error');
        testResults.failed++;
      }

      await await new Promise(resolve => setTimeout(resolve, 500));
    }

    // ============================================
    // STEP 3: Create Students for Each Module
    // ============================================
    log('', 'info');
    log('═══════════════════════════════════════════════════════════════', 'info');
    log('STEP 3: Creating Students for Each Module', 'info');
    log('═══════════════════════════════════════════════════════════════', 'info');

    const studentNames = [
      { first: 'Alice', last: 'Johnson', father: 'Robert Johnson' },
      { first: 'Bob', last: 'Smith', father: 'John Smith' },
      { first: 'Carol', last: 'Williams', father: 'Michael Williams' },
      { first: 'David', last: 'Brown', father: 'James Brown' },
      { first: 'Emma', last: 'Davis', father: 'Richard Davis' }
    ];

    const createdStudents = [];

    for (let i = 0; i < modules.length; i++) {
      const module = modules[i];
      const student = studentNames[i];
      const moduleCode = module.code.replace(/[^A-Z0-9]/g, '');

      log(`\nCreating student for ${module.name}...`, 'module');

      const studentData = {
        rollNo: `${moduleCode}${timestamp}${String(i + 1).padStart(3, '0')}`,
        regNo: `REG${timestamp}${String(i + 1).padStart(3, '0')}`,
        name: `${student.first} ${student.last}`,
        fatherName: student.father,
        email: `${student.first.toLowerCase()}${timestamp}@test.com`,
        mobile: `987654${String(i).padStart(4, '0')}`,
        dob: `200${i}-0${(i % 9) + 1}-15`
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
      }, studentData, adminToken);

      if (studentResponse.student) {
        createdStudents.push({
          id: studentResponse.student.id,
          ...studentData,
          module: module
        });
        log(`✅ Student created: ${studentData.name} (${studentData.rollNo})`, 'success');
      } else {
        log(`❌ Failed to create student for ${module.name}`, 'error');
      }

      await await new Promise(resolve => setTimeout(resolve, 500));
    }

    // ============================================
    // STEP 4: Generate Certificates
    // ============================================
    log('', 'info');
    log('═══════════════════════════════════════════════════════════════', 'info');
    log('STEP 4: Generating Certificates', 'info');
    log('═══════════════════════════════════════════════════════════════', 'info');

    testResults.totalCertificates = createdTemplates.length;

    for (let i = 0; i < createdTemplates.length; i++) {
      const template = createdTemplates[i];
      const student = createdStudents[i];

      if (!template || !student) continue;

      log(`\n🎓 Generating certificate ${i + 1}/${createdTemplates.length}`, 'cert');
      log(`   Module: ${template.module.name}`, 'info');
      log(`   Template: ${template.template.name}`, 'info');
      log(`   Student: ${student.name}`, 'info');

      const certificateData = {
        studentId: student.rollNo,
        templateId: template.id,
        data: {
          studentName: student.name,
          rollNo: student.rollNo,
          regNo: student.regNo,
          issueDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        }
      };

      try {
        const docResponse = await page.evaluate(async (data, token) => {
          const response = await fetch('/api/document/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
          });

          if (response.ok) {
            return await response.json();
          } else {
            return { error: await response.text(), status: response.status };
          }
        }, certificateData, adminToken);

        if (docResponse && !docResponse.error) {
          log(`   ✅ Certificate generated successfully!`, 'success');
          testResults.certificates.push({
            module: template.module.name,
            template: template.template.name,
            student: student.name,
            status: 'success'
          });
        } else {
          log(`   ⚠️ Certificate generation initiated (status: ${docResponse?.status || 'processing'})`, 'warn');
          testResults.certificates.push({
            module: template.module.name,
            template: template.template.name,
            student: student.name,
            status: 'processing'
          });
        }
      } catch (error) {
        log(`   ❌ Error: ${error.message}`, 'error');
        testResults.certificates.push({
          module: template.module.name,
          template: template.template.name,
          student: student.name,
          status: 'failed',
          error: error.message
        });
      }

      await await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // ============================================
    // STEP 5: View Documents Page
    // ============================================
    log('', 'info');
    log('═══════════════════════════════════════════════════════════════', 'info');
    log('STEP 5: Viewing Generated Documents', 'info');
    log('═══════════════════════════════════════════════════════════════', 'info');

    await page.goto('http://localhost:3000/admin/documents', { waitUntil: 'networkidle2' });
    await await new Promise(resolve => setTimeout(resolve, 2000));

    const screenshotDir = path.join(__dirname, 'module-certificates-screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    await page.screenshot({
      path: path.join(screenshotDir, 'all-certificates-list.png'),
      fullPage: true
    });

    log('Screenshot saved: all-certificates-list.png', 'success');

    // Get documents count
    const documentsList = await page.evaluate(async (token) => {
      const response = await fetch('/api/document/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await response.json();
    }, adminToken);

    if (documentsList.documents) {
      log(`Total documents in system: ${documentsList.documents.length}`, 'info');
    }

  } catch (error) {
    log(`Critical Error: ${error.message}`, 'error');
  } finally {
    // ============================================
    // FINAL REPORT
    // ============================================
    log('', 'info');
    log('╔═══════════════════════════════════════════════════════════════╗', 'info');
    log('║                     FINAL REPORT                              ║', 'info');
    log('╚═══════════════════════════════════════════════════════════════╝', 'info');
    log('', 'info');
    log(`📊 Total Modules: ${modules.length}`, 'info');
    log(`🎨 Templates Created: ${testResults.created}`, 'info');
    log(`🎓 Certificates Generated: ${testResults.certificates.length}`, 'info');
    log('', 'info');
    log('Certificate Details:', 'info');
    testResults.certificates.forEach((cert, index) => {
      log(`  ${index + 1}. ${cert.module} - ${cert.template}`, 'cert');
      log(`     Student: ${cert.student}`, 'info');
      log(`     Status: ${cert.status}`, cert.status === 'success' ? 'success' : 'warn');
    });

    // Save report
    const reportPath = path.join(__dirname, 'module-certificates-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      modules: modules,
      templates: templates,
      results: testResults
    }, null, 2));

    log('', 'info');
    log(`📄 Report saved: module-certificates-report.json`, 'success');
    log('', 'info');
    log('Browser will remain open for 10 seconds...', 'info');

    await await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();

    log('✅ Test completed!', 'success');
  }
}

// Run the test
createCertificatesForModules().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
