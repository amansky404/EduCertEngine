const {
  searchCertificates,
  searchStudents,
  getCertificateStatistics,
  exportCertificatesToCSV,
  bulkUpdateCertificates,
} = require('../utils/advancedSearch');

// @desc    Advanced certificate search
// @route   POST /api/search/certificates
// @access  Private
exports.advancedCertificateSearch = async (req, res) => {
  try {
    const filters = req.body;
    const result = await searchCertificates(filters, req.user.university);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Advanced student search
// @route   POST /api/search/students
// @access  Private
exports.advancedStudentSearch = async (req, res) => {
  try {
    const filters = req.body;
    const result = await searchStudents(filters, req.user.university);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get certificate statistics
// @route   POST /api/search/certificates/stats
// @access  Private/Admin
exports.getCertificateStats = async (req, res) => {
  try {
    const filters = req.body;
    const result = await getCertificateStatistics(filters, req.user.university);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Export certificates to CSV
// @route   POST /api/search/certificates/export
// @access  Private/Admin
exports.exportCertificates = async (req, res) => {
  try {
    const filters = req.body;
    const result = await exportCertificatesToCSV(filters, req.user.university);

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="certificates-${Date.now()}.csv"`);

    res.send(result.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Bulk update certificates
// @route   POST /api/search/certificates/bulk-update
// @access  Private/Admin
exports.bulkUpdate = async (req, res) => {
  try {
    const { certificateIds, updates } = req.body;

    if (!certificateIds || !Array.isArray(certificateIds)) {
      return res.status(400).json({
        success: false,
        message: 'certificateIds array is required',
      });
    }

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'updates object is required',
      });
    }

    const result = await bulkUpdateCertificates(certificateIds, updates);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
