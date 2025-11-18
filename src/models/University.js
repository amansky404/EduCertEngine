const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide university name'],
    unique: true,
    trim: true,
  },
  subdomain: {
    type: String,
    required: [true, 'Please provide subdomain'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'],
  },
  logo: {
    type: String,
    default: '',
  },
  branding: {
    primaryColor: {
      type: String,
      default: '#1a73e8',
    },
    secondaryColor: {
      type: String,
      default: '#34a853',
    },
    accentColor: {
      type: String,
      default: '#fbbc04',
    },
    fontFamily: {
      type: String,
      default: 'Arial, sans-serif',
    },
  },
  landingPage: {
    heroTitle: String,
    heroSubtitle: String,
    heroImage: String,
    aboutText: String,
    features: [{
      title: String,
      description: String,
      icon: String,
    }],
    customHTML: String,
  },
  seo: {
    title: String,
    description: String,
    keywords: [String],
    ogImage: String,
  },
  settings: {
    enableQRCode: {
      type: Boolean,
      default: true,
    },
    allowDirectUpload: {
      type: Boolean,
      default: true,
    },
    allowBulkImport: {
      type: Boolean,
      default: true,
    },
    enableStudentPortal: {
      type: Boolean,
      default: true,
    },
    verificationEnabled: {
      type: Boolean,
      default: true,
    },
  },
  contactInfo: {
    email: String,
    phone: String,
    address: String,
    website: String,
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for efficient subdomain lookup
universitySchema.index({ subdomain: 1 });

module.exports = mongoose.model('University', universitySchema);
