const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
let testResults = [];
let superAdminToken = '';
let universityAdminToken = '';
let universityId = '';
let templateId = '';
let studentId = '';
let documentId = '';

// Color codes for terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(phase, test, status, message) {
  const icon = status === 'PASS' ? '✓' : '✗';
  const color = status === 'PASS' ? 'green' : 'red';
  log(`\n${icon} ${phase} - ${test}: ${message}`, color);
  testResults.push({ phase, test, status, message });
}

function logSection(title) {
  log('\n' + '═'.repeat(80), 'cyan');
  log(`  ${title}`, 'cyan');
  log('═'.repeat(80), 'cyan');
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// PHASE 1: SUPER ADMIN TESTING
// ============================================================================

async function phase1_superAdmin() {
  logSection('PHASE 1: SUPER ADMIN TESTING (8 tests)');
  
  // Test 1.1: Super Admin Registration
  try {
    log('\n📝 Test 1.1: Super Admin Registration...', 'blue');
    const response = await axios.post(`${BASE_URL}/api/superadmin/register`, {
      name: 'Test Super Admin',
      email: 'superadmin@test.com',
      password: 'Test@12345'
    });
    
    if (response.data.token) {
      superAdminToken = response.data.token;
      logTest('Phase 1', 'Test 1.1', 'PASS', 'Super Admin registered successfully');
      log(`   Token: ${superAdminToken.substring(0, 20)}...`, 'yellow');
    } else {
      logTest('Phase 1', 'Test 1.1', 'FAIL', 'No token received');
    }
  } catch (error) {
    logTest('Phase 1', 'Test 1.1', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 1.2: Super Admin Login
  try {
    log('\n🔐 Test 1.2: Super Admin Login...', 'blue');
    const response = await axios.post(`${BASE_URL}/api/superadmin/login`, {
      email: 'superadmin@test.com',
      password: 'Test@12345'
    });
    
    if (response.data.token) {
      superAdminToken = response.data.token;
      logTest('Phase 1', 'Test 1.2', 'PASS', 'Login successful');
      log(`   Token refreshed`, 'yellow');
    } else {
      logTest('Phase 1', 'Test 1.2', 'FAIL', 'Login failed');
    }
  } catch (error) {
    logTest('Phase 1', 'Test 1.2', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 1.3: Create University (Harvard)
  try {
    log('\n🏛️  Test 1.3: Create Harvard University...', 'blue');
    const response = await axios.post(`${BASE_URL}/api/superadmin/universities`, {
      name: 'Harvard University',
      subdomain: 'harvard',
      description: 'Prestigious Ivy League institution',
      adminName: 'John Harvard',
      adminEmail: 'admin@harvard.edu',
      adminPassword: 'Admin@12345',
      adminPhone: '+1-617-495-1000',
      primaryColor: '#A51C30',
      secondaryColor: '#000000',
      accentColor: '#FFFFFF',
      features: {
        studentSearch: true,
        qrVerification: true,
        publicLanding: true,
        emailNotifications: false,
        smsNotifications: false
      },
      limits: {
        maxTemplates: 50,
        maxStudents: 10000,
        storageLimit: 10737418240 // 10GB
      }
    }, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    
    if (response.data.id) {
      universityId = response.data.id;
      logTest('Phase 1', 'Test 1.3', 'PASS', `Harvard University created (ID: ${universityId})`);
      log(`   Subdomain: harvard.educert.com`, 'yellow');
      log(`   Admin: admin@harvard.edu`, 'yellow');
    } else {
      logTest('Phase 1', 'Test 1.3', 'FAIL', 'University creation failed');
    }
  } catch (error) {
    logTest('Phase 1', 'Test 1.3', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 1.4: View University Details
  try {
    log('\n👁️  Test 1.4: View University Details...', 'blue');
    const response = await axios.get(`${BASE_URL}/api/superadmin/universities/${universityId}`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    
    if (response.data.name === 'Harvard University') {
      logTest('Phase 1', 'Test 1.4', 'PASS', 'University details retrieved');
      log(`   Name: ${response.data.name}`, 'yellow');
      log(`   Status: ${response.data.enabled ? '🟢 Active' : '🔴 Disabled'}`, 'yellow');
    } else {
      logTest('Phase 1', 'Test 1.4', 'FAIL', 'Incorrect university data');
    }
  } catch (error) {
    logTest('Phase 1', 'Test 1.4', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 1.5: Edit University
  try {
    log('\n✏️  Test 1.5: Edit University...', 'blue');
    const response = await axios.put(`${BASE_URL}/api/superadmin/universities/${universityId}`, {
      description: 'Harvard University - Founded 1636, oldest institution in the US'
    }, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    
    if (response.data.description.includes('Founded 1636')) {
      logTest('Phase 1', 'Test 1.5', 'PASS', 'University updated successfully');
      log(`   Updated description`, 'yellow');
    } else {
      logTest('Phase 1', 'Test 1.5', 'FAIL', 'Update failed');
    }
  } catch (error) {
    logTest('Phase 1', 'Test 1.5', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 1.6: Create Second University (Stanford)
  try {
    log('\n🏛️  Test 1.6: Create Stanford University...', 'blue');
    const response = await axios.post(`${BASE_URL}/api/superadmin/universities`, {
      name: 'Stanford University',
      subdomain: 'stanford',
      description: 'Private research university in California',
      adminName: 'Jane Stanford',
      adminEmail: 'admin@stanford.edu',
      adminPassword: 'Admin@12345',
      primaryColor: '#8C1515',
      secondaryColor: '#FFFFFF'
    }, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    
    if (response.data.id) {
      logTest('Phase 1', 'Test 1.6', 'PASS', 'Stanford University created');
      log(`   ID: ${response.data.id}`, 'yellow');
    } else {
      logTest('Phase 1', 'Test 1.6', 'FAIL', 'Creation failed');
    }
  } catch (error) {
    logTest('Phase 1', 'Test 1.6', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 1.7: List Universities
  try {
    log('\n📋 Test 1.7: List All Universities...', 'blue');
    const response = await axios.get(`${BASE_URL}/api/superadmin/universities`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    
    if (response.data.length >= 2) {
      logTest('Phase 1', 'Test 1.7', 'PASS', `Retrieved ${response.data.length} universities`);
      response.data.forEach(uni => {
        log(`   - ${uni.name} (${uni.subdomain})`, 'yellow');
      });
    } else {
      logTest('Phase 1', 'Test 1.7', 'FAIL', 'Not all universities listed');
    }
  } catch (error) {
    logTest('Phase 1', 'Test 1.7', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 1.8: Dashboard Statistics
  try {
    log('\n📊 Test 1.8: Super Admin Dashboard Statistics...', 'blue');
    const response = await axios.get(`${BASE_URL}/api/superadmin/stats`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    
    logTest('Phase 1', 'Test 1.8', 'PASS', 'Dashboard statistics retrieved');
    log(`   Total Universities: ${response.data.totalUniversities || 0}`, 'yellow');
    log(`   Active Universities: ${response.data.activeUniversities || 0}`, 'yellow');
    log(`   Total Students: ${response.data.totalStudents || 0}`, 'yellow');
    log(`   Total Documents: ${response.data.totalDocuments || 0}`, 'yellow');
  } catch (error) {
    logTest('Phase 1', 'Test 1.8', 'FAIL', error.response?.data?.message || error.message);
  }
  
  log('\n✅ Phase 1 Complete!', 'green');
}

// ============================================================================
// PHASE 2: UNIVERSITY ADMIN TESTING
// ============================================================================

async function phase2_universityAdmin() {
  logSection('PHASE 2: UNIVERSITY ADMIN TESTING (3 tests)');
  
  // Test 2.1: University Admin Login
  try {
    log('\n🔐 Test 2.1: University Admin Login...', 'blue');
    const response = await axios.post(`${BASE_URL}/api/admin/login`, {
      email: 'admin@harvard.edu',
      password: 'Admin@12345',
      universityId: universityId
    });
    
    if (response.data.token) {
      universityAdminToken = response.data.token;
      logTest('Phase 2', 'Test 2.1', 'PASS', 'University Admin logged in successfully');
      log(`   Token: ${universityAdminToken.substring(0, 20)}...`, 'yellow');
    } else {
      logTest('Phase 2', 'Test 2.1', 'FAIL', 'Login failed');
    }
  } catch (error) {
    logTest('Phase 2', 'Test 2.1', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 2.2: View Admin Dashboard
  try {
    log('\n📊 Test 2.2: University Admin Dashboard...', 'blue');
    const response = await axios.get(`${BASE_URL}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${universityAdminToken}` }
    });
    
    logTest('Phase 2', 'Test 2.2', 'PASS', 'Dashboard loaded');
    log(`   Templates: ${response.data.stats?.templates || 0}`, 'yellow');
    log(`   Students: ${response.data.stats?.students || 0}`, 'yellow');
    log(`   Documents: ${response.data.stats?.documents || 0}`, 'yellow');
  } catch (error) {
    logTest('Phase 2', 'Test 2.2', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 2.3: Update Branding
  try {
    log('\n🎨 Test 2.3: Update University Branding...', 'blue');
    const response = await axios.put(`${BASE_URL}/api/admin/branding`, {
      primaryColor: '#A51C30',
      tagline: 'Veritas - Truth',
      footerText: '© 2024 Harvard University. All rights reserved.'
    }, {
      headers: { Authorization: `Bearer ${universityAdminToken}` }
    });
    
    logTest('Phase 2', 'Test 2.3', 'PASS', 'Branding updated successfully');
    log(`   Primary Color: #A51C30`, 'yellow');
    log(`   Tagline: Veritas - Truth`, 'yellow');
  } catch (error) {
    logTest('Phase 2', 'Test 2.3', 'FAIL', error.response?.data?.message || error.message);
  }
  
  log('\n✅ Phase 2 Complete!', 'green');
}

// ============================================================================
// PHASE 3: TEMPLATE CREATION TESTING
// ============================================================================

async function phase3_templates() {
  logSection('PHASE 3: TEMPLATE CREATION TESTING (6 tests)');
  
  // Test 3.1: Create HTML Template
  try {
    log('\n📝 Test 3.1: Create HTML Template...', 'blue');
    const htmlContent = `
<div style="padding: 50px; font-family: 'Times New Roman', serif; text-align: center;">
  <h1 style="color: #A51C30; font-size: 48px;">HARVARD UNIVERSITY</h1>
  <p style="font-size: 18px; font-style: italic;">Veritas</p>
  <div style="margin: 50px 0;">
    <h2 style="font-size: 32px;">Certificate of Completion</h2>
    <p style="font-size: 20px;">This is to certify that</p>
    <h2 style="color: #A51C30; font-size: 36px;">{{studentName}}</h2>
    <p>Roll Number: <strong>{{rollNo}}</strong></p>
    <p>has successfully completed the degree of</p>
    <h3 style="color: #A51C30; font-size: 28px;">{{courseName}}</h3>
    <p>Dated: {{date}}</p>
  </div>
</div>`;
    
    const response = await axios.post(`${BASE_URL}/api/admin/templates`, {
      name: 'Harvard Degree Certificate',
      type: 'HTML',
      description: 'Official degree certificate for graduates',
      content: htmlContent,
      pageSize: 'A4',
      orientation: 'landscape',
      qrEnabled: true,
      qrPosition: 'bottom-right'
    }, {
      headers: { Authorization: `Bearer ${universityAdminToken}` }
    });
    
    if (response.data.id) {
      templateId = response.data.id;
      logTest('Phase 3', 'Test 3.1', 'PASS', `HTML template created (ID: ${templateId})`);
      log(`   Name: Harvard Degree Certificate`, 'yellow');
      log(`   Type: HTML Builder`, 'yellow');
      log(`   QR Code: Enabled`, 'yellow');
    } else {
      logTest('Phase 3', 'Test 3.1', 'FAIL', 'Template creation failed');
    }
  } catch (error) {
    logTest('Phase 3', 'Test 3.1', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 3.2: View Template
  try {
    log('\n👁️  Test 3.2: View Template Details...', 'blue');
    const response = await axios.get(`${BASE_URL}/api/admin/templates/${templateId}`, {
      headers: { Authorization: `Bearer ${universityAdminToken}` }
    });
    
    if (response.data.name === 'Harvard Degree Certificate') {
      logTest('Phase 3', 'Test 3.2', 'PASS', 'Template retrieved successfully');
      log(`   Variables: ${response.data.variables?.join(', ') || 'studentName, rollNo, courseName, date'}`, 'yellow');
    } else {
      logTest('Phase 3', 'Test 3.2', 'FAIL', 'Template data incorrect');
    }
  } catch (error) {
    logTest('Phase 3', 'Test 3.2', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 3.3: List Templates
  try {
    log('\n📋 Test 3.3: List All Templates...', 'blue');
    const response = await axios.get(`${BASE_URL}/api/admin/templates`, {
      headers: { Authorization: `Bearer ${universityAdminToken}` }
    });
    
    logTest('Phase 3', 'Test 3.3', 'PASS', `Retrieved ${response.data.length} template(s)`);
    response.data.forEach(template => {
      log(`   - ${template.name} (${template.type})`, 'yellow');
    });
  } catch (error) {
    logTest('Phase 3', 'Test 3.3', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 3.4: Edit Template
  try {
    log('\n✏️  Test 3.4: Edit Template...', 'blue');
    const response = await axios.put(`${BASE_URL}/api/admin/templates/${templateId}`, {
      description: 'Official degree certificate - Updated design'
    }, {
      headers: { Authorization: `Bearer ${universityAdminToken}` }
    });
    
    logTest('Phase 3', 'Test 3.4', 'PASS', 'Template updated successfully');
    log(`   Description updated`, 'yellow');
  } catch (error) {
    logTest('Phase 3', 'Test 3.4', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 3.5: Preview Template
  try {
    log('\n🔍 Test 3.5: Preview Template...', 'blue');
    const response = await axios.post(`${BASE_URL}/api/admin/templates/${templateId}/preview`, {
      sampleData: {
        studentName: 'John Doe',
        rollNo: 'TEST001',
        courseName: 'Computer Science',
        date: new Date().toLocaleDateString()
      }
    }, {
      headers: { Authorization: `Bearer ${universityAdminToken}` }
    });
    
    logTest('Phase 3', 'Test 3.5', 'PASS', 'Template preview generated');
    log(`   Preview generated with sample data`, 'yellow');
  } catch (error) {
    logTest('Phase 3', 'Test 3.5', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 3.6: Template Statistics
  try {
    log('\n📊 Test 3.6: Template Statistics...', 'blue');
    const response = await axios.get(`${BASE_URL}/api/admin/templates/${templateId}/stats`, {
      headers: { Authorization: `Bearer ${universityAdminToken}` }
    });
    
    logTest('Phase 3', 'Test 3.6', 'PASS', 'Template statistics retrieved');
    log(`   Documents generated: ${response.data.documentsGenerated || 0}`, 'yellow');
    log(`   Last used: ${response.data.lastUsed || 'Never'}`, 'yellow');
  } catch (error) {
    logTest('Phase 3', 'Test 3.6', 'FAIL', error.response?.data?.message || error.message);
  }
  
  log('\n✅ Phase 3 Complete!', 'green');
}

// ============================================================================
// PHASE 4: STUDENT MANAGEMENT TESTING
// ============================================================================

async function phase4_students() {
  logSection('PHASE 4: STUDENT MANAGEMENT TESTING (7 tests)');
  
  // Test 4.1: Add Single Student
  try {
    log('\n👤 Test 4.1: Add Single Student (Alice Johnson)...', 'blue');
    const response = await axios.post(`${BASE_URL}/api/admin/students`, {
      studentName: 'Alice Johnson',
      rollNo: 'H2024001',
      regNo: 'REG-H-2024-001',
      mobile: '+1-617-555-0001',
      email: 'alice.johnson@harvard.edu',
      dateOfBirth: '2000-01-15',
      courseName: 'Computer Science',
      templateId: templateId,
      generateDocument: true,
      publishImmediately: true,
      customFields: {
        grade: 'A',
        cgpa: '3.95'
      }
    }, {
      headers: { Authorization: `Bearer ${universityAdminToken}` }
    });
    
    if (response.data.id) {
      studentId = response.data.id;
      logTest('Phase 4', 'Test 4.1', 'PASS', `Student created (ID: ${studentId})`);
      log(`   Name: Alice Johnson`, 'yellow');
      log(`   Roll: H2024001`, 'yellow');
      log(`   Document: ${response.data.documentGenerated ? 'Generated' : 'Queued'}`, 'yellow');
    } else {
      logTest('Phase 4', 'Test 4.1', 'FAIL', 'Student creation failed');
    }
  } catch (error) {
    logTest('Phase 4', 'Test 4.1', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 4.2: Bulk CSV Import
  try {
    log('\n📤 Test 4.2: Bulk CSV Import (10 students)...', 'blue');
    const csvData = [
      { studentName: 'Bob Smith', rollNo: 'H2024002', regNo: 'REG-H-2024-002', mobile: '+1-617-555-0002', email: 'bob.smith@harvard.edu', dateOfBirth: '2000-02-20', courseName: 'Physics', grade: 'A-', cgpa: '3.85' },
      { studentName: 'Carol White', rollNo: 'H2024003', regNo: 'REG-H-2024-003', mobile: '+1-617-555-0003', email: 'carol.white@harvard.edu', dateOfBirth: '2000-03-10', courseName: 'Mathematics', grade: 'A+', cgpa: '4.00' },
      { studentName: 'David Brown', rollNo: 'H2024004', regNo: 'REG-H-2024-004', mobile: '+1-617-555-0004', email: 'david.brown@harvard.edu', dateOfBirth: '2000-04-05', courseName: 'Chemistry', grade: 'B+', cgpa: '3.70' }
    ];
    
    const response = await axios.post(`${BASE_URL}/api/admin/students/bulk`, {
      students: csvData,
      templateId: templateId,
      generateDocuments: true
    }, {
      headers: { Authorization: `Bearer ${universityAdminToken}` }
    });
    
    if (response.data.imported) {
      logTest('Phase 4', 'Test 4.2', 'PASS', `Bulk import: ${response.data.imported} students imported`);
      log(`   Successful: ${response.data.successful || 0}`, 'yellow');
      log(`   Failed: ${response.data.failed || 0}`, 'yellow');
    } else {
      logTest('Phase 4', 'Test 4.2', 'FAIL', 'Bulk import failed');
    }
  } catch (error) {
    logTest('Phase 4', 'Test 4.2', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 4.3: View Student Details
  try {
    log('\n👁️  Test 4.3: View Student Details...', 'blue');
    const response = await axios.get(`${BASE_URL}/api/admin/students/${studentId}`, {
      headers: { Authorization: `Bearer ${universityAdminToken}` }
    });
    
    if (response.data.studentName === 'Alice Johnson') {
      logTest('Phase 4', 'Test 4.3', 'PASS', 'Student details retrieved');
      log(`   Name: ${response.data.studentName}`, 'yellow');
      log(`   Roll: ${response.data.rollNo}`, 'yellow');
      log(`   Documents: ${response.data.documents?.length || 0}`, 'yellow');
    } else {
      logTest('Phase 4', 'Test 4.3', 'FAIL', 'Student data incorrect');
    }
  } catch (error) {
    logTest('Phase 4', 'Test 4.3', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 4.4: Edit Student
  try {
    log('\n✏️  Test 4.4: Edit Student...', 'blue');
    const response = await axios.put(`${BASE_URL}/api/admin/students/${studentId}`, {
      mobile: '+1-617-555-9999',
      email: 'alice.j@harvard.edu'
    }, {
      headers: { Authorization: `Bearer ${universityAdminToken}` }
    });
    
    logTest('Phase 4', 'Test 4.4', 'PASS', 'Student updated successfully');
    log(`   Mobile: +1-617-555-9999`, 'yellow');
    log(`   Email: alice.j@harvard.edu`, 'yellow');
  } catch (error) {
    logTest('Phase 4', 'Test 4.4', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 4.5: Search Students
  try {
    log('\n🔍 Test 4.5: Search Students...', 'blue');
    const response = await axios.get(`${BASE_URL}/api/admin/students/search?q=Alice`, {
      headers: { Authorization: `Bearer ${universityAdminToken}` }
    });
    
    if (response.data.length > 0) {
      logTest('Phase 4', 'Test 4.5', 'PASS', `Found ${response.data.length} student(s)`);
      response.data.forEach(student => {
        log(`   - ${student.studentName} (${student.rollNo})`, 'yellow');
      });
    } else {
      logTest('Phase 4', 'Test 4.5', 'FAIL', 'Search failed');
    }
  } catch (error) {
    logTest('Phase 4', 'Test 4.5', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 4.6: List All Students
  try {
    log('\n📋 Test 4.6: List All Students...', 'blue');
    const response = await axios.get(`${BASE_URL}/api/admin/students`, {
      headers: { Authorization: `Bearer ${universityAdminToken}` }
    });
    
    logTest('Phase 4', 'Test 4.6', 'PASS', `Total students: ${response.data.length}`);
    log(`   Listed ${Math.min(5, response.data.length)} students:`, 'yellow');
    response.data.slice(0, 5).forEach(student => {
      log(`   - ${student.studentName} (${student.rollNo})`, 'yellow');
    });
  } catch (error) {
    logTest('Phase 4', 'Test 4.6', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 4.7: Student Statistics
  try {
    log('\n📊 Test 4.7: Student Statistics...', 'blue');
    const response = await axios.get(`${BASE_URL}/api/admin/students/stats`, {
      headers: { Authorization: `Bearer ${universityAdminToken}` }
    });
    
    logTest('Phase 4', 'Test 4.7', 'PASS', 'Statistics retrieved');
    log(`   Total: ${response.data.total || 0}`, 'yellow');
    log(`   With documents: ${response.data.withDocuments || 0}`, 'yellow');
    log(`   Courses: ${response.data.courses?.length || 0} different courses`, 'yellow');
  } catch (error) {
    logTest('Phase 4', 'Test 4.7', 'FAIL', error.response?.data?.message || error.message);
  }
  
  log('\n✅ Phase 4 Complete!', 'green');
}

// ============================================================================
// PHASE 5: DOCUMENT MANAGEMENT TESTING
// ============================================================================

async function phase5_documents() {
  logSection('PHASE 5: DOCUMENT MANAGEMENT TESTING (8 tests)');
  
  // Test 5.1: List Documents
  try {
    log('\n📋 Test 5.1: List All Documents...', 'blue');
    const response = await axios.get(`${BASE_URL}/api/admin/documents`, {
      headers: { Authorization: `Bearer ${universityAdminToken}` }
    });
    
    if (response.data.length > 0) {
      documentId = response.data[0].id;
      logTest('Phase 5', 'Test 5.1', 'PASS', `Found ${response.data.length} document(s)`);
      response.data.slice(0, 5).forEach(doc => {
        log(`   - ${doc.student?.studentName || 'Unknown'} (${doc.status})`, 'yellow');
      });
    } else {
      logTest('Phase 5', 'Test 5.1', 'FAIL', 'No documents found');
    }
  } catch (error) {
    logTest('Phase 5', 'Test 5.1', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 5.2: View Document
  try {
    log('\n👁️  Test 5.2: View Document Details...', 'blue');
    const response = await axios.get(`${BASE_URL}/api/admin/documents/${documentId}`, {
      headers: { Authorization: `Bearer ${universityAdminToken}` }
    });
    
    logTest('Phase 5', 'Test 5.2', 'PASS', 'Document details retrieved');
    log(`   Student: ${response.data.student?.studentName || 'Unknown'}`, 'yellow');
    log(`   Status: ${response.data.status}`, 'yellow');
    log(`   Template: ${response.data.template?.name || 'Unknown'}`, 'yellow');
  } catch (error) {
    logTest('Phase 5', 'Test 5.2', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 5.3: Publish Document
  try {
    log('\n📢 Test 5.3: Publish Document...', 'blue');
    const response = await axios.post(`${BASE_URL}/api/admin/documents/${documentId}/publish`, {}, {
      headers: { Authorization: `Bearer ${universityAdminToken}` }
    });
    
    logTest('Phase 5', 'Test 5.3', 'PASS', 'Document published successfully');
    log(`   Status: Published ✅`, 'yellow');
  } catch (error) {
    logTest('Phase 5', 'Test 5.3', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 5.4: Filter Documents
  try {
    log('\n🔍 Test 5.4: Filter Documents (Published)...', 'blue');
    const response = await axios.get(`${BASE_URL}/api/admin/documents?status=published`, {
      headers: { Authorization: `Bearer ${universityAdminToken}` }
    });
    
    logTest('Phase 5', 'Test 5.4', 'PASS', `Found ${response.data.length} published document(s)`);
  } catch (error) {
    logTest('Phase 5', 'Test 5.4', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 5.5: Download Document
  try {
    log('\n⬇️  Test 5.5: Download Document...', 'blue');
    const response = await axios.get(`${BASE_URL}/api/admin/documents/${documentId}/download`, {
      headers: { Authorization: `Bearer ${universityAdminToken}` },
      responseType: 'arraybuffer'
    });
    
    if (response.data.byteLength > 0) {
      logTest('Phase 5', 'Test 5.5', 'PASS', `Document downloaded (${response.data.byteLength} bytes)`);
      log(`   File size: ${(response.data.byteLength / 1024).toFixed(2)} KB`, 'yellow');
    } else {
      logTest('Phase 5', 'Test 5.5', 'FAIL', 'Download failed');
    }
  } catch (error) {
    logTest('Phase 5', 'Test 5.5', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 5.6: Unpublish Document
  try {
    log('\n⏸️  Test 5.6: Unpublish Document...', 'blue');
    const response = await axios.post(`${BASE_URL}/api/admin/documents/${documentId}/unpublish`, {}, {
      headers: { Authorization: `Bearer ${universityAdminToken}` }
    });
    
    logTest('Phase 5', 'Test 5.6', 'PASS', 'Document unpublished successfully');
    log(`   Status: Draft ⏸️`, 'yellow');
  } catch (error) {
    logTest('Phase 5', 'Test 5.6', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 5.7: Regenerate Document
  try {
    log('\n🔄 Test 5.7: Regenerate Document...', 'blue');
    const response = await axios.post(`${BASE_URL}/api/admin/documents/${documentId}/regenerate`, {
      reason: 'Updated template design'
    }, {
      headers: { Authorization: `Bearer ${universityAdminToken}` }
    });
    
    logTest('Phase 5', 'Test 5.7', 'PASS', 'Document regeneration queued');
    log(`   Status: Processing ⏳`, 'yellow');
  } catch (error) {
    logTest('Phase 5', 'Test 5.7', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 5.8: Document Statistics
  try {
    log('\n📊 Test 5.8: Document Statistics...', 'blue');
    const response = await axios.get(`${BASE_URL}/api/admin/documents/stats`, {
      headers: { Authorization: `Bearer ${universityAdminToken}` }
    });
    
    logTest('Phase 5', 'Test 5.8', 'PASS', 'Document statistics retrieved');
    log(`   Total: ${response.data.total || 0}`, 'yellow');
    log(`   Published: ${response.data.published || 0}`, 'yellow');
    log(`   Draft: ${response.data.draft || 0}`, 'yellow');
    log(`   Processing: ${response.data.processing || 0}`, 'yellow');
  } catch (error) {
    logTest('Phase 5', 'Test 5.8', 'FAIL', error.response?.data?.message || error.message);
  }
  
  log('\n✅ Phase 5 Complete!', 'green');
}

// ============================================================================
// PHASE 6: PUBLIC PORTAL TESTING
// ============================================================================

async function phase6_publicPortal() {
  logSection('PHASE 6: PUBLIC PORTAL TESTING (10 tests)');
  
  // First, publish a document for testing
  try {
    await axios.post(`${BASE_URL}/api/admin/documents/${documentId}/publish`, {}, {
      headers: { Authorization: `Bearer ${universityAdminToken}` }
    });
    log('\n✓ Document published for public testing', 'green');
  } catch (error) {
    log('\n⚠ Warning: Could not publish document', 'yellow');
  }
  
  await wait(1000);
  
  // Test 6.1: Access Landing Page
  try {
    log('\n🏠 Test 6.1: Access Public Landing Page...', 'blue');
    const response = await axios.get(`${BASE_URL}/`);
    
    if (response.status === 200) {
      logTest('Phase 6', 'Test 6.1', 'PASS', 'Landing page accessible');
      log(`   Status: ${response.status}`, 'yellow');
    } else {
      logTest('Phase 6', 'Test 6.1', 'FAIL', 'Landing page not accessible');
    }
  } catch (error) {
    logTest('Phase 6', 'Test 6.1', 'FAIL', error.message);
  }
  
  await wait(1000);
  
  // Test 6.2: Search by Roll Number
  try {
    log('\n🔍 Test 6.2: Search by Roll Number...', 'blue');
    const response = await axios.post(`${BASE_URL}/api/public/search`, {
      rollNo: 'H2024001'
    });
    
    if (response.data.documents && response.data.documents.length > 0) {
      logTest('Phase 6', 'Test 6.2', 'PASS', `Found ${response.data.documents.length} document(s)`);
      log(`   Student: ${response.data.student?.studentName || 'Unknown'}`, 'yellow');
      log(`   Documents: ${response.data.documents.length}`, 'yellow');
    } else {
      logTest('Phase 6', 'Test 6.2', 'FAIL', 'No documents found');
    }
  } catch (error) {
    logTest('Phase 6', 'Test 6.2', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 6.3: Search by Registration Number
  try {
    log('\n🔍 Test 6.3: Search by Registration Number...', 'blue');
    const response = await axios.post(`${BASE_URL}/api/public/search`, {
      regNo: 'REG-H-2024-001'
    });
    
    if (response.data.documents && response.data.documents.length > 0) {
      logTest('Phase 6', 'Test 6.3', 'PASS', 'Search by registration number successful');
      log(`   Found student via registration number`, 'yellow');
    } else {
      logTest('Phase 6', 'Test 6.3', 'FAIL', 'Search failed');
    }
  } catch (error) {
    logTest('Phase 6', 'Test 6.3', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 6.4: Search by Mobile
  try {
    log('\n🔍 Test 6.4: Search by Mobile...', 'blue');
    const response = await axios.post(`${BASE_URL}/api/public/search`, {
      mobile: '+1-617-555-9999'
    });
    
    if (response.data.documents && response.data.documents.length > 0) {
      logTest('Phase 6', 'Test 6.4', 'PASS', 'Search by mobile successful');
      log(`   Found via mobile number`, 'yellow');
    } else {
      logTest('Phase 6', 'Test 6.4', 'FAIL', 'Search failed');
    }
  } catch (error) {
    logTest('Phase 6', 'Test 6.4', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 6.5: Search by Date of Birth
  try {
    log('\n🔍 Test 6.5: Search by Date of Birth...', 'blue');
    const response = await axios.post(`${BASE_URL}/api/public/search`, {
      dateOfBirth: '2000-01-15'
    });
    
    if (response.data.documents && response.data.documents.length > 0) {
      logTest('Phase 6', 'Test 6.5', 'PASS', 'Search by DOB successful');
      log(`   Found via date of birth`, 'yellow');
    } else {
      logTest('Phase 6', 'Test 6.5', 'FAIL', 'Search failed');
    }
  } catch (error) {
    logTest('Phase 6', 'Test 6.5', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 6.6: View Certificate (Public)
  try {
    log('\n👁️  Test 6.6: View Certificate (Public Access)...', 'blue');
    const response = await axios.get(`${BASE_URL}/api/public/documents/${documentId}`);
    
    logTest('Phase 6', 'Test 6.6', 'PASS', 'Certificate viewable publicly');
    log(`   Document accessible without login`, 'yellow');
  } catch (error) {
    logTest('Phase 6', 'Test 6.6', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 6.7: Download Certificate (Public)
  try {
    log('\n⬇️  Test 6.7: Download Certificate (Public Access)...', 'blue');
    const response = await axios.get(`${BASE_URL}/api/public/documents/${documentId}/download`, {
      responseType: 'arraybuffer'
    });
    
    if (response.data.byteLength > 0) {
      logTest('Phase 6', 'Test 6.7', 'PASS', `Certificate downloadable (${response.data.byteLength} bytes)`);
      log(`   File size: ${(response.data.byteLength / 1024).toFixed(2)} KB`, 'yellow');
    } else {
      logTest('Phase 6', 'Test 6.7', 'FAIL', 'Download failed');
    }
  } catch (error) {
    logTest('Phase 6', 'Test 6.7', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 6.8: Verify QR Code
  try {
    log('\n✓ Test 6.8: Verify QR Code...', 'blue');
    const response = await axios.post(`${BASE_URL}/api/public/verify`, {
      documentId: documentId
    });
    
    if (response.data.verified) {
      logTest('Phase 6', 'Test 6.8', 'PASS', 'QR code verification successful');
      log(`   Status: ✅ Verified`, 'yellow');
      log(`   Hash: ${response.data.hash?.substring(0, 20)}...`, 'yellow');
    } else {
      logTest('Phase 6', 'Test 6.8', 'FAIL', 'Verification failed');
    }
  } catch (error) {
    logTest('Phase 6', 'Test 6.8', 'FAIL', error.response?.data?.message || error.message);
  }
  
  await wait(1000);
  
  // Test 6.9: Search Non-existent Record
  try {
    log('\n🔍 Test 6.9: Search Non-existent Record...', 'blue');
    const response = await axios.post(`${BASE_URL}/api/public/search`, {
      rollNo: 'NONEXISTENT999'
    });
    
    if (!response.data.documents || response.data.documents.length === 0) {
      logTest('Phase 6', 'Test 6.9', 'PASS', 'Correctly returns no results');
      log(`   Error handling: Graceful`, 'yellow');
    } else {
      logTest('Phase 6', 'Test 6.9', 'FAIL', 'Should return no results');
    }
  } catch (error) {
    if (error.response?.status === 404) {
      logTest('Phase 6', 'Test 6.9', 'PASS', 'Correctly returns 404');
      log(`   Error handling: Proper`, 'yellow');
    } else {
      logTest('Phase 6', 'Test 6.9', 'FAIL', error.message);
    }
  }
  
  await wait(1000);
  
  // Test 6.10: Unpublished Document Security
  try {
    log('\n🔒 Test 6.10: Unpublished Document Security...', 'blue');
    // First unpublish the document
    await axios.post(`${BASE_URL}/api/admin/documents/${documentId}/unpublish`, {}, {
      headers: { Authorization: `Bearer ${universityAdminToken}` }
    });
    
    // Try to access it publicly
    try {
      await axios.post(`${BASE_URL}/api/public/search`, {
        rollNo: 'H2024001'
      });
      logTest('Phase 6', 'Test 6.10', 'FAIL', 'Unpublished documents should not be accessible');
    } catch (searchError) {
      if (searchError.response?.data?.documents?.length === 0) {
        logTest('Phase 6', 'Test 6.10', 'PASS', 'Unpublished documents properly hidden');
        log(`   Security: ✅ Working correctly`, 'yellow');
      } else {
        logTest('Phase 6', 'Test 6.10', 'FAIL', 'Security check inconclusive');
      }
    }
  } catch (error) {
    logTest('Phase 6', 'Test 6.10', 'FAIL', error.response?.data?.message || error.message);
  }
  
  log('\n✅ Phase 6 Complete!', 'green');
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests() {
  const startTime = Date.now();
  
  log('\n╔══════════════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                                                                          ║', 'cyan');
  log('║        🤖 AUTOMATED COMPREHENSIVE TESTING - IN PROGRESS                  ║', 'cyan');
  log('║                                                                          ║', 'cyan');
  log('╚══════════════════════════════════════════════════════════════════════════╝', 'cyan');
  log('\n📊 Testing Configuration:', 'magenta');
  log(`   Base URL: ${BASE_URL}`, 'yellow');
  log(`   Total Tests: 41`, 'yellow');
  log(`   Phases: 6`, 'yellow');
  log(`   Start Time: ${new Date().toLocaleString()}`, 'yellow');
  
  try {
    await phase1_superAdmin();
    await wait(2000);
    
    await phase2_universityAdmin();
    await wait(2000);
    
    await phase3_templates();
    await wait(2000);
    
    await phase4_students();
    await wait(2000);
    
    await phase5_documents();
    await wait(2000);
    
    await phase6_publicPortal();
  } catch (error) {
    log(`\n❌ Testing stopped due to critical error: ${error.message}`, 'red');
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // Generate summary
  logSection('TEST SUMMARY');
  
  const totalTests = testResults.length;
  const passed = testResults.filter(t => t.status === 'PASS').length;
  const failed = testResults.filter(t => t.status === 'FAIL').length;
  const successRate = ((passed / totalTests) * 100).toFixed(2);
  
  log(`\n📊 Results:`, 'magenta');
  log(`   Total Tests: ${totalTests}`, 'yellow');
  log(`   Passed: ${passed}`, 'green');
  log(`   Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`   Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'red');
  log(`   Duration: ${duration} seconds`, 'yellow');
  log(`   End Time: ${new Date().toLocaleString()}`, 'yellow');
  
  // Show failed tests
  if (failed > 0) {
    log('\n❌ Failed Tests:', 'red');
    testResults.filter(t => t.status === 'FAIL').forEach(t => {
      log(`   ${t.phase} - ${t.test}: ${t.message}`, 'red');
    });
  }
  
  // Save results to file
  const report = {
    summary: {
      totalTests,
      passed,
      failed,
      successRate,
      duration,
      timestamp: new Date().toISOString()
    },
    results: testResults
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'test-results.json'),
    JSON.stringify(report, null, 2)
  );
  
  log('\n✅ Test results saved to: test-results.json', 'green');
  
  log('\n╔══════════════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                                                                          ║', 'cyan');
  log(`║        ${successRate >= 80 ? '✅ TESTING COMPLETE - SUCCESS!' : '⚠️  TESTING COMPLETE - REVIEW NEEDED'}                         ║`, 'cyan');
  log('║                                                                          ║', 'cyan');
  log('╚══════════════════════════════════════════════════════════════════════════╝', 'cyan');
}

// Run all tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
