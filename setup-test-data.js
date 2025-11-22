const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

function generateId() {
  return crypto.randomBytes(16).toString('hex');
}

async function setupTestData() {
  console.log('🔧 Setting up test data...\n');
  
  try {
    // Check if test university exists
    let university = await prisma.university.findFirst({
      where: { subdomain: 'testuni' }
    });
    
    if (!university) {
      console.log('📚 Creating test university...');
      university = await prisma.university.create({
        data: {
          id: generateId(),
          name: 'Test University',
          subdomain: 'testuni',
          slug: 'test-university',
          qrEnabled: true,
          isActive: true,
        }
      });
      console.log(`✅ Created university: ${university.name} (${university.id})`);
    } else {
      console.log(`✅ University exists: ${university.name}`);
    }
    
    // Check if admin exists
    let admin = await prisma.universityAdmin.findFirst({
      where: { email: 'admin@test.com' }
    });
    
    if (!admin) {
      console.log('👤 Creating test admin...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = await prisma.universityAdmin.create({
        data: {
          id: generateId(),
          email: 'admin@test.com',
          password: hashedPassword,
          name: 'Test Admin',
          role: 'admin',
          universityId: university.id,
        }
      });
      console.log(`✅ Created admin: ${admin.email}`);
    } else {
      console.log(`✅ Admin exists: ${admin.email}`);
    }
    
    console.log('\n✨ Test data ready!');
    console.log('\n📋 Test Credentials:');
    console.log(`   Email: admin@test.com`);
    console.log(`   Password: admin123`);
    console.log(`   University: ${university.name}`);
    console.log(`   University ID: ${university.id}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestData();
