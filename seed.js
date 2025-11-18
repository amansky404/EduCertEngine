require('dotenv').config();
const mongoose = require('mongoose');
const University = require('./src/models/University');
const User = require('./src/models/User');
const Template = require('./src/models/Template');
const connectDB = require('./src/config/database');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await University.deleteMany({});
    await User.deleteMany({});
    await Template.deleteMany({});

    console.log('Cleared existing data');

    // Create sample university
    const university = await University.create({
      name: 'Tech University',
      subdomain: 'tech-uni',
      branding: {
        primaryColor: '#1a73e8',
        secondaryColor: '#34a853',
        accentColor: '#fbbc04',
        fontFamily: 'Arial, sans-serif',
      },
      landingPage: {
        heroTitle: 'Welcome to Tech University',
        heroSubtitle: 'Excellence in Technology Education',
        aboutText: 'We are committed to providing world-class education in technology and innovation.',
        features: [
          {
            title: 'Quality Education',
            description: 'Top-notch faculty and curriculum',
            icon: '🎓',
          },
          {
            title: 'Modern Facilities',
            description: 'State-of-the-art labs and equipment',
            icon: '🏢',
          },
          {
            title: 'Industry Partnerships',
            description: 'Strong connections with leading companies',
            icon: '🤝',
          },
        ],
      },
      seo: {
        title: 'Tech University - Official Certificates',
        description: 'Verify and download your official certificates from Tech University',
        keywords: ['tech university', 'certificates', 'education', 'technology'],
      },
      settings: {
        enableQRCode: true,
        allowDirectUpload: true,
        allowBulkImport: true,
        enableStudentPortal: true,
        verificationEnabled: true,
      },
      contactInfo: {
        email: 'info@techuni.edu',
        phone: '+1-800-TECH-UNI',
        address: '123 Technology Avenue, Silicon Valley, CA 94000',
        website: 'https://techuni.edu',
      },
      isActive: true,
    });

    console.log('Created university:', university.name);

    // Create super admin user
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'admin@educert.com',
      password: 'admin123',
      role: 'superadmin',
    });

    console.log('Created super admin user:', superAdmin.email);

    // Create university admin
    const admin = await User.create({
      name: 'University Admin',
      email: 'admin@techuni.edu',
      password: 'admin123',
      role: 'admin',
      university: university._id,
    });

    // Add admin to university
    university.admins.push(admin._id);
    await university.save();

    console.log('Created university admin:', admin.email);

    // Create staff user
    const staff = await User.create({
      name: 'Staff Member',
      email: 'staff@techuni.edu',
      password: 'staff123',
      role: 'staff',
      university: university._id,
    });

    console.log('Created staff user:', staff.email);

    // Create sample certificate template
    const template = await Template.create({
      university: university._id,
      name: 'Graduation Certificate',
      type: 'certificate',
      description: 'Standard graduation certificate for bachelor degree programs',
      fields: [
        {
          name: 'studentName',
          label: 'Student Name',
          type: 'text',
          position: { x: 250, y: 200, width: 400, height: 50 },
          style: {
            fontSize: 28,
            fontFamily: 'Arial',
            fontWeight: 'bold',
            color: '#000000',
            align: 'center',
          },
          required: true,
        },
        {
          name: 'rollNumber',
          label: 'Roll Number',
          type: 'text',
          position: { x: 100, y: 280, width: 200, height: 30 },
          style: {
            fontSize: 16,
            color: '#333333',
            align: 'left',
          },
          required: true,
        },
        {
          name: 'courseName',
          label: 'Course Name',
          type: 'text',
          position: { x: 250, y: 320, width: 400, height: 40 },
          style: {
            fontSize: 20,
            color: '#1a73e8',
            align: 'center',
          },
          required: true,
        },
        {
          name: 'completionDate',
          label: 'Completion Date',
          type: 'date',
          position: { x: 250, y: 380, width: 200, height: 30 },
          style: {
            fontSize: 16,
            color: '#333333',
            align: 'center',
          },
          required: true,
        },
        {
          name: 'grade',
          label: 'Grade',
          type: 'text',
          position: { x: 250, y: 420, width: 100, height: 30 },
          style: {
            fontSize: 18,
            fontWeight: 'bold',
            color: '#34a853',
            align: 'center',
          },
        },
        {
          name: 'qrCode',
          label: 'QR Code',
          type: 'qrcode',
          position: { x: 650, y: 450, width: 100, height: 100 },
        },
      ],
      dimensions: {
        width: 792,
        height: 612,
        orientation: 'landscape',
      },
      qrCode: {
        enabled: true,
        position: { x: 650, y: 450, size: 100 },
        dataFields: ['certificateNumber', 'studentName', 'verificationCode'],
      },
      isActive: true,
      createdBy: admin._id,
    });

    console.log('Created certificate template:', template.name);

    // Create marksheet template
    const marksheetTemplate = await Template.create({
      university: university._id,
      name: 'Semester Marksheet',
      type: 'marksheet',
      description: 'Semester-wise marksheet template',
      fields: [
        {
          name: 'studentName',
          label: 'Student Name',
          type: 'text',
          position: { x: 100, y: 100, width: 300, height: 30 },
          style: { fontSize: 18, fontWeight: 'bold' },
          required: true,
        },
        {
          name: 'rollNumber',
          label: 'Roll Number',
          type: 'text',
          position: { x: 100, y: 140, width: 200, height: 25 },
          style: { fontSize: 14 },
          required: true,
        },
        {
          name: 'semester',
          label: 'Semester',
          type: 'text',
          position: { x: 100, y: 170, width: 150, height: 25 },
          style: { fontSize: 14 },
          required: true,
        },
        {
          name: 'cgpa',
          label: 'CGPA',
          type: 'number',
          position: { x: 500, y: 100, width: 100, height: 30 },
          style: { fontSize: 20, fontWeight: 'bold', color: '#1a73e8' },
        },
      ],
      dimensions: {
        width: 792,
        height: 612,
        orientation: 'portrait',
      },
      qrCode: {
        enabled: true,
        position: { x: 650, y: 500, size: 80 },
      },
      isActive: true,
      createdBy: admin._id,
    });

    console.log('Created marksheet template:', marksheetTemplate.name);

    console.log('\n✅ Seed data created successfully!');
    console.log('\n📝 Sample Credentials:');
    console.log('Super Admin:');
    console.log('  Email: admin@educert.com');
    console.log('  Password: admin123');
    console.log('\nUniversity Admin:');
    console.log('  Email: admin@techuni.edu');
    console.log('  Password: admin123');
    console.log('\nStaff:');
    console.log('  Email: staff@techuni.edu');
    console.log('  Password: staff123');
    console.log('\n🏫 Sample University:');
    console.log('  Name: Tech University');
    console.log('  Subdomain: tech-uni');
    console.log('  Access: tech-uni.localhost:5000');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
