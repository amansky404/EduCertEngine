const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide template name'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['certificate', 'marksheet', 'degree', 'transcript', 'other'],
    required: true,
  },
  description: String,
  
  // Template file storage
  backgroundImage: String,
  backgroundPDF: String,
  
  // Field mapping for dynamic content
  fields: [{
    name: {
      type: String,
      required: true,
    },
    label: String,
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'image', 'qrcode'],
      default: 'text',
    },
    position: {
      x: Number,
      y: Number,
      width: Number,
      height: Number,
    },
    style: {
      fontSize: Number,
      fontFamily: String,
      fontWeight: String,
      color: String,
      align: {
        type: String,
        enum: ['left', 'center', 'right'],
        default: 'left',
      },
    },
    required: {
      type: Boolean,
      default: false,
    },
    defaultValue: String,
  }],
  
  // Template dimensions
  dimensions: {
    width: {
      type: Number,
      default: 792, // A4 width in points
    },
    height: {
      type: Number,
      default: 612, // A4 height in points (landscape)
    },
    orientation: {
      type: String,
      enum: ['portrait', 'landscape'],
      default: 'landscape',
    },
  },
  
  // QR Code settings
  qrCode: {
    enabled: {
      type: Boolean,
      default: true,
    },
    position: {
      x: Number,
      y: Number,
      size: Number,
    },
    dataFields: [String], // Fields to include in QR data
  },
  
  // Version control
  version: {
    type: Number,
    default: 1,
  },
  
  isActive: {
    type: Boolean,
    default: true,
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Compound index for efficient queries
templateSchema.index({ university: 1, type: 1, isActive: 1 });

module.exports = mongoose.model('Template', templateSchema);
