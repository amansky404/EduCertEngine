const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create Super Admin
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const superAdmin = await prisma.superAdmin.upsert({
    where: { email: 'superadmin@educert.com' },
    update: {},
    create: {
      email: 'superadmin@educert.com',
      name: 'Super Admin',
      password: hashedPassword,
    },
  })
  console.log('✓ Super Admin created:', superAdmin.email)

  // Create University
  const university = await prisma.university.upsert({
    where: { subdomain: 'testuni' },
    update: {},
    create: {
      name: 'Test University',
      subdomain: 'testuni',
      slug: 'test-university',
      primaryColor: '#1a73e8',
      secondaryColor: '#34a853',
      qrEnabled: true,
      seoTitle: 'Test University Certificates',
      seoDescription: 'Official certificate portal for Test University',
    },
  })
  console.log('✓ University created:', university.name)

  // Create University Admin
  const univAdmin = await prisma.universityAdmin.upsert({
    where: { email: 'admin@testuni.edu' },
    update: {},
    create: {
      email: 'admin@testuni.edu',
      name: 'University Admin',
      password: hashedPassword,
      role: 'admin',
      universityId: university.id,
    },
  })
  console.log('✓ University Admin created:', univAdmin.email)

  // Create a test template
  const template = await prisma.template.create({
    data: {
      name: 'Test Certificate Template',
      type: 'HTML',
      description: 'A test certificate template for demonstration',
      htmlConfig: JSON.stringify({
        version: '5.5.2',
        objects: [],
        background: '#ffffff',
        width: 1200,
        height: 900
      }),
      universityId: university.id,
      qrEnabled: true,
    },
  })
  console.log('✓ Template created:', template.name)

  console.log('\n✓ Seeding complete!')
  console.log('\nTest credentials:')
  console.log('  Super Admin:')
  console.log('    Email: superadmin@educert.com')
  console.log('    Password: admin123')
  console.log('  University Admin:')
  console.log('    Email: admin@testuni.edu')
  console.log('    Password: admin123')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
