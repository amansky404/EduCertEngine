const Certificate = require('../models/Certificate');
const Template = require('../models/Template');
const { generateQRCode, generateVerificationURL } = require('../utils/qrGenerator');
const { generatePDF } = require('../utils/pdfGenerator');
const { parseCSV, validateCSVData, mapCSVRowToFields } = require('../utils/csvParser');
const path = require('path');

// @desc    Create single certificate
// @route   POST /api/certificates
// @access  Private
exports.createCertificate = async (req, res) => {
  try {
    const { templateId, studentInfo, courseInfo, fieldData } = req.body;

    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    // Generate unique certificate number
    const certificateNumber = await generateCertificateNumber(req.user.university);

    const certificate = await Certificate.create({
      university: req.user.university,
      template: templateId,
      certificateNumber,
      studentInfo,
      courseInfo,
      fieldData: new Map(Object.entries(fieldData || {})),
      generatedBy: req.user._id,
      status: 'draft',
    });

    res.status(201).json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Generate certificate PDF
// @route   POST /api/certificates/:id/generate
// @access  Private
exports.generateCertificatePDF = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    const template = await Template.findById(certificate.template);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    // Generate QR code if enabled
    if (template.qrCode.enabled && template.settings?.enableQRCode !== false) {
      const verificationURL = generateVerificationURL(
        certificate.verificationCode,
        (await certificate.populate('university')).university.subdomain
      );
      
      const qrPath = await generateQRCode(verificationURL, certificate._id.toString());
      certificate.qrCode = qrPath;
    }

    // Generate PDF
    const pdfPath = await generatePDF(certificate, template);
    certificate.pdfFile = pdfPath;
    certificate.status = 'generated';

    await certificate.save();

    res.json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Bulk import certificates from CSV
// @route   POST /api/certificates/bulk-import
// @access  Private/Admin
exports.bulkImport = async (req, res) => {
  try {
    const { templateId } = req.body;

    if (!req.files || !req.files.csvFile) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a CSV file',
      });
    }

    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    const csvFile = req.files.csvFile;
    const uploadDir = path.join(process.cwd(), 'tmp');
    const filePath = path.join(uploadDir, `${Date.now()}-${csvFile.name}`);
    
    await csvFile.mv(filePath);

    // Parse CSV
    const csvData = await parseCSV(filePath);

    // Validate CSV data
    const validation = validateCSVData(csvData, template);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'CSV validation failed',
        errors: validation.errors,
      });
    }

    // Generate batch ID
    const batchId = `BATCH-${Date.now()}`;

    // Create certificates
    const certificates = [];
    for (const row of csvData) {
      const certificateNumber = await generateCertificateNumber(req.user.university);
      const fieldData = mapCSVRowToFields(row, template);

      const certificate = await Certificate.create({
        university: req.user.university,
        template: templateId,
        certificateNumber,
        studentInfo: {
          name: row.studentName || row.name,
          rollNumber: row.rollNumber,
          email: row.email,
        },
        courseInfo: {
          courseName: row.courseName,
          completionDate: row.completionDate,
          issueDate: row.issueDate || new Date(),
          grade: row.grade,
        },
        fieldData,
        batchId,
        generatedBy: req.user._id,
        status: 'draft',
      });

      certificates.push(certificate);
    }

    res.status(201).json({
      success: true,
      message: `Successfully imported ${certificates.length} certificates`,
      batchId,
      data: certificates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all certificates
// @route   GET /api/certificates
// @access  Private
exports.getCertificates = async (req, res) => {
  try {
    const query = { university: req.user.university };

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.batchId) {
      query.batchId = req.query.batchId;
    }

    const certificates = await Certificate.find(query)
      .populate('template', 'name type')
      .populate('generatedBy', 'name email')
      .sort('-createdAt')
      .limit(parseInt(req.query.limit) || 50);

    res.json({
      success: true,
      count: certificates.length,
      data: certificates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single certificate
// @route   GET /api/certificates/:id
// @access  Private
exports.getCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('template')
      .populate('university')
      .populate('generatedBy', 'name email');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    res.json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Search certificates
// @route   GET /api/certificates/search
// @access  Public
exports.searchCertificates = async (req, res) => {
  try {
    const { query, universityId } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Please provide search query',
      });
    }

    const searchQuery = {
      university: universityId,
      status: 'issued',
      $or: [
        { 'studentInfo.name': { $regex: query, $options: 'i' } },
        { 'studentInfo.rollNumber': { $regex: query, $options: 'i' } },
        { certificateNumber: { $regex: query, $options: 'i' } },
      ],
    };

    const certificates = await Certificate.find(searchQuery)
      .select('certificateNumber studentInfo courseInfo')
      .limit(20);

    res.json({
      success: true,
      count: certificates.length,
      data: certificates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Verify certificate
// @route   GET /api/certificates/verify/:code
// @access  Public
exports.verifyCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ 
      verificationCode: req.params.code,
      status: { $in: ['generated', 'issued'] },
    })
      .populate('university', 'name logo')
      .populate('template', 'name type');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or invalid verification code',
      });
    }

    res.json({
      success: true,
      data: {
        isValid: true,
        certificate: {
          certificateNumber: certificate.certificateNumber,
          studentInfo: certificate.studentInfo,
          courseInfo: certificate.courseInfo,
          university: certificate.university,
          template: certificate.template,
          issueDate: certificate.createdAt,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Download certificate PDF
// @route   GET /api/certificates/:id/download
// @access  Public/Private
exports.downloadCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    // Check if PDF is generated
    if (!certificate.pdfFile) {
      return res.status(400).json({
        success: false,
        message: 'Certificate PDF not generated yet',
      });
    }

    // Build file path
    const filePath = path.join(process.cwd(), 'public', certificate.pdfFile);
    
    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Certificate file not found',
      });
    }

    // Update download count
    certificate.downloadCount += 1;
    certificate.lastDownloadedAt = new Date();
    await certificate.save();

    // Send file
    res.download(filePath, `${certificate.certificateNumber}.pdf`, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({
          success: false,
          message: 'Error downloading file',
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Batch generate certificates
// @route   POST /api/certificates/batch-generate
// @access  Private/Admin
exports.batchGenerate = async (req, res) => {
  try {
    const { certificateIds, batchId } = req.body;

    if (!certificateIds || !Array.isArray(certificateIds)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of certificate IDs',
      });
    }

    const results = {
      success: [],
      failed: [],
      total: certificateIds.length,
    };

    for (const certId of certificateIds) {
      try {
        const certificate = await Certificate.findById(certId);
        if (!certificate) {
          results.failed.push({ id: certId, reason: 'Certificate not found' });
          continue;
        }

        const template = await Template.findById(certificate.template);
        if (!template) {
          results.failed.push({ id: certId, reason: 'Template not found' });
          continue;
        }

        // Generate QR code if enabled
        if (template.qrCode.enabled) {
          const verificationURL = generateVerificationURL(
            certificate.verificationCode,
            (await certificate.populate('university')).university.subdomain
          );
          
          const qrPath = await generateQRCode(verificationURL, certificate._id.toString());
          certificate.qrCode = qrPath;
        }

        // Generate PDF
        const pdfPath = await generatePDF(certificate, template);
        certificate.pdfFile = pdfPath;
        certificate.status = 'generated';

        await certificate.save();
        results.success.push(certId);
      } catch (error) {
        results.failed.push({ id: certId, reason: error.message });
      }
    }

    res.json({
      success: true,
      message: `Generated ${results.success.length} out of ${results.total} certificates`,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper function to generate unique certificate number
async function generateCertificateNumber(universityId) {
  const year = new Date().getFullYear();
  const count = await Certificate.countDocuments({ university: universityId });
  return `CERT-${year}-${String(count + 1).padStart(6, '0')}`;
}
