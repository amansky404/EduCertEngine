const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: true,
  },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true,
  },
  
  // Unique certificate identifier
  certificateNumber: {
    type: String,
    required: true,
    unique: true,
  },
  
  // Student information
  studentInfo: {
    name: {
      type: String,
      required: true,
    },
    rollNumber: String,
    email: String,
    phone: String,
    dateOfBirth: Date,
    photo: String,
  },
  
  // Course/Program details
  courseInfo: {
    courseName: String,
    courseDuration: String,
    completionDate: Date,
    issueDate: Date,
    grade: String,
    cgpa: String,
    percentage: String,
    division: String,
  },
  
  // Dynamic field data
  fieldData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  
  // Generated files
  pdfFile: String,
  jpegFile: String,
  qrCode: String,
  
  // Verification
  verificationCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  verificationURL: String,
  
  // Status tracking
  status: {
    type: String,
    enum: ['draft', 'generated', 'issued', 'revoked'],
    default: 'draft',
  },
  
  // Batch information (for bulk generation)
  batchId: String,
  
  // Download tracking
  downloadCount: {
    type: Number,
    default: 0,
  },
  lastDownloadedAt: Date,
  
  // Metadata
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  revokedAt: Date,
  revocationReason: String,
  
  notes: String,
}, {
  timestamps: true,
});

// Indexes for efficient queries
certificateSchema.index({ university: 1, status: 1 });
certificateSchema.index({ certificateNumber: 1 });
certificateSchema.index({ verificationCode: 1 });
certificateSchema.index({ 'studentInfo.name': 'text', 'studentInfo.rollNumber': 'text' });

// Generate verification code before saving
certificateSchema.pre('save', function(next) {
  if (!this.verificationCode) {
    this.verificationCode = generateVerificationCode();
  }
  next();
});

function generateVerificationCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

module.exports = mongoose.model('Certificate', certificateSchema);
